<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\StoredIn;
class StoredInController extends Controller
{
    function getStoredInItems(Request $req){
        $items = StoredIn::with(['item.invoices'])->get();
        return response()->json($items);
    }
    function createStoredInItem(Request $req){
        $s_nb=$req->serial_number;
        $location=$req->location;
        $amount=$req->amount;
        $name=$req->name;
        $min_stock=$req->min_stock;
        if(!$s_nb||!$location||!$amount||!$name){
            return response()->json(['message'=>'Please fill all the fields'.$s_nb.','.$location.','.$amount.','.$name]);
        }
        else{
            StoredIn::create([
                'serial_number'=>$s_nb,
                'location'=>$location,
                'amount'=>$amount,
                'name'=>$name,
                'min_stock'=>$min_stock
            ]);
            return response()->json(['message'=>'StoredIn item created successfully']);
        }
    }
    function getStoredIn(Request $req){
        $serial_number=$req->serial_number;
      
        $warehouse=StoredIn::where('serial_number',$serial_number)->first();
        if(is_null($warehouse)){
            return response()->json(['message'=>'warehouse not exist',"exist"=>false]);
        }
        else{
            return response()->json($warehouse);
        }
    }
    function updateStoredInItem(Request $req){
        $s_nb=$req->serial_number;
        $item=StoredIn::where('serial_number',$s_nb)->first();
        if($req->filled('amount')){
            $item->increment('amount',$req->amount);
        }
        $allowed_fields=['location','name','min_stock'];
        $dataToUpdate=array_filter($req->only($allowed_fields));
        $id=$item->id;
        //$item=StoredIn::find($id);
        if(!$item){
            return response()->json(['message'=>'StoredIn item not found']);
        }
        else{
            if(empty($dataToUpdate)){
                return response()->json(['message'=>'No valid fields to update']);
            }
            $item->update($dataToUpdate);
            return response()->json(['message'=>'StoredIn item updated successfully']);
        }
    }
   function updateStoredInItemAmount(Request $req){
        $s_nb=$req->serial_number;
        $item=StoredIn::where('serial_number',$s_nb)->first();
        $allowed_fields=['amount'];
        $dataToUpdate=array_filter($req->only($allowed_fields));
        $id=$item->id;
        $item=StoredIn::find($id);
        if(!$item){
            return response()->json(['message'=>'StoredIn item not found']);
        }
        else{
            if(empty($dataToUpdate)){
                return response()->json(['message'=>'No valid fields to update']);
            }
            $item->update($dataToUpdate);
            return response()->json(['message'=>'StoredIn item amount updated successfully']);
        }
    }
    function getWarehouseItems(Request $req){
        $serial_number=$req->serial_number;
        if(!$serial_number){
            return response()->json(['message'=>'Please provide serial_number']);
        }
        else{
            $items=StoredIn::where('serial_number',$serial_number)->get();
            if(!$items){
                return response()->json(['message'=>'No items found with this serial_number']);
            }
            else{
                return response()->json($items);
            }
        }
    }
}
