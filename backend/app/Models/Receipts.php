<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Receipts extends Model
{
    use HasFactory;
    public $timestamps = false;
    protected $table = 'receipts';
    protected $fillable = [
        'total_price',
        'discount',
        'TVA',
        'pay',
        'owes'
    ];
}
