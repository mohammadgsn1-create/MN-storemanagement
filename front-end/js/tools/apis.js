export const server="http://127.0.0.1:8000/api";
export const apis = {
    get_customers:"/customers",
    create_customer:"/createcustomers",
    get_customer_invoices:"/customerinvoices",
    add_wholesale_customer:"/addWholesaleCustomer",
    get_wholesale_customers:"/getWholesaleCustomers",
    get_wholesale_customers_by_ID:"/getWholesaleCustomersById",
    get_items:"/getItems",
    get_item_by_id:"/getItemById",
    create_item:"/createItem",
    update_item:"/updateItem",
    delete_item:"/deleteItem",
    get_item_by_serial_number:"/getItemBySerialNumber",
    get_item_by_barcode:"/getItemByBarcode",
    get_item_by_brand_id:"/getItemByBrandID",
    get_stored_in_items:"/getStoredInItems",
    create_stored_in_item:"/createStoredInItem",
    update_stored_in_item:"/updateStoredInItem",
    delete_stored_in_item:"/deleteStoredInItem",
    update_stored_in_item_quantity:"/updateStoredInItemAmount",
    get_brands:"/getAllBrands",
    get_brand_by_id:"/getBrand",
    get_brand_by_name:"/getBrandByName",
    create_brand:"/createBrand",
    update_brand:"/updateBrand",
    delete_brand:"/deleteBrand",
    get_warehouse:"/getWarehouse",
    create_Receipt_Item:"/createReceiptsItems",
    create_Receipt:"/createReceipts",
    get_receipts_items:"/getAllReceiptsItems",
    get_receipt:"/getReceipt",
    create_invoice_customer_item:"/createInvoiceCustomerItem",
    create_invoice:"/createInvoice",
    get_all_invoices_customer_items:"/getAllInvoiceCustomerItems",
    get_payments:"/getPayments",
    create_payments:"/createPayments",
    get_billable:'/getBillable',
    create_sales_man:'/createSalesMan',
    create_brand_sales_man:'/createbrandSalesMan',
    get_sales_man:'/getSalesMen',
    get_brand_with_sales_man:'/getSalesMen',
    get_invoices:'/getInvoices',
    get_profit:'/getProfit',
    get_all_receipt:'/getAllReceipts',
    check_user:'/checkUser',
    create_return:'/createReturn',
    create_debt:'/createDebts',
    get_debts:'/getAlldebts',
    create_debt_payment:'/createDebtPayment'
};
export const getData=async(link,payload)=>{
try{
  const res=await axios.post(link,payload);
  if(res.data.exist){
    return res.data
  }
  else if(res.status===200||res.status===201){
    console.log(res.data)
    return res.data
  }
  else{
    console.log(res)
  }
}
catch(err){
  console.log(err)
}
}
export const formatDisplayDate= (dateStr)=> {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  const month = d.toLocaleString('en-US', { month: 'short' }).toUpperCase(); // AUG
  const day = String(d.getDate()).padStart(2, '0');                          // 22
  const year = d.getFullYear();                                             // 2026
  
  return `${month} ${day} ${year}`;
}
export const today = new Date().toDateString().toUpperCase().split(' ').slice(1).join(' ');