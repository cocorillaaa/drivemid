<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Unidades de la flota ejecutiva. El identificador es el código interno
     * de la unidad (por ejemplo `unit-01`) para mantener paridad con el
     * dataset mock del frontend Angular.
     */
    public function up(): void
    {
        Schema::create('vehicles', function (Blueprint $table) {
            $table->string('id', 40)->primary();
            $table->string('unit_code', 40)->index();
            $table->string('make', 60);
            $table->string('model', 80);
            $table->unsignedSmallInteger('year');
            $table->string('plates', 20)->unique();
            $table->string('vin', 32)->unique();
            $table->string('color', 40);
            $table->unsignedTinyInteger('capacity');
            $table->string('service_tier', 60);
            $table->enum('status', ['en_servicio', 'disponible', 'mantenimiento'])->default('disponible');

            $table->unsignedInteger('odometer_km');
            $table->unsignedInteger('weekly_km')->default(0);
            $table->json('weekly_km_by_day');
            $table->unsignedTinyInteger('fuel_level')->default(100);
            $table->unsignedInteger('last_service_km')->default(0);
            $table->unsignedInteger('next_service_km')->default(0);

            $table->string('driver_name', 120);
            $table->string('driver_phone', 10);
            $table->string('driver_email', 120);
            $table->string('driver_license', 40);
            $table->decimal('driver_rating', 2, 1)->default(5.0);
            $table->date('driver_assigned_since');

            $table->string('policy_provider', 80);
            $table->string('policy_number', 40)->index();
            $table->date('policy_valid_from');
            $table->date('policy_valid_to')->index();
            $table->string('policy_coverage', 160);

            $table->string('location_label', 120);
            $table->string('location_zone', 120);
            $table->decimal('location_lat', 10, 7);
            $table->decimal('location_lng', 10, 7);
            $table->dateTime('location_updated_at');
            $table->unsignedSmallInteger('speed_kmh')->default(0);
            $table->string('heading', 4)->default('N');

            /*
             * Enlace de seguimiento de la unidad. El rastreo del cliente se
             * consulta con un link por vehículo (no hay API), así que el
             * sistema guarda la liga y ofrece el acceso directo desde la ficha.
             */
            $table->string('tracking_url', 300)->nullable();

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('vehicles');
    }
};
