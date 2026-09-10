<?php

namespace Database\Factories;

use App\Models\User;
use App\Models\Vehicle;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

/**
 * @extends Factory<User>
 */
class UserFactory extends Factory
{
    protected static ?string $password;

    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'name' => fake()->name(),
            'email' => fake()->unique()->safeEmail(),
            'email_verified_at' => now(),
            'password' => static::$password ??= Hash::make('password'),
            'remember_token' => Str::random(10),
            'role' => User::ROLE_UNIT_ADMIN,
            'vehicle_id' => null,
            'job_title' => 'Administrador de Unidad',
            'phone' => fake()->numerify('##########'),
        ];
    }

    /** Usuario con vista global de la flota. */
    public function superuser(): static
    {
        return $this->state(fn (array $attributes): array => [
            'role' => User::ROLE_SUPERUSER,
            'vehicle_id' => null,
            'job_title' => 'Dirección de Operaciones',
        ]);
    }

    /** Administrador vinculado a una unidad concreta. */
    public function forVehicle(Vehicle $vehicle): static
    {
        return $this->state(fn (array $attributes): array => [
            'role' => User::ROLE_UNIT_ADMIN,
            'vehicle_id' => $vehicle->id,
        ]);
    }

    public function unverified(): static
    {
        return $this->state(fn (array $attributes): array => [
            'email_verified_at' => null,
        ]);
    }
}
