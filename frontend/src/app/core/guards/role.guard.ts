import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

import { SessionService, UserRole } from '../services/session.service';

/**
 * Guard funcional que mantiene la ruta sincronizada con el rol activo.
 *
 * En lugar de bloquear la navegación, redirige a la vista que corresponde
 * al rol en sesión, de modo que el selector de roles y la URL nunca queden
 * en estados contradictorios.
 */
export function roleGuard(expected: UserRole): CanActivateFn {
  return () => {
    const session = inject(SessionService);
    const router = inject(Router);

    if (session.role() === expected) return true;

    return router.parseUrl(
      expected === 'superuser' ? '/plataforma/flota' : '/plataforma/unidad',
    );
  };
}
