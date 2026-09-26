<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Invoices;
class InvoicesController extends Controller
{
    function getInvoices(Request $req){
        $invoices = Invoices::all();
        return response()->json($invoices);
    }
    function getProfit(Request $req){
        $invoices=Invoices::where('owes',0)->get();
        if(is_null($invoices)){
          return  response()->json(["message"=>"Invoices not found"]);
        }
        return $invoices;
    }
    function createInvoice(Request $req){
        $total_price=$req->total_price;
        $paid=$req->paid;
        $owes=$req->owes;
        $type=$req->type;
        if(!$total_price||is_null($paid)||is_null($owes)||!$type){
            return response()->json(['message'=>'Please fill all the fields'.$total_price.",".$paid.",".$owes.",".$type,'exit'=>true]);
        }
        else{
           $invoice_item= Invoices::create([
                'type'=>$type,
                'total_price'=>$total_price,
                'paid'=>$paid,
                'owes'=>$owes
            ]);
            return response()->json(['message'=>'Invoice created successfully','invoice_item'=>$invoice_item]);
        }
    }
}
