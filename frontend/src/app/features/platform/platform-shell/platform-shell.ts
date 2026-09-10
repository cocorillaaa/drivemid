import {
  ChangeDetectionStrategy,
  Component,
  OnDestroy,
  computed,
  inject,
  signal,
} from '@angular/core';
import { Router, RouterLink, RouterOutlet } from '@angular/router';

import { environment } from '../../../../environments/environment';
import { AuthService } from '../../../core/services/auth.service';
import { FleetService } from '../../../core/services/fleet.service';
import { ToastService } from '../../../core/services/toast.service';
import { formatNumber } from '../../../core/utils/fleet-format';
import { homeRouteFor } from '../../../core/utils/role-routes';

/**
 * Shell de la plataforma ejecutiva.
 *
 * Muestra la identidad de la sesión (usuario, rol y unidad asignada), el
 * estado de sincronización de la telemetría —que se refresca solo— y la
 * navegación propia del rol. No existe selector de roles: el alcance de la
 * sesión lo determina el backend a partir del token.
 */
@Component({
  selector: 'vf-platform-shell',
  imports: [RouterOutlet, RouterLink],
  templateUrl: './platform-shell.html',
  styleUrl: './platform-shell.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PlatformShell implements OnDestroy {
  private readonly auth = inject(AuthService);
  private readonly fleet = inject(FleetService);
  private readonly router = inject(Router);
  private readonly toast = inject(ToastService);

  /** Usuario autenticado. */
  readonly user = this.auth.user;

  /** `true` cuando la sesión tiene vista global de flota. */
  readonly isSuperuser = this.auth.isSuperuser;

  /** Resumen de flota (sólo Superusuario). */
  readonly summary = this.fleet.summary;

  /** `true` mientras se refresca la telemetría. */
  readonly refreshing = this.fleet.refreshing;

  /** Texto "hace X" que avanza cada segundo. */
  readonly syncAgo = this.fleet.syncAgo;

  /** `true` si la última sincronización es reciente. */
  readonly syncFresh = this.fleet.syncFresh;

  /** Cadencia del refresco automático, en segundos. */
  readonly refreshSeconds = Math.round(environment.telemetryRefreshMs / 1000);

  /** Ruta de inicio del rol autenticado. */
  readonly homeRoute = computed(() => homeRouteFor(this.auth.role()));

  /** `true` cuando el menú de usuario está desplegado. */
  readonly menuOpen = signal(false);

  /** Helper de formato expuesto a la plantilla. */
  readonly formatNumber = formatNumber;

  constructor() {
    // Carga inicial + refresco automático de telemetría.
    this.fleet.load();
    this.fleet.startAutoRefresh();
  }

  ngOnDestroy(): void {
    this.fleet.stopAutoRefresh();
  }

  /** Alterna el menú de usuario. */
  toggleMenu(): void {
    this.menuOpen.update((open) => !open);
  }

  /** Cierra el menú de usuario. */
  closeMenu(): void {
    this.menuOpen.set(false);
  }

  /** Fuerza un refresco manual de la telemetría. */
  refresh(): void {
    this.fleet.refresh();
  }

  /** Cierra la sesión y vuelve a la pantalla de acceso. */
  logout(): void {
    this.closeMenu();

    const name = this.user()?.name ?? '';
    this.auth.logout();
    this.toast.info('Sesión finalizada', `${name} cerró la sesión correctamente.`);

    void this.router.navigate(['/acceso']);
  }
}
