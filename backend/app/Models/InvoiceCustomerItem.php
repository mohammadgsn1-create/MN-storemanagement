<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class InvoiceCustomerItem extends Model
{
    use HasFactory;
    public $timestamps = false;
    protected $table = 'invoices_customers_items';
    protected $fillable = [
        'invoice_id',
        'customer_id',
        
        'i_name',
        'date',
        'total_price',
        'services',
        'quantity',
        'serial_number',
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
