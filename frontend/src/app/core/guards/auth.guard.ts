import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { catchError, map, of } from 'rxjs';

import { AuthService } from '../services/auth.service';
import { homeRouteFor } from '../utils/role-routes';

/**
 * Exige una sesión válida.
 *
 * Si existe un token almacenado pero aún no se ha resuelto el perfil, lo
 * recupera del backend antes de decidir. Cuando no hay sesión, envía a la
 * pantalla de acceso conservando la ruta solicitada en `destino`.
 */
export const authGuard: CanActivateFn = (_route, state) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (auth.isAuthenticated()) return true;

  const toLogin = () =>
    router.createUrlTree(['/acceso'], { queryParams: { destino: state.url } });

  if (!auth.hasToken()) return toLogin();

  return auth
    .restoreSession()
    .pipe(map(() => true as const), catchError(() => of(toLogin())));
};

/**
 * Evita que un usuario ya autenticado vuelva a la pantalla de acceso:
 * lo lleva directamente a la vista que corresponde a su rol.
 */
export const guestGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (auth.isAuthenticated()) {
    return router.parseUrl(homeRouteFor(auth.role()));
  }

  if (!auth.hasToken()) return true;

  return auth.restoreSession().pipe(
    map((user) => router.parseUrl(homeRouteFor(user.role))),
    catchError(() => of(true as const)),
  );
};
