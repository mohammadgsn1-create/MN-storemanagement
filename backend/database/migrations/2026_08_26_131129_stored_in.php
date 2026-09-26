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
        Schema::create('stored_in', function (Blueprint $table) {
            $table->id();
            $table->integer("serial_number");
            $table->foreign("serial_number")->references("serial_number")->on("items")->cascadeOnDelete();
            $table->string('location');
            $table->integer("amount");
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        //
    }
};
