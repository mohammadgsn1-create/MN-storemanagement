<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Brand extends Model
{
    use HasFactory;
     public $timestamps = false;
    protected $table = "brands";
    protected $fillable = [
        'name',
        'location',
        'v_of_Items',
        'email',
        'phone_number',
        'registration_no'
    ];
    public function items()
    {
        return $this->hasMany(Items::class);
    }
    public function salesMan(){
        return $this->hasMany(SalesMan::class,'works_in');
    }

}
