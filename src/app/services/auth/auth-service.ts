// services/auth/auth-service.ts
import { Injectable, signal, computed, Inject, PLATFORM_ID } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap, throwError, of, catchError, switchMap } from 'rxjs';
import { isPlatformBrowser } from '@angular/common';
import { environment } from '../../../environments/environment';

export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  firstName?: string;
  lastName?: string;
  role: string;
  clientId?: string;
  avatarUrl?: string;
  picture?: string;
  googleId?: string;
  emailVerified?: boolean;
  provider?: 'email' | 'google';
  phone?: string;
  address?: string;
  company?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  user?: UserProfile;
}

export class CookieService {
  static setCookie(name: string, value: string, days: number = 7): void {
    if (typeof document === 'undefined') return;
    const expires = new Date();
    expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
    document.cookie = `${name}=${encodeURIComponent(value)};expires=${expires.toUTCString()};path=/;SameSite=Strict;${window.location.protocol === 'https:' ? 'Secure;' : ''}`;
  }

  static getCookie(name: string): string | null {
    if (typeof document === 'undefined') return null;
    const cookieName = `${name}=`;
    const cookies = document.cookie.split(';');
    for (let cookie of cookies) {
      cookie = cookie.trim();
      if (cookie.indexOf(cookieName) === 0) {
        return decodeURIComponent(cookie.substring(cookieName.length));
      }
    }
    return null;
  }

  static deleteCookie(name: string): void {
    if (typeof document === 'undefined') return;
    document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;`;
  }
}

// Кросс-вкладочный сигнал logout. Любая вкладка, вызвавшая logout(),
// оповещает остальные, чтобы они тоже сбросили сессию, а не продолжали
// работать с уже удалёнными в куках токенами до первого 401.
const LOGOUT_CHANNEL_NAME = 'swoop-auth-logout';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private accessToken = signal<string | null>(null);
  private userData = signal<UserProfile | null>(null);
  private isBrowser: boolean;
  private apiUrl = environment.apiUrl;
  private logoutChannel: BroadcastChannel | null = null;

  isAuthenticated = computed(() => !!this.accessToken());
  user = computed(() => this.userData());

  userName = computed(() => {
    const user = this.userData();
    if (!user) return 'Guest';
    return user.fullName || user.firstName || user.email || 'User';
  });

  userAvatar = computed(() => {
    const user = this.userData();
    return user?.avatarUrl || user?.picture || null;
  });

  userInitials = computed(() => {
    const user = this.userData();
    if (!user) return '?';

    if (user.fullName) {
      const parts = user.fullName.trim().split(' ');
      if (parts.length >= 2) {
        return (parts[0][0] + parts[1][0]).toUpperCase();
      }
      return user.fullName.substring(0, 2).toUpperCase();
    }

    if (user.firstName && user.lastName) {
      return (user.firstName[0] + user.lastName[0]).toUpperCase();
    }

    if (user.firstName) {
      return user.firstName.substring(0, 2).toUpperCase();
    }

    if (user.email) {
      return user.email.substring(0, 2).toUpperCase();
    }

    return 'U';
  });

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private http: HttpClient,
    private router: Router,
  ) {
    this.isBrowser = isPlatformBrowser(platformId);

    if (this.isBrowser) {
      const token = CookieService.getCookie('accessToken');
      const userData = CookieService.getCookie('user');

      if (token) {
        this.accessToken.set(token);
      }

      if (userData) {
        try {
          this.userData.set(JSON.parse(userData));
        } catch {
          this.userData.set(null);
        }
      }

      // Подписка на logout из других вкладок.
      if (typeof BroadcastChannel !== 'undefined') {
        this.logoutChannel = new BroadcastChannel(LOGOUT_CHANNEL_NAME);
        this.logoutChannel.onmessage = (event) => {
          if (event.data === 'logout') {
            console.log('[Auth] Logout received from another tab');
            this.performLocalLogout(true);
          }
        };
      }
    }
  }

  // ===== EMAIL LOGIN =====
  login(email: string, password: string): Observable<LoginResponse> {
    console.log('[Auth] Login attempt:', email);
    return this.http.post<LoginResponse>(`${this.apiUrl}/Auth/login`, { email, password }).pipe(
      tap({
        next: (res) => {
          console.log('[Auth] Login success:', res);
          this.setTokens(res.accessToken, res.refreshToken, res.expiresIn);
          if (res.user) this.saveUser(res.user);
        },
        error: (error) => {
          console.error('[Auth] Login failed:', error);
        },
      }),
      catchError((error: HttpErrorResponse) => {
        console.error('[Auth] Login catchError:', error);
        return throwError(() => error);
      }),
    );
  }

  // ===== GOOGLE LOGIN =====
  googleLogin(googleToken: string, googleProfile?: any): Observable<LoginResponse> {
    console.log('[Auth] Google login attempt');

    const requestBody = {
      googleToken: googleToken,
    };

    return this.http.post<LoginResponse>(`${this.apiUrl}/Auth/google`, requestBody).pipe(
      tap({
        next: (res) => {
          console.log('[Auth] Google login success:', res);
          this.setTokens(res.accessToken, res.refreshToken, res.expiresIn);

          if (res.user) {
            const userWithGoogleData = {
              ...res.user,
              picture: googleProfile?.picture || res.user?.avatarUrl,
              googleId: googleProfile?.sub,
              provider: 'google' as const,
              emailVerified: googleProfile?.email_verified || res.user?.emailVerified,
            };
            this.saveUser(userWithGoogleData);
          }

          console.log('[Auth] After login - isAuthenticated:', this.isAuthenticated());
          console.log('[Auth] After login - user:', this.user());
        },
        error: (error: HttpErrorResponse) => {
          console.error('[Auth] Google login failed:', error);
        },
      }),
      catchError((error: HttpErrorResponse) => {
        console.error('[Auth] Google login catchError:', error);

        if (error.status === 401 && error.error?.message === 'User not found') {
          return throwError(() => new Error('User not found. Please sign up first.'));
        }

        return throwError(() => error);
      }),
    );
  }

  // ===== GOOGLE SIGN UP =====
  googleSignUp(googleToken: string, companyData: any): Observable<LoginResponse> {
    console.log('[Auth] Google sign up attempt');

    const requestBody = {
      googleToken: googleToken,
      CompanyName: companyData.companyName || companyData.CompanyName,
      Phone: companyData.phone || companyData.Phone,
      CompanyEmail: companyData.companyEmail || companyData.CompanyEmail,
      CompanyPhone: companyData.companyPhone || companyData.CompanyPhone,
      Website: companyData.website || companyData.Website,
      Nip: companyData.nip || companyData.Nip,
      Regon: companyData.regon || companyData.Regon,
      Krs: companyData.krs || companyData.Krs,
      AddressFull: companyData.addressFull || companyData.AddressFull,
      City: companyData.city || companyData.City,
      PostalCode: companyData.postalCode || companyData.PostalCode,
    };

    return this.http.post<LoginResponse>(`${this.apiUrl}/Auth/google-signup`, requestBody).pipe(
      tap({
        next: (res) => {
          console.log('[Auth] Google sign up success:', res);
          this.setTokens(res.accessToken, res.refreshToken, res.expiresIn);
          if (res.user) this.saveUser(res.user);
        },
        error: (error) => {
          console.error('[Auth] Google sign up failed:', error);
        },
      }),
      catchError((error: HttpErrorResponse) => {
        console.error('[Auth] Google sign up catchError:', error);
        return throwError(() => error);
      }),
    );
  }

  // ===== EMAIL REGISTER =====
  register(payload: any): Observable<LoginResponse> {
    console.log('[Auth] Register:', payload.email);
    return this.http.post<LoginResponse>(`${this.apiUrl}/Auth/register`, payload).pipe(
      tap({
        next: (res) => {
          console.log('[Auth] Register success:', res);
          this.setTokens(res.accessToken, res.refreshToken, res.expiresIn);
          if (res.user) this.saveUser(res.user);
        },
        error: (error) => {
          console.error('[Auth] Register failed:', error);
        },
      }),
      catchError((error: HttpErrorResponse) => {
        console.error('[Auth] Register catchError:', error);
        return throwError(() => error);
      }),
    );
  }

  // ===== REFRESH TOKEN =====
  refresh(): Observable<LoginResponse> {
    const refreshToken = CookieService.getCookie('refreshToken');

    if (!refreshToken) {
      console.error('[Auth] No refresh token available');
      this.logout(false);
      return throwError(() => new Error('No refresh token available'));
    }

    return this.http.post<LoginResponse>(`${this.apiUrl}/Auth/refresh`, { refreshToken }).pipe(
      tap({
        next: (res) => {
          console.log('[Auth] Token refreshed');
          this.setTokens(res.accessToken, res.refreshToken, res.expiresIn);
        },
        error: (error) => {
          console.error('[Auth] Refresh failed:', error);
          this.logout(false);
        },
      }),
      catchError((error: HttpErrorResponse) => {
        console.error('[Auth] Refresh catchError:', error);
        this.logout(false);
        return throwError(() => error);
      }),
    );
  }

  // ===== RESET GOOGLE CLIENT =====
  private resetGoogleClient(): void {
    console.log('[Auth] Resetting Google client...');

    if (typeof google !== 'undefined') {
      try {
        if (google.accounts?.id) {
          google.accounts.id.disableAutoSelect();
          console.log('[Auth] Google auto-select disabled');
        }

        document.cookie.split(';').forEach((c) => {
          const cookie = c.trim();
          if (
            cookie.startsWith('G_AUTHUSER_') ||
            cookie.startsWith('gsi_') ||
            cookie.includes('google')
          ) {
            document.cookie =
              cookie.split('=')[0] + '=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;';
          }
        });

        const keysToRemove = [];
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && (key.startsWith('gsi_') || key.startsWith('google_') || key.includes('gsi'))) {
            keysToRemove.push(key);
          }
        }
        keysToRemove.forEach((key) => localStorage.removeItem(key));

        console.log('[Auth] Google client reset complete');
      } catch (e) {
        console.warn('[Auth] Could not reset Google client:', e);
      }
    }
  }

  // ===== LOGOUT =====
  /**
   * Полный logout: отзывает refresh-токен на сервере, сбрасывает Google-сессию,
   * чистит локальное состояние (куки/storage/сигналы) и оповещает другие вкладки.
   */
  logout(redirectToLogin: boolean = true): void {
    console.log('[Auth] Logout');

    const refreshToken = this.getRefreshToken();

    const finish = () => this.performLocalLogout(redirectToLogin, /* broadcast */ true);

    if (this.isBrowser && refreshToken) {
      this.http.post(`${this.apiUrl}/Auth/logout`, { refreshToken }).subscribe({
        next: () => finish(),
        // Даже если сервер недоступен/токен уже невалиден — всё равно
        // чистим локальную сессию, не блокируем пользователя.
        error: (err) => {
          console.warn('[Auth] Server-side logout failed, clearing locally anyway:', err);
          finish();
        },
      });
    } else {
      finish();
    }
  }

  /**
   * Локальная часть logout — без похода на сервер. Используется как самим
   * logout(), так и обработчиком сообщений от других вкладок (чтобы не уйти
   * в бесконечный цикл повторного broadcast).
   */
  private performLocalLogout(redirectToLogin: boolean, broadcast: boolean = false): void {
    this.resetGoogleClient();
    this.clearTokens();

    try {
      localStorage.clear();
      sessionStorage.clear();
    } catch (e) {
      console.warn('[Auth] Could not clear storage:', e);
    }

    this.accessToken.set(null);
    this.userData.set(null);

    if (broadcast) {
      this.logoutChannel?.postMessage('logout');
    }

    if (redirectToLogin) {
      this.router.navigate(['/login'], { replaceUrl: true });
    }
  }

  // ===== GETTERS =====
  getAccessToken(): string | null {
    return this.accessToken();
  }

  getRefreshToken(): string | null {
    return CookieService.getCookie('refreshToken');
  }

  getUserRole(): string {
    return this.userData()?.role || '';
  }

  getClientId(): string | null {
    return this.userData()?.clientId || null;
  }

  getUserId(): string | null {
    return this.userData()?.id || null;
  }

  getUserEmail(): string | null {
    return this.userData()?.email || null;
  }

  getFullName(): string | null {
    return this.userData()?.fullName || null;
  }

  getAvatarUrl(): string | null {
    return this.userData()?.avatarUrl || this.userData()?.picture || null;
  }

  // ===== CHECK AUTH STATUS =====
  checkAuthStatus(): boolean {
    const token = this.getAccessToken();
    if (!token) return false;

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const exp = payload.exp * 1000;
      if (Date.now() > exp) {
        console.log('[Auth] Token expired');
        this.logout(false);
        return false;
      }
    } catch (error) {
      console.error('[Auth] Failed to parse token:', error);
      return false;
    }

    return true;
  }

  isTokenValid(): boolean {
    const token = this.getAccessToken();
    if (!token) return false;

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const exp = payload.exp * 1000;
      return Date.now() < exp - 60000;
    } catch {
      return false;
    }
  }

  getTokenExpiration(): Date | null {
    const token = this.getAccessToken();
    if (!token) return null;

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const exp = payload.exp * 1000;
      return new Date(exp);
    } catch {
      return null;
    }
  }

  // ===== UPDATE USER =====
  updateUser(user: Partial<UserProfile>): void {
    const currentUser = this.userData();
    if (currentUser) {
      this.saveUser({ ...currentUser, ...user });
    }
  }

  // ===== PRIVATE METHODS =====
  private setTokens(access: string, refresh: string, expiresIn?: number): void {
    if (!this.isBrowser) return;

    try {
      CookieService.setCookie('accessToken', access, 1);
      CookieService.setCookie('refreshToken', refresh, 7);
      this.accessToken.set(access);
      console.log('[Auth] Tokens set, isAuthenticated:', this.isAuthenticated());
    } catch (error) {
      console.error('[Auth] Failed to set tokens:', error);
    }
  }

  private saveUser(user: UserProfile): void {
    if (!this.isBrowser) return;

    try {
      CookieService.setCookie('user', JSON.stringify(user), 7);
      this.userData.set(user);
      console.log('[Auth] User saved, user signal updated');
    } catch (error) {
      console.error('[Auth] Failed to save user data:', error);
    }
  }

  private clearTokens(): void {
    if (!this.isBrowser) return;

    CookieService.deleteCookie('accessToken');
    CookieService.deleteCookie('refreshToken');
    CookieService.deleteCookie('user');

    this.accessToken.set(null);
    this.userData.set(null);
    console.log('[Auth] Tokens cleared, isAuthenticated:', this.isAuthenticated());
  }

  isAdminOrManager(): boolean {
    const role = this.getUserRole();
    return role === 'admin' || role === 'client';
  }

  isAdmin(): boolean {
    return this.getUserRole() === 'admin';
  }

  isManager(): boolean {
    return this.getUserRole() === 'client';
  }

  hasRole(role: string | string[]): boolean {
    const userRole = this.getUserRole();
    if (!userRole) return false;

    if (Array.isArray(role)) {
      return role.includes(userRole);
    }
    return userRole === role;
  }
}
