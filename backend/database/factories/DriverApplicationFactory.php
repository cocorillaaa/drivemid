<?php

namespace Database\Factories;

use App\Models\DriverApplication;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<DriverApplication>
 */
class DriverApplicationFactory extends Factory
{
    protected $model = DriverApplication::class;

    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'reference' => 'VF-CON-'.fake()->unique()->bothify('#####'),
            'full_name' => fake()->name(),
            'email' => fake()->unique()->safeEmail(),
            'phone' => fake()->numerify('##########'),
            'city' => fake()->randomElement([
                'Ciudad de México',
                'Guadalajara, Jalisco',
                'Monterrey, Nuevo León',
                'Puebla, Puebla',
            ]),
            'license_number' => fake()->bothify('????#############'),
            'experience_years' => fake()->numberBetween(0, 25),
            'vehicle_owned' => fake()->boolean(),
            'message' => fake()->optional()->sentence(),
            'status' => 'recibida',
        ];
    }
}
