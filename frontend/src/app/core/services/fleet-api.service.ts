import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';

import { environment } from '../../../environments/environment';
import {
  ApiResponse,
  InvestorLeadPayload,
  DriverApplicationPayload,
  FleetSummary,
  PerformanceOverview,
  UnitPerformanceDetail,
  UnitUpdatePayload,
  Vehicle,
} from '../models/fleet.models';
import {
  RawFleetSummary,
  RawPerformanceOverview,
  RawVehicle,
  mapFleetSummary,
  mapPerformanceOverview,
  mapUnitPerformanceDetail,
  mapVehicle,
} from './api-mappers';

/**
 * Endpoints de flota y captación.
 *
 * El backend acota el resultado según el rol del token: un Administrador de
 * Unidad recibe únicamente su unidad asignada.
 */
@Injectable({ providedIn: 'root' })
export class FleetApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.apiBaseUrl;

  /** Unidades visibles para el usuario autenticado. */
  getVehicles(): Observable<Vehicle[]> {
    return this.http
      .get<ApiResponse<RawVehicle[]>>(`${this.baseUrl}/vehicles`)
      .pipe(map((res) => (res.data ?? []).map(mapVehicle)));
  }

  /** Detalle de una unidad. */
  getVehicle(id: string): Observable<Vehicle> {
    return this.http
      .get<ApiResponse<RawVehicle>>(`${this.baseUrl}/vehicles/${id}`)
      .pipe(map((res) => mapVehicle(res.data)));
  }

  /** Métricas agregadas de la flota (sólo Superusuario). */
  getSummary(): Observable<FleetSummary> {
    return this.http
      .get<ApiResponse<RawFleetSummary>>(`${this.baseUrl}/fleet/summary`)
      .pipe(map((res) => mapFleetSummary(res.data)));
  }

  /** Actualiza kilometraje semanal y/o teléfono de contacto de una unidad. */
  updateUnit(id: string, payload: UnitUpdatePayload): Observable<Vehicle> {
    return this.http
      .patch<ApiResponse<RawVehicle>>(`${this.baseUrl}/vehicles/${id}/telemetry`, {
        weekly_km: payload.weeklyKm,
        driver_phone: payload.phone,
      })
      .pipe(map((res) => mapVehicle(res.data)));
  }

  /**
   * Rendimiento económico del programa y de cada unidad.
   *
   * `weeks` acota la ventana observada; el backend la limita a un año.
   */
  getPerformance(weeks: number): Observable<PerformanceOverview> {
    return this.http
      .get<ApiResponse<RawPerformanceOverview>>(`${this.baseUrl}/performance`, {
        params: { weeks },
      })
      .pipe(map((res) => mapPerformanceOverview(res.data)));
  }

  /** Rendimiento de una unidad con su bitácora de cortes semanales. */
  getUnitPerformance(id: string, weeks: number): Observable<UnitPerformanceDetail> {
    return this.http
      .get<ApiResponse<Parameters<typeof mapUnitPerformanceDetail>[0]>>(
        `${this.baseUrl}/performance/${id}`,
        { params: { weeks } },
      )
      .pipe(map((res) => mapUnitPerformanceDetail(res.data)));
  }

  /** Alta de interesado en el programa de inversión desde el sitio público. */
  createInvestorLead(payload: InvestorLeadPayload): Observable<{ reference: string }> {
    return this.http
      .post<ApiResponse<{ id: number; reference: string }>>(`${this.baseUrl}/leads/investors`, {
        full_name: payload.fullName,
        email: payload.email,
        phone: payload.phone,
        city: payload.city,
        capital_range: payload.capitalRange,
        message: payload.message?.trim() ? payload.message : null,
      })
      .pipe(map((res) => ({ reference: res.data.reference })));
  }

  /** Alta de postulación de conductor desde la landing. */
  createDriverApplication(
    payload: DriverApplicationPayload,
  ): Observable<{ reference: string }> {
    return this.http
      .post<ApiResponse<{ id: number; reference: string }>>(`${this.baseUrl}/leads/drivers`, {
        full_name: payload.fullName,
        email: payload.email,
        phone: payload.phone,
        city: payload.city,
        license_number: payload.licenseNumber,
        experience_years: payload.experienceYears,
        vehicle_owned: payload.vehicleOwned,
        message: payload.message?.trim() ? payload.message : null,
      })
      .pipe(map((res) => ({ reference: res.data.reference })));
  }
}
