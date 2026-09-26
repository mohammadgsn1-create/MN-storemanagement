<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Payments extends Model
{
    use HasFactory;
    public $timestamps = false;
    protected $table ="payments";
    protected $fillable = ["Date","payment_des","amount"];
}
