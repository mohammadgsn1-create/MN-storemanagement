<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SalesMan extends Model
{
    use HasFactory;
    public $timestamps = false;
    protected $table = 'sales_man';
    protected $fillable = [
        'name',
        'phone_number',
        'works_in'
    ];
    function brand(){
        return $this->belongsTo(Brand::class,'works_in');
    }
}
