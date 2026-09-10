import { Injectable, computed, inject, signal } from '@angular/core';
import { catchError, finalize, of, tap, timeout } from 'rxjs';

import { environment } from '../../../environments/environment';
import { LandingContact, LandingMetric, LandingOverview, LandingSolution } from '../models/fleet.models';
import { LandingApiService } from './landing-api.service';

/**
 * Contenido de la landing pública.
 *
 * Todo el contenido (soluciones, catálogos, contacto, indicadores y flota
 * publicada) proviene de `/api/public/overview`; el frontend no mantiene
 * copias locales.
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

  /** Indicadores institucionales. */
  readonly metrics = computed<LandingMetric[]>(() => this._overview()?.metrics ?? []);

  /** Canales de contacto. */
  readonly contact = computed<LandingContact | null>(() => this._overview()?.contact ?? null);

  /** Flota publicada (sin datos personales del conductor). */
  readonly fleet = computed(() => this._overview()?.fleet ?? []);

  /** Resumen agregado de la flota. */
  readonly summary = computed(() => this._overview()?.summary ?? null);

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
        catchError((error: unknown) => {
          this._error.set(describeError(error));
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

/** Mensaje legible para un fallo de carga del contenido público. */
function describeError(error: unknown): string {
  const status = (error as { status?: number })?.status;

  if (status === 0 || status === undefined) {
    return `No fue posible contactar el servicio en ${environment.apiBaseUrl}.`;
  }

  return 'No fue posible cargar el contenido. Intente nuevamente.';
}
