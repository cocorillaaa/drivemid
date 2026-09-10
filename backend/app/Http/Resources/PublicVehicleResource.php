<?php

namespace App\Http\Resources;

use App\Models\Vehicle;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Str;

/**
 * Vista pública de una unidad para la landing.
 *
 * Omite deliberadamente los datos personales del conductor (nombre completo,
 * teléfono y correo): la landing no requiere autenticación y esa información
 * no debe exponerse sin sesión.
 *
 * @mixin Vehicle
 */
class PublicVehicleResource extends JsonResource
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
            'service_tier' => $this->service_tier,
            'capacity' => (int) $this->capacity,
            'status' => $this->status,
            'weekly_km' => (int) $this->weekly_km,
            'policy_status' => $this->policyStatus(),
            'policy_days_to_expire' => $this->daysToPolicyExpiry(),
            'driver_first_name' => Str::of($this->driver_name)->explode(' ')->first(),
            'location' => [
                'label' => $this->location_label,
                'zone' => $this->location_zone,
                'lat' => (float) $this->location_lat,
                'lng' => (float) $this->location_lng,
                'updated_at' => $this->location_updated_at?->toIso8601String(),
                'speed_kmh' => (int) $this->speed_kmh,
                'heading' => $this->heading,
            ],
        ];
    }
}
