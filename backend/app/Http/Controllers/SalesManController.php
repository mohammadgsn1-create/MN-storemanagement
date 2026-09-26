<?php

namespace App\Http\Controllers;

use App\Models\Brand;
use Illuminate\Http\Request;
use App\Models\SalesMan;
class SalesManController extends Controller
{
    function getSalesMen(Request $req){
        $salesmen = SalesMan::with('brand')->get();
        return response()->json($salesmen);
    }
    function getSalesManWithBrand(Request $req){
        $username=$req->username;
        if(!$username){
            return response()->json(['message'=>'Please provide username']);
        }
        else{
            $salesman=SalesMan::where('username',$username)->join('brands', 'sales_man.works_in', '=', 'brands.id')->first();
            if(!$salesman){
                return response()->json(['message'=>'SalesMan not found']);
            }
            else{
                return response()->json($salesman);
            }
        }
    }
    function createSalesMan(Request $req){
        $name=$req->name;
        $phone_number=$req->phone_number;
        $works_in=$req->works_in;
        $brand=Brand::where('name',$works_in)->first();
        if(!$name||!$phone_number||!$brand){
            return response()->json(['message'=>'Please fill all the fields['.$name.','.$phone_number.','.$brand.']']);
        }
        else{
           $salesman= SalesMan::create([
                'name'=>$name,
                'phone_number'=>$phone_number,
                'works_in'=>$brand['id']
            ]);
            return response()->json(['message'=>'SalesMan created successfully','salesman'=>$salesman]);
        }
    }
}
