<?php

namespace App\Models;

use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

/**
 * Usuario de la plataforma.
 *
 * Existen dos roles con alcances distintos:
 *
 * - `superuser`   → vista global de la flota.
 * - `unit_admin`  → una única unidad asignada (`vehicle_id`), que es la que
 *                   determina qué registros puede consultar y modificar.
 */
#[Fillable(['name', 'email', 'password', 'role', 'vehicle_id', 'job_title', 'phone'])]
#[Hidden(['password', 'remember_token'])]
class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
    use HasApiTokens, HasFactory, Notifiable;

    public const ROLE_SUPERUSER = 'superuser';

    public const ROLE_UNIT_ADMIN = 'unit_admin';

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    /** Unidad asignada al usuario (sólo para el rol Administrador de Unidad). */
    public function vehicle(): BelongsTo
    {
        return $this->belongsTo(Vehicle::class, 'vehicle_id');
    }

    /** `true` cuando el usuario administra la flota completa. */
    public function isSuperuser(): bool
    {
        return $this->role === self::ROLE_SUPERUSER;
    }

    /** `true` cuando el usuario sólo administra su unidad asignada. */
    public function isUnitAdmin(): bool
    {
        return $this->role === self::ROLE_UNIT_ADMIN;
    }

    /** Iniciales del nombre, para mostrar en la interfaz. */
    public function initials(): string
    {
        return collect(explode(' ', $this->name))
            ->filter()
            ->take(2)
            ->map(fn (string $part): string => mb_strtoupper(mb_substr($part, 0, 1)))
            ->implode('');
    }
}
