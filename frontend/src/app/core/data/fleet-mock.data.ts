import {
  Driver,
  FleetSummary,
  InsurancePolicy,
  PolicyStatus,
  Vehicle,
} from '../models/fleet.models';

/**
 * Dataset de prueba (mock) de la flota ejecutiva Vanguard Fleet.
 *
 * Es la fuente única de datos para el prototipo cuando la API de Laravel
 * no está disponible. El seeder del backend (`VehicleSeeder`) replica
 * exactamente este mismo dataset para mantener paridad front/back.
 *
 * 4 unidades ejecutivas, conductores mexicanos, teléfonos ficticios a
 * 10 dígitos, pólizas con vigencia real y coordenadas coherentes de la
 * Zona Metropolitana del Valle de México.
 */

/** Umbral (días) a partir del cual una póliza se marca como "por vencer". */
export const POLICY_WARNING_DAYS = 60;

/** Normaliza una fecha a medianoche UTC para evitar desfases por zona horaria. */
function toUtcMidnight(dateIso: string): number {
  const [y, m, d] = dateIso.split('-').map(Number);
  return Date.UTC(y, m - 1, d);
}

/** Días restantes entre hoy y la fecha de vigencia (negativo si ya venció). */
export function daysUntil(dateIso: string, from: Date = new Date()): number {
  const today = Date.UTC(from.getFullYear(), from.getMonth(), from.getDate());
  return Math.round((toUtcMidnight(dateIso) - today) / 86_400_000);
}

/** Deriva el estatus de la póliza a partir de su vigencia. */
export function resolvePolicyStatus(daysToExpire: number): PolicyStatus {
  if (daysToExpire < 0) return 'vencida';
  if (daysToExpire <= POLICY_WARNING_DAYS) return 'por_vencer';
  return 'vigente';
}

/** Construye la póliza calculando vigencia y estatus en tiempo de ejecución. */
function buildPolicy(
  base: Omit<InsurancePolicy, 'status' | 'daysToExpire'>,
): InsurancePolicy {
  const daysToExpire = daysUntil(base.validTo);
  return { ...base, daysToExpire, status: resolvePolicyStatus(daysToExpire) };
}

/** Datos crudos de las 4 unidades de la flota. */
export const MOCK_VEHICLES: Vehicle[] = [
  {
    id: 'unit-01',
    unitCode: 'Unidad 01',
    make: 'Dodge',
    model: 'Attitude',
    year: 2023,
    plates: 'ABC-123',
    vin: '3C6TD5AA0PG512874',
    color: 'Blanco perla',
    capacity: 4,
    serviceTier: 'Traslado ejecutivo',
    status: 'en_servicio',
    odometerKm: 68_450,
    weeklyKm: 412,
    weeklyKmByDay: [68, 74, 55, 81, 62, 48, 24],
    fuelLevel: 72,
    lastServiceKm: 62_000,
    nextServiceKm: 72_000,
    driver: {
      id: 'drv-01',
      fullName: 'Juan Carlos Ramírez Ortega',
      phone: '5548217390',
      email: 'juan.ramirez@vanguardfleet.mx',
      licenseNumber: 'RMOC880415HDFMRN03',
      rating: 4.9,
      assignedSince: '2023-02-14',
    } satisfies Driver,
    policy: buildPolicy({
      provider: 'Quálitas',
      policyNumber: 'QLT-2026-884512',
      validFrom: '2026-01-15',
      validTo: '2027-01-15',
      coverage: 'Cobertura amplia · Responsabilidad civil $4,000,000',
    }),
    location: {
      label: 'Centro Histórico, Cuauhtémoc',
      zone: 'Corredor Centro · Reforma',
      lat: 19.4326,
      lng: -99.1332,
      lastUpdate: '2026-09-10T08:32:00',
      speedKmh: 0,
      heading: 'N',
    },
  },
  {
    id: 'unit-02',
    unitCode: 'Unidad 02',
    make: 'Nissan',
    model: 'Versa Sense',
    year: 2024,
    plates: 'DFG-456',
    vin: '3N1CN7AP0RL834126',
    color: 'Gris Oxford',
    capacity: 4,
    serviceTier: 'Transporte corporativo',
    status: 'en_servicio',
    odometerKm: 42_180,
    weeklyKm: 536,
    weeklyKmByDay: [82, 91, 76, 88, 79, 84, 36],
    fuelLevel: 48,
    lastServiceKm: 38_000,
    nextServiceKm: 48_000,
    driver: {
      id: 'drv-02',
      fullName: 'Miguel Ángel Hernández Cruz',
      phone: '5591372648',
      email: 'miguel.hernandez@vanguardfleet.mx',
      licenseNumber: 'HECM910722HDFRRG08',
      rating: 4.8,
      assignedSince: '2024-01-08',
    } satisfies Driver,
    policy: buildPolicy({
      provider: 'GNP (Grupo Nacional Provincial)',
      policyNumber: 'GNP-2026-339021',
      validFrom: '2026-03-01',
      validTo: '2027-03-01',
      coverage: 'Cobertura amplia · Gastos médicos a ocupantes',
    }),
    location: {
      label: 'Polanco, Miguel Hidalgo',
      zone: 'Corredor Polanco · Masaryk',
      lat: 19.433,
      lng: -99.199,
      lastUpdate: '2026-09-10T08:29:00',
      speedKmh: 34,
      heading: 'SO',
    },
  },
  {
    id: 'unit-03',
    unitCode: 'Unidad 03',
    make: 'Volkswagen',
    model: 'Virtus Highline',
    year: 2024,
    plates: 'HIJ-789',
    vin: '3VW5T7AT0RM216530',
    color: 'Negro Ónix',
    capacity: 4,
    serviceTier: 'Personal de confianza',
    status: 'en_servicio',
    odometerKm: 31_240,
    weeklyKm: 389,
    weeklyKmByDay: [61, 58, 70, 49, 66, 55, 30],
    fuelLevel: 26,
    lastServiceKm: 25_000,
    nextServiceKm: 35_000,
    driver: {
      id: 'drv-03',
      fullName: 'Luis Fernando Mendoza Ríos',
      phone: '8120458891',
      email: 'luis.mendoza@vanguardfleet.mx',
      licenseNumber: 'MERL870930HNLDNS01',
      rating: 4.7,
      assignedSince: '2024-06-03',
    } satisfies Driver,
    policy: buildPolicy({
      provider: 'AXA Seguros',
      policyNumber: 'AXA-2025-117854',
      validFrom: '2025-10-25',
      validTo: '2026-10-25',
      coverage: 'Cobertura amplia · Asistencia vial 24/7',
    }),
    location: {
      label: 'Santa Fe, Álvaro Obregón',
      zone: 'Corredor Santa Fe · Toluca',
      lat: 19.3667,
      lng: -99.2667,
      lastUpdate: '2026-09-10T08:21:00',
      speedKmh: 62,
      heading: 'O',
    },
  },
  {
    id: 'unit-04',
    unitCode: 'Unidad 04',
    make: 'Toyota',
    model: 'Avanza LE',
    year: 2023,
    plates: 'KLM-012',
    vin: '8AJHA3CD0PZ118945',
    color: 'Plata metálico',
    capacity: 7,
    serviceTier: 'Grupos y eventos',
    status: 'disponible',
    odometerKm: 89_730,
    weeklyKm: 604,
    weeklyKmByDay: [95, 102, 88, 110, 92, 78, 39],
    fuelLevel: 91,
    lastServiceKm: 84_000,
    nextServiceKm: 94_000,
    driver: {
      id: 'drv-04',
      fullName: 'Ricardo Alejandro Domínguez Peña',
      phone: '3367124405',
      email: 'ricardo.dominguez@vanguardfleet.mx',
      licenseNumber: 'DOPR851118HJCMNC07',
      rating: 4.9,
      assignedSince: '2023-08-21',
    } satisfies Driver,
    policy: buildPolicy({
      provider: 'HDI Seguros',
      policyNumber: 'HDI-2025-556210',
      validFrom: '2025-08-16',
      validTo: '2026-08-16',
      coverage: 'Cobertura limitada · Requiere renovación',
    }),
    location: {
      label: 'AICM Terminal 2, Venustiano Carranza',
      zone: 'Corredor Aeropuerto · Norte',
      lat: 19.42,
      lng: -99.08,
      lastUpdate: '2026-09-10T07:58:00',
      speedKmh: 0,
      heading: 'NE',
    },
  },
];

/** Vista previa de las tarifas/soluciones mostradas en la landing. */
export const SERVICE_SOLUTIONS = [
  {
    icon: 'bi-briefcase',
    title: 'Transporte corporativo',
    description:
      'Traslado diario de colaboradores y personal directivo con unidades asignadas, conductores verificados y control de horarios por centro de costo.',
    bullets: ['Unidad dedicada', 'Facturación mensual', 'Reporte por centro de costo'],
  },
  {
    icon: 'bi-person-badge',
    title: 'Traslado ejecutivo',
    description:
      'Servicio puerta a puerta para juntas, aeropuerto y visitas de cliente con estándar de puntualidad y confidencialidad.',
    bullets: ['SLA de puntualidad', 'Conductor bilingüe', 'Discreción total'],
  },
  {
    icon: 'bi-diagram-3',
    title: 'Gestión integral de flota',
    description:
      'Administración de unidades propias o arrendadas: pólizas, mantenimiento preventivo, telemetría y asignación de conductores.',
    bullets: ['Alertas de pólizas', 'Mantenimiento preventivo', 'Telemetría GPS'],
  },
  {
    icon: 'bi-people',
    title: 'Grupos y eventos',
    description:
      'Cobertura para convenciones, roadshows y logística de eventos con unidades de mayor capacidad y coordinación en sitio.',
    bullets: ['Unidades de 7 plazas', 'Coordinador en sitio', 'Cobertura nacional'],
  },
] as const;

/** Indicadores institucionales usados en la landing pública. */
export const LANDING_METRICS = [
  { value: '4', label: 'Unidades activas en operación' },
  { value: '1,941', label: 'Kilómetros recorridos esta semana' },
  { value: '98.6%', label: 'Cumplimiento de nivel de servicio' },
  { value: '24/7', label: 'Monitoreo y asistencia vial' },
] as const;

/** Cálculo del resumen agregado que alimenta el dashboard de Superusuario. */
export function buildFleetSummary(
  vehicles: readonly Vehicle[],
  lastTelemetryAt: string = new Date().toISOString(),
): FleetSummary {
  const totalWeeklyKm = vehicles.reduce((acc, v) => acc + v.weeklyKm, 0);
  const expiredPolicies = vehicles.filter((v) => v.policy.status === 'vencida').length;
  const expiringPolicies = vehicles.filter((v) => v.policy.status === 'por_vencer').length;
  const covered = vehicles.filter((v) => v.policy.status !== 'vencida').length;

  return {
    totalUnits: vehicles.length,
    activeUnits: vehicles.filter((v) => v.status !== 'mantenimiento').length,
    onServiceUnits: vehicles.filter((v) => v.status === 'en_servicio').length,
    availableUnits: vehicles.filter((v) => v.status === 'disponible').length,
    totalWeeklyKm,
    averageWeeklyKm: vehicles.length ? Math.round(totalWeeklyKm / vehicles.length) : 0,
    policyAlerts: expiredPolicies + expiringPolicies,
    expiredPolicies,
    expiringPolicies,
    insuranceCoveragePct: vehicles.length ? Math.round((covered / vehicles.length) * 100) : 0,
    lastTelemetryAt,
  };
}
