import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: 'menu/structure', pathMatch: 'full' },

  // Menu
  {
    path: 'menu/structure',
    loadComponent: () => import('./pages/menu/structure/structure').then((m) => m.Structure),
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

  { path: '**', redirectTo: 'menu/structure' },
];
