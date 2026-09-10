import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { finalize } from 'rxjs';

import { FleetService } from '../../../../core/services/fleet.service';
import { ClipboardService } from '../../../../core/services/clipboard.service';
import { LandingService } from '../../../../core/services/landing.service';
import { ToastService } from '../../../../core/services/toast.service';
import { RevealDirective } from '../../../../shared/directives/reveal.directive';

/** Pestañas disponibles en el formulario de captación. */
export type LeadTab = 'corporate' | 'driver';

/** Confirmación mostrada tras un envío exitoso. */
interface SubmissionResult {
  tab: LeadTab;
  reference: string;
  headline: string;
  detail: string;
}

/**
 * Formulario de captación de la landing.
 *
 * Dos pestañas sobre el mismo componente:
 *  - "Solicitar Servicio Corporativo" (empresas).
 *  - "Postularse como Conductor" (operadores).
 *
 * Los catálogos de ciudades y líneas de servicio llegan del backend, y el
 * envío registra la solicitud en la API, que devuelve el folio de seguimiento.
 */
@Component({
  selector: 'dl-lead-form',
  imports: [ReactiveFormsModule, RevealDirective],
  templateUrl: './lead-form.html',
  styleUrl: './lead-form.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LeadFormComponent {
  private readonly fb = inject(FormBuilder);
  private readonly fleet = inject(FleetService);
  private readonly landing = inject(LandingService);
  private readonly toast = inject(ToastService);
  private readonly clipboard = inject(ClipboardService);

  /** Catálogos servidos por la API. */
  readonly cities = this.landing.cities;
  readonly serviceTypes = this.landing.serviceTypes;

  /** Canales de contacto institucionales. */
  readonly contact = this.landing.contact;

  /** Pestaña activa. */
  readonly activeTab = signal<LeadTab>('corporate');

  /** `true` mientras se envía el formulario. */
  readonly submitting = signal(false);

  /** Resultado del último envío (null = formulario visible). */
  readonly result = signal<SubmissionResult | null>(null);

  /** `true` mientras los catálogos se cargan. */
  readonly catalogsPending = computed(
    () => this.cities().length === 0 || this.serviceTypes().length === 0,
  );

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

  /** Copia un dato de contacto al portapapeles. */
  copy(value: string | undefined, label: string): void {
    this.clipboard.copy(value ?? '', label);
  }

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

    this.submitting.set(true);
    this.fleet
      .submitCorporateLead(payload)
      .pipe(finalize(() => this.submitting.set(false)))
      .subscribe({
        next: ({ reference }) => {
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
        },
        error: (error: unknown) => {
          this.toast.error('No se pudo registrar la solicitud', describeLeadError(error));
        },
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

    this.submitting.set(true);
    this.fleet
      .submitDriverApplication(payload)
      .pipe(finalize(() => this.submitting.set(false)))
      .subscribe({
        next: ({ reference }) => {
          this.result.set({
            tab: 'driver',
            reference,
            headline: 'Postulación recibida',
            detail: `Gracias, ${payload.fullName}. Revisaremos su documentación y le contactaremos para agendar la entrevista técnica.`,
          });
          this.toast.success('Postulación registrada', `Folio ${reference} · expediente en revisión.`);
        },
        error: (error: unknown) => {
          this.toast.error('No se pudo registrar la postulación', describeLeadError(error));
        },
      });
  }
}

/** Deja únicamente los dígitos de una cadena. */
function digitsOnly(value: string): string {
  return String(value ?? '').replace(/\D/g, '').slice(0, 10);
}

/** Mensaje legible para un fallo de captación. */
function describeLeadError(error: unknown): string {
  const httpError = error as {
    status?: number;
    error?: { message?: string; errors?: Record<string, string[]> };
  };

  if (httpError?.status === 422 && httpError.error?.errors) {
    const first = Object.values(httpError.error.errors)[0];
    if (first?.length) return first[0];
  }

  if (httpError?.status === 0 || httpError?.status === undefined) {
    return 'No fue posible contactar el servicio. Verifique su conexión e intente de nuevo.';
  }

  return 'El servidor rechazó la solicitud. Intente nuevamente en unos momentos.';
}
