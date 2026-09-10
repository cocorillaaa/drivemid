import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';

import { SessionService, UserRole } from './session.service';
import { ToastService } from './toast.service';

/** Vistas principales de la plataforma. */
export type PlatformView = 'fleet' | 'unit';

/** Ruta asociada a cada vista. */
const VIEW_ROUTE: Record<PlatformView, string> = {
  fleet: '/plataforma/flota',
  unit: '/plataforma/unidad',
};

/** Rol asociado a cada vista. */
const VIEW_ROLE: Record<PlatformView, UserRole> = {
  fleet: 'superuser',
  unit: 'unit_admin',
};

/**
 * Coordina la navegación de la plataforma con el rol simulado.
 *
 * Centraliza la regla "una vista = un rol" para que el selector de sesión,
 * el menú lateral y los accesos desde la tabla de flota se comporten igual.
 */
@Injectable({ providedIn: 'root' })
export class PlatformNavService {
  private readonly session = inject(SessionService);
  private readonly router = inject(Router);
  private readonly toast = inject(ToastService);

  /** Vista activa derivada del rol en sesión. */
  viewFor(role: UserRole = this.session.role()): PlatformView {
    return role === 'superuser' ? 'fleet' : 'unit';
  }

  /**
   * Cambia de vista y sincroniza el rol de la sesión simulada.
   *
   * @param view vista destino.
   * @param opts.unitId  unidad a asignar (al entrar como Administrador de Unidad).
   * @param opts.announce muestra un toast confirmando el cambio de rol.
   */
  switchView(view: PlatformView, opts: { unitId?: string; announce?: boolean } = {}): void {
    const targetRole = VIEW_ROLE[view];
    const roleChanged = this.session.role() !== targetRole;

    if (opts.unitId) this.session.setActiveUnit(opts.unitId);
    this.session.setRole(targetRole);

    void this.router.navigate([VIEW_ROUTE[view]]);

    if (roleChanged && opts.announce !== false) {
      this.toast.info(
        targetRole === 'superuser'
          ? 'Sesión: Superusuario'
          : 'Sesión: Administrador de Unidad',
        targetRole === 'superuser'
          ? 'Vista global de la flota habilitada.'
          : 'Vista restringida a la unidad asignada.',
      );
    }
  }
}
