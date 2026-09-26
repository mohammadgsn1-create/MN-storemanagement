<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\CustomersController;
use App\Http\Controllers\ItemsController;
use App\Http\Controllers\StoredInController;
use App\Http\Controllers\InvoicesController;
use App\Http\Controllers\SalesManController;
use App\Http\Controllers\InvoiceCustomerItemController;
use App\Http\Controllers\receiptsController;
use App\Http\Controllers\receiptsItemsController;
use App\Http\Controllers\brandSalesManController;
use App\Http\Controllers\brandController;
use App\Http\Controllers\paymentsController;
use App\Http\Controllers\returnsController;
use App\Http\Controllers\storeDebtsController;
use App\Http\Controllers\storeDeptsPaymentsController;
use App\Http\Controllers\userController;
use App\Http\Controllers\wholeSaleCustomersController;
/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/
//createStoredInItem
Route::post('/customers', [CustomersController::class, 'getCustomers']);
Route::post('/createcustomers', [CustomersController::class, 'createCustomer']);
Route::post('/customerinvoices', [CustomersController::class, 'getCustomerInvoices']);
Route::post('/addWholesaleCustomer', [CustomersController::class, 'addWholesaleCustomer']);
Route::post('/getWholesaleCustomers', [CustomersController::class, 'getWholesaleCustomers']);
Route::post('/getItems', [ItemsController::class, 'getItems']);
Route::post('/createItem', [ItemsController::class, 'createItem']);
Route::post('/updateItem', [ItemsController::class, 'updateItem']);
Route::post('/deleteItem', [ItemsController::class, 'deleteItem']);
Route::post('/getItemBySerialNumber', [ItemsController::class, 'getItemBySerialNumber']);
Route::post('/getItemByBarcode', [ItemsController::class, 'getItemByBarcode']);
Route::post('/getItemById', [ItemsController::class, 'getItemById']);
Route::post('/getItemByBrandID', [ItemsController::class, 'getItemByBrandID']);
Route::post('/getStoredInItems', [StoredInController::class, 'getStoredInItems']);
Route::post('/getWarehouseItems', [StoredInController::class, 'getWarehouseItems']);
Route::post('/createStoredInItem', [StoredInController::class, 'createStoredInItem']);
Route::post('/updateStoredInItem', [StoredInController::class, 'updateStoredInItem']);
Route::post('/updateStoredInItemAmount', [StoredInController::class, 'updateStoredInItemAmount']);
Route::post('/deleteStoredInItem', [StoredInController::class, 'deleteStoredInItem']);
Route::post('/getWarehouse',[StoredInController::class, 'getStoredIn']);
Route::post('/getInvoices', [InvoicesController::class, 'getInvoices']);
Route::post('/getProfit', [InvoicesController::class, 'getProfit']);
Route::post('/createInvoice', [InvoicesController::class, 'createInvoice']);
Route::post('/getSalesMen', [SalesManController::class, 'getSalesMen']);
Route::post('/createSalesMan', [SalesManController::class, 'createSalesMan']);
Route::post('/getSalesManWithBrand', [SalesManController::class, 'getSalesManWithBrand']);
Route::post('/getInvoiceCustomerItems', [InvoiceCustomerItemController::class, 'getInvoiceCustomerItems']);
Route::post('/createInvoiceCustomerItem', [InvoiceCustomerItemController::class, 'createInvoiceCustomerItem']);
Route::post('/getAllInvoiceCustomerItems', [InvoiceCustomerItemController::class, 'getAllInvoiceCustomerItems']);
Route::post('/getBillable',[InvoiceCustomerItemController::class,'getBillable']);
Route::post('/getAllReceipts', [receiptsController::class, 'getAllReceipts']);
Route::post('/getReceipt', [receiptsController::class, 'getReceipt']);//getItemById
Route::post('/createReceipts', [receiptsController::class, 'createReceipts']);
Route::post('/updateReceipts', [receiptsController::class, 'updateReceipts']);
Route::post('/getAllReceiptsItems', [receiptsItemsController::class, 'getAllReceiptsItems']);
Route::post('/getReceiptsItems', [receiptsItemsController::class, 'getReceiptsItems']);
Route::post('/createReceiptsItems', [receiptsItemsController::class, 'createReceiptsItems']);
Route::post('/getAllbrandSalesMan', [brandSalesManController::class, 'getAllbrandSalesMan']);
Route::post('/getbrandSalesMan', [brandSalesManController::class, 'getbrandSalesMan']);
Route::post('/createbrandSalesMan', [brandSalesManController::class, 'createbrandSalesMan']);
Route::post('/getAllBrands', [brandController::class, 'getAllBrands']);
Route::post('/getBrand', [brandController::class, 'getBrand']);
Route::post('/getBrandByName',[brandController::class,'getBrandByName']);
Route::post('/createBrand', [brandController::class, 'createBrand']);
Route::post('/updateBrand', [brandController::class, 'updateBrand']);
Route::post('/getWholesaleCustomers', [wholeSaleCustomersController::class, 'getWholesaleCustomers']);
Route::post('/createWholesaleCustomer', [wholeSaleCustomersController::class, 'createWholesaleCustomer']);
Route::post('/deleteWholesaleCustomer', [wholeSaleCustomersController::class, 'deleteWholesaleCustomer']);
Route::post('/getWholesaleCustomersById', [wholeSaleCustomersController::class, 'getWholesaleCustomersById']);
Route::post('/getPayments',[paymentsController::class,'getPayments']);
Route::post('/createPayments',[paymentsController::class,'createPayments']);
Route::post('/getUser',[userController::class,'getUser']);
Route::post('/checkUser',[userController::class,'checkUser']);
Route::post('/createReturn',[returnsController::class,'createReturn']);
Route::post('/createDebts',[storeDebtsController::class,'createDebts']);
Route::post('/getAlldebts',[storeDebtsController::class,'getAlldebts']);
Route::post('/createDebtPayment',[storeDeptsPaymentsController::class,'createDebtPayment']);