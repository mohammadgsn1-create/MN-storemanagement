<?php

namespace App\Http\Controllers;

use App\Models\Payments;
use Illuminate\Http\Request;
class paymentsController extends Controller
{
    function getPayments(Request $req){
     $payments=Payments::get();
     return response()->json($payments);
    }
    function createPayments(Request $req){
        $rawDate = $req->input('date'); // أو $req->date
        $Date = $rawDate ? \Carbon\Carbon::parse($rawDate)->format('Y-m-d') : null;
        $payments_des=$req->payments_des;
        $amount=$req->amount;
        if(is_null($Date)||is_null($payments_des)||is_null($amount)){
            response()->json(["message"=>"Please fill all the fields [".$Date.",".$payments_des.",".$amount."]"]);
        }
        $payments=Payments::create([
           "Date"=>$Date,
           "payment_des"=>$payments_des,
           "amount"=>$amount
        ]);
     response()->json(["message"=>"Payment created successfully","data"=>$payments]);
    }
}
