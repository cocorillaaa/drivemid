<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Condiciones económicas pactadas por unidad.
     *
     * El estudio del cliente propone «renta semanal fija contra estructura
     * variable»: aquí viven los importes fijos del contrato y el capital
     * invertido; los importes que cambian cada semana se registran como
     * movimientos, en `unit_periods`.
     */
    public function up(): void
    {
        Schema::table('vehicles', function (Blueprint $table) {
            // Capital invertido en la unidad: vehículo, adecuación, equipo y reserva.
            $table->unsignedInteger('capital_invested')->default(0)->after('status');

            // Condiciones de la operación.
            $table->unsignedInteger('weekly_fee')->default(0)->after('capital_invested');
            $table->unsignedInteger('maintenance_reserve')->default(0)->after('weekly_fee');
            $table->unsignedInteger('security_deposit')->default(0)->after('maintenance_reserve');

            // Costos fijos mensuales que absorbe la operación.
            $table->unsignedInteger('monthly_insurance_cost')->default(0)->after('security_deposit');
            $table->unsignedInteger('monthly_tracking_cost')->default(0)->after('monthly_insurance_cost');
            $table->unsignedInteger('monthly_admin_cost')->default(0)->after('monthly_tracking_cost');

            // Alta del activo en el programa: ancla la antigüedad y la depreciación.
            $table->date('acquired_on')->nullable()->after('weekly_km_by_day');

            // De dónde salieron estas cifras: si son ejemplo, la interfaz lo dice.
            $table->boolean('financials_are_demo')->default(true)->after('acquired_on');
        });
    }

    public function down(): void
    {
        Schema::table('vehicles', function (Blueprint $table) {
            $table->dropColumn([
                'capital_invested',
                'weekly_fee',
                'maintenance_reserve',
                'security_deposit',
                'monthly_insurance_cost',
                'monthly_tracking_cost',
                'monthly_admin_cost',
                'acquired_on',
                'financials_are_demo',
            ]);
        });
    }
};
