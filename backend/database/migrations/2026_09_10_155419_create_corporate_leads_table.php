<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Solicitudes de servicio corporativo captadas en la landing pública.
     */
    public function up(): void
    {
        Schema::create('corporate_leads', function (Blueprint $table) {
            $table->id();
            $table->string('reference', 24)->unique();
            $table->string('company', 160);
            $table->string('contact_name', 120);
            $table->string('email', 160);
            $table->string('phone', 10);
            $table->string('service_type', 80)->index();
            $table->unsignedTinyInteger('units');
            $table->string('city', 100)->index();
            $table->text('message')->nullable();
            $table->enum('status', ['nuevo', 'contactado', 'propuesta', 'cerrado'])->default('nuevo');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('corporate_leads');
    }
};
