<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Incorpora los datos de perfil operativo a la tabla de usuarios.
     *
     * - `role`: distingue al Superusuario (vista global) del Administrador de
     *   Unidad (una sola unidad asignada).
     * - `vehicle_id`: unidad asignada; es la clave de la autorización, ya que
     *   un Administrador de Unidad sólo puede operar sobre su propia unidad.
     */
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->enum('role', ['superuser', 'unit_admin'])->default('unit_admin')->after('email');
            $table->string('vehicle_id', 40)->nullable()->after('role');
            $table->string('job_title', 120)->nullable()->after('vehicle_id');
            $table->string('phone', 10)->nullable()->after('job_title');

            $table->foreign('vehicle_id')
                ->references('id')
                ->on('vehicles')
                ->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropForeign(['vehicle_id']);
            $table->dropColumn(['role', 'vehicle_id', 'job_title', 'phone']);
        });
    }
};
