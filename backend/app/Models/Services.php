<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class services extends Model
{
    use HasFactory;
    public $timestamps = false;
    protected $table = 'services';
    protected $fillable = [
        'service_name',
        'customer_phone_number',
        'fee',
        'material_cost',
        'date',
        'note'
    ];
}
