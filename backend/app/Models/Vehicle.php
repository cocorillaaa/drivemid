<?php

namespace App\Models;

use Database\Factories\VehicleFactory;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

/**
 * Unidad de la flota ejecutiva.
 *
 * El identificador es el código interno (`unit-01`, `unit-02`, …) y no es
 * autoincremental, para mantener paridad con el dataset mock del frontend.
 */
class Vehicle extends Model
{
    /** @use HasFactory<VehicleFactory> */
    use HasFactory;

    /** Días de anticipación con los que se marca una póliza "por vencer". */
    public const POLICY_WARNING_DAYS = 60;

    /** Códigos de estatus operativo válidos. */
    public const STATUSES = ['en_servicio', 'disponible', 'mantenimiento'];

    protected $primaryKey = 'id';

    public $incrementing = false;

    protected $keyType = 'string';

    /** @var list<string> */
    protected $guarded = [];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'year' => 'integer',
            'capacity' => 'integer',
            'odometer_km' => 'integer',
            'weekly_km' => 'integer',
            'weekly_km_by_day' => 'array',
            'fuel_level' => 'integer',
            'last_service_km' => 'integer',
            'next_service_km' => 'integer',
            'driver_rating' => 'decimal:1',
            'driver_assigned_since' => 'date',
            'policy_valid_from' => 'date',
            'policy_valid_to' => 'date',
            'location_lat' => 'decimal:7',
            'location_lng' => 'decimal:7',
            'location_updated_at' => 'datetime',
            'speed_kmh' => 'integer',
        ];
    }

    /** Días restantes de vigencia de la póliza (negativo si ya venció). */
    public function daysToPolicyExpiry(): int
    {
        return (int) today()->diffInDays($this->policy_valid_to, absolute: false);
    }

    /** Estatus derivado de la póliza: `vigente`, `por_vencer` o `vencida`. */
    public function policyStatus(): string
    {
        $days = $this->daysToPolicyExpiry();

        return match (true) {
            $days < 0 => 'vencida',
            $days <= self::POLICY_WARNING_DAYS => 'por_vencer',
            default => 'vigente',
        };
    }

    /**
     * Unidades con póliza vencida o próxima a vencer.
     *
     * @param  Builder<Vehicle>  $query
     */
    public function scopeWithPolicyAlert(Builder $query): void
    {
        $query->whereDate('policy_valid_to', '<=', today()->addDays(self::POLICY_WARNING_DAYS));
    }

    /**
     * Unidades operativas (excluye las que están en mantenimiento).
     *
     * @param  Builder<Vehicle>  $query
     */
    public function scopeActive(Builder $query): void
    {
        $query->where('status', '!=', 'mantenimiento');
    }
}
