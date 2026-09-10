import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';

import { DemoAccount } from '../../../core/models/fleet.models';
import { AuthService } from '../../../core/services/auth.service';
import { LandingApiService } from '../../../core/services/landing-api.service';
import { ToastService } from '../../../core/services/toast.service';
import { homeRouteFor } from '../../../core/utils/role-routes';

/**
 * Pantalla de acceso a la plataforma.
 *
 * Valida las credenciales contra la API y, según el rol que el backend
 * devuelva, redirige al panel global de flota o a la vista de la unidad
 * asignada. Las cuentas de demostración también llegan del backend.
 */
@Component({
  selector: 'dl-login-page',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './login-page.html',
  styleUrl: './login-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginPage implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly landingApi = inject(LandingApiService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly toast = inject(ToastService);

  /** Cuentas de demostración publicadas por el backend. */
  readonly demoAccounts = signal<DemoAccount[]>([]);

  /** Mensaje de error del último intento. */
  readonly errorMessage = signal<string | null>(null);

  /** `true` mientras se envían las credenciales. */
  readonly submitting = this.auth.submitting;

  /** Aviso mostrado cuando la sesión anterior expiró. */
  readonly sessionExpired = signal(false);

  /** Formulario de acceso. */
  readonly form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  constructor() {
    this.sessionExpired.set(this.route.snapshot.queryParamMap.get('motivo') === 'sesion-expirada');
  }

  ngOnInit(): void {
    // Las credenciales de la demo las sirve la API; si no hay, no se muestra
    // el bloque de atajos.
    this.landingApi.getDemoAccounts().subscribe({
      next: (accounts) => this.demoAccounts.set(accounts),
      error: () => this.demoAccounts.set([]),
    });
  }

  /** Indica si un campo debe mostrarse con error. */
  showError(controlName: 'email' | 'password'): boolean {
    const control = this.form.controls[controlName];
    return control.invalid && (control.dirty || control.touched);
  }

  /** Rellena el formulario con una cuenta de demostración y lo envía. */
  useAccount(account: DemoAccount): void {
    this.form.setValue({ email: account.email, password: account.password });
    this.submit();
  }

  /** Envía las credenciales. */
  submit(): void {
    this.errorMessage.set(null);

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const { email, password } = this.form.getRawValue();

    this.auth
      .login({ email: email.trim().toLowerCase(), password })
      .pipe(finalize(() => this.form.controls.password.reset()))
      .subscribe({
        next: (user) => {
          this.toast.success(
            `Bienvenido, ${user.name.split(' ')[0]}`,
            user.role === 'superuser'
              ? 'Sesión iniciada con vista global de la flota.'
              : `Sesión iniciada sobre ${user.vehicle?.unitCode ?? 'su unidad asignada'}.`,
          );
          void this.router.navigateByUrl(this.destinationFor(user.role));
        },
        error: (error: unknown) => {
          const message = AuthService.describeError(error);
          this.errorMessage.set(message);
          this.toast.error('No fue posible iniciar sesión', message);
        },
      });
  }

  /** Ruta de destino tras autenticarse, respetando `?destino=`. */
  private destinationFor(role: DemoAccount['role']): string {
    const requested = this.route.snapshot.queryParamMap.get('destino');
    const home = homeRouteFor(role);

    // Sólo se respeta el destino si pertenece a la vista del rol autenticado.
    return requested?.startsWith(home) ? requested : home;
  }
}
