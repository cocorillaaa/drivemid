import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';

import { environment } from '../../../environments/environment';
import { ApiResponse, DemoAccount, LandingOverview } from '../models/fleet.models';
import { RawLandingOverview, mapLandingOverview } from './api-mappers';

/**
 * Contenido público de la landing (`/api/public/overview`).
 *
 * Soluciones, catálogos del formulario, canales de contacto, indicadores y
 * flota publicada: todo llega del backend, por lo que editar el contenido no
 * requiere recompilar el frontend.
 */
@Injectable({ providedIn: 'root' })
export class LandingApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.apiBaseUrl;

  getOverview(): Observable<LandingOverview> {
    return this.http
      .get<ApiResponse<RawLandingOverview>>(`${this.baseUrl}/public/overview`)
      .pipe(map((res) => mapLandingOverview(res.data)));
  }

  /**
   * Cuentas de demostración para la pantalla de acceso.
   *
   * El backend devuelve una lista vacía cuando `APP_DEBUG` está desactivado,
   * de modo que las credenciales nunca se hardcodean en el cliente.
   */
  getDemoAccounts(): Observable<DemoAccount[]> {
    return this.http
      .get<ApiResponse<DemoAccount[]>>(`${this.baseUrl}/public/demo-accounts`)
      .pipe(map((res) => res.data ?? []));
  }
}
