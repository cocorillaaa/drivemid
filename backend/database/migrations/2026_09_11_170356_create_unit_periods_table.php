<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Corte semanal por unidad: la única fuente de histórico del sistema.
     *
     * Los indicadores que pide el estudio del cliente —utilización, ingreso
     * bruto y neto por día, flujo neto, costo de mantenimiento por km,
     * kilometraje mensual, días fuera de servicio, mora y rotación de
     * conductores— se derivan de esta tabla. Sin ella sólo habría una foto
     * del estado actual y ningún indicador sería calculable.
     *
     * El ingreso del periodo se descompone en lo cobrado y lo que quedó
     * pendiente: la mora es la diferencia, no un campo aparte.
     */
    public function up(): void
    {
        Schema::create('unit_periods', function (Blueprint $table) {
            $table->id();

            $table->string('vehicle_id', 40);
            $table->foreign('vehicle_id')->references('id')->on('vehicles')->cascadeOnDelete();

            // Lunes de la semana del corte.
            $table->date('week_start')->index();

            // Operación de la semana.
            $table->unsignedInteger('km_driven');
            $table->unsignedTinyInteger('days_in_service');
            $table->unsignedTinyInteger('days_in_shop');

            // Ingreso y cobranza.
            $table->unsignedInteger('gross_income');
            $table->unsignedInteger('collected_income');

            // Costos directos del periodo (los fijos se prorratean en el cálculo).
            $table->unsignedInteger('maintenance_cost')->default(0);
            $table->unsignedInteger('fuel_cost')->default(0);
            $table->unsignedInteger('incident_cost')->default(0);
            $table->unsignedInteger('other_cost')->default(0);

            // Rotación: quién condujo la unidad y si el periodo cerró con mora.
            $table->string('driver_name', 120)->nullable();

            /*
             * Procedencia del corte. Sólo los periodos capturados o importados
             * cuentan como dato real; los sembrados para la demostración se
             * marcan y la interfaz lo advierte.
             */
            $table->enum('source', ['capturado', 'importado', 'demo'])->default('capturado');

            $table->timestamps();

            $table->unique(['vehicle_id', 'week_start']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('unit_periods');
    }
};
