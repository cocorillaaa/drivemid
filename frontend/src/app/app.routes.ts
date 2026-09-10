import { Routes } from '@angular/router';

import { roleGuard } from './core/guards/role.guard';

/**
 * Mapa de rutas de Vanguard Fleet.
 *
 * - `/` landing pública con formulario de captación.
 * - `/plataforma` shell autenticado con el selector de roles.
 *   - `/plataforma/flota`  → dashboard de Superusuario (vista global).
 *   - `/plataforma/unidad` → dashboard de Administrador de Unidad.
 */
export const routes: Routes = [
  {
    path: '',
    title: 'Vanguard Fleet · Movilidad ejecutiva y gestión de flotillas',
    loadComponent: () => import('./features/landing/landing-page').then((m) => m.LandingPage),
  },
  {
    path: 'plataforma',
    loadComponent: () =>
      import('./features/platform/platform-shell/platform-shell').then((m) => m.PlatformShell),
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'flota' },
      {
        path: 'flota',
        title: 'Panel de flota · Vanguard Fleet',
        canActivate: [roleGuard('superuser')],
        loadComponent: () =>
          import('./features/platform/superuser-dashboard/superuser-dashboard').then(
            (m) => m.SuperuserDashboard,
          ),
      },
      {
        path: 'unidad',
        title: 'Mi unidad · Vanguard Fleet',
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
