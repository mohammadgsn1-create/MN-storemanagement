<?php

namespace App\Http\Controllers;

use App\Models\Returns;
use Illuminate\Http\Request;

class returnsController extends Controller
{
    function createReturn(Request $req){
        $invoice_id=$req->invoice_id;
        $customer_id=$req->customer_id;
        $sn_b=$req->serial_number;
        $item_name=$req->item_name;
        $date=\Carbon\Carbon::parse($req->date)->format('Y-m-d');
        $total_price=$req->total_price;
        $pay_type=$req->pay_type;
        $quantity=$req->quantity;
        if(!$invoice_id||!$customer_id||is_null($sn_b)||!$item_name||!$total_price||!$pay_type||!$date||is_null($quantity)){
            return response()->json(['message'=>'Please fill all the fields('.$invoice_id.",".$customer_id.",".$sn_b.",".$item_name.",".$total_price.",".$pay_type.",".$date.",".$quantity.".)",'accept'=>false]);
        }
        else{
            Returns::create([
                'invoice_id'=>$invoice_id,
                'customer_id'=>$customer_id,
                'i_name'=>$item_name,
                'total_price'=>$total_price,
                'pay_type'=>$pay_type,
                'date'=>$date,
                'serial_number'=>$sn_b,
                'quantity'=>$quantity
            ]);
            return response()->json(['message'=>'InvoiceCustomerItem created successfully','accept'=>true]);
        }
    }
}
