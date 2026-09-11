<?php

namespace Database\Factories;

use App\Models\UnitPeriod;
use App\Models\Vehicle;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<UnitPeriod>
 */
class UnitPeriodFactory extends Factory
{
    protected $model = UnitPeriod::class;

    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $daysInService = fake()->numberBetween(4, 7);
        $km = fake()->numberBetween(260, 520);
        $grossIncome = (int) round($km * fake()->randomFloat(2, 7.5, 10.5));
        $collected = fake()->boolean(80)
            ? $grossIncome
            : (int) round($grossIncome * fake()->randomFloat(2, 0.5, 0.9));

        return [
            'vehicle_id' => Vehicle::factory(),
            'week_start' => now()->startOfWeek()->subWeeks(fake()->numberBetween(1, 12))->toDateString(),
            'km_driven' => $km,
            'days_in_service' => $daysInService,
            'days_in_shop' => 7 - $daysInService,
            'gross_income' => $grossIncome,
            'collected_income' => $collected,
            'maintenance_cost' => fake()->numberBetween(0, 3_500),
            'fuel_cost' => fake()->numberBetween(600, 2_200),
            'incident_cost' => fake()->boolean(15) ? fake()->numberBetween(2_000, 18_000) : 0,
            'other_cost' => fake()->numberBetween(0, 600),
            'driver_name' => fake()->name(),
            'source' => UnitPeriod::SOURCE_DEMO,
        ];
    }

    /** Periodo sin cortes: la unidad estuvo toda la semana fuera de circulación. */
    public function offRoad(): static
    {
        return $this->state(fn (): array => [
            'km_driven' => 0,
            'days_in_service' => 0,
            'days_in_shop' => 7,
            'gross_income' => 0,
            'collected_income' => 0,
            'maintenance_cost' => fake()->numberBetween(4_000, 22_000),
        ]);
    }

    /** Periodo con mora: parte del ingreso quedó sin cobrar. */
    public function withArrears(): static
    {
        return $this->state(fn (array $attributes): array => [
            'collected_income' => (int) round(($attributes['gross_income'] ?? 4_000) * 0.45),
        ]);
    }
}
