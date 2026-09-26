<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\InvoiceCustomerItem;
use Illuminate\Support\Facades\DB;
class InvoiceCustomerItemController extends Controller
{
    function getAllInvoiceCustomerItems(Request $req){
       $items = DB::table('invoices_customers_items as ici')
        ->leftJoin('invoices as inv', 'ici.invoice_id', '=', 'inv.id')
        ->leftJoin('items as itm', 'ici.serial_number', '=', 'itm.serial_number')
        // ربط جدول العملاء
        ->leftJoin('customers as cust', 'ici.customer_id', '=', 'cust.id')
        ->select(
            'ici.id as record_id',
            'ici.invoice_id',
            'ici.customer_id',
            'ici.i_name as item_name',
            'ici.date',
            'ici.total_price',
            'ici.services',
            'ici.quantity as item_quantity',
            'ici.serial_number',
            
            // بيانات الفاتورة
            'inv.type as pay_type',
            'inv.paid',
            'inv.owes',
            
            // بيانات المنتج
            'itm.Barcode as barcode',
            'itm.color',

            // بيانات العميل المضافة
            'cust.first_name',
            'cust.last_name',
            'cust.address',
            'cust.phone_number',
            'cust.note as address_desc'
        )
        ->orderBy('ici.id', 'desc')
        ->get();

    return response()->json($items, 200);
    }
    function getInvoiceCustomerItems(Request $req){
        $invoice_id=$req->invoice_id;
        if(!$invoice_id){
            return response()->json(['message'=>'Please provide invoice_id']);
        }
        else{
            $items=InvoiceCustomerItem::where('invoice_id',$invoice_id)->get();
            if(!$items){
                return response()->json(['message'=>'No items found']);
            }
            else{
                return response()->json($items);
            }
        }
    }
    function createInvoiceCustomerItem(Request $req){
        $invoice_id=$req->invoice_id;
        $customer_id=$req->customer_id;
        $sn_b=$req->serial_number;
        $item_name=$req->item_name;
        $date=\Carbon\Carbon::parse($req->date)->format('Y-m-d');
        $total_price=$req->total_price;
        $services=$req->services;
        $quantity=$req->quantity;
        if(!$invoice_id||!$customer_id||is_null($sn_b)||!$item_name||!$total_price||!$services||!$date||is_null($quantity)){
            return response()->json(['message'=>'Please fill all the fields('.$invoice_id.",".$customer_id.",".$sn_b.",".$item_name.",".$total_price.",".$services.",".$date.",".$quantity.".)"]);
        }
        else{
            InvoiceCustomerItem::create([
                'invoice_id'=>$invoice_id,
                'customer_id'=>$customer_id,
                'i_name'=>$item_name,
                'total_price'=>$total_price,
                'services'=>$services,
                'date'=>$date,
                'serial_number'=>$sn_b,
                'quantity'=>$quantity
            ]);
            return response()->json(['message'=>'InvoiceCustomerItem created successfully']);
        }
    }
    function getBillable(Request $req){
        $items=DB::table("invoices_customers_items as ici")
        ->leftJoin('customers as cust', 'ici.customer_id', '=', 'cust.id')->select( 'ici.id as record_id',
            'ici.invoice_id',
            'ici.customer_id',
            'ici.i_name as item_name',
            'ici.date',
            'ici.total_price',
            'ici.services',
            'ici.quantity as item_quantity',
            'ici.serial_number',
            
            'cust.first_name',
            'cust.last_name',
            'cust.address',
            'cust.phone_number',
            'cust.note as address_desc')->where('ici.i_name','billable')->get()
        ;
        return response()->json($items);
    }
}
