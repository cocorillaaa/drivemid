<?php

namespace Database\Seeders;

use App\Models\Vehicle;
use Illuminate\Database\Seeder;

/**
 * Carga las 4 unidades ejecutivas de prueba.
 *
 * El dataset replica exactamente el mock del frontend Angular
 * (`core/data/fleet-mock.data.ts`) para mantener paridad front/back:
 * conductores mexicanos, teléfonos ficticios a 10 dígitos, pólizas con
 * vigencia real y coordenadas coherentes del Valle de México.
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
                'make' => 'Dodge',
                'model' => 'Attitude',
                'year' => 2023,
                'plates' => 'ABC-123',
                'vin' => '3C6TD5AA0PG512874',
                'color' => 'Blanco perla',
                'capacity' => 4,
                'service_tier' => 'Traslado ejecutivo',
                'status' => 'en_servicio',
                'odometer_km' => 68450,
                'weekly_km' => 412,
                'weekly_km_by_day' => [68, 74, 55, 81, 62, 48, 24],
                'fuel_level' => 72,
                'last_service_km' => 62000,
                'next_service_km' => 72000,
                'driver_name' => 'Juan Carlos Ramírez Ortega',
                'driver_phone' => '5548217390',
                'driver_email' => 'juan.ramirez@demologistics.mx',
                'driver_license' => 'RMOC880415HDFMRN03',
                'driver_rating' => 4.9,
                'driver_assigned_since' => '2023-02-14',
                'policy_provider' => 'Quálitas',
                'policy_number' => 'QLT-2026-884512',
                'policy_valid_from' => '2026-01-15',
                'policy_valid_to' => '2027-01-15',
                'policy_coverage' => 'Cobertura amplia · Responsabilidad civil $4,000,000',
                'location_label' => 'Centro Histórico, Cuauhtémoc',
                'location_zone' => 'Corredor Centro · Reforma',
                'location_lat' => 19.4326,
                'location_lng' => -99.1332,
                'location_updated_at' => now()->subMinutes(42),
                'speed_kmh' => 0,
                'heading' => 'N',
            ],
            [
                'id' => 'unit-02',
                'unit_code' => 'Unidad 02',
                'make' => 'Nissan',
                'model' => 'Versa Sense',
                'year' => 2024,
                'plates' => 'DFG-456',
                'vin' => '3N1CN7AP0RL834126',
                'color' => 'Gris Oxford',
                'capacity' => 4,
                'service_tier' => 'Transporte corporativo',
                'status' => 'en_servicio',
                'odometer_km' => 42180,
                'weekly_km' => 536,
                'weekly_km_by_day' => [82, 91, 76, 88, 79, 84, 36],
                'fuel_level' => 48,
                'last_service_km' => 38000,
                'next_service_km' => 48000,
                'driver_name' => 'Miguel Ángel Hernández Cruz',
                'driver_phone' => '5591372648',
                'driver_email' => 'miguel.hernandez@demologistics.mx',
                'driver_license' => 'HECM910722HDFRRG08',
                'driver_rating' => 4.8,
                'driver_assigned_since' => '2024-01-08',
                'policy_provider' => 'GNP (Grupo Nacional Provincial)',
                'policy_number' => 'GNP-2026-339021',
                'policy_valid_from' => '2026-03-01',
                'policy_valid_to' => '2027-03-01',
                'policy_coverage' => 'Cobertura amplia · Gastos médicos a ocupantes',
                'location_label' => 'Polanco, Miguel Hidalgo',
                'location_zone' => 'Corredor Polanco · Masaryk',
                'location_lat' => 19.4330,
                'location_lng' => -99.1990,
                'location_updated_at' => now()->subMinutes(45),
                'speed_kmh' => 34,
                'heading' => 'SO',
            ],
            [
                'id' => 'unit-03',
                'unit_code' => 'Unidad 03',
                'make' => 'Volkswagen',
                'model' => 'Virtus Highline',
                'year' => 2024,
                'plates' => 'HIJ-789',
                'vin' => '3VW5T7AT0RM216530',
                'color' => 'Negro Ónix',
                'capacity' => 4,
                'service_tier' => 'Personal de confianza',
                'status' => 'en_servicio',
                'odometer_km' => 31240,
                'weekly_km' => 389,
                'weekly_km_by_day' => [61, 58, 70, 49, 66, 55, 30],
                'fuel_level' => 26,
                'last_service_km' => 25000,
                'next_service_km' => 35000,
                'driver_name' => 'Luis Fernando Mendoza Ríos',
                'driver_phone' => '8120458891',
                'driver_email' => 'luis.mendoza@demologistics.mx',
                'driver_license' => 'MERL870930HNLDNS01',
                'driver_rating' => 4.7,
                'driver_assigned_since' => '2024-06-03',
                'policy_provider' => 'AXA Seguros',
                'policy_number' => 'AXA-2025-117854',
                'policy_valid_from' => '2025-10-25',
                'policy_valid_to' => '2026-10-25',
                'policy_coverage' => 'Cobertura amplia · Asistencia vial 24/7',
                'location_label' => 'Santa Fe, Álvaro Obregón',
                'location_zone' => 'Corredor Santa Fe · Toluca',
                'location_lat' => 19.3667,
                'location_lng' => -99.2667,
                'location_updated_at' => now()->subMinutes(53),
                'speed_kmh' => 62,
                'heading' => 'O',
            ],
            [
                'id' => 'unit-04',
                'unit_code' => 'Unidad 04',
                'make' => 'Toyota',
                'model' => 'Avanza LE',
                'year' => 2023,
                'plates' => 'KLM-012',
                'vin' => '8AJHA3CD0PZ118945',
                'color' => 'Plata metálico',
                'capacity' => 7,
                'service_tier' => 'Grupos y eventos',
                'status' => 'disponible',
                'odometer_km' => 89730,
                'weekly_km' => 604,
                'weekly_km_by_day' => [95, 102, 88, 110, 92, 78, 39],
                'fuel_level' => 91,
                'last_service_km' => 84000,
                'next_service_km' => 94000,
                'driver_name' => 'Ricardo Alejandro Domínguez Peña',
                'driver_phone' => '3367124405',
                'driver_email' => 'ricardo.dominguez@demologistics.mx',
                'driver_license' => 'DOPR851118HJCMNC07',
                'driver_rating' => 4.9,
                'driver_assigned_since' => '2023-08-21',
                'policy_provider' => 'HDI Seguros',
                'policy_number' => 'HDI-2025-556210',
                'policy_valid_from' => '2025-08-16',
                'policy_valid_to' => '2026-08-16',
                'policy_coverage' => 'Cobertura limitada · Requiere renovación',
                'location_label' => 'AICM Terminal 2, Venustiano Carranza',
                'location_zone' => 'Corredor Aeropuerto · Norte',
                'location_lat' => 19.4200,
                'location_lng' => -99.0800,
                'location_updated_at' => now()->subMinutes(76),
                'speed_kmh' => 0,
                'heading' => 'NE',
            ],
        ];
    }
}
