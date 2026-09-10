<?php

namespace App\Models;

use Database\Factories\CorporateLeadFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

/**
 * Solicitud de servicio corporativo captada en la landing pública.
 */
class CorporateLead extends Model
{
    /** @use HasFactory<CorporateLeadFactory> */
    use HasFactory;

    /** @var list<string> */
    protected $fillable = [
        'reference',
        'company',
        'contact_name',
        'email',
        'phone',
        'service_type',
        'units',
        'city',
        'message',
        'status',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'units' => 'integer',
        ];
    }
}
