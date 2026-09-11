import { Injectable, computed, inject, signal } from '@angular/core';
import { catchError, finalize, of, tap, timeout } from 'rxjs';

import { environment } from '../../../environments/environment';
import {
  BusinessFlowStep,
  LandingAudience,
  LandingContact,
  LandingOverview,
  ProgramStep,
  ProgramValue,
} from '../models/fleet.models';
import { LandingApiService } from './landing-api.service';

/**
 * Contenido del sitio público.
 *
 * Todo lo que se muestra proviene de `/api/public/overview` y es contenido
 * institucional: el sitio no expone datos operativos de la aplicación.
 */
@Injectable({ providedIn: 'root' })
export class LandingService {
  private readonly api = inject(LandingApiService);

  private readonly _overview = signal<LandingOverview | null>(null);
  private readonly _loading = signal(false);
  private readonly _error = signal<string | null>(null);

  /** Contenido completo del sitio. */
  readonly overview = this._overview.asReadonly();

  /** `true` durante la carga. */
  readonly loading = this._loading.asReadonly();

  /** Mensaje de error si el contenido no pudo cargarse. */
  readonly error = this._error.asReadonly();

  /** `true` cuando el contenido ya está disponible. */
  readonly loaded = computed(() => this._overview() !== null);

  /** Identidad de la marca. */
  readonly brand = computed(() => this._overview()?.brand ?? null);

  /** Quiénes somos. */
  readonly about = computed(() => this._overview()?.about ?? null);

  /** Misión del programa. */
  readonly mission = computed(() => this._overview()?.mission ?? null);

  /** Visión del programa. */
  readonly vision = computed(() => this._overview()?.vision ?? null);

  /** Valores institucionales. */
  readonly values = computed<ProgramValue[]>(() => this._overview()?.values ?? []);

  /** Modelo de negocio y su flujo de capital. */
  readonly businessModel = computed(() => this._overview()?.businessModel ?? null);

  /** Plan de trabajo por etapas. */
  readonly workPlan = computed(() => this._overview()?.workPlan ?? null);

  /** Etapas del plan de trabajo. */
  readonly workPlanSteps = computed<ProgramStep[]>(
    () => this._overview()?.workPlan.steps ?? [],
  );

  /** Público al que se dirige el programa. */
  readonly audiences = computed<LandingAudience[]>(() => this._overview()?.audiences ?? []);

  /** Pasos del flujo del modelo de negocio. */
  readonly businessFlow = computed<BusinessFlowStep[]>(
    () => this._overview()?.businessModel.flow ?? [],
  );

  /** Canales de contacto. */
  readonly contact = computed<LandingContact | null>(() => this._overview()?.contact ?? null);

  /** Catálogo de capitales del formulario de inversionistas. */
  readonly capitalRanges = computed<string[]>(() => this._overview()?.capitalRanges ?? []);

  /** Carga el contenido del sitio. */
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
