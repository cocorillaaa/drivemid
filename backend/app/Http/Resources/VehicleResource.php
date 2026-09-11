<?php

namespace App\Http\Resources;

use App\Models\Vehicle;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * Contrato de salida de una unidad de la flota.
 *
 * El frontend Angular consume exactamente estas claves (snake_case) y las
 * normaliza a su modelo de dominio en `FleetApiService`.
 *
 * @mixin Vehicle
 */
class VehicleResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'unit_code' => $this->unit_code,
            'make' => $this->make,
            'model' => $this->model,
            'year' => (int) $this->year,
            'plates' => $this->plates,
            'vin' => $this->vin,
            'color' => $this->color,
            'capacity' => (int) $this->capacity,
            'service_tier' => $this->service_tier,
            'status' => $this->status,

            'odometer_km' => (int) $this->odometer_km,
            'weekly_km' => (int) $this->weekly_km,
            'weekly_km_by_day' => array_map('intval', $this->weekly_km_by_day ?? []),
            'fuel_level' => (int) $this->fuel_level,
            'last_service_km' => (int) $this->last_service_km,
            'next_service_km' => (int) $this->next_service_km,

            'driver_name' => $this->driver_name,
            'driver_phone' => $this->driver_phone,
            'driver_email' => $this->driver_email,
            'driver_license' => $this->driver_license,
            'driver_rating' => (float) $this->driver_rating,
            'driver_assigned_since' => $this->driver_assigned_since?->toDateString(),

            'policy_provider' => $this->policy_provider,
            'policy_number' => $this->policy_number,
            'policy_valid_from' => $this->policy_valid_from?->toDateString(),
            'policy_valid_to' => $this->policy_valid_to?->toDateString(),
            'policy_coverage' => $this->policy_coverage,
            'policy_status' => $this->policyStatus(),
            'policy_days_to_expire' => $this->daysToPolicyExpiry(),

            'location_label' => $this->location_label,
            'location_zone' => $this->location_zone,
            'location_lat' => (float) $this->location_lat,
            'location_lng' => (float) $this->location_lng,
            'location_updated_at' => $this->location_updated_at?->toIso8601String(),
            'speed_kmh' => (int) $this->speed_kmh,
            'heading' => $this->heading,

            'tracking_url' => $this->tracking_url,
        ];
    }
}
