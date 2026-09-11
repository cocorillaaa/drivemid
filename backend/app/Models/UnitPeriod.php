<?php

namespace App\Models;

use Database\Factories\UnitPeriodFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Corte semanal de una unidad: kilometraje, disponibilidad, ingreso y costos.
 *
 * Es la única fuente de histórico del sistema y de aquí salen todos los
 * indicadores de rendimiento. El ingreso se guarda descompuesto en cobrado y
 * total, de modo que la mora del periodo se obtiene por diferencia.
 */
class UnitPeriod extends Model
{
    /** @use HasFactory<UnitPeriodFactory> */
    use HasFactory;

    /** Origen del corte. Sólo `demo` es dato de ejemplo. */
    public const SOURCE_DEMO = 'demo';

    /** @var list<string> */
    protected $fillable = [
        'vehicle_id',
        'week_start',
        'km_driven',
        'days_in_service',
        'days_in_shop',
        'gross_income',
        'collected_income',
        'maintenance_cost',
        'fuel_cost',
        'incident_cost',
        'other_cost',
        'driver_name',
        'source',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'week_start' => 'date',
            'km_driven' => 'integer',
            'days_in_service' => 'integer',
            'days_in_shop' => 'integer',
            'gross_income' => 'integer',
            'collected_income' => 'integer',
            'maintenance_cost' => 'integer',
            'fuel_cost' => 'integer',
            'incident_cost' => 'integer',
            'other_cost' => 'integer',
        ];
    }

    /**
     * @return BelongsTo<Vehicle, $this>
     */
    public function vehicle(): BelongsTo
    {
        return $this->belongsTo(Vehicle::class);
    }

    /** Días del periodo en que la unidad estuvo fuera de circulación. */
    public function daysOffRoad(): int
    {
        return max(0, 7 - $this->days_in_service);
    }

    /** Ingreso del periodo que no se cobró. */
    public function outstandingAmount(): int
    {
        return max(0, $this->gross_income - $this->collected_income);
    }

    /** Días del periodo en que la unidad estuvo disponible para operar. */
    public function availableDays(): int
    {
        return max(0, $this->days_in_service + $this->days_in_shop);
    }

    /** Costos directos registrados en el periodo. */
    public function directCosts(): int
    {
        return $this->maintenance_cost
            + $this->fuel_cost
            + $this->incident_cost
            + $this->other_cost;
    }
}
