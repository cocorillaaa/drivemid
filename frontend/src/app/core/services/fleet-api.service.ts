import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';

import { environment } from '../../../environments/environment';
import {
  ApiResponse,
  CorporateLeadPayload,
  DriverApplicationPayload,
  UnitUpdatePayload,
  Vehicle,
} from '../models/fleet.models';
import { resolvePolicyStatus } from '../data/fleet-mock.data';

/** Representación snake_case que devuelve Laravel. */
interface RawVehicle {
  id: string;
  unit_code: string;
  make: string;
  model: string;
  year: number;
  plates: string;
  vin: string;
  color: string;
  capacity: number;
  service_tier: string;
  status: Vehicle['status'];
  odometer_km: number;
  weekly_km: number;
  weekly_km_by_day: string | number[];
  fuel_level: number;
  last_service_km: number;
  next_service_km: number;
  driver_name: string;
  driver_phone: string;
  driver_email: string;
  driver_license: string;
  driver_rating: number;
  driver_assigned_since: string;
  policy_provider: string;
  policy_number: string;
  policy_valid_from: string;
  policy_valid_to: string;
  policy_coverage: string;
  location_label: string;
  location_zone: string;
  location_lat: number | string;
  location_lng: number | string;
  location_updated_at: string;
  speed_kmh: number;
  heading: string;
}

/**
 * Cliente HTTP de la API de Laravel (puerto 8001).
 *
 * Aísla el detalle del transporte y traduce el contrato snake_case del
 * backend al modelo de dominio camelCase usado por el frontend.
 */
@Injectable({ providedIn: 'root' })
export class FleetApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.apiBaseUrl;

  /** Listado completo de unidades de la flota. */
  getVehicles(): Observable<Vehicle[]> {
    return this.http
      .get<ApiResponse<RawVehicle[]>>(`${this.baseUrl}/vehicles`)
      .pipe(map((res) => (res.data ?? []).map(toVehicle)));
  }

  /** Detalle de una unidad. */
  getVehicle(id: string): Observable<Vehicle> {
    return this.http
      .get<ApiResponse<RawVehicle>>(`${this.baseUrl}/vehicles/${id}`)
      .pipe(map((res) => toVehicle(res.data)));
  }

  /** Actualiza kilometraje semanal y/o teléfono de contacto. */
  updateUnit(id: string, payload: UnitUpdatePayload): Observable<Vehicle> {
    return this.http
      .patch<ApiResponse<RawVehicle>>(`${this.baseUrl}/vehicles/${id}/telemetry`, {
        weekly_km: payload.weeklyKm,
        driver_phone: payload.phone,
      })
      .pipe(map((res) => toVehicle(res.data)));
  }

  /** Alta de solicitud de servicio corporativo desde la landing. */
  createCorporateLead(payload: CorporateLeadPayload): Observable<{ id: number; reference: string }> {
    return this.http
      .post<ApiResponse<{ id: number; reference: string }>>(`${this.baseUrl}/leads/corporate`, {
        company: payload.company,
        contact_name: payload.contactName,
        email: payload.email,
        phone: payload.phone,
        service_type: payload.serviceType,
        units: payload.units,
        city: payload.city,
        message: payload.message?.trim() ? payload.message : null,
      })
      .pipe(map((res) => res.data));
  }

  /** Alta de postulación de conductor desde la landing. */
  createDriverApplication(
    payload: DriverApplicationPayload,
  ): Observable<{ id: number; reference: string }> {
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
      .pipe(map((res) => res.data));
  }

  /** Comprobación de disponibilidad del backend. */
  health(): Observable<{ status: string; version: string }> {
    return this.http
      .get<ApiResponse<{ status: string; version: string }>>(`${this.baseUrl}/health`)
      .pipe(map((res) => res.data));
  }
}

/** Normaliza un registro del backend al modelo de dominio. */
function toVehicle(raw: RawVehicle): Vehicle {
  const daysToExpire = daysBetween(new Date(), raw.policy_valid_to);

  return {
    id: raw.id,
    unitCode: raw.unit_code,
    make: raw.make,
    model: raw.model,
    year: Number(raw.year),
    plates: raw.plates,
    vin: raw.vin,
    color: raw.color,
    capacity: Number(raw.capacity),
    serviceTier: raw.service_tier,
    status: raw.status,
    odometerKm: Number(raw.odometer_km),
    weeklyKm: Number(raw.weekly_km),
    weeklyKmByDay: parseWeeklySeries(raw.weekly_km_by_day),
    fuelLevel: Number(raw.fuel_level),
    lastServiceKm: Number(raw.last_service_km),
    nextServiceKm: Number(raw.next_service_km),
    driver: {
      id: `drv-${raw.id}`,
      fullName: raw.driver_name,
      phone: raw.driver_phone,
      email: raw.driver_email,
      licenseNumber: raw.driver_license,
      rating: Number(raw.driver_rating),
      assignedSince: raw.driver_assigned_since,
    },
    policy: {
      provider: raw.policy_provider,
      policyNumber: raw.policy_number,
      validFrom: raw.policy_valid_from,
      validTo: raw.policy_valid_to,
      coverage: raw.policy_coverage,
      daysToExpire,
      status: resolvePolicyStatus(daysToExpire),
    },
    location: {
      label: raw.location_label,
      zone: raw.location_zone,
      lat: Number(raw.location_lat),
      lng: Number(raw.location_lng),
      lastUpdate: raw.location_updated_at,
      speedKmh: Number(raw.speed_kmh),
      heading: (raw.heading ?? 'N') as Vehicle['location']['heading'],
    },
  };
}

/** Convierte la serie de km (JSON en texto o arreglo) en números. */
function parseWeeklySeries(value: string | number[]): number[] {
  if (Array.isArray(value)) return value.map(Number);
  try {
    const parsed = JSON.parse(value ?? '[]');
    return Array.isArray(parsed) ? parsed.map(Number) : [];
  } catch {
    return [];
  }
}

/** Días calendario entre dos fechas ISO. */
function daysBetween(from: Date, toIso: string): number {
  const [y, m, d] = toIso.slice(0, 10).split('-').map(Number);
  const target = Date.UTC(y, m - 1, d);
  const origin = Date.UTC(from.getFullYear(), from.getMonth(), from.getDate());
  return Math.round((target - origin) / 86_400_000);
}
