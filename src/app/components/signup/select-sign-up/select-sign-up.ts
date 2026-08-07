// ============================================
// SELECT-SIGN-UP (экран выбора способа)
// ============================================
import { Component, inject, OnInit, NgZone } from '@angular/core';
import { Router } from '@angular/router';
import { SignupStateService } from '../../../services/signup.service';
import { environment } from '../../../../environments/environment';

// Google GIS types
declare const google: any;

@Component({
  selector: 'app-select-sign-up',
  standalone: true,
  templateUrl: './select-sign-up.html',
  styleUrls: ['./select-sign-up.scss'],
})
export class SelectSignUp implements OnInit {
  private router = inject(Router);
  private stateService = inject(SignupStateService);
  private ngZone = inject(NgZone); // Обязательно для коректной навигации из callback Google

  googleLoading = false;
  private googleReady = false;

  ngOnInit(): void {
    this.loadGoogleScript().then(() => {
      this.initGoogleClient();
    });
  }

  // ===== Загрузка Google скрипта =====
  private loadGoogleScript(): Promise<void> {
    return new Promise((resolve) => {
      if (typeof google !== 'undefined' && google.accounts?.id) {
        console.log('[SelectSignUp] Google GIS already loaded');
        resolve();
        return;
      }

      const existing = document.getElementById('google-gsi-script');
      if (existing) {
        existing.addEventListener('load', () => resolve());
        return;
      }

      console.log('[SelectSignUp] Loading Google GIS script...');
      const script = document.createElement('script');
      script.id = 'google-gsi-script';
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = () => {
        console.log('[SelectSignUp] Google GIS script loaded');
        resolve();
      };
      script.onerror = () => {
        console.error('[SelectSignUp] Failed to load Google script');
        resolve();
      };
      document.head.appendChild(script);
    });
  }

  // ===== Инициализация Google ID Client =====
  private initGoogleClient(): void {
    if (typeof google === 'undefined' || !google.accounts?.id) {
      console.error('[SelectSignUp] Google accounts.id is not available');
      return;
    }

    google.accounts.id.initialize({
      client_id: environment.googleClientId,
      callback: (response: any) => this.handleGoogleCredentialResponse(response),
      auto_select: false,
      cancel_on_tap_outside: true,
    });

    this.googleReady = true;
    console.log('[SelectSignUp] Google ID client initialized');
  }

  // ===== Клик по кастомной кнопке Google =====
  googleSignUp(): void {
    this.googleLoading = true;

    if (!this.googleReady) {
      console.error('[SelectSignUp] Google client not ready, retrying...');
      setTimeout(() => {
        if (this.googleReady) {
          this.promptGoogleOneTap();
        } else {
          this.googleLoading = false;
          alert('Google Sign-In is not available. Please try again or use email.');
        }
      }, 1000);
      return;
    }

    this.promptGoogleOneTap();
  }

  private promptGoogleOneTap(): void {
    // Отображает всплывающее окно Google One Tap или окно выбора аккаунта
    google.accounts.id.prompt((notification: any) => {
      if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
        console.warn(
          '[SelectSignUp] One Tap prompt missed or closed:',
          notification.getNotDisplayedReason(),
        );
        this.ngZone.run(() => {
          this.googleLoading = false;
        });
      }
    });
  }

  // ===== Обработка ответа с ID Token (JWT) =====
  private handleGoogleCredentialResponse(response: any): void {
    if (!response.credential) {
      console.error('[SelectSignUp] No credential returned from Google');
      this.ngZone.run(() => (this.googleLoading = false));
      return;
    }

    const idToken = response.credential; // 👈 Это настоящий JWT (eyJ...)
    console.log('[SelectSignUp] Received Google ID Token (JWT):', idToken.substring(0, 30) + '...');

    // Декодируем JWT payload прямо в браузере (без сетевого запроса!)
    const payload = this.parseJwt(idToken);
    console.log('[SelectSignUp] Google Profile decoded:', payload?.email);

    // Обертка ngZone нужна, так как callback от Google происходит вне зоны Angular
    this.ngZone.run(() => {
      // 1. Сохраняем JWT для последующей отправки на /api/Auth/google-signup
      this.stateService.setGoogleToken(idToken);

      // 2. Заполняем данные пользователя
      this.stateService.setPersonal({
        fullName: payload?.name || payload?.email,
        email: payload?.email,
        googleId: payload?.sub,
        avatarUrl: payload?.picture,
      });

      this.stateService.setAuthMethod('google');

      // 3. Переходим на шаг ввода данных компании
      this.router.navigate(['/sign-up/company']);
    });
  }

  // ===== Вспомогательный метод декодирования JWT =====
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
      console.error('[SelectSignUp] Failed to parse JWT payload', e);
      return null;
    }
  }

  // ===== Email Sign Up =====
  emailSignUp(): void {
    this.stateService.setAuthMethod('email');
    this.router.navigate(['/sign-up/personal']);
  }
  onSignIn(event: Event): void {
    event.preventDefault();
    this.router.navigate([`/login`]);
  }
}
