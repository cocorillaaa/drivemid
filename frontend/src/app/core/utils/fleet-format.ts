import { PolicyStatus, UnitStatus } from '../models/fleet.models';

/** Etiquetas legibles para el estatus operativo de una unidad. */
export const UNIT_STATUS_LABEL: Record<UnitStatus, string> = {
  en_servicio: 'En servicio',
  disponible: 'Disponible',
  mantenimiento: 'En mantenimiento',
};

/** Clases asociadas al estatus operativo. */
export const UNIT_STATUS_BADGE: Record<UnitStatus, string> = {
  en_servicio: 'dl-badge dl-badge--ok',
  disponible: 'dl-badge dl-badge--neutral',
  mantenimiento: 'dl-badge dl-badge--warn',
};

/** Etiquetas legibles para el estatus de la póliza. */
export const POLICY_STATUS_LABEL: Record<PolicyStatus, string> = {
  vigente: 'Vigente',
  por_vencer: 'Por vencer',
  vencida: 'Vencida',
};

/** Clases asociadas al estatus de la póliza. */
export const POLICY_STATUS_BADGE: Record<PolicyStatus, string> = {
  vigente: 'dl-badge dl-badge--ok',
  por_vencer: 'dl-badge dl-badge--warn',
  vencida: 'dl-badge dl-badge--danger',
};

/** Formatea kilómetros con separador de miles. */
export function formatKm(km: number): string {
  return `${formatNumber(km)} km`;
}

/** Formatea un número con separador de miles. */
export function formatNumber(value: number): string {
  return new Intl.NumberFormat('es-MX').format(Math.round(value));
}

/** Formatea un teléfono mexicano a 10 dígitos como "55 4821 7390". */
export function formatPhone(phone: string): string {
  const digits = (phone ?? '').replace(/\D/g, '');
  if (digits.length !== 10) return phone;
  return `${digits.slice(0, 2)} ${digits.slice(2, 6)} ${digits.slice(6)}`;
}

/** Fecha larga en español, p. ej. "15 de enero de 2027". */
export function formatDate(iso: string): string {
  const date = parseIsoDate(iso);
  if (!date) return iso;

  return new Intl.DateTimeFormat('es-MX', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(date);
}

/** Fecha corta, p. ej. "15/01/2027". */
export function formatDateShort(iso: string): string {
  const date = parseIsoDate(iso);
  if (!date) return iso;

  return new Intl.DateTimeFormat('es-MX', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(date);
}

/** Hora local "hh:mm" a partir de un ISO con hora. */
export function formatTime(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '—';

  return new Intl.DateTimeFormat('es-MX', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(date);
}

/**
 * Tiempo relativo en español.
 *
 * Bajo el primer minuto se expresa en segundos, de modo que el indicador de
 * sincronización avanza visiblemente cada segundo.
 */
export function relativeTime(iso: string, now: Date = new Date()): string {
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return '—';

  const diffSeconds = Math.max(0, Math.round((now.getTime() - then) / 1000));

  if (diffSeconds < 5) return 'hace unos segundos';
  if (diffSeconds < 60) return `hace ${diffSeconds} s`;

  const minutes = Math.floor(diffSeconds / 60);
  if (minutes < 60) return `hace ${minutes} min`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `hace ${hours} h`;

  const days = Math.floor(hours / 24);
  return days === 1 ? 'hace 1 día' : `hace ${days} días`;
}

/** Texto de vigencia de una póliza a partir de los días restantes. */
export function policyCountdownText(daysToExpire: number): string {
  if (daysToExpire < 0) return `Vencida hace ${Math.abs(daysToExpire)} días`;
  if (daysToExpire === 0) return 'Vence hoy';
  if (daysToExpire === 1) return 'Vence mañana';

  return `Vence en ${daysToExpire} días`;
}

/** Interpreta "yyyy-MM-dd" como fecha UTC para evitar corrimientos. */
function parseIsoDate(iso: string): Date | null {
  if (!iso) return null;

  if (!/^\d{4}-\d{2}-\d{2}/.test(iso)) {
    const fallback = new Date(iso);
    return Number.isNaN(fallback.getTime()) ? null : fallback;
  }

  const [y, m, d] = iso.slice(0, 10).split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d));
}

/** Iniciales de un nombre completo (máximo 2 letras). */
export function initials(fullName: string): string {
  return fullName
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join('');
}

/** Días de la semana en orden lun → dom para las gráficas de km. */
export const WEEK_DAYS_SHORT = ['L', 'M', 'M', 'J', 'V', 'S', 'D'] as const;
