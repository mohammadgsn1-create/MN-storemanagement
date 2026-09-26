<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class BrandSalesMan extends Model
{
    use HasFactory;
     public $timestamps = false;
    protected $table = 'brands_sales_man';
    protected $fillable = [
        'brand_id',
        'sales_man_id',
    ]; 
    function brand()
    {
        return $this->belongsTo(Brand::class);
    }
    function salesMan()
    {
        return $this->belongsTo(SalesMan::class);
    }
}
