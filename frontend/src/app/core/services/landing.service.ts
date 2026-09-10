import { Injectable, computed, inject, signal } from '@angular/core';
import { catchError, finalize, of, tap, timeout } from 'rxjs';

import { environment } from '../../../environments/environment';
import {
  CoverageZone,
  LandingContact,
  LandingOverview,
  LandingPillar,
  LandingSolution,
} from '../models/fleet.models';
import { LandingApiService } from './landing-api.service';

/**
 * Contenido de la landing pública.
 *
 * Todo lo que se muestra proviene de `/api/public/overview` y es contenido
 * institucional: la landing no expone datos operativos de la aplicación.
 */
@Injectable({ providedIn: 'root' })
export class LandingService {
  private readonly api = inject(LandingApiService);

  private readonly _overview = signal<LandingOverview | null>(null);
  private readonly _loading = signal(false);
  private readonly _error = signal<string | null>(null);

  /** Contenido completo de la landing. */
  readonly overview = this._overview.asReadonly();

  /** `true` durante la carga. */
  readonly loading = this._loading.asReadonly();

  /** Mensaje de error si el contenido no pudo cargarse. */
  readonly error = this._error.asReadonly();

  /** `true` cuando el contenido ya está disponible. */
  readonly loaded = computed(() => this._overview() !== null);

  /** Soluciones comerciales. */
  readonly solutions = computed<LandingSolution[]>(() => this._overview()?.solutions ?? []);

  /** Pilares institucionales. */
  readonly pillars = computed<LandingPillar[]>(() => this._overview()?.pillars ?? []);

  /** Zonas comerciales de cobertura. */
  readonly coverageZones = computed<CoverageZone[]>(() => this._overview()?.coverageZones ?? []);

  /** Canales de contacto. */
  readonly contact = computed<LandingContact | null>(() => this._overview()?.contact ?? null);

  /** Catálogo de líneas de servicio del formulario. */
  readonly serviceTypes = computed<string[]>(() => this._overview()?.serviceTypes ?? []);

  /** Catálogo de ciudades del formulario. */
  readonly cities = computed<string[]>(() => this._overview()?.cities ?? []);

  /** Carga el contenido de la landing. */
  load(): void {
    this._loading.set(true);

    this.api
      .getOverview()
      .pipe(
        timeout(environment.apiTimeoutMs),
        tap((overview) => {
          this._overview.set(overview);
          this._error.set(null);
        }),
        catchError(() => {
          this._error.set(
            `No fue posible cargar el contenido desde ${environment.apiBaseUrl}.`,
          );
          return of(null);
        }),
        finalize(() => this._loading.set(false)),
      )
      .subscribe();
  }

  /** Carga el contenido sólo si aún no está en memoria. */
  ensureLoaded(): void {
    if (!this.loaded() && !this._loading()) {
      this.load();
    }
  }
}
