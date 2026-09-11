/**
 * Modelo de dominio de la plataforma Drive Mid.
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
  /** Etiqueta legible, p. ej. "Centro, Mérida". */
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
  /**
   * Enlace de seguimiento de la unidad.
   *
   * El rastreo del cliente se consulta con un link por vehículo (no hay API
   * que alimente el mapa), así que la ficha ofrece el acceso directo.
   */
  trackingUrl: string | null;
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
   Sitio público
   ------------------------------------------------------------------------ */

/** Valor institucional del programa. */
export interface ProgramValue {
  key: string;
  title: string;
  description: string;
}

/** Etapa del plan de trabajo. */
export interface ProgramStep {
  key: string;
  /** Número de etapa ya formateado, p. ej. "01". */
  step: string;
  title: string;
  description: string;
}

/** Paso del flujo del modelo de negocio. */
export interface BusinessFlowStep {
  key: string;
  title: string;
  description: string;
}

/** Público al que se dirige el programa. */
export interface LandingAudience {
  key: string;
  title: string;
  description: string;
  bullets: string[];
}

/** Canal de contacto institucional. */
export interface LandingContact {
  phone: string;
  email: string;
  address: string;
  city: string;
  hours: string;
  website: string;
}

/**
 * Contenido completo del sitio público servido por el backend.
 *
 * No incluye datos de la aplicación: ni unidades, ni kilometrajes, ni
 * pólizas, ni posiciones, ni información de los conductores. Tampoco publica
 * cobertura ni ciudades: el negocio se presenta como un programa de
 * inversión, no como una operación geográfica.
 */
export interface LandingOverview {
  brand: {
    name: string;
    shortName: string;
    tagline: string;
    legalName: string;
    demoBadge: string;
  };
  contact: LandingContact;
  about: { title: string; body: string[] };
  mission: { title: string; body: string };
  vision: { title: string; body: string };
  values: ProgramValue[];
  businessModel: { title: string; body: string[]; flow: BusinessFlowStep[] };
  workPlan: { title: string; intro: string; steps: ProgramStep[] };
  audiences: LandingAudience[];
  capitalRanges: string[];
}

/* ---------------------------------------------------------------------------
   Captación
   ------------------------------------------------------------------------ */

/** Alta de interesado en el programa de inversión. */
export interface InvestorLeadPayload {
  fullName: string;
  email: string;
  phone: string;
  city: string;
  capitalRange: string;
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
