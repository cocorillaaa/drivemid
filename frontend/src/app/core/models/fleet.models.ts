/**
 * Modelo de dominio de la plataforma DemoLogistics.
 * Contrato único compartido entre los servicios de datos y las vistas.
 */

/** Estatus operativo de la unidad. */
export type UnitStatus = 'en_servicio' | 'disponible' | 'mantenimiento';

/** Estatus de la póliza de seguro. */
export type PolicyStatus = 'vigente' | 'por_vencer' | 'vencida';

/** Roles de la plataforma. */
export type UserRole = 'superuser' | 'unit_admin';

/** Coordenada geográfica. */
export interface GeoPoint {
  lat: number;
  lng: number;
}

/* ---------------------------------------------------------------------------
   Sesión y usuarios
   ------------------------------------------------------------------------ */

/** Unidad resumida que acompaña al perfil del Administrador de Unidad. */
export interface AssignedVehicle {
  id: string;
  unitCode: string;
  plates: string;
  make: string;
  model: string;
}

/** Permisos que el backend calcula para el usuario autenticado. */
export interface UserPermissions {
  viewGlobalFleet: boolean;
  viewAllUnits: boolean;
  managePolicies: boolean;
  updateAssignedUnit: boolean;
}

/** Usuario autenticado. */
export interface AuthUser {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  roleLabel: string;
  jobTitle: string | null;
  phone: string | null;
  initials: string;
  vehicleId: string | null;
  vehicle: AssignedVehicle | null;
  permissions: UserPermissions;
}

/** Credenciales de acceso. */
export interface LoginPayload {
  email: string;
  password: string;
  deviceName?: string;
}

/** Respuesta del inicio de sesión. */
export interface SessionPayload {
  token: string;
  tokenType: string;
  user: AuthUser;
}

/**
 * Cuenta de demostración publicada por el backend.
 * Sólo llega con `APP_DEBUG` activo.
 */
export interface DemoAccount {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  scope: string;
}

/* ---------------------------------------------------------------------------
   Flota
   ------------------------------------------------------------------------ */

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

/* ---------------------------------------------------------------------------
   Landing pública
   ------------------------------------------------------------------------ */

/** Pilar institucional mostrado en la landing. */
export interface LandingPillar {
  key: string;
  title: string;
  description: string;
}

/**
 * Zona comercial de cobertura.
 *
 * Son referencias geográficas de operación, no la posición de una unidad:
 * la landing es pública y no publica datos operativos.
 */
export interface CoverageZone {
  key: string;
  name: string;
  note: string;
  lat: number;
  lng: number;
}

/** Solución comercial mostrada en la landing. */
export interface LandingSolution {
  key: string;
  title: string;
  description: string;
  bullets: string[];
}

/** Canales de contacto institucionales. */
export interface LandingContact {
  phone: string;
  email: string;
  address: string;
  hours: string;
}

/**
 * Contenido completo de la landing servido por el backend.
 *
 * No incluye datos de la aplicación: ni unidades, ni kilometrajes, ni
 * pólizas, ni posiciones, ni información de los conductores.
 */
export interface LandingOverview {
  brand: { name: string; tagline: string; legalName: string };
  contact: LandingContact;
  solutions: LandingSolution[];
  serviceTypes: string[];
  cities: string[];
  pillars: LandingPillar[];
  coverageZones: CoverageZone[];
}

/* ---------------------------------------------------------------------------
   Captación
   ------------------------------------------------------------------------ */

/** Alta de solicitud de servicio corporativo. */
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

/** Alta de postulación de conductor. */
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

/** Error de validación devuelto por Laravel (HTTP 422). */
export interface ApiValidationError {
  message: string;
  errors?: Record<string, string[]>;
}

/** Payload aceptado por el formulario rápido del Administrador de Unidad. */
export interface UnitUpdatePayload {
  weeklyKm?: number;
  phone?: string;
}

/** Marcador que el componente `dl-fleet-map` sabe pintar. */
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
  /** Filas del popup (etiqueta/valor). */
  rows: ReadonlyArray<{ label: string; value: string }>;
  /** Radio (m) del halo de geocerca; sólo en la vista de unidad individual. */
  accuracyRadiusM?: number;
}
