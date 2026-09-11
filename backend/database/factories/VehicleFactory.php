<?php

namespace Database\Factories;

use App\Models\Vehicle;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Vehicle>
 */
class VehicleFactory extends Factory
{
    protected $model = Vehicle::class;

    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $id = 'unit-'.fake()->unique()->numerify('###');

        return [
            'id' => $id,
            'unit_code' => 'Unidad '.fake()->unique()->numerify('###'),
            'make' => fake()->randomElement(['Dodge', 'Nissan', 'Volkswagen', 'Toyota', 'Chevrolet']),
            'model' => fake()->randomElement(['Attitude', 'Versa Sense', 'Virtus', 'Avanza LE', 'Aveo LT']),
            'year' => fake()->numberBetween(2020, 2026),
            'plates' => fake()->unique()->bothify('???-###'),
            'vin' => fake()->unique()->bothify('?????????????????'),
            'color' => fake()->randomElement(['Blanco perla', 'Gris Oxford', 'Negro Ónix', 'Plata metálico', 'Gris']),
            'capacity' => fake()->randomElement([4, 4, 5, 5, 7]),
            'service_tier' => fake()->randomElement([
                'Plataformas de movilidad',
                'Plataformas de movilidad',
                'Traslado ejecutivo',
                'Personal de confianza',
            ]),
            'status' => fake()->randomElement(Vehicle::STATUSES),
            'odometer_km' => fake()->numberBetween(10_000, 120_000),
            'weekly_km' => $weeklyKm = fake()->numberBetween(200, 700),
            'weekly_km_by_day' => array_map(
                static fn (): int => fake()->numberBetween(20, 110),
                range(0, 6),
            ),
            'fuel_level' => fake()->numberBetween(10, 100),
            'last_service_km' => fake()->numberBetween(5_000, 80_000),
            'next_service_km' => fake()->numberBetween(10_000, 95_000),
            'driver_name' => fake()->name(),
            'driver_phone' => fake()->numerify('##########'),
            'driver_email' => fake()->unique()->safeEmail(),
            'driver_license' => fake()->bothify('????#############'),
            'driver_rating' => fake()->randomFloat(1, 3.5, 5),
            'driver_assigned_since' => fake()->dateTimeBetween('-3 years', 'now')->format('Y-m-d'),
            'policy_provider' => fake()->randomElement(['Quálitas', 'GNP', 'AXA Seguros', 'HDI Seguros']),
            'policy_number' => fake()->unique()->bothify('???-####-######'),
            'policy_valid_from' => now()->subMonths(6)->toDateString(),
            'policy_valid_to' => fake()->dateTimeBetween('-1 month', '+18 months')->format('Y-m-d'),
            'policy_coverage' => 'Cobertura amplia · Responsabilidad civil',
            'location_label' => fake()->randomElement([
                'Centro, Mérida',
                'Montejo, Mérida',
                'Chuburná, Mérida',
                'Francisco de Montejo, Mérida',
            ]),
            'location_zone' => 'Mérida, Yucatán',
            'location_lat' => fake()->latitude(20.9, 21.1),
            'location_lng' => fake()->longitude(-89.7, -89.5),
            'location_updated_at' => now()->subMinutes(fake()->numberBetween(1, 240)),
            'speed_kmh' => fake()->numberBetween(0, 90),
            'heading' => fake()->randomElement(['N', 'NE', 'E', 'SE', 'S', 'SO', 'O', 'NO']),
            'tracking_url' => fake()->boolean(80)
                ? 'https://seguimiento.ejemplo.mx/u/'.fake()->unique()->bothify('??????')
                : null,
            'created_at' => now(),
            'updated_at' => now(),
        ];
    }
}
