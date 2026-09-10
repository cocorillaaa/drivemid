import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';

import { environment } from '../../../environments/environment';
import { ApiResponse, AuthUser, LoginPayload, SessionPayload } from '../models/fleet.models';
import { mapAuthUser, RawAuthUser } from './api-mappers';

/** Respuesta cruda del inicio de sesión. */
interface RawSession {
  token: string;
  token_type: string;
  user: RawAuthUser;
}

/**
 * Endpoints de autenticación (`/api/auth/*`).
 *
 * Sólo se encarga del transporte; el estado de sesión vive en `AuthService`.
 */
@Injectable({ providedIn: 'root' })
export class AuthApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.apiBaseUrl;

  /** Intercambia credenciales por un token de acceso. */
  login(payload: LoginPayload): Observable<SessionPayload> {
    return this.http
      .post<ApiResponse<RawSession>>(`${this.baseUrl}/auth/login`, {
        email: payload.email,
        password: payload.password,
        device_name: payload.deviceName,
      })
      .pipe(
        map((res) => ({
          token: res.data.token,
          tokenType: res.data.token_type,
          user: mapAuthUser(res.data.user),
        })),
      );
  }

  /** Recupera el perfil asociado al token vigente. */
  me(): Observable<AuthUser> {
    return this.http
      .get<ApiResponse<RawAuthUser>>(`${this.baseUrl}/auth/me`)
      .pipe(map((res) => mapAuthUser(res.data)));
  }

  /** Revoca el token en el servidor. */
  logout(): Observable<void> {
    return this.http
      .post<ApiResponse<{ status: string }>>(`${this.baseUrl}/auth/logout`, {})
      .pipe(map(() => undefined));
  }
}
