import { Routes } from '@angular/router';
import { AuthGuard, GuestGuard } from './services/auth/auth-guard';
import { SelectSignUp } from './components/signup/select-sign-up/select-sign-up';
import { SignupPersonal } from './components/signup/personal-info/personal-info';
import { SignupCompany } from './components/signup/company-info/company-info';
import { SignupContact } from './components/signup/contact-info/contact-info';

export const routes: Routes = [
  { path: '', redirectTo: 'menu/structure', pathMatch: 'full' },

  // Auth — standalone screens, no layout shell
  {
    path: 'login',
    loadComponent: () => import('./pages/sign-in/sign-in').then((m) => m.SignIn),
    canActivate: [GuestGuard],
  },

  {
    path: 'sign-up',
    loadComponent: () => import('./pages/sign-up/sign-up').then((m) => m.SignUp),
    children: [
      { path: '', component: SelectSignUp }, // ← выбор способа
      { path: 'personal', component: SignupPersonal }, // ← личные данные
      { path: 'company', component: SignupCompany }, // ← компания
      { path: 'contact', component: SignupContact }, // ← контакты
    ],
    canActivate: [GuestGuard],
  },

  {
    path: '',
    loadComponent: () => import('./layout/layout/layout').then((m) => m.Layout),
    canActivate: [AuthGuard],
    children: [
      // Menu
      {
        path: 'menu/structure',
        loadComponent: () => import('./pages/menu/structure/structure').then((m) => m.Structure),
      },
      {
        path: 'menu/structure/add-new',
        loadComponent: () =>
          import('./pages/menu/structure/add-new-item-menu/add-new-item-menu').then(
            (m) => m.AddNewItemMenu,
          ),
      },
      {
        path: 'menu/stop-list',
        loadComponent: () => import('./pages/menu/stop-list/stop-list').then((m) => m.StopList),
      },
      {
        path: 'menu/diets-and-allergens',
        loadComponent: () =>
          import('./pages/menu/diets-and-allergens/diets-and-allergens').then(
            (m) => m.DietsAndAllergens,
          ),
      },

      // About Us
      {
        path: 'about-us/welcome-page',
        loadComponent: () =>
          import('./pages/about-us/welcome-page/welcome-page').then((m) => m.WelcomePage),
      },
      {
        path: 'about-us/staff',
        loadComponent: () => import('./pages/about-us/staff/staff').then((m) => m.Staff),
      },

      // Orders
      {
        path: 'orders/today',
        loadComponent: () => import('./pages/orders/today/today').then((m) => m.Today),
      },
      {
        path: 'orders/history',
        loadComponent: () => import('./pages/orders/history/history').then((m) => m.History),
      },
      {
        path: 'orders/analitics',
        loadComponent: () => import('./pages/orders/analytics/analytics').then((m) => m.Analytics),
      },

      // Settings
      {
        path: 'settings/language',
        loadComponent: () => import('./pages/settings/language/language').then((m) => m.Language),
      },
      {
        path: 'settings/profile',
        loadComponent: () => import('./pages/settings/profile/profile').then((m) => m.Profile),
      },
    ],
  },

  { path: '**', redirectTo: 'menu/structure' },
];
