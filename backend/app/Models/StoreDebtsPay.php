<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class StoreDebtsPay extends Model
{
    use HasFactory;
    public $timestamps = false;
    protected $table='store_debts_pay';
    protected $fillable = ['debt_id','date','paid'];
    public function storeDebt(){
        return $this->belongsTo(StoreDebts::class);
    }
    
}
