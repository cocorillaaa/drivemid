import {
  ChangeDetectionStrategy,
  Component,
  OnDestroy,
  computed,
  inject,
  signal,
} from '@angular/core';
import { Router, RouterLink, RouterOutlet } from '@angular/router';

import { AuthService } from '../../../core/services/auth.service';
import { FleetService } from '../../../core/services/fleet.service';
import { ToastService } from '../../../core/services/toast.service';
import { formatNumber } from '../../../core/utils/fleet-format';
import { homeRouteFor } from '../../../core/utils/role-routes';

/**
 * Shell de la plataforma ejecutiva.
 *
 * Muestra la identidad de la sesión (usuario, rol y unidad asignada) y la
 * navegación propia del rol. No existe selector de roles: el alcance de la
 * sesión lo determina el backend a partir del token.
 */
@Component({
  selector: 'dl-platform-shell',
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

  /** Cierra la sesión y vuelve a la pantalla de acceso. */
  logout(): void {
    this.closeMenu();

    const name = this.user()?.name ?? '';
    this.auth.logout();
    this.toast.info('Sesión finalizada', `${name} cerró la sesión correctamente.`);

    void this.router.navigate(['/acceso']);
  }
}
