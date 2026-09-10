<?php

namespace Database\Factories;

use App\Models\CorporateLead;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<CorporateLead>
 */
class CorporateLeadFactory extends Factory
{
    protected $model = CorporateLead::class;

    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'reference' => 'VF-COR-'.fake()->unique()->bothify('#####'),
            'company' => fake()->company(),
            'contact_name' => fake()->name(),
            'email' => fake()->unique()->companyEmail(),
            'phone' => fake()->numerify('##########'),
            'service_type' => fake()->randomElement([
                'Transporte corporativo',
                'Traslado ejecutivo',
                'Gestión integral de flota',
                'Grupos y eventos',
            ]),
            'units' => fake()->numberBetween(1, 20),
            'city' => fake()->randomElement([
                'Ciudad de México',
                'Guadalajara, Jalisco',
                'Monterrey, Nuevo León',
                'Querétaro, Querétaro',
            ]),
            'message' => fake()->optional()->sentence(),
            'status' => 'nuevo',
        ];
    }
}
