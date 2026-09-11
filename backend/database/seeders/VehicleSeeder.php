<?php

namespace Database\Seeders;

use App\Models\Vehicle;
use Illuminate\Database\Seeder;

/**
 * Carga la unidad de prueba que corresponde al vehículo real del cliente.
 *
 * La identidad de la unidad —marca, modelo, año, placas, color y capacidad—
 * proviene de la hoja de captura que devolvió el cliente. El kilometraje, el
 * mantenimiento, el conductor, la póliza y la ubicación siguen siendo valores
 * de ejemplo mientras se completa la captura. El VIN está marcado como
 * pendiente y el enlace de seguimiento es un marcador: el enlace real de
 * rastreo no se versiona porque da acceso a la ubicación del vehículo.
 */
class VehicleSeeder extends Seeder
{
    public function run(): void
    {
        foreach ($this->vehicles() as $vehicle) {
            Vehicle::updateOrCreate(['id' => $vehicle['id']], $vehicle);
        }
    }

    /**
     * @return array<int, array<string, mixed>>
     */
    private function vehicles(): array
    {
        return [
            [
                'id' => 'unit-01',
                'unit_code' => 'Unidad 01',
                'make' => 'Chevrolet',
                'model' => 'Aveo',
                'year' => 2022,
                'plates' => 'YXY-669-G',
                'vin' => 'PENDIENTE-DE-CAPTURA',
                'color' => 'Gris',
                'capacity' => 5,
                'service_tier' => 'Plataformas de movilidad',
                'status' => 'en_servicio',
                'odometer_km' => 68450,
                'weekly_km' => 412,
                'weekly_km_by_day' => [68, 74, 55, 81, 62, 48, 24],
                'fuel_level' => 68,
                'last_service_km' => 62000,
                'next_service_km' => 72000,
                'driver_name' => 'Juan Carlos Ramírez Ortega',
                'driver_phone' => '5548217390',
                'driver_email' => 'juan.ramirez@drivemid.com',
                'driver_license' => 'RMOC880415HDFMRN03',
                'driver_rating' => 4.9,
                'driver_assigned_since' => '2023-02-14',
                'policy_provider' => 'Quálitas',
                'policy_number' => 'QLT-2026-884512',
                'policy_valid_from' => '2026-01-15',
                'policy_valid_to' => '2027-01-15',
                'policy_coverage' => 'Cobertura amplia · Responsabilidad civil $4,000,000',
                'location_label' => 'Centro, Mérida',
                'location_zone' => 'Mérida, Yucatán',
                'location_lat' => 20.9674,
                'location_lng' => -89.5926,
                'location_updated_at' => now()->subMinutes(12),
                'speed_kmh' => 0,
                'heading' => 'N',
                'tracking_url' => 'https://seguimiento.ejemplo.mx/u/YXY669G',
            ],
        ];
    }
}
