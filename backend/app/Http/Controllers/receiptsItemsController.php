<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\ReceiptItems;
class receiptsItemsController extends Controller
{
    function getAllReceiptsItems(Request $req){
        $receiptsItems=ReceiptItems::with(['item.brand','receipt'])->get();
        if(!$receiptsItems){
            return response()->json(['message'=>'No receipts items found']);
        }
        else{
            return response()->json($receiptsItems);
        }
    }
    function getReceiptsItems(Request $req){
        $receipts_id=$req->receipts_id;
        if(!$receipts_id){
            return response()->json(['message'=>'Please provide receipts_id']);
        }
        else{
            $receiptsItems=ReceiptItems::where('receipts_id',$receipts_id)->get();
            if(!$receiptsItems){
                return response()->json(['message'=>'No receipts items found']);
            }
            else{
                return response()->json($receiptsItems);
            }
        }
    }
    function createReceiptsItems(Request $req){
        $receipts_id=$req->receipts_id;
        $item_id=$req->item_id;
        $item_name=$req->item_name;
        $date=$req->date;
        $quantity=$req->quantity;
        $discount=$req->discount;
        $sub_total=$req->sub_total;
        $price=$req->price;
        if(is_null($receipts_id)||is_null($item_name)||is_null($quantity)||is_null($discount)||is_null($date)||is_null($item_id)||is_null($sub_total)){
            return response()->json(['message'=>'Please fill all the fields']);
        }
        else{
            ReceiptItems::create([
                'receipt_id'=>$receipts_id,
                'item_id'=>$item_id,
                'i_name'=>$item_name,
                'date'=>$date,
                'discount'=>$discount,
                'quantity'=>$quantity,
                'subtotal'=>$sub_total,
                'price'=>$price
            ]);
            return response()->json(['message'=>'Receipts item created successfully']);
        }
    }
}
