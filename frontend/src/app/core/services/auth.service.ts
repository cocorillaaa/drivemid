import { Injectable, computed, inject, signal } from '@angular/core';
import { Observable, catchError, finalize, map, of, tap, throwError } from 'rxjs';

import { environment } from '../../../environments/environment';
import { ApiValidationError, AuthUser, LoginPayload, UserRole } from '../models/fleet.models';
import { AuthApiService } from './auth-api.service';
import { TokenStorageService } from './token-storage.service';

/**
 * Estado de la sesión en el frontend.
 *
 * Mantiene el usuario autenticado, su rol y la unidad asignada; ambos se
 * resuelven siempre en el backend, nunca en el cliente. El token se conserva
 * en `localStorage` para sobrevivir recargas de página.
 */
@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly api = inject(AuthApiService);
  private readonly storage = inject(TokenStorageService);

  private readonly _user = signal<AuthUser | null>(null);
  private readonly _restoring = signal(false);
  private readonly _submitting = signal(false);

  /** Usuario autenticado, o `null`. */
  readonly user = this._user.asReadonly();

  /** `true` mientras se intercambian credenciales. */
  readonly submitting = this._submitting.asReadonly();

  /** `true` mientras se restaura la sesión desde el token almacenado. */
  readonly restoring = this._restoring.asReadonly();

  /** `true` cuando hay una sesión válida cargada. */
  readonly isAuthenticated = computed(() => this._user() !== null);

  /** Rol del usuario autenticado. */
  readonly role = computed<UserRole | null>(() => this._user()?.role ?? null);

  /** `true` cuando la sesión corresponde al Superusuario. */
  readonly isSuperuser = computed(() => this.role() === 'superuser');

  /** `true` cuando la sesión corresponde a un Administrador de Unidad. */
  readonly isUnitAdmin = computed(() => this.role() === 'unit_admin');

  /** Unidad asignada al usuario autenticado (`null` para el Superusuario). */
  readonly assignedVehicleId = computed(() => this._user()?.vehicleId ?? null);

  /** `true` cuando existe un token persistido. */
  hasToken(): boolean {
    return this.storage.read() !== null;
  }

  /**
   * Inicia sesión con las credenciales indicadas.
   *
   * El rol y la unidad asignada provienen de la respuesta del backend.
   */
  login(payload: LoginPayload): Observable<AuthUser> {
    this._submitting.set(true);

    return this.api
      .login({ ...payload, deviceName: this.storage.deviceName() })
      .pipe(
        tap((session) => {
          this.storage.write(session.token);
          this._user.set(session.user);
        }),
        map((session) => session.user),
        finalize(() => this._submitting.set(false)),
      );
  }

  /**
   * Restaura la sesión a partir del token almacenado.
   *
   * Emite el usuario autenticado o falla si el token ya no es válido.
   */
  restoreSession(): Observable<AuthUser> {
    const token = this.storage.read();

    if (!token) {
      this._user.set(null);
      return throwError(() => new Error('No hay una sesión almacenada.'));
    }

    this._restoring.set(true);

    return this.api.me().pipe(
      tap((user) => this._user.set(user)),
      catchError((error: unknown) => {
        this.clearLocalSession();
        return throwError(() => error);
      }),
      finalize(() => this._restoring.set(false)),
    );
  }

  /**
   * Cierra la sesión.
   *
   * El usuario se descarta de inmediato para que la interfaz responda al
   * instante; el token se conserva el tiempo justo para que el backend pueda
   * revocarlo y después se elimina del almacenamiento.
   */
  logout(): void {
    const hadToken = this.hasToken();
    this._user.set(null);

    if (!hadToken) {
      this.storage.clear();
      return;
    }

    this.api
      .logout()
      .pipe(
        catchError(() => of(undefined)),
        finalize(() => this.storage.clear()),
      )
      .subscribe();
  }

  /** Limpia el estado local sin llamar al backend (token expirado o revocado). */
  clearLocalSession(): void {
    this.storage.clear();
    this._user.set(null);
  }

  /** Mensaje legible para un error de credenciales o de red. */
  static describeError(error: unknown): string {
    const httpError = error as { status?: number; error?: ApiValidationError; message?: string };

    if (httpError?.status === 0) {
      return `No fue posible contactar el servicio en ${environment.apiBaseUrl}. Verifique que la API esté en ejecución.`;
    }

    const validation = httpError?.error;
    if (validation?.errors) {
      const first = Object.values(validation.errors)[0];
      if (first?.length) return first[0];
    }

    if (validation?.message) return validation.message;
    if (httpError?.status === 429) return 'Demasiados intentos. Espere un momento e intente de nuevo.';

    return 'No fue posible iniciar sesión. Intente nuevamente.';
  }
}
