import { FleetMapMarker, Vehicle } from '../models/fleet.models';
import {
  POLICY_STATUS_LABEL,
  UNIT_STATUS_LABEL,
  formatKm,
  formatPhone,
  policyCountdownText,
  relativeTime,
} from './fleet-format';

/** Traduce el estatus de póliza al tono cromático del pin. */
const POLICY_TONE: Record<Vehicle['policy']['status'], FleetMapMarker['tone']> = {
  vigente: 'ok',
  por_vencer: 'warn',
  vencida: 'danger',
};

/**
 * Construye el marcador del mapa a partir de una unidad de la flota.
 *
 * Reutilizado por la vista Superusuario (4 marcadores) y por la vista de
 * Administrador de Unidad (marcador único con geocerca).
 */
export function toFleetMarker(
  vehicle: Vehicle,
  opts: { withZone?: boolean } = {},
): FleetMapMarker {
  return {
    id: vehicle.id,
    title: `${vehicle.unitCode} · ${vehicle.make} ${vehicle.model}`,
    subtitle: `${vehicle.plates} · ${vehicle.driver.fullName}`,
    lat: vehicle.location.lat,
    lng: vehicle.location.lng,
    tone: POLICY_TONE[vehicle.policy.status],
    icon: 'bi-truck-front-fill',
    rows: [
      { label: 'Conductor', value: vehicle.driver.fullName },
      { label: 'Teléfono', value: formatPhone(vehicle.driver.phone) },
      { label: 'Estatus', value: UNIT_STATUS_LABEL[vehicle.status] },
      {
        label: 'Póliza',
        value: `${POLICY_STATUS_LABEL[vehicle.policy.status]} · ${policyCountdownText(
          vehicle.policy.daysToExpire,
        )}`,
      },
      { label: 'Km semana', value: formatKm(vehicle.weeklyKm) },
      { label: 'Ubicación', value: vehicle.location.label },
      { label: 'Reporte GPS', value: relativeTime(vehicle.location.lastUpdate) },
    ],
    accuracyRadiusM: opts.withZone ? 850 : undefined,
  };
}
