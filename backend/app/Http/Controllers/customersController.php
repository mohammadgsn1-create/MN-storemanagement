<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Customers;
use App\Models\InvoiceCustomerItem;
use App\Models\WholesaleCustomers;
class customersController extends Controller
{
    function getCustomers(Request $req){
        $customers = Customers::with(['invoiceItem.invoice','invoiceItem.item','return'])->get();
        return response()->json($customers);
    }
    function createCustomer(Request $req){
        $f_name=$req->first_name;
        $l_name=$req->last_name;
        $address=$req->address;
        $phone=$req->phone_number;
        $note=$req->note;
        

        if(!$f_name||!$l_name||!$address||!$phone||!$note){
            return response()->json(['message'=>'Please fill all the fields']);
        }
        else{
        $customer=Customers::create([
                'first_name'=>$f_name,
                'last_name'=>$l_name,
                'address'=>$address,
                'phone_number'=>$phone,
                'note'=>$note,
                
                
            ]);
            return response()->json(['message'=>'Customer created successfully','customer'=>$customer]);

        }

    }
    function getCustomerInvoices(Request $req){
    $customer_id=$req->customer_id;
if(!$customer_id){
    return response()->json(['message'=>'Please provide customer_id']);
}
else{
    $invoices=InvoiceCustomerItem::where('customer_id',$customer_id)->get();
    if(!$invoices){
        return response()->json(['message'=>'No invoices found']);
    }
    else{
       return response()->json($invoices);
    }
    
}
    }
    function addWholesaleCustomer(Request $req){
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
            return response()->json(['message'=>'Wholesale customer added successfully']);
        }
    }

}
