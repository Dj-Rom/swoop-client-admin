// interceptors/auth.interceptor.ts
import { HttpInterceptorFn, HttpErrorResponse, HttpRequest } from '@angular/common/http';
import { inject } from '@angular/core';
import {
  catchError,
  switchMap,
  throwError,
  Observable,
  BehaviorSubject,
  filter,
  take,
  timeout,
} from 'rxjs';
import { AuthService } from '../auth/auth-service';
import { Router } from '@angular/router';

// ✅ FIXED: Case-insensitive regex for auth endpoints
const AUTH_ENDPOINT_PATTERN = /\/Auth\/(login|register|google|google-signup|refresh)$/i;

// Очередь запросов во время обновления токена
let isRefreshing = false;
const refreshTokenSubject = new BehaviorSubject<string | null>(null);

// Типы ошибок, при которых нужно перенаправлять на логин
const AUTH_ERRORS = [401, 403];
const CLIENT_ERRORS = ['Client', 'client', 'database is not ready', 'Client ID not found'];

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const token = authService.getAccessToken();

  // ✅ FIXED: Use regex for case-insensitive matching
  const isAuthEndpoint = AUTH_ENDPOINT_PATTERN.test(req.url);

  // Клонируем запрос с заголовком Authorization, если токен есть и это не auth-эндпоинт
  let authReq = req;
  if (token && !isAuthEndpoint) {
    authReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
      },
    });
  }

  // Логируем исходящий запрос для отладки
  console.log('[Interceptor] Sending request to:', authReq.url);
  console.log('[Interceptor] Is auth endpoint:', isAuthEndpoint);
  console.log('[Interceptor] Headers:', authReq.headers);

  return next(authReq).pipe(
    timeout(60000), // 60 секунд таймаут
    catchError((error: HttpErrorResponse | Error) => {
      console.log('[Interceptor] Error caught:', error);
      return handleAllErrors(error, req, next, authService, router, isAuthEndpoint);
    }),
  );
};

/**
 * Централизованная обработка всех ошибок
 */
function handleAllErrors(
  error: any,
  req: HttpRequest<unknown>,
  next: any,
  authService: AuthService,
  router: Router,
  isAuthEndpoint: boolean,
): Observable<any> {
  // 1. Сетевые ошибки (status 0) или таймаут – НЕ разлогиниваем!
  // if (error.status === 0 || error.name === 'TimeoutError') {
  //   console.error('[Interceptor] Network/Timeout error:', error);
  //   // ❌ НЕ удаляем токен и не редиректим на логин
  //   return throwError(() => new Error('Network error. Please check your connection.'));
  // }

  // 2. Ошибки авторизации (401, 403) – пробуем обновить токен или разлогиниваем
  if (AUTH_ERRORS.includes(error.status) && !isAuthEndpoint) {
    console.warn(`[Interceptor] Auth error ${error.status}, attempting token refresh...`);

    // Если токен ещё валиден, но почему-то 401 – пробуем обновить
    if (authService.isTokenValid()) {
      console.log('[Interceptor] Token is still valid, retrying with same token...');
      const retryReq = req.clone({
        setHeaders: { Authorization: `Bearer ${authService.getAccessToken()}` },
      });
      return next(retryReq);
    }

    // Иначе пытаемся обновить токен через refresh
    return handleTokenRefreshWithQueue(req, next, authService);
  }

  // 3. Ошибки клиента (500 с сообщением о клиенте)
  if (error.status === 500) {
    const errorMessage = error.error?.message || error.message || '';
    console.error('[Interceptor] Server error:', errorMessage);

    const isClientError = CLIENT_ERRORS.some((keyword) =>
      errorMessage.toLowerCase().includes(keyword.toLowerCase()),
    );

    if (isClientError) {
      console.warn('[Interceptor] Client error detected, redirecting to login');
      authService.logout(false);
      router.navigate(['/login'], { replaceUrl: true });
      return throwError(() => new Error('Session expired. Please login again.'));
    }

    // Другие ошибки 500
    return throwError(() => new Error('Server error. Please try again later.'));
  }

  // 4. 404 Not Found
  if (error.status === 404) {
    console.warn('[Interceptor] 404 Not Found:', req.url);
    return throwError(() => new Error('Resource not found.'));
  }

  // 5. 400 Bad Request
  if (error.status === 400) {
    console.warn('[Interceptor] 400 Bad Request:', error.error?.message || error.message);
    const message = error.error?.message || 'Invalid request. Please check your input.';
    return throwError(() => new Error(message));
  }

  // 6. 409 Conflict
  if (error.status === 409) {
    console.warn('[Interceptor] 409 Conflict:', error.error?.message || error.message);
    const message = error.error?.message || 'Conflict. Please try again.';
    return throwError(() => new Error(message));
  }

  // 7. 429 Too Many Requests
  if (error.status === 429) {
    console.warn('[Interceptor] 429 Too Many Requests');
    return throwError(() => new Error('Too many requests. Please try again later.'));
  }

  // 8. 503 Service Unavailable
  if (error.status === 503) {
    console.warn('[Interceptor] 503 Service Unavailable');
    authService.logout(false);
    router.navigate(['/login'], { replaceUrl: true });
    return throwError(() => new Error('Service unavailable. Please try again later.'));
  }

  // 9. Любые другие ошибки (включая 500 без client-сообщения)
  console.error('[Interceptor] Unhandled error:', error);

  // Для безопасности – если ошибка клиентская (4xx), возможно проблема с авторизацией
  if (error.status >= 400 && error.status < 500) {
    if (!isAuthEndpoint) {
      authService.logout(false);
      router.navigate(['/login'], { replaceUrl: true });
      return throwError(() => new Error('Authentication error. Please login again.'));
    }
  }

  return throwError(() => error);
}

/**
 * Обновление токена с очередью, чтобы не создавать множество параллельных запросов
 */
function handleTokenRefreshWithQueue(
  req: HttpRequest<unknown>,
  next: any,
  authService: AuthService,
): Observable<any> {
  const refreshToken = authService.getRefreshToken();

  if (!refreshToken) {
    console.warn('[Interceptor] No refresh token available, logging out...');
    authService.logout(false);
    return throwError(() => new Error('Session expired. Please login again.'));
  }

  if (!isRefreshing) {
    isRefreshing = true;
    refreshTokenSubject.next(null);

    return authService.refresh().pipe(
      switchMap((response) => {
        isRefreshing = false;
        const newToken = authService.getAccessToken();

        if (newToken) {
          refreshTokenSubject.next(newToken);
          console.log('[Interceptor] Token refresh successful');

          const retryReq = req.clone({
            setHeaders: { Authorization: `Bearer ${newToken}` },
          });
          return next(retryReq);
        } else {
          console.error('[Interceptor] No token after refresh');
          authService.logout(false);
          return throwError(() => new Error('Authentication failed'));
        }
      }),
      catchError((refreshError: HttpErrorResponse) => {
        isRefreshing = false;
        console.error('[Interceptor] Token refresh failed:', refreshError.status);
        authService.logout(false);
        const errorMessage =
          refreshError.status === 400
            ? 'Invalid refresh token. Please login again.'
            : 'Session expired. Please login again.';
        return throwError(() => new Error(errorMessage));
      }),
    );
  } else {
    // Если уже идёт обновление, ждём новый токен
    return refreshTokenSubject.pipe(
      filter((token) => token !== null),
      take(1),
      switchMap((token) => {
        const retryReq = req.clone({
          setHeaders: { Authorization: `Bearer ${token}` },
        });
        return next(retryReq);
      }),
    );
  }
}

// Экспорт для использования
export const authInterceptorWithQueue = authInterceptor;
export { authInterceptor as default };
