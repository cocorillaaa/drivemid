<?php

namespace App\Policies;

use App\Models\User;
use App\Models\Vehicle;

/**
 * Reglas de acceso a las unidades de la flota.
 *
 * Un **Superusuario** opera sobre toda la flota; un **Administrador de Unidad**
 * sólo sobre la unidad que tiene asignada (`users.vehicle_id`).
 */
class VehiclePolicy
{
    /** El listado se permite a ambos roles; el controlador lo acota por rol. */
    public function viewAny(User $user): bool
    {
        return true;
    }

    /** Sólo el Superusuario o el administrador de esa misma unidad. */
    public function view(User $user, Vehicle $vehicle): bool
    {
        return $user->isSuperuser() || $user->vehicle_id === $vehicle->id;
    }

    /** Actualizar telemetría (km semanales y teléfono de contacto). */
    public function updateTelemetry(User $user, Vehicle $vehicle): bool
    {
        return $user->isSuperuser() || $user->vehicle_id === $vehicle->id;
    }

    /** Las métricas globales son exclusivas de la vista de Superusuario. */
    public function viewFleetSummary(User $user): bool
    {
        return $user->isSuperuser();
    }
}
