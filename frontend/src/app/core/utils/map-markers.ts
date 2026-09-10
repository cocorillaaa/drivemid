import { FleetMapMarker, PublicVehicle, Vehicle } from '../models/fleet.models';
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
 * Marcador de una unidad autenticada (panel de flota y vista de unidad).
 *
 * Incluye los datos de contacto del conductor, disponibles sólo con sesión.
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

/**
 * Marcador de una unidad publicada en la landing.
 *
 * La landing no requiere autenticación, así que el popup sólo expone los datos
 * operativos y el nombre de pila del conductor.
 */
export function toPublicFleetMarker(unit: PublicVehicle): FleetMapMarker {
  return {
    id: unit.id,
    title: `${unit.unitCode} · ${unit.make} ${unit.model}`,
    subtitle: `${unit.plates} · ${unit.serviceTier}`,
    lat: unit.location.lat,
    lng: unit.location.lng,
    tone: POLICY_TONE[unit.policyStatus],
    icon: 'bi-truck-front-fill',
    rows: [
      { label: 'Servicio', value: unit.serviceTier },
      { label: 'Conductor', value: unit.driverFirstName },
      { label: 'Estatus', value: UNIT_STATUS_LABEL[unit.status] },
      {
        label: 'Póliza',
        value: `${POLICY_STATUS_LABEL[unit.policyStatus]} · ${policyCountdownText(
          unit.policyDaysToExpire,
        )}`,
      },
      { label: 'Km semana', value: formatKm(unit.weeklyKm) },
      { label: 'Capacidad', value: `${unit.capacity} pasajeros` },
      { label: 'Ubicación', value: unit.location.label },
      { label: 'Reporte GPS', value: relativeTime(unit.location.lastUpdate) },
    ],
  };
}
