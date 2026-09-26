<?php

namespace App\Http\Controllers;

use App\Models\StoreDebts;
use Illuminate\Http\Request;

class storeDebtsController extends Controller
{
    function getAlldebts(){
        $debts=StoreDebts::with('payments')->get();
        return response()->json($debts);
    }
    function createDebts(Request $req){
        $lender=$req->lender;
        $date=\Carbon\Carbon::parse($req->date)->format('Y-m-d');
        $amount=$req->amount;
        
        if(is_null($lender)||is_null($date)||is_null($amount)){
            return response()->json(['message'=>'please fill all the field ['.$lender.','.$date.','.$amount.']','accept'=>false]);
        }
        else{
            StoreDebts::create([
                'lender'=>$lender,
                'date'=>$date,
                'amount'=>$amount,
            ]);
            return response()->json(['message'=>'Debt create successfully','accept'=>true]);
        }

    }
}
