// guards/auth.guard.ts
import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth-service';

export const AuthGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const isAuth = authService.isAuthenticated();
  const user = authService.user();
  const token = authService.getAccessToken();

  console.log('[AuthGuard] Checking authentication for:', state.url);
  console.log('[AuthGuard] isAuthenticated:', isAuth);
  console.log('[AuthGuard] User:', user);
  console.log('[AuthGuard] Token:', token?.substring(0, 20) + '...');

  // 1. Если не авторизован - на логин
  if (!isAuth) {
    console.log('[AuthGuard] ❌ Not authenticated, redirecting to login');
    router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
    return false;
  }

  // 2. Если токен не валидный - на логин
  if (!authService.isTokenValid()) {
    console.log('[AuthGuard] ❌ Token invalid, redirecting to login');
    authService.logout(false);
    router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
    return false;
  }

  // 3. Если нет clientId - на логин
  if (user && !user.clientId) {
    console.log('[AuthGuard] ❌ User has no clientId, redirecting to login');
    authService.logout(false);
    router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
    return false;
  }

  // УДАЛИТЕ ЭТУ ПРОВЕРКУ если isActive не существует
  // if (user && !user.isActive) {
  //   console.log('[AuthGuard] ❌ User is not active, redirecting to login');
  //   authService.logout(false);
  //   router.navigate(['/login']);
  //   return false;
  // }

  // 4. Если пользователь - гость - на страницу гостя
  if (user?.role === 'guest') {
    console.log('[AuthGuard] ❌ Guest user, redirecting to guest page');
    router.navigate(['/guest']);
    return false;
  }

  // 5. Проверка ролей для маршрута
  const requiredRoles = route.data?.['roles'] as string[] | undefined;
  if (requiredRoles && requiredRoles.length > 0) {
    const userRole = user?.role || 'guest';
    const hasRole = requiredRoles.includes(userRole);
    if (!hasRole) {
      console.log(`[AuthGuard] ❌ User role "${userRole}" not allowed. Required:`, requiredRoles);
      router.navigate(['/unauthorized']);
      return false;
    }
  }

  console.log('[AuthGuard] ✅ Allowing access to:', state.url);
  return true;
};

export const GuestGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const isAuth = authService.isAuthenticated();
  const user = authService.user();

  console.log('[GuestGuard] Checking authentication:', isAuth);

  // Если не авторизован - гость, разрешаем доступ
  if (!isAuth) {
    console.log('[GuestGuard] User is guest, allowing access');
    return true;
  }

  // Если пользователь с ролью 'guest' - разрешаем
  if (user?.role === 'guest') {
    console.log('[GuestGuard] User has guest role, allowing access');
    return true;
  }

  // Если авторизован - перенаправляем на главную
  console.log('[GuestGuard] User is authenticated, redirecting to home');
  router.navigate(['/']);
  return false;
};

export const adminGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const isAuth = authService.isAuthenticated();
  const user = authService.user();

  if (!isAuth) {
    console.log('[AdminGuard] Not authenticated, redirecting to login');
    router.navigate(['/login']);
    return false;
  }

  if (user?.role !== 'admin' && user?.role !== 'owner') {
    console.log('[AdminGuard] User is not admin, redirecting to home');
    router.navigate(['/']);
    return false;
  }

  return true;
};
