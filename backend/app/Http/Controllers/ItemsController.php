<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Items;
use Illuminate\Support\Facades\Validator;
class ItemsController extends Controller
{
    function getItems(Request $req){
        $items = Items::all();
        return response()->json($items);
    }
    function createItem(Request $req){
       $validator = Validator::make($req->all(), [
        'serial_number' => 'required',
        'barcode'       => 'required',
        'name'          => 'required',
        'type'          => 'required',
        'color'         => 'required',
        'height'        => 'required',
        'width'         => 'required',
        'depth'         => 'required',
        'price'         => 'required|numeric',
        'brand_id'      => 'required',
        'Origin'        => 'required',
        'TVA'           => 'required',
        'discount'      => 'required'
    ]);

    if ($validator->fails()) {
        return response()->json([
            'message' => 'Please fill all the fields correctly',
            'errors'  => $validator->errors()
        ], 400);
    }

    // إنشاء العنصر باستخدام البيانات المحققة
    Items::create([
        'serial_number' => $req->input('serial_number'),
        'name'          => $req->input('name'),
        'type'          => $req->input('type'),
        'color'         => $req->input('color'),
        'height'        => $req->input('height'),
        'width'         => $req->input('width'),
        'depth'         => $req->input('depth'),
        'price'         => floatval($req->input('price')), // ضمان تحويله إلى رقم
        'brand_id'      => $req->input('brand_id'),
        'barcode'       => $req->input('barcode'),
        'Origin'        => $req->input('Origin'),
        'TVA'           => $req->input('TVA'),
        'discount'        => $req->input('discount')
    ]);

    return response()->json(['message' => 'Item created successfully'], 200);
    }
    function updateItem(Request $req){
        $s_nb=$req->serial_number;
        $item=Items::where('serial_number',$s_nb)->first();
        $allowed_fields=['name','type','color','height','width','depth','price','brand_id','barcode','Origin','TVA','discount'];
        $dataToUpdate=array_filter($req->only($allowed_fields));
        if(!$item){
            return response()->json(['message'=>'Item not found']);
        }
        else{
            if(empty($dataToUpdate)){
                return response()->json(['message'=>'No valid fields to update']);
            }
            $item->update($dataToUpdate);
            return response()->json(['message'=>'Item updated successfully']);
        }
    }
    function deleteItem(Request $req){
        $s_nb=$req->serial_number;
        $item=Items::where('serial_number',$s_nb)->first();
        if(!$item){
            return response()->json(['message'=>'Item not found']);
        }
        else{
            $item->delete();
            return response()->json(['message'=>'Item deleted successfully']);
        }
    }
    function getItemBySerialNumber(Request $req){
        $s_nb=$req->serial_number;
        if(!$s_nb){
            return response()->json(['message'=>'Please provide serial_number']);
        }
        else{
            $item=Items::where('serial_number',$s_nb)->first();
            if(!$item){
                return response()->json(['exist'=>false,'message'=>'Item not found'],);
            }
            else{
                return response()->json($item);
            }
        }
    }
    function getItemByBarcode(Request $req){
        $barcode=$req->barcode;
        if(!$barcode){
            return response()->json(['message'=>'Please provide barcode']);
        }
        else{
            $item=Items::where('barcode',$barcode)->first();
            if(!$item){
                return response()->json(['message'=>'Item not found']);
            }
            else{
                return response()->json($item);
            }
        }
    }
    function getItemById(Request $req){
        $id=$req->id;
        if(!$id){
            return response()->json(['message'=>'Please provide id']);
        }
        else{
            $item=Items::find($id);
            if(!$item){
                return response()->json(['message'=>'Item not found']);
            }
            else{
                return response()->json($item);
            }
        }
    }
    function getItemByBrandID(Request $req){
        $brand_id=$req->brand_id;
        if(!$brand_id){
            return response()->json(["message"=>"Attribute missing"]);
        }
        $items=Items::where('brand_id',$brand_id)->get();
        if(!$items){
              return response()->json(["message"=>"Brand not found"]);
        }
        else{
            return  response()->json($items);
        }
    }
}
