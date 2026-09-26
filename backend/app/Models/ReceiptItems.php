<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ReceiptItems extends Model
{
    use HasFactory;
    public $timestamps = false;
    protected $table = 'receipt_items';
    protected $fillable = [
        'receipt_id',
        'item_id',
        'i_name',
        'date',
        'quantity',
        'discount',
        'subtotal',
        'price'
        
    ];
  public  function item(){
    return $this->belongsTo(Items::class);
  }
  public function receipt(){
    return $this->belongsTo(Receipts::class);
  }
}
