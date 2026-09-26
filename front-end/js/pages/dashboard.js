import {server,apis,getData} from "../tools/apis.js"
// dashboard.js — page-specific logic for dashboard.html
// Uses shared shell behavior in js/base.js

  
const appShell = document.getElementById('appShell');
  const toggleBtn = document.getElementById('sidebarToggle');
  
  toggleBtn.addEventListener('click', () => {
    const collapsed = appShell.classList.toggle('sidebar-collapsed');
    toggleBtn.setAttribute('aria-expanded', String(!collapsed));
  });
  const getProducts=async()=>{
    const Products=document.getElementById('products')
    const res=await getData(`${server}${apis.get_items}`)
    if(Array.isArray(res)){
      Products.innerText=res.length
    }
  }
  const getOrders=async()=>{
    const orders=document.getElementById('orders')
    const response=await getData(`${server}${apis.get_invoices}`)
    if(Array.isArray(response)){
        orders.innerText=response.length
    }

  }
   const getCustomers=async()=>{
    const customers=document.getElementById('customers')
    const customers2=document.getElementById('customers-2')
    const response=await getData(`${server}${apis.get_customers}`)
    if(Array.isArray(response)){
        console.log(response.length)
        customers.innerText=response.length
        customers2.innerText=response.length
    }

  }
  const getRevenue=async ()=>{
    const revenue=document.getElementById('revenue');
    const response=await getData(`${server}${apis.get_invoices}`)
    if(Array.isArray(response)){
        let money=0;
        for(const item of response){
            money+=Number(item.total_price||0)
        }
        if(money>1000){
                money=`${(money/1000).toFixed(3)}k`
            }
        revenue.innerText=`$${money}`
    }
  }
  const getProfit=async ()=>{
    const prophet_body=document.getElementById('prophet')
    const percentage=document.getElementById('pp')
    const revenue=await getData(`${server}${apis.get_profit}`);
    const receipt=await getData(`${server}${apis.get_all_receipt}`);
    let rev=0
    let rec=0
    let total=0
   
    if(Array.isArray(revenue)&&Array.isArray(receipt)){
    for(const item of revenue){
        rev+=Number(item.total_price||0)
    }
    for(const item of receipt){
        rec+=Number(item.total_price||0)
      
    }
    total=rev-rec
   }
   if(Number(total||0)>0){
    total=`${(total/1000).toFixed(3)}k`
   }
  
   prophet_body.innerText=`$${total}`
   percentage.innerText=`%${Number((rec/rev)*100)}`

  }
  const getAllInvoiceCustomerItems=async ()=>{
    const orders=document.getElementById('orders_table');
    const response=await getData(`${server}${apis.get_all_invoices_customer_items}`)
    
    if(Array.isArray(response.data)){
       
        response.data.filter(item=>(Number(item.owes||0)===0)&&(item.services.toLowerCase()==='buy'||item.services.toLowerCase()==='maintenance')&&(Number(item.serial_number||0)!==0)).forEach(item=>orders.appendChild(formatElements(item)))
        
    }
  }
  const formatElements=(parameter)=>{
    const{record_id,first_name,last_name,item_name,total_price,services}=parameter
    const row=document.createElement('tr')
    let s_type='pending'
    let serve='Other'
    if(services==='buy'){
        s_type='delivered'
        serve='Deliver'
    }
    if(services.split('+')[0].toLowerCase()==='repair'||services.split('+')[0].toLowerCase()==='maintenance'){
        s_type="processing"
        serve='Maintenance'
    }
    row.innerHTML=`
    <td class="mono">#VLT-${record_id}</td>
              <td>${first_name.substring(0,1)}. ${last_name}</td>
              <td>${item_name}</td>
              <td><span class="status ${s_type}" data-i18n="status.${s_type}">${serve}</span></td>
              <td class="mono">$${total_price}</td>
    `
    return row
  }
  const getStoredInItems=async()=>{
    const response=await getData(`${server}${apis.get_stored_in_items}`);
    const panel=document.getElementById('panel')
    if(Array.isArray(response)){
    
     response.forEach(resItem => {
    
    (resItem.item || []).forEach(subItem => {
        
        
        const sealed = (subItem.invoices || []).reduce((sum, inv) => {
            return sum + (Number(inv.quantity) || 0);
        }, 0);

        const stock = Number(resItem.amount) || 0;
        const i_name = subItem.name || '';
        
        
        const per = stock > 0 ? ((stock - sealed) / stock) * 100 : 0;
        const div = document.createElement('div');
        div.classList.add('panel');
        
        div.innerHTML = `
            <div class="stock-row">
                <span>${i_name}</span>
                <div class="stock-bar">
                    <div class="stock-fill ${per >= 50 ? '' : 'low'}" style="width:${per}%"></div>
                </div>
            </div>
        `;

        panel.appendChild(div);
    });
});
        
    }
    
  }
  document.addEventListener('DOMContentLoaded',()=> {
 getOrders()
 getCustomers()
 getRevenue();
 getProfit()
 getAllInvoiceCustomerItems()
 getStoredInItems()
 getProducts()
 const today = new Date();

const formattedDate = new Intl.DateTimeFormat('en-US', {
  weekday: 'long', 
  month: 'long',  
  day: 'numeric', 
  year: 'numeric'  
}).format(today).toUpperCase();
document.getElementById('date').innerText = formattedDate;

});