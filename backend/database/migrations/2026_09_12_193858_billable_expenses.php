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
      Schema::create('billable-expenses',function(Blueprint $table){
        $table->id();
        $table->date("Date");
        $table->string("payment_description");
        $table->bigInteger("amount");
        $table->unsignedBigInteger('brand_id');
        $table->unsignedBigInteger('customer_id');
        $table->foreign('brand_id')->references('id')->on('brands');;
        $table->foreign('customer_id')->references('id')->on('customers');;
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
