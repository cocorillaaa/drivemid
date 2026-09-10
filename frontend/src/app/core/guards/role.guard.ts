import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

import { UserRole } from '../models/fleet.models';
import { AuthService } from '../services/auth.service';
import { homeRouteFor } from '../utils/role-routes';

/**
 * Mantiene la ruta sincronizada con el rol del usuario autenticado.
 *
 * El rol lo determina el backend a partir del token; el cliente nunca lo
 * elige. Si un Administrador de Unidad intenta abrir el panel global (o al
 * contrario), se le redirige a su propia vista.
 *
 * El destino se calcula con el rol **activo**, nunca con la ruta solicitada:
 * redirigir a la misma ruta vigilada produciría un ciclo infinito.
 */
export function roleGuard(expected: UserRole): CanActivateFn {
  return () => {
    const auth = inject(AuthService);
    const router = inject(Router);

    if (auth.role() === expected) return true;

    return router.parseUrl(homeRouteFor(auth.role()));
  };
}
