import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';

import { environment } from '../../../environments/environment';
import { AuthService } from '../services/auth.service';
import { TokenStorageService } from '../services/token-storage.service';

/**
 * Interceptor HTTP de la API.
 *
 * - Añade `Accept: application/json` a todas las peticiones a la API para que
 *   Laravel responda siempre en JSON (nunca con una redirección HTML).
 * - Adjunta el token Bearer cuando hay una sesión activa.
 * - Ante un 401 cierra la sesión local y devuelve al usuario a la pantalla de
 *   acceso, conservando la ruta solicitada para retomarla tras autenticarse.
 */
export const authInterceptor: HttpInterceptorFn = (request, next) => {
  const storage = inject(TokenStorageService);
  const auth = inject(AuthService);
  const router = inject(Router);

  if (!request.url.startsWith(environment.apiBaseUrl)) {
    return next(request);
  }

  const token = storage.read();

  const authorized = request.clone({
    setHeaders: {
      Accept: 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  return next(authorized).pipe(
    catchError((error: unknown) => {
      const isUnauthorized = error instanceof HttpErrorResponse && error.status === 401;

      if (isUnauthorized) {
        const wasAuthenticated = auth.isAuthenticated();
        auth.clearLocalSession();

        void router.navigate(['/acceso'], {
          queryParams: wasAuthenticated ? { motivo: 'sesion-expirada' } : undefined,
        });
      }

      return throwError(() => error);
    }),
  );
};
