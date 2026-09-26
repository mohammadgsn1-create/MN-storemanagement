<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Returns extends Model
{
    use HasFactory;
    public $table= "returns";
    public $timestamps = false;
    
    protected $fillable = [
        'invoice_id',
        'customer_id',
        'serial_number',
        'i_name',
        'date',
        'total_price',
        'pay_type',
        'quantity'
    ];
    function invoice()
    {
        return $this->belongsTo(Invoices::class);
    }
    function customer()
    {
        return $this->belongsTo(Customers::class);
    }
    function item()
    {
        return $this->belongsTo(Items::class, 'serial_number','serial_number');
    }
}
