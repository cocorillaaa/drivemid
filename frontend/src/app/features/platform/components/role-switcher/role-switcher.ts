import { ChangeDetectionStrategy, Component, inject } from '@angular/core';

import { FleetService } from '../../../../core/services/fleet.service';
import { PlatformNavService } from '../../../../core/services/platform-nav.service';
import { ROLE_PROFILES, SessionService, UserRole } from '../../../../core/services/session.service';
import { formatPhone } from '../../../../core/utils/fleet-format';

/**
 * Selector rápido de sesión (simulación de roles).
 *
 * Permite alternar entre "Superusuario" (vista global de flota) y
 * "Administrador de Unidad" (vista de una sola unidad) sin login.
 * Al elegir el segundo rol se habilita el selector de unidad asignada.
 */
@Component({
  selector: 'vf-role-switcher',
  templateUrl: './role-switcher.html',
  styleUrl: './role-switcher.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RoleSwitcherComponent {
  private readonly session = inject(SessionService);
  private readonly nav = inject(PlatformNavService);
  private readonly fleet = inject(FleetService);

  /** Rol activo. */
  readonly role = this.session.role;

  /** Perfiles disponibles en el selector. */
  readonly profiles = [ROLE_PROFILES.superuser, ROLE_PROFILES.unit_admin];

  /** Unidades seleccionables como "unidad asignada". */
  readonly vehicles = this.fleet.vehicles;

  /** Unidad asignada actual. */
  readonly activeUnitId = this.session.activeUnitId;

  /** Formateador de teléfono usado en el resumen de la unidad. */
  readonly formatPhone = formatPhone;

  /** Cambia el rol activo y navega a la vista correspondiente. */
  select(role: UserRole): void {
    if (role === this.role()) return;
    this.nav.switchView(role === 'superuser' ? 'fleet' : 'unit');
  }

  /** Reasigna la unidad al rol "Administrador de Unidad". */
  onUnitChange(event: Event): void {
    const unitId = (event.target as HTMLSelectElement).value;
    this.session.setActiveUnit(unitId);
  }
}
