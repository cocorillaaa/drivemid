<?php

namespace Database\Factories;

use App\Models\InvestorLead;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<InvestorLead>
 */
class InvestorLeadFactory extends Factory
{
    protected $model = InvestorLead::class;

    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'reference' => 'DL-INV-'.fake()->unique()->bothify('#####'),
            'full_name' => fake()->name(),
            'email' => fake()->unique()->safeEmail(),
            'phone' => fake()->numerify('##########'),
            'city' => fake()->randomElement([
                'Mérida, Yucatán',
                'Progreso, Yucatán',
                'Valladolid, Yucatán',
                'Ciudad de México',
            ]),
            'capital_range' => fake()->randomElement([
                'Una unidad',
                'Dos a cuatro unidades',
                'Cinco unidades o más',
                'Por definir',
            ]),
            'message' => fake()->optional()->sentence(),
            'status' => 'nuevo',
        ];
    }
}
