<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class StoreDebts extends Model
{
    use HasFactory;
    public $timestamps = false;
    protected $table='store_debts';
    protected $fillable = [
        'lender',
        'date',
        'amount',   
    ];
    public function payments(){
        return $this->hasMany(StoreDebtsPay::class,'debt_id');
    }
}
