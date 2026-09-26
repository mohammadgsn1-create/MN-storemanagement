<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\BrandSalesMan;
class brandSalesManController extends Controller
{
    function getAllbrandSalesMan(Request $req){
        $brandSalesMan=BrandSalesMan::join('brands', 'brand_sales_men.brand_id', '=', 'brands.id')
            ->join('sales_men', 'brand_sales_men.sales_man_id', '=', 'sales_men.id')
            ->select('brand_sales_men.*', 'brands.name as brand_name', 'sales_men.name as sales_man_name')
            ->get();
        if(!$brandSalesMan){
            return response()->json(['message'=>'No brand sales man found']);
        }
        else{
            return response()->json($brandSalesMan);
        }
    }
    function getbrandSalesMan(Request $req){
        $brand_id=$req->brand_id;
        if(!$brand_id){
            return response()->json(['message'=>'Please provide brand_id']);
        }
        else{
            $brandSalesMan=BrandSalesMan::where('brand_id',$brand_id)->get();
            if(!$brandSalesMan){
                return response()->json(['message'=>'No brand sales man found']);
            }
            else{
                return response()->json($brandSalesMan);
            }
        }
    }
    function createbrandSalesMan(Request $req){
        $brand_id=$req->brand_id;
        $sales_man_id=$req->sales_man_id;
        if(!$brand_id||!$sales_man_id){
            return response()->json(['message'=>'Please fill all the fields']);
        }
        else{
            BrandSalesMan::create([
                'brand_id'=>$brand_id,
                'sales_man_id'=>$sales_man_id
            ]);
            return response()->json(['message'=>'Brand sales man created successfully']);
        }
    }
    }
