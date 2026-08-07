// components/sign-in/sign-in.ts
import { Component, EventEmitter, inject, OnInit, Output, OnDestroy, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { environment } from '../../../environments/environment';
import { AuthService } from '../../services/auth/auth-service';
import { Router } from '@angular/router';
import { finalize } from 'rxjs/operators';

export interface WelcomeSignInSubmit {
  email: string;
  password: string;
}

export interface GoogleUserInfo {
  sub: string;
  email: string;
  email_verified: boolean;
  name: string;
  given_name?: string;
  family_name?: string;
  picture?: string;
}

declare const google: any;
const GOOGLE_CLIENT_ID = environment.googleClientId;
const baseUrl = environment.baseUrl;

@Component({
  selector: 'app-sign-in',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './sign-in.html',
  styleUrls: ['./sign-in.scss'],
})
export class SignIn implements OnInit, OnDestroy {
  authService = inject(AuthService);
  router = inject(Router);
  private ngZone = inject(NgZone); // callback от Google выполняется вне Angular zone

  @Output() signIn = new EventEmitter<WelcomeSignInSubmit>();
  @Output() googleSignIn = new EventEmitter<GoogleUserInfo>();
  @Output() forgotPassword = new EventEmitter<void>();
  @Output() signUp = new EventEmitter<void>();

  form: FormGroup;
  submitted = false;
  loading = false;
  googleLoading = false;
  errorMessage: string | null = null;
  showPassword = false;
  googleProfile: GoogleUserInfo | null = null;

  private googleReady: Promise<void>;
  private googleClientReady = false;
  private destroySignal = false;

  constructor(private fb: FormBuilder) {
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      rememberMe: [false],
    });

    this.checkExistingSession();

    // ID Token flow (google.accounts.id) — тот же, что использует SelectSignUp,
    // и тот, который бэкенд реально умеет валидировать (GoogleJsonWebSignature).
    // Раньше здесь был google.accounts.oauth2 (access token) — бэкенд его отклонял
    // с "JWT must consist of Header, Payload, and Signature", потому что access
    // token структурно не является JWT.
    this.googleReady = this.loadGoogleScript()
      .then(() => this.initGoogleClient())
      .catch((err) => {
        console.error('[SignIn] Google Identity Services failed to initialize:', err);
      });
  }

  ngOnInit(): void {
    const savedEmail = localStorage.getItem('rememberedEmail');
    if (savedEmail) {
      this.form.patchValue({ email: savedEmail, rememberMe: true });
    }
  }

  ngOnDestroy(): void {
    this.destroySignal = true;
  }

  get emailInvalid(): boolean {
    const c = this.form.get('email');
    return !!c && c.invalid && (c.touched || this.submitted);
  }

  get passwordInvalid(): boolean {
    const c = this.form.get('password');
    return !!c && c.invalid && (c.touched || this.submitted);
  }

  get emailErrors(): string {
    const c = this.form.get('email');
    if (!c || !c.errors) return '';
    if (c.errors['required']) return 'Email is required';
    if (c.errors['email']) return 'Please enter a valid email address';
    return 'Invalid email';
  }

  get passwordErrors(): string {
    const c = this.form.get('password');
    if (!c || !c.errors) return '';
    if (c.errors['required']) return 'Password is required';
    if (c.errors['minlength']) return 'Password must be at least 6 characters';
    return 'Invalid password';
  }

  onSignIn(): void {
    this.submitted = true;
    this.errorMessage = null;

    if (this.form.invalid) {
      return;
    }

    const { email, password, rememberMe } = this.form.value;

    if (rememberMe) {
      localStorage.setItem('rememberedEmail', email);
    } else {
      localStorage.removeItem('rememberedEmail');
    }

    this.loading = true;
    this.authService
      .login(email, password)
      .pipe(finalize(() => (this.loading = false)))
      .subscribe({
        next: () => {
          console.log('[SignIn] Login successful');
          this.router.navigate([`${baseUrl}/menu/structure`]);
        },
        error: (err) => {
          console.error('[SignIn] login failed:', err);
          this.errorMessage = this.getErrorMessage(err);
        },
      });
  }

  private loadGoogleScript(): Promise<void> {
    if (typeof google !== 'undefined' && google.accounts?.id) {
      console.log('[SignIn] Google GIS already loaded');
      return Promise.resolve();
    }

    const existing = document.getElementById('google-gsi-script') as HTMLScriptElement | null;
    if (existing) {
      return new Promise((resolve, reject) => {
        const onLoad = () => {
          existing.removeEventListener('load', onLoad);
          existing.removeEventListener('error', onError);
          resolve();
        };
        const onError = () => {
          existing.removeEventListener('load', onLoad);
          existing.removeEventListener('error', onError);
          reject(new Error('Google Identity Services script failed to load'));
        };
        existing.addEventListener('load', onLoad);
        existing.addEventListener('error', onError);
      });
    }

    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.id = 'google-gsi-script';
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = () => {
        console.log('[SignIn] Google Identity Services script loaded');
        resolve();
      };
      script.onerror = () => reject(new Error('Google Identity Services script failed to load'));
      document.head.appendChild(script);
    });
  }

  private initGoogleClient(): void {
    if (this.destroySignal) return;

    if (typeof google === 'undefined' || !google.accounts?.id) {
      console.error('[SignIn] Google accounts.id is not available');
      this.errorMessage = 'Google sign-in is temporarily unavailable.';
      return;
    }

    try {
      google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: (response: any) => this.handleGoogleCredentialResponse(response),
        auto_select: false,
        cancel_on_tap_outside: true,
      });

      this.googleClientReady = true;
      console.log('[SignIn] Google ID client ready');
    } catch (error) {
      console.error('[SignIn] Failed to initialize Google client:', error);
      this.errorMessage = 'Google sign-in is temporarily unavailable.';
    }
  }

  async onGoogleSignIn(): Promise<void> {
    this.googleLoading = true;
    this.errorMessage = null;

    try {
      await this.googleReady;
    } catch {
      this.googleLoading = false;
      this.errorMessage = 'Google sign-in is not available. Please refresh and try again.';
      return;
    }

    if (!this.googleClientReady) {
      this.googleLoading = false;
      this.errorMessage = 'Google sign-in is not configured properly.';
      return;
    }

    console.log('[SignIn] prompting Google One Tap...');
    google.accounts.id.prompt((notification: any) => {
      if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
        console.warn(
          '[SignIn] One Tap prompt missed or closed:',
          notification.getNotDisplayedReason?.() ?? notification.getSkippedReason?.(),
        );
        this.ngZone.run(() => {
          this.googleLoading = false;
        });
      }
    });
  }

  /** Ответ Google Identity Services содержит настоящий ID Token (JWT) в response.credential. */
  private handleGoogleCredentialResponse(response: any): void {
    if (!response.credential) {
      console.error('[SignIn] No credential returned from Google');
      this.ngZone.run(() => {
        this.googleLoading = false;
        this.errorMessage = 'Google sign-in failed. Please try again.';
      });
      return;
    }

    const idToken = response.credential;
    console.log('[SignIn] Received Google ID Token (JWT):', idToken.substring(0, 30) + '...');

    const payload = this.parseJwt(idToken);
    if (!payload) {
      this.ngZone.run(() => {
        this.googleLoading = false;
        this.errorMessage = 'Failed to read Google profile.';
      });
      return;
    }

    const profile: GoogleUserInfo = {
      sub: payload.sub,
      email: payload.email,
      email_verified: payload.email_verified,
      name: payload.name,
      given_name: payload.given_name,
      family_name: payload.family_name,
      picture: payload.picture,
    };

    console.log('[SignIn] Google user profile:', profile);

    // Callback от Google выполняется вне Angular zone — оборачиваем, чтобы
    // изменения сигналов/навигация корректно вызвали change detection.
    this.ngZone.run(() => {
      this.googleProfile = profile;
      this.googleSignIn.emit(profile);

      // ✅ Логинимся через Google, теперь отправляя настоящий ID Token (JWT),
      // а не access_token — именно это и ждёт GoogleAuthService на бэкенде.
      this.authService.googleLogin(idToken, profile).subscribe({
        next: () => {
          console.log('[SignIn] Google login successful');
          this.googleLoading = false;

          const currentUrl = this.router.url;
          if (currentUrl.includes('/login') || currentUrl === '/') {
            this.router.navigate([`${baseUrl}/menu/structure`]).then((success) => {
              if (!success) {
                window.location.href = `${baseUrl}/menu/structure`;
              }
            });
          }
        },
        error: (err) => {
          console.error('[SignIn] Google login failed:', err);
          this.googleLoading = false;

          if (err.message?.includes('not found') || err.message?.includes('sign up')) {
            this.router.navigate([`${baseUrl}/sign-up`], {
              state: { googleProfile: profile, googleToken: idToken },
            });
          } else {
            this.errorMessage = err.message || 'Google login failed. Please try again.';
          }
        },
      });
    });
  }

  private parseJwt(token: string): any {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join(''),
      );
      return JSON.parse(jsonPayload);
    } catch (e) {
      console.error('[SignIn] Failed to parse JWT payload', e);
      return null;
    }
  }

  private checkExistingSession(): void {
    if (this.authService.isAuthenticated() && this.authService.isTokenValid()) {
      this.router.navigate([`${baseUrl}/menu/structure`]);
    }
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  private getErrorMessage(error: any): string {
    if (typeof error === 'string') return error;

    if (error.status === 401) {
      return 'Invalid email or password. Please try again.';
    }
    if (error.status === 404) {
      return 'No account found with this email. Please sign up first.';
    }
    if (error.status === 400) {
      return error.error?.message || 'Invalid request.';
    }
    if (error.status === 429) {
      return 'Too many login attempts. Please try again later.';
    }
    if (error.status === 0) {
      return 'Network error. Please check your internet connection.';
    }
    return error.error?.message || 'An unexpected error occurred.';
  }

  onForgotPassword(event: Event): void {
    event.preventDefault();
    this.forgotPassword.emit();
    this.router.navigate([`/forgot-password`]);
  }

  onSignUp(event: Event): void {
    event.preventDefault();
    this.signUp.emit();

    this.router.navigate([`/sign-up`]);
  }
}
