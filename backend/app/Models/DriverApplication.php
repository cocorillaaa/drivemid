<?php

namespace App\Models;

use Database\Factories\DriverApplicationFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

/**
 * Postulación de conductor captada en la landing pública.
 */
class DriverApplication extends Model
{
    /** @use HasFactory<DriverApplicationFactory> */
    use HasFactory;

    /** @var list<string> */
    protected $fillable = [
        'reference',
        'full_name',
        'email',
        'phone',
        'city',
        'license_number',
        'experience_years',
        'vehicle_owned',
        'message',
        'status',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'experience_years' => 'integer',
            'vehicle_owned' => 'boolean',
        ];
    }
}
