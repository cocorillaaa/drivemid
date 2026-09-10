import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

import { SessionService, UserRole } from '../services/session.service';

/** Ruta canónica de cada rol. */
const ROLE_ROUTE: Record<UserRole, string> = {
  superuser: '/plataforma/flota',
  unit_admin: '/plataforma/unidad',
};

/**
 * Guard funcional que mantiene la ruta sincronizada con el rol activo.
 *
 * En lugar de bloquear la navegación, redirige a la vista que corresponde
 * al rol en sesión, de modo que el selector de roles y la URL nunca queden
 * en estados contradictorios.
 *
 * Importante: el destino de la redirección se calcula a partir del rol
 * **activo**, nunca de la ruta solicitada. Redirigir a la misma ruta
 * vigilada provocaría un ciclo infinito de navegación (y dejaría la
 * aplicación sin renderizar al abrir un enlace directo).
 */
export function roleGuard(expected: UserRole): CanActivateFn {
  return () => {
    const session = inject(SessionService);
    const router = inject(Router);

    if (session.role() === expected) return true;

    // `session.role()` es distinto de `expected`, por lo que el destino
    // siempre está protegido por el otro guard y la navegación termina.
    return router.parseUrl(ROLE_ROUTE[session.role()]);
  };
}
