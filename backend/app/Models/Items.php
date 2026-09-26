<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Items extends Model
{
    use HasFactory;
    public $timestamps = false;
    protected $table = "items";
    protected $fillable = [
        'serial_number',
        'barcode',
        'name',
        'type',
        'color',
        'price',
        'height',
        'width',
        'depth',
        'brand_id',
        'Origin',
        'TVA',
        'discount'
    ];
public function brand()
    {
        return $this->belongsTo(Brand::class);
    }
public function invoices(){
    return $this->hasMany(InvoiceCustomerItem::class,'serial_number','serial_number');
}
public function receipt(){
    return $this->hasOne(ReceiptItems::class,'item_id');
}
  
}
