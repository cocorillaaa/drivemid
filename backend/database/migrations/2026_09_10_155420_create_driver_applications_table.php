<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Postulaciones de conductores captadas en la landing pública.
     */
    public function up(): void
    {
        Schema::create('driver_applications', function (Blueprint $table) {
            $table->id();
            $table->string('reference', 24)->unique();
            $table->string('full_name', 120);
            $table->string('email', 160);
            $table->string('phone', 10);
            $table->string('city', 100)->index();
            $table->string('license_number', 40);
            $table->unsignedTinyInteger('experience_years');
            $table->boolean('vehicle_owned')->default(false);
            $table->text('message')->nullable();
            $table->enum('status', ['recibida', 'en_revision', 'entrevista', 'rechazada', 'contratada'])
                ->default('recibida');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('driver_applications');
    }
};
