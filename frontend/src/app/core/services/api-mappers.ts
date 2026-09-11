import {
  AssignedVehicle,
  AuthUser,
  BusinessFlowStep,
  FleetSummary,
  LandingAudience,
  LandingContact,
  LandingOverview,
  PerformanceOverview,
  PerformanceSeriesPoint,
  ProgramPerformance,
  ProgramStep,
  ProgramValue,
  UnitPerformance,
  UnitPerformanceDetail,
  UnitPerformanceRow,
  UnitPeriodRow,
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
  tracking_url: string | null;
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
    trackingUrl: raw.tracking_url ?? null,
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
   Sitio público
   ------------------------------------------------------------------------ */

export interface RawLandingOverview {
  brand: {
    name: string;
    short_name: string;
    tagline: string;
    legal_name: string;
    demo_badge: string;
  };
  contact: LandingContact;
  about: { title: string; body: string[] };
  mission: { title: string; body: string };
  vision: { title: string; body: string };
  values: ProgramValue[];
  business_model: { title: string; body: string[]; flow: BusinessFlowStep[] };
  work_plan: { title: string; intro: string; steps: ProgramStep[] };
  audiences: LandingAudience[];
  capital_ranges: string[];
}

export function mapLandingOverview(raw: RawLandingOverview): LandingOverview {
  return {
    brand: {
      name: raw.brand.name,
      shortName: raw.brand.short_name,
      tagline: raw.brand.tagline,
      legalName: raw.brand.legal_name,
      demoBadge: raw.brand.demo_badge,
    },
    contact: raw.contact,
    about: raw.about,
    mission: raw.mission,
    vision: raw.vision,
    values: raw.values,
    businessModel: raw.business_model,
    workPlan: raw.work_plan,
    audiences: raw.audiences,
    capitalRanges: raw.capital_ranges,
  };
}

/* ---------------------------------------------------------------------------
   Rendimiento económico
   ------------------------------------------------------------------------ */

export interface RawPerformanceSeriesPoint {
  week_start: string;
  km: number;
  gross_income: number;
  net_flow: number;
  utilization_pct: number;
  days_in_shop: number;
}

export interface RawUnitPerformance {
  weeks: number;
  first_week: string | null;
  last_week: string | null;
  capital_invested: number;
  weekly_fee: number;
  acquired_on: string | null;
  financials_are_demo: boolean;
  periods_are_demo: boolean;
  km: number;
  days_available: number;
  days_in_service: number;
  days_in_shop: number;
  days_off_road: number;
  gross_income: number;
  collected_income: number;
  outstanding_income: number;
  maintenance_cost: number;
  incident_cost: number;
  direct_costs: number;
  fixed_costs: number;
  operating_result: number;
  reserve: number;
  net_flow: number;
  monthly_net_flow: number;
  utilization_pct: number;
  availability_pct: number;
  gross_income_per_day: number;
  net_flow_per_day: number;
  net_flow_per_km: number;
  cost_per_km: number;
  maintenance_cost_per_km: number;
  monthly_km: number;
  delinquency_pct: number;
  driver_turnover: number;
  driver_names: string[];
  annualized_return_pct: number;
  series: RawPerformanceSeriesPoint[];
}

function mapSeries(raw: RawPerformanceSeriesPoint[]): PerformanceSeriesPoint[] {
  return (raw ?? []).map((point) => ({
    weekStart: point.week_start,
    km: num(point.km),
    grossIncome: num(point.gross_income),
    netFlow: num(point.net_flow),
    utilizationPct: num(point.utilization_pct),
    daysInShop: num(point.days_in_shop),
  }));
}

export function mapUnitPerformance(raw: RawUnitPerformance): UnitPerformance {
  return {
    weeks: num(raw.weeks),
    firstWeek: raw.first_week,
    lastWeek: raw.last_week,
    capitalInvested: num(raw.capital_invested),
    weeklyFee: num(raw.weekly_fee),
    acquiredOn: raw.acquired_on,
    financialsAreDemo: !!raw.financials_are_demo,
    periodsAreDemo: !!raw.periods_are_demo,
    km: num(raw.km),
    daysAvailable: num(raw.days_available),
    daysInService: num(raw.days_in_service),
    daysInShop: num(raw.days_in_shop),
    daysOffRoad: num(raw.days_off_road),
    grossIncome: num(raw.gross_income),
    collectedIncome: num(raw.collected_income),
    outstandingIncome: num(raw.outstanding_income),
    maintenanceCost: num(raw.maintenance_cost),
    incidentCost: num(raw.incident_cost),
    directCosts: num(raw.direct_costs),
    fixedCosts: num(raw.fixed_costs),
    operatingResult: num(raw.operating_result),
    reserve: num(raw.reserve),
    netFlow: num(raw.net_flow),
    monthlyNetFlow: num(raw.monthly_net_flow),
    utilizationPct: num(raw.utilization_pct),
    availabilityPct: num(raw.availability_pct),
    grossIncomePerDay: num(raw.gross_income_per_day),
    netFlowPerDay: num(raw.net_flow_per_day),
    netFlowPerKm: num(raw.net_flow_per_km),
    costPerKm: num(raw.cost_per_km),
    maintenanceCostPerKm: num(raw.maintenance_cost_per_km),
    monthlyKm: num(raw.monthly_km),
    delinquencyPct: num(raw.delinquency_pct),
    driverTurnover: num(raw.driver_turnover),
    driverNames: raw.driver_names ?? [],
    annualizedReturnPct: num(raw.annualized_return_pct),
    series: mapSeries(raw.series),
  };
}

export interface RawProgramPerformance {
  units_with_data: number;
  capital_invested: number;
  gross_income: number;
  outstanding_income: number;
  operating_result: number;
  net_flow: number;
  monthly_net_flow: number;
  annualized_return_pct: number;
  weighted_utilization_pct: number;
  weighted_availability_pct: number;
  delinquency_pct: number;
  cost_per_km: number;
}

function mapProgram(raw: RawProgramPerformance): ProgramPerformance {
  return {
    unitsWithData: num(raw.units_with_data),
    capitalInvested: num(raw.capital_invested),
    grossIncome: num(raw.gross_income),
    outstandingIncome: num(raw.outstanding_income),
    operatingResult: num(raw.operating_result),
    netFlow: num(raw.net_flow),
    monthlyNetFlow: num(raw.monthly_net_flow),
    annualizedReturnPct: num(raw.annualized_return_pct),
    weightedUtilizationPct: num(raw.weighted_utilization_pct),
    weightedAvailabilityPct: num(raw.weighted_availability_pct),
    delinquencyPct: num(raw.delinquency_pct),
    costPerKm: num(raw.cost_per_km),
  };
}

export interface RawPerformanceOverview {
  weeks: number;
  demo_data: boolean;
  program: RawProgramPerformance;
  units: (RawUnitPerformance & {
    id: string;
    unit_code: string;
    make: string;
    model: string;
    year: number;
    plates: string;
    status: Vehicle['status'];
    driver_name: string;
    tracking_url: string | null;
  })[];
}

export function mapPerformanceOverview(raw: RawPerformanceOverview): PerformanceOverview {
  return {
    weeks: num(raw.weeks),
    demoData: !!raw.demo_data,
    program: mapProgram(raw.program),
    units: (raw.units ?? []).map<UnitPerformanceRow>((unit) => ({
      ...mapUnitPerformance(unit),
      id: unit.id,
      unitCode: unit.unit_code,
      make: unit.make,
      model: unit.model,
      year: num(unit.year),
      plates: unit.plates,
      status: unit.status,
      driverName: unit.driver_name,
      trackingUrl: unit.tracking_url ?? null,
    })),
  };
}

export function mapUnitPerformanceDetail(raw: {
  weeks: number;
  demo_data: boolean;
  vehicle: RawPerformanceOverview['units'][number];
  performance: RawUnitPerformance;
  periods: {
    week_start: string;
    km_driven: number;
    days_in_service: number;
    days_in_shop: number;
    gross_income: number;
    collected_income: number;
    outstanding_income: number;
    direct_costs: number;
    driver_name: string | null;
    source: UnitPeriodRow['source'];
  }[];
}): UnitPerformanceDetail {
  return {
    weeks: num(raw.weeks),
    demoData: !!raw.demo_data,
    vehicle: {
      id: raw.vehicle.id,
      unitCode: raw.vehicle.unit_code,
      make: raw.vehicle.make,
      model: raw.vehicle.model,
      year: num(raw.vehicle.year),
      plates: raw.vehicle.plates,
      status: raw.vehicle.status,
      driverName: raw.vehicle.driver_name,
      trackingUrl: raw.vehicle.tracking_url ?? null,
    },
    performance: mapUnitPerformance(raw.performance),
    periods: (raw.periods ?? []).map<UnitPeriodRow>((period) => ({
      weekStart: period.week_start,
      kmDriven: num(period.km_driven),
      daysInService: num(period.days_in_service),
      daysInShop: num(period.days_in_shop),
      grossIncome: num(period.gross_income),
      collectedIncome: num(period.collected_income),
      outstandingIncome: num(period.outstanding_income),
      directCosts: num(period.direct_costs),
      driverName: period.driver_name,
      source: period.source,
    })),
  };
}
