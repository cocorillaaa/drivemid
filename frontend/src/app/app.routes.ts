import { Routes } from '@angular/router';

import { authGuard, guestGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';

/**
 * Mapa de rutas del prototipo de Drive Mid.
 *
 * - `/`            landing pública.
 * - `/acceso`      pantalla de credenciales.
 * - `/plataforma`  shell protegido; la vista interna depende del rol que el
 *                  backend asigne al token.
 *   - `/plataforma/flota`  → Superusuario (vista global).
 *   - `/plataforma/unidad` → Administrador de Unidad (sólo su unidad).
 */
export const routes: Routes = [
  {
    path: '',
    title: 'Drive Mid · Prototipo de demostración',
    loadComponent: () => import('./features/landing/landing-page').then((m) => m.LandingPage),
  },
  {
    path: 'acceso',
    title: 'Acceso · Drive Mid (demo)',
    canActivate: [guestGuard],
    loadComponent: () => import('./features/auth/login-page/login-page').then((m) => m.LoginPage),
  },
  {
    path: 'plataforma',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/platform/platform-shell/platform-shell').then((m) => m.PlatformShell),
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'flota' },
      {
        path: 'flota',
        title: 'Panel de flota · Drive Mid (demo)',
        canActivate: [roleGuard('superuser')],
        loadComponent: () =>
          import('./features/platform/superuser-dashboard/superuser-dashboard').then(
            (m) => m.SuperuserDashboard,
          ),
      },
      {
        path: 'unidad',
        title: 'Mi unidad · Drive Mid (demo)',
        canActivate: [roleGuard('unit_admin')],
        loadComponent: () =>
          import('./features/platform/unit-admin-dashboard/unit-admin-dashboard').then(
            (m) => m.UnitAdminDashboard,
          ),
      },
    ],
  },
  { path: '**', redirectTo: '' },
];
