<?php

namespace App\Http\Controllers;

use App\Models\StoreDebtsPay;
use GuzzleHttp\Psr7\Response;
use Illuminate\Http\Request;
use Nette\Schema\Message;

class storeDeptsPaymentsController extends Controller
{
    function createDebtPayment(Request $req){
        $debt_id=$req->debt_id;
        $date=\Carbon\Carbon::parse($req->date)->format('Y-m-d');
        $paid=$req->paid;
        if(is_null($debt_id)||is_null($date)||is_null($paid)){
            return response()->json(['message'=>'please fill all the fields['.$debt_id.','.$date.','.$paid.']','accept'=>false]);
        }
        StoreDebtsPay::create([
            'debt_id'=>$debt_id,
            'date'=>$date,
            'paid'=>$paid
        ]);
        return response()->json(['message'=>'A payment has ben added successfully','accept'=>true]);

    }
}
