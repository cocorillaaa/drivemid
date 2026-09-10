import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
} from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';

import { FleetService } from '../../../core/services/fleet.service';
import { PlatformNavService, PlatformView } from '../../../core/services/platform-nav.service';
import { SessionService } from '../../../core/services/session.service';
import { ToastService } from '../../../core/services/toast.service';
import { formatNumber, initials, relativeTime } from '../../../core/utils/fleet-format';
import { RoleSwitcherComponent } from '../components/role-switcher/role-switcher';

/**
 * Shell de la plataforma ejecutiva.
 *
 * Contiene la barra superior con el selector de roles (simulación de sesión),
 * la navegación entre la vista global de flota y la vista de unidad asignada,
 * y el indicador de origen de datos / última sincronización.
 */
@Component({
  selector: 'vf-platform-shell',
  imports: [RouterOutlet, RouterLink, RoleSwitcherComponent],
  templateUrl: './platform-shell.html',
  styleUrl: './platform-shell.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PlatformShell {
  private readonly fleet = inject(FleetService);
  private readonly session = inject(SessionService);
  private readonly nav = inject(PlatformNavService);
  private readonly toast = inject(ToastService);

  /** Rol activo. */
  readonly role = this.session.role;

  /** Vista activa derivada del rol. */
  readonly view = computed<PlatformView>(() => this.nav.viewFor(this.role()));

  /** Perfil del usuario en sesión. */
  readonly profile = this.session.profile;

  /** Resumen de flota para las píldoras de contexto. */
  readonly summary = this.fleet.summary;

  /** Origen de datos actual. */
  readonly dataSource = this.fleet.dataSource;

  /** Marca del último refresco. */
  readonly lastSync = this.fleet.lastSync;

  /** Estado de carga. */
  readonly loading = this.fleet.loading;

  /** Helpers de formato expuestos a la plantilla. */
  readonly formatNumber = formatNumber;
  readonly initials = initials;
  readonly relativeTime = relativeTime;

  constructor() {
    this.fleet.ensureLoaded();
  }

  /** Navega entre las dos vistas de la plataforma. */
  go(view: PlatformView): void {
    this.nav.switchView(view);
  }

  /** Fuerza un refresco de la telemetría. */
  refresh(): void {
    this.fleet.refresh();
    this.toast.info('Telemetría actualizada', 'Se consultaron las posiciones más recientes.');
  }
}
