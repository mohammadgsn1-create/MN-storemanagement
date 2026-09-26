<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('items', function (Blueprint $table) {
            $table->id();
            $table->integer('serial_number')->unique();
            $table->integer('Barcode');
            $table->string('name');
            $table->string('type');
            $table->string('color');
            $table->decimal('price', 5, 2);
            $table->integer('height');
            $table->integer('width');
            $table->foreignId('brand_id')->constrained('brands')->cascadeOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        
    }
};
