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
        Schema::table('sales_man',function(Blueprint $table){
            $table->dropColumn(['first_name','last_name','username','password']);
            $table->string('name')->after('id');

        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
       
         Schema::table('sales_man',function(Blueprint $table){
            $table->dropColumn(['name']);
            $table->dropColumn(['first_name','last_name','username','password']);
            $table->string('first_name');
            $table->string('last_name');
            $table->string('username');
            $table->string('password');
        });

    }
};
