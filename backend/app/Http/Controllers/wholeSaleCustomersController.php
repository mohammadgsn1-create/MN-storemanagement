<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\WholesaleCustomers;
class wholeSaleCustomersController extends Controller
{
    
    function getWholesaleCustomers(Request $req){
        $customers=WholesaleCustomers::join('customers','wholesale_customers.customer_id','=','customers.id')
            ->select('wholesale_customers.*','customers.name as customer_name')
            ->get();
        if(!$customers){
            return response()->json(['message'=>'No wholesale customers found']);
        }
        else{
            return response()->json($customers);
        }
    }
    function createWholesaleCustomer(Request $req){
        $customer_id=$req->customer_id;
        $priority_level=$req->priority_level;
        if(!$customer_id||!$priority_level){
            return response()->json(['message'=>'Please fill all the fields']);
        }
        else{
            WholesaleCustomers::create([
                'customer_id'=>$customer_id,
                'priority_level'=>$priority_level
            ]);
            return response()->json(['message'=>'Wholesale customer created successfully']);
        }
    }
    function deleteWholesaleCustomer(Request $req){
        $customer_id=$req->customer_id;
        if(!$customer_id){
            return response()->json(['message'=>'Please provide customer_id']);
        }
        else{
            $customer=WholesaleCustomers::where('customer_id',$customer_id)->first();
            if(!$customer){
                return response()->json(['message'=>'Wholesale customer not found']);
            }
            else{
                WholesaleCustomers::where('customer_id',$customer_id)->delete();
                return response()->json(['message'=>'Wholesale customer deleted successfully']);
            }
        }
    }
    function getWholesaleCustomersById(Request $req){
        $customer_id=$req->customer_id;
        if(!$customer_id){
            return response()->json(['message'=>'Please provide customer_id']);
        }
        else{
            $customer=WholesaleCustomers::where('customer_id',$customer_id)->first();
            if(!$customer){
                return response()->json(['message'=>'Wholesale customer not found']);
            }
            else{
                return response()->json($customer);
            }
        }
    }
}
