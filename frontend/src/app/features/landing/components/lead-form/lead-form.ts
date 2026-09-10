import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { finalize } from 'rxjs';

import { FleetService } from '../../../../core/services/fleet.service';
import { ToastService } from '../../../../core/services/toast.service';

/** Pestañas disponibles en el formulario de captación. */
export type LeadTab = 'corporate' | 'driver';

/** Confirmación mostrada tras un envío exitoso. */
interface SubmissionResult {
  tab: LeadTab;
  reference: string;
  headline: string;
  detail: string;
}

/** Ciudades con cobertura comercial. */
const CITIES = [
  'Ciudad de México',
  'Estado de México',
  'Guadalajara, Jalisco',
  'Monterrey, Nuevo León',
  'Puebla, Puebla',
  'Querétaro, Querétaro',
  'Tijuana, Baja California',
] as const;

/** Líneas de servicio ofertadas. */
const SERVICE_TYPES = [
  'Transporte corporativo',
  'Traslado ejecutivo',
  'Gestión integral de flota',
  'Grupos y eventos',
] as const;

/**
 * Formulario de captación de la landing.
 *
 * Dos pestañas sobre el mismo componente:
 *  - "Solicitar Servicio Corporativo" (empresas).
 *  - "Postularse como Conductor" (operadores).
 *
 * El envío registra la solicitud en la API de Laravel; si el backend no
 * responde, se genera un folio local y el flujo continúa sin romperse.
 */
@Component({
  selector: 'vf-lead-form',
  imports: [ReactiveFormsModule],
  templateUrl: './lead-form.html',
  styleUrl: './lead-form.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LeadFormComponent {
  private readonly fb = inject(FormBuilder);
  private readonly fleet = inject(FleetService);
  private readonly toast = inject(ToastService);

  /** Catálogos para los selectores. */
  readonly cities = CITIES;
  readonly serviceTypes = SERVICE_TYPES;

  /** Pestaña activa. */
  readonly activeTab = signal<LeadTab>('corporate');

  /** `true` mientras se envía el formulario. */
  readonly submitting = signal(false);

  /** Resultado del último envío (null = formulario visible). */
  readonly result = signal<SubmissionResult | null>(null);

  /** Formulario de servicio corporativo. */
  readonly corporateForm: FormGroup = this.fb.nonNullable.group({
    company: ['', [Validators.required, Validators.minLength(2)]],
    contactName: ['', [Validators.required, Validators.minLength(3)]],
    email: ['', [Validators.required, Validators.email]],
    phone: ['', [Validators.required, Validators.pattern(/^\d{10}$/)]],
    serviceType: ['', [Validators.required]],
    units: [2, [Validators.required, Validators.min(1), Validators.max(50)]],
    city: ['', [Validators.required]],
    message: [''],
  });

  /** Formulario de postulación de conductor. */
  readonly driverForm: FormGroup = this.fb.nonNullable.group({
    fullName: ['', [Validators.required, Validators.minLength(3)]],
    email: ['', [Validators.required, Validators.email]],
    phone: ['', [Validators.required, Validators.pattern(/^\d{10}$/)]],
    city: ['', [Validators.required]],
    licenseNumber: ['', [Validators.required, Validators.minLength(8)]],
    experienceYears: [3, [Validators.required, Validators.min(0), Validators.max(50)]],
    vehicleOwned: [false],
    message: [''],
  });

  /** Cambia de pestaña y limpia la confirmación previa. */
  setTab(tab: LeadTab): void {
    this.activeTab.set(tab);
    this.result.set(null);
  }

  /** Indica si un control debe mostrarse en estado de error. */
  showError(form: FormGroup, controlName: string): boolean {
    const control = form.get(controlName);
    return !!control && control.invalid && (control.dirty || control.touched);
  }

  /** Cierra la confirmación y deja el formulario listo para un nuevo registro. */
  resetForm(): void {
    const tab = this.result()?.tab ?? this.activeTab();
    this.result.set(null);

    if (tab === 'corporate') {
      this.corporateForm.reset({
        company: '',
        contactName: '',
        email: '',
        phone: '',
        serviceType: '',
        units: 2,
        city: '',
        message: '',
      });
    } else {
      this.driverForm.reset({
        fullName: '',
        email: '',
        phone: '',
        city: '',
        licenseNumber: '',
        experienceYears: 3,
        vehicleOwned: false,
        message: '',
      });
    }
  }

  /** Envía la solicitud de servicio corporativo. */
  submitCorporate(): void {
    if (this.corporateForm.invalid) {
      this.corporateForm.markAllAsTouched();
      this.toast.warning('Revise el formulario', 'Hay campos obligatorios pendientes.');
      return;
    }

    const value = this.corporateForm.getRawValue();
    const payload = { ...value, phone: digitsOnly(value.phone), units: Number(value.units) };

    // Traza de la demo: el objeto enviado queda disponible en consola.
    console.log('[Vanguard Fleet] Solicitud de servicio corporativo', payload);

    this.submitting.set(true);
    this.fleet
      .submitCorporateLead(payload)
      .pipe(finalize(() => this.submitting.set(false)))
      .subscribe(({ reference }) => {
        this.result.set({
          tab: 'corporate',
          reference,
          headline: 'Solicitud recibida',
          detail: `Gracias, ${payload.contactName}. Un ejecutivo de cuenta contactará a ${payload.company} en menos de 24 horas hábiles.`,
        });
        this.toast.success(
          'Solicitud corporativa registrada',
          `Folio ${reference} · ${payload.units} unidad(es) en ${payload.city}.`,
        );
      });
  }

  /** Envía la postulación como conductor. */
  submitDriver(): void {
    if (this.driverForm.invalid) {
      this.driverForm.markAllAsTouched();
      this.toast.warning('Revise el formulario', 'Hay campos obligatorios pendientes.');
      return;
    }

    const value = this.driverForm.getRawValue();
    const payload = {
      ...value,
      phone: digitsOnly(value.phone),
      experienceYears: Number(value.experienceYears),
    };

    console.log('[Vanguard Fleet] Postulación de conductor', payload);

    this.submitting.set(true);
    this.fleet
      .submitDriverApplication(payload)
      .pipe(finalize(() => this.submitting.set(false)))
      .subscribe(({ reference }) => {
        this.result.set({
          tab: 'driver',
          reference,
          headline: 'Postulación recibida',
          detail: `Gracias, ${payload.fullName}. Revisaremos su documentación y le contactaremos para agendar la entrevista técnica.`,
        });
        this.toast.success(
          'Postulación registrada',
          `Folio ${reference} · expediente en revisión.`,
        );
      });
  }
}

/** Deja únicamente los dígitos de una cadena. */
function digitsOnly(value: string): string {
  return String(value ?? '').replace(/\D/g, '').slice(0, 10);
}
