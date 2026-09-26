<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Brand;
class brandController extends Controller
{
    function getAllBrands(Request $req){
        $brands=Brand::with(["items.receipt","salesMan"])->get();
        if(!$brands){
            return response()->json(['message'=>'No brands found']);
        }
        else{
            return response()->json($brands);
        }
    }
    function getBrand(Request $req){
        $brand_id=$req->brand_id;
        
        if(!$brand_id){
            return response()->json(['message'=>'Please provide brand_id']);
        }
        else{
            $brand=Brand::find($brand_id);
            if(!$brand){
                return response()->json(['message'=>'Brand not found']);
            }
            else{
                return response()->json($brand);
            }
        }
    }
    function getBrandByName(Request $req){
        $name=$req->name;
        
        if(!$name){
            return response()->json(['message'=>'Please provide name']);
        }
        else{
            $brand=Brand::where("name",$name)->first();
            if(!$brand){
                return response()->json(['message'=>'Brand not found']);
            }
            else{
                return response()->json($brand);
            }
        }
    }
    function createBrand(Request $req){
        $name=$req->name;
        $v_of_items=$req->v_of_items;
        $location=$req->location;
        $phone_number=$req->phone_number;
        $email=$req->email;
        $registration_no=$req->registration_no;
        if(!$name||!$v_of_items||!$location||!$phone_number||is_null($email)||!$registration_no){
            return response()->json(['message'=>'Please fill all the fields['.$name.','.$v_of_items.','.$location.','.$phone_number.','.$email.','.$registration_no.']']);
        }
        else{
            Brand::create([
                'name'=>$name,
                'location'=>$location,
                'v_of_Items'=>$v_of_items,
                'email'=>$email,
                'phone_number'=>$phone_number,
                'registration_no'=>$registration_no
            ]);
            return response()->json(['message'=>'Brand created successfully']);
        }
    }
    function updateBrand(Request $req){
        $brand_id=$req->brand_id;
        $brand=Brand::find($brand_id);
        $allowed_fields=['name','v_of_Items','location'];
        $dataToUpdate=array_filter($req->only($allowed_fields));
        if(!$brand){
            return response()->json(['message'=>'Brand not found']);
        }
        else{
            if(empty($dataToUpdate)){
                return response()->json(['message'=>'No valid fields to update']);
            }
            $brand->update($dataToUpdate);
            return response()->json(['message'=>'Brand updated successfully']);
        }
    }
    
}
