/**
 * Modelo de dominio de la plataforma Vanguard Fleet.
 * Contrato único compartido entre `FleetApiService`, `FleetService` y las vistas.
 */

/** Estatus operativo de la unidad. */
export type UnitStatus = 'en_servicio' | 'disponible' | 'mantenimiento';

/** Estatus de la póliza de seguro. */
export type PolicyStatus = 'vigente' | 'por_vencer' | 'vencida';

/** Origen de los datos mostrados en la interfaz. */
export type DataSource = 'api' | 'mock';

/** Coordenada geográfica. */
export interface GeoPoint {
  lat: number;
  lng: number;
}

/** Ubicación reportada por el GPS de la unidad. */
export interface VehicleLocation extends GeoPoint {
  /** Etiqueta legible, p. ej. "Polanco, CDMX". */
  label: string;
  /** Zona / corredor operativo. */
  zone: string;
  /** Fecha ISO de la última lectura de GPS. */
  lastUpdate: string;
  /** Velocidad instantánea en km/h. */
  speedKmh: number;
  /** Rumbo cardinal. */
  heading: 'N' | 'NE' | 'E' | 'SE' | 'S' | 'SO' | 'O' | 'NO';
}

/** Póliza de seguro de la unidad. */
export interface InsurancePolicy {
  provider: string;
  policyNumber: string;
  status: PolicyStatus;
  /** Vigencia inicial (ISO yyyy-MM-dd). */
  validFrom: string;
  /** Vigencia final (ISO yyyy-MM-dd). */
  validTo: string;
  coverage: string;
  /** Días restantes (negativo si ya venció). */
  daysToExpire: number;
}

/** Conductor asignado a la unidad. */
export interface Driver {
  id: string;
  fullName: string;
  /** Teléfono a 10 dígitos. */
  phone: string;
  email: string;
  licenseNumber: string;
  rating: number;
  assignedSince: string;
}

/** Unidad de la flota. */
export interface Vehicle {
  id: string;
  /** Código interno, p. ej. "Unidad 01". */
  unitCode: string;
  make: string;
  model: string;
  year: number;
  plates: string;
  vin: string;
  color: string;
  /** Capacidad de pasajeros. */
  capacity: number;
  /** Tipo de servicio ejecutivo prestado. */
  serviceTier: string;
  status: UnitStatus;
  /** Odómetro acumulado (km). */
  odometerKm: number;
  /** Km recorridos en la semana en curso. */
  weeklyKm: number;
  /** Km por día de la semana en curso (lun → dom). */
  weeklyKmByDay: number[];
  /** Nivel de combustible (0-100). */
  fuelLevel: number;
  /** Km del último servicio preventivo. */
  lastServiceKm: number;
  /** Km programado para el siguiente servicio. */
  nextServiceKm: number;
  driver: Driver;
  policy: InsurancePolicy;
  location: VehicleLocation;
}

/** Resumen agregado de la flota (vista Superusuario). */
export interface FleetSummary {
  totalUnits: number;
  activeUnits: number;
  onServiceUnits: number;
  availableUnits: number;
  totalWeeklyKm: number;
  averageWeeklyKm: number;
  policyAlerts: number;
  expiredPolicies: number;
  expiringPolicies: number;
  insuranceCoveragePct: number;
  lastTelemetryAt: string;
}

/** Alta de solicitud de servicio corporativo (landing). */
export interface CorporateLeadPayload {
  company: string;
  contactName: string;
  email: string;
  phone: string;
  serviceType: string;
  units: number;
  city: string;
  message?: string;
}

/** Alta de postulación de conductor (landing). */
export interface DriverApplicationPayload {
  fullName: string;
  email: string;
  phone: string;
  city: string;
  licenseNumber: string;
  experienceYears: number;
  vehicleOwned: boolean;
  message?: string;
}

/** Respuesta genérica de la API. */
export interface ApiResponse<T> {
  data: T;
  message?: string;
}

/** Payload aceptado por el formulario rápido del Administrador de Unidad. */
export interface UnitUpdatePayload {
  weeklyKm?: number;
  phone?: string;
}

/** Marcador que el componente `vf-fleet-map` sabe pintar. */
export interface FleetMapMarker {
  id: string;
  /** Título principal del popup, p. ej. "Unidad 01 · Dodge Attitude". */
  title: string;
  /** Subtítulo del popup, p. ej. placas y conductor. */
  subtitle: string;
  lat: number;
  lng: number;
  /** Tono cromático del pin. */
  tone: 'ok' | 'warn' | 'danger' | 'neutral';
  /** Icono Bootstrap Icons del pin. */
  icon: string;
  /** Filas del popup (etiqueta/valor). */
  rows: ReadonlyArray<{ label: string; value: string }>;
  /** Radio (m) del halo de geocerca; sólo en la vista de unidad individual. */
  accuracyRadiusM?: number;
}
