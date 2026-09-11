<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Prospectos de inversión captados en el sitio público.
     */
    public function up(): void
    {
        Schema::create('investor_leads', function (Blueprint $table) {
            $table->id();
            $table->string('reference', 24)->unique();
            $table->string('full_name', 120);
            $table->string('email', 160);
            $table->string('phone', 10);
            $table->string('city', 100)->index();
            $table->string('capital_range', 80)->index();
            $table->text('message')->nullable();
            $table->enum('status', ['nuevo', 'contactado', 'propuesta', 'cerrado'])->default('nuevo');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('investor_leads');
    }
};
