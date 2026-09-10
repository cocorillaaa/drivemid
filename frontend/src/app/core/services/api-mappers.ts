import {
  AssignedVehicle,
  AuthUser,
  FleetSummary,
  LandingContact,
  LandingMetric,
  LandingOverview,
  LandingSolution,
  PublicVehicle,
  UserRole,
  Vehicle,
} from '../models/fleet.models';

/**
 * Traducción del contrato snake_case de Laravel al modelo de dominio
 * camelCase del frontend. Toda la frontera HTTP pasa por aquí.
 */

/* ---------------------------------------------------------------------------
   Utilidades
   ------------------------------------------------------------------------ */

/** Interpreta una serie semanal que puede llegar como arreglo o como JSON. */
export function parseWeeklySeries(value: string | number[] | null): number[] {
  if (Array.isArray(value)) return value.map(Number);
  try {
    const parsed = JSON.parse(value ?? '[]');
    return Array.isArray(parsed) ? parsed.map(Number) : [];
  } catch {
    return [];
  }
}

/** Normaliza un valor numérico que puede llegar como cadena decimal. */
function num(value: unknown, fallback = 0): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

/* ---------------------------------------------------------------------------
   Usuarios y sesión
   ------------------------------------------------------------------------ */

export interface RawAuthUser {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  role_label: string;
  job_title: string | null;
  phone: string | null;
  initials: string;
  vehicle_id: string | null;
  vehicle?: { id: string; unit_code: string; plates: string; make: string; model: string } | null;
  permissions: {
    view_global_fleet: boolean;
    view_all_units: boolean;
    manage_policies: boolean;
    update_assigned_unit: boolean;
  };
}

export function mapAuthUser(raw: RawAuthUser): AuthUser {
  const vehicle: AssignedVehicle | null = raw.vehicle
    ? {
        id: raw.vehicle.id,
        unitCode: raw.vehicle.unit_code,
        plates: raw.vehicle.plates,
        make: raw.vehicle.make,
        model: raw.vehicle.model,
      }
    : null;

  return {
    id: raw.id,
    name: raw.name,
    email: raw.email,
    role: raw.role,
    roleLabel: raw.role_label,
    jobTitle: raw.job_title,
    phone: raw.phone,
    initials: raw.initials,
    vehicleId: raw.vehicle_id,
    vehicle,
    permissions: {
      viewGlobalFleet: raw.permissions.view_global_fleet,
      viewAllUnits: raw.permissions.view_all_units,
      managePolicies: raw.permissions.manage_policies,
      updateAssignedUnit: raw.permissions.update_assigned_unit,
    },
  };
}

/* ---------------------------------------------------------------------------
   Flota
   ------------------------------------------------------------------------ */

export interface RawVehicle {
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
  driver_rating: number | string;
  driver_assigned_since: string;
  policy_provider: string;
  policy_number: string;
  policy_valid_from: string;
  policy_valid_to: string;
  policy_coverage: string;
  policy_status: Vehicle['policy']['status'];
  policy_days_to_expire: number;
  location_label: string;
  location_zone: string;
  location_lat: number | string;
  location_lng: number | string;
  location_updated_at: string;
  speed_kmh: number;
  heading: string;
}

export function mapVehicle(raw: RawVehicle): Vehicle {
  return {
    id: raw.id,
    unitCode: raw.unit_code,
    make: raw.make,
    model: raw.model,
    year: num(raw.year),
    plates: raw.plates,
    vin: raw.vin,
    color: raw.color,
    capacity: num(raw.capacity),
    serviceTier: raw.service_tier,
    status: raw.status,
    odometerKm: num(raw.odometer_km),
    weeklyKm: num(raw.weekly_km),
    weeklyKmByDay: parseWeeklySeries(raw.weekly_km_by_day),
    fuelLevel: num(raw.fuel_level),
    lastServiceKm: num(raw.last_service_km),
    nextServiceKm: num(raw.next_service_km),
    driver: {
      id: `drv-${raw.id}`,
      fullName: raw.driver_name,
      phone: raw.driver_phone,
      email: raw.driver_email,
      licenseNumber: raw.driver_license,
      rating: num(raw.driver_rating, 5),
      assignedSince: raw.driver_assigned_since,
    },
    policy: {
      provider: raw.policy_provider,
      policyNumber: raw.policy_number,
      validFrom: raw.policy_valid_from,
      validTo: raw.policy_valid_to,
      coverage: raw.policy_coverage,
      daysToExpire: num(raw.policy_days_to_expire),
      status: raw.policy_status,
    },
    location: {
      label: raw.location_label,
      zone: raw.location_zone,
      lat: num(raw.location_lat),
      lng: num(raw.location_lng),
      lastUpdate: raw.location_updated_at,
      speedKmh: num(raw.speed_kmh),
      heading: (raw.heading ?? 'N') as Vehicle['location']['heading'],
    },
  };
}

export interface RawFleetSummary {
  total_units: number;
  active_units: number;
  on_service_units: number;
  available_units: number;
  total_weekly_km: number;
  average_weekly_km: number;
  policy_alerts: number;
  expired_policies: number;
  expiring_policies: number;
  insurance_coverage_pct: number;
  last_telemetry_at: string | null;
}

export function mapFleetSummary(raw: RawFleetSummary): FleetSummary {
  return {
    totalUnits: num(raw.total_units),
    activeUnits: num(raw.active_units),
    onServiceUnits: num(raw.on_service_units),
    availableUnits: num(raw.available_units),
    totalWeeklyKm: num(raw.total_weekly_km),
    averageWeeklyKm: num(raw.average_weekly_km),
    policyAlerts: num(raw.policy_alerts),
    expiredPolicies: num(raw.expired_policies),
    expiringPolicies: num(raw.expiring_policies),
    insuranceCoveragePct: num(raw.insurance_coverage_pct),
    lastTelemetryAt: raw.last_telemetry_at ?? new Date().toISOString(),
  };
}

/* ---------------------------------------------------------------------------
   Landing pública
   ------------------------------------------------------------------------ */

export interface RawPublicVehicle {
  id: string;
  unit_code: string;
  make: string;
  model: string;
  year: number;
  plates: string;
  service_tier: string;
  capacity: number;
  status: PublicVehicle['status'];
  weekly_km: number;
  policy_status: PublicVehicle['policyStatus'];
  policy_days_to_expire: number;
  driver_first_name: string;
  location: {
    label: string;
    zone: string;
    lat: number | string;
    lng: number | string;
    updated_at: string;
    speed_kmh: number;
    heading: string;
  };
}

export function mapPublicVehicle(raw: RawPublicVehicle): PublicVehicle {
  return {
    id: raw.id,
    unitCode: raw.unit_code,
    make: raw.make,
    model: raw.model,
    year: num(raw.year),
    plates: raw.plates,
    serviceTier: raw.service_tier,
    capacity: num(raw.capacity),
    status: raw.status,
    weeklyKm: num(raw.weekly_km),
    policyStatus: raw.policy_status,
    policyDaysToExpire: num(raw.policy_days_to_expire),
    driverFirstName: raw.driver_first_name,
    location: {
      label: raw.location.label,
      zone: raw.location.zone,
      lat: num(raw.location.lat),
      lng: num(raw.location.lng),
      lastUpdate: raw.location.updated_at,
      speedKmh: num(raw.location.speed_kmh),
      heading: (raw.location.heading ?? 'N') as PublicVehicle['location']['heading'],
    },
  };
}

export interface RawLandingOverview {
  brand: { name: string; tagline: string; legal_name: string };
  contact: LandingContact;
  solutions: LandingSolution[];
  service_types: string[];
  cities: string[];
  metrics: LandingMetric[];
  summary: RawFleetSummary;
  fleet: RawPublicVehicle[];
}

export function mapLandingOverview(raw: RawLandingOverview): LandingOverview {
  return {
    brand: {
      name: raw.brand.name,
      tagline: raw.brand.tagline,
      legalName: raw.brand.legal_name,
    },
    contact: raw.contact,
    solutions: raw.solutions,
    serviceTypes: raw.service_types,
    cities: raw.cities,
    metrics: raw.metrics,
    summary: mapFleetSummary(raw.summary),
    fleet: raw.fleet.map(mapPublicVehicle),
  };
}
