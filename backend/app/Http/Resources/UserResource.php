<?php

namespace App\Http\Resources;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * Perfil del usuario autenticado que consume el frontend.
 *
 * @mixin User
 */
class UserResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'email' => $this->email,
            'role' => $this->role,
            'role_label' => $this->isSuperuser()
                ? 'Superusuario · Vista global'
                : 'Administrador de Unidad · Vista individual',
            'job_title' => $this->job_title,
            'phone' => $this->phone,
            'initials' => $this->initials(),
            'vehicle_id' => $this->vehicle_id,
            'vehicle' => $this->whenLoaded('vehicle', fn () => [
                'id' => $this->vehicle->id,
                'unit_code' => $this->vehicle->unit_code,
                'plates' => $this->vehicle->plates,
                'make' => $this->vehicle->make,
                'model' => $this->vehicle->model,
            ]),
            'permissions' => [
                'view_global_fleet' => $this->isSuperuser(),
                'view_all_units' => $this->isSuperuser(),
                'manage_policies' => $this->isSuperuser(),
                'update_assigned_unit' => true,
            ],
        ];
    }
}
