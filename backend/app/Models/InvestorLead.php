<?php

namespace App\Models;

use Database\Factories\InvestorLeadFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

/**
 * Interesado en participar en el programa de inversión, captado en el sitio
 * público. No es un cliente de servicio: es un prospecto de capital.
 */
class InvestorLead extends Model
{
    /** @use HasFactory<InvestorLeadFactory> */
    use HasFactory;

    /** @var list<string> */
    protected $fillable = [
        'reference',
        'full_name',
        'email',
        'phone',
        'city',
        'capital_range',
        'message',
        'status',
    ];
}
