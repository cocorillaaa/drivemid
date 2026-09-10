import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
} from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { toSignal } from '@angular/core/rxjs-interop';
import { finalize, startWith } from 'rxjs';

import { FleetMapMarker, Vehicle } from '../../../core/models/fleet.models';
import { FleetService } from '../../../core/services/fleet.service';
import { SessionService } from '../../../core/services/session.service';
import { ToastService } from '../../../core/services/toast.service';
import { toFleetMarker } from '../../../core/utils/map-markers';
import {
  POLICY_STATUS_BADGE,
  POLICY_STATUS_LABEL,
  UNIT_STATUS_BADGE,
  UNIT_STATUS_LABEL,
  WEEK_DAYS_SHORT,
  formatDate,
  formatKm,
  formatPhone,
  policyCountdownText,
  relativeTime,
} from '../../../core/utils/fleet-format';
import { FleetMapComponent } from '../../../shared/components/fleet-map/fleet-map';
import { StatCardComponent } from '../../../shared/components/stat-card/stat-card';

/**
 * Dashboard del rol "Administrador de Unidad".
 *
 * Vista restringida a una única unidad asignada (por defecto
 * Unidad 01 · Dodge Attitude / ABC-123): formulario rápido de
 * kilometraje y teléfono, ficha técnica, estatus de la póliza y mapa
 * con la última ubicación reportada.
 */
@Component({
  selector: 'vf-unit-admin-dashboard',
  imports: [ReactiveFormsModule, FleetMapComponent, StatCardComponent],
  templateUrl: './unit-admin-dashboard.html',
  styleUrl: './unit-admin-dashboard.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UnitAdminDashboard {
  private readonly fleet = inject(FleetService);
  private readonly session = inject(SessionService);
  private readonly toast = inject(ToastService);
  private readonly fb = inject(FormBuilder);

  /** Unidad asignada a la sesión. */
  readonly unit = computed<Vehicle | null>(() => {
    const id = this.session.activeUnitId();
    return this.fleet.getById(id) ?? this.fleet.vehicles()[0] ?? null;
  });

  /** Marcador único con halo de geocerca. */
  readonly markers = computed<FleetMapMarker[]>(() => {
    const current = this.unit();
    return current ? [toFleetMarker(current, { withZone: true })] : [];
  });

  /** Id de la unidad que se está guardando. */
  readonly savingUnitId = this.fleet.savingUnitId;

  /** `true` mientras se guarda la unidad activa. */
  readonly saving = computed(() => this.savingUnitId() === this.unit()?.id);

  /** Origen de datos actual. */
  readonly dataSource = this.fleet.dataSource;

  /** Km restantes para el siguiente servicio preventivo. */
  readonly kmToService = computed(() => {
    const u = this.unit();
    return u ? u.nextServiceKm - u.odometerKm : 0;
  });

  /** Avance hacia el siguiente servicio preventivo (0-100). */
  readonly servicePct = computed(() => {
    const u = this.unit();
    if (!u) return 0;
    const span = Math.max(u.nextServiceKm - u.lastServiceKm, 1);
    return Math.min(100, Math.max(0, Math.round(((u.odometerKm - u.lastServiceKm) / span) * 100)));
  });

  /** Km promedio por día de la semana en curso. */
  readonly dailyAverageKm = computed(() => {
    const u = this.unit();
    return u ? Math.round(u.weeklyKm / 7) : 0;
  });

  /** Máximo diario, para escalar las barras. */
  readonly maxDailyKm = computed(() => Math.max(...(this.unit()?.weeklyKmByDay ?? [1]), 1));

  /** Formulario rápido de actualización de estatus. */
  readonly updateForm = this.fb.nonNullable.group({
    weeklyKm: [0, [Validators.required, Validators.min(0), Validators.max(5000)]],
    phone: ['', [Validators.required, Validators.pattern(/^\d{10}$/)]],
  });

  /** Valor actual del formulario como Signal (reactivo en modo zoneless). */
  private readonly formValue = toSignal(
    this.updateForm.valueChanges.pipe(startWith(this.updateForm.getRawValue())),
    { initialValue: this.updateForm.getRawValue() },
  );

  /** `true` cuando hay cambios sin guardar respecto a la unidad actual. */
  readonly hasChanges = computed(() => {
    const current = this.unit();
    if (!current) return false;
    const { weeklyKm, phone } = this.formValue();
    return Number(weeklyKm) !== current.weeklyKm || String(phone) !== current.driver.phone;
  });

  // Helpers expuestos a la plantilla
  readonly weekDays = WEEK_DAYS_SHORT;
  readonly unitStatusLabel = UNIT_STATUS_LABEL;
  readonly unitStatusBadge = UNIT_STATUS_BADGE;
  readonly policyLabel = POLICY_STATUS_LABEL;
  readonly policyBadge = POLICY_STATUS_BADGE;
  readonly formatKm = formatKm;
  readonly formatDate = formatDate;
  readonly formatPhone = formatPhone;
  readonly relativeTime = relativeTime;
  readonly policyCountdownText = policyCountdownText;

  constructor() {
    // Mantiene el formulario sincronizado con la unidad asignada.
    effect(() => {
      const current = this.unit();
      if (!current) return;
      this.updateForm.patchValue(
        { weeklyKm: current.weeklyKm, phone: current.driver.phone },
        { emitEvent: false },
      );
    });
  }

  /** Indica si un control del formulario debe mostrarse con error. */
  showError(controlName: 'weeklyKm' | 'phone'): boolean {
    const control = this.updateForm.controls[controlName];
    return control.invalid && (control.dirty || control.touched);
  }

  /** Guarda el kilometraje semanal y el teléfono de contacto. */
  submit(): void {
    const current = this.unit();
    if (!current) return;

    if (this.updateForm.invalid) {
      this.updateForm.markAllAsTouched();
      this.toast.warning('Revise los datos', 'Verifique el kilometraje y el teléfono de contacto.');
      return;
    }

    const { weeklyKm, phone } = this.updateForm.getRawValue();
    const payload = { weeklyKm: Number(weeklyKm), phone: String(phone) };

    console.log(`[Vanguard Fleet] Actualización de ${current.unitCode}`, payload);

    this.fleet
      .updateUnit(current.id, payload)
      .pipe(finalize(() => this.updateForm.markAsPristine()))
      .subscribe({
        next: () => this.updateForm.markAsPristine(),
      });
  }

  /** Restaura el formulario con los valores vigentes de la unidad. */
  resetForm(): void {
    const current = this.unit();
    if (!current) return;

    this.updateForm.reset({ weeklyKm: current.weeklyKm, phone: current.driver.phone });
    this.updateForm.markAsPristine();
    this.toast.info('Formulario restaurado', 'Se recuperaron los valores vigentes de la unidad.');
  }

  /** Copia las coordenadas de la unidad al portapapeles. */
  copyCoordinates(): void {
    const current = this.unit();
    if (!current) return;

    const text = `${current.location.lat.toFixed(5)}, ${current.location.lng.toFixed(5)}`;
    void globalThis.navigator?.clipboard
      ?.writeText(text)
      .then(() => this.toast.success('Coordenadas copiadas', text))
      .catch(() => this.toast.info('Coordenadas', text));
  }
}
