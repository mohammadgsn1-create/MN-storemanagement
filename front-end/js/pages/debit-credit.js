import {server,apis} from "../tools/apis.js"
// debit-credit.js — page-specific logic for debit-credit.html
// Uses shared shell behavior in js/base.js

  

  // ---- search by customer or company name, across both tables ----
  let cust_owes=0;
  let br_owes=0;
  const dcSearch = document.getElementById('dcSearch');
  const debitRows = Array.from(document.querySelectorAll('#debitBody tr'));
  const creditRows = Array.from(document.querySelectorAll('#creditBody tr'));
const getCustomersOwes=async()=>{
   try {
    const response = await axios.post(`${server}${apis.get_all_invoices_customer_items}`);
    const itemsList = response.data;

    const tableBody = document.getElementById('debitBody');
    tableBody.innerHTML = ''; 
    if (Array.isArray(itemsList)) {
      itemsList.forEach(item => {
        console.log(item.owes)
        const row = renderDebitCreditRow(item);
        tableBody.appendChild(row);
      });
    }
    document.getElementById('cust-owes-total').innerText=`$${cust_owes}`
  } catch (error) {
    console.error("Fetch error:", error);
  }
  }
  const getReceipts=async()=>{
    try{
    const brand_owes=document.getElementById('br-owes-total')
    const credits=document.getElementById('creditBody')
    const response=await axios.post(`${server}${apis.get_receipts_items}`)
     if(response.status!==200&&response.status!==201){
      alert(`Fetch Receipts Error:${response.status}`);
      return;
     }
    const itemsList=response.data;
    if(Array.isArray(itemsList)){
      itemsList.forEach(item=>{
        const row=renderBrandsRow(item)
        credits.appendChild(row)
        brand_owes.innerText=`$${br_owes}`
      })
    }
    }
     catch(error){
      alert(error)
      console.log(error)
     }
  }
  function runDcFilter(){
    const q = dcSearch.value.trim().toLowerCase();
    [debitRows, creditRows].forEach(rows => {
      rows.forEach(row => {
        const name = (row.dataset.name || '').toLowerCase();
        row.style.display = (q === '' || name.includes(q)) ? '' : 'none';
      });
    });
  }
  function renderDebitCreditRow(data) {
  const firstName = data.first_name || '';
  const lastName = data.last_name || '';
  const custName = `${firstName} ${lastName}`.trim() || 'Customer not exist';
  const total = Number(data.total_price || 0);
  const paid = Number(data.paid || 0);
  const owes = Number(data.owes || 0);
   cust_owes+=Number(owes ||(total-paid))
   
  const tr = document.createElement('tr');
tr.innerHTML=`<td><span class="id-tag debit mono">INV-${data.invoice_id || '—'}</span></td>
            <td>${custName}</td>
            <td class="mono">$${total.toLocaleString()}</td>
            <td class="mono">$${paid.toLocaleString()}</td>
            <td class="mono balance-cell">$${owes.toLocaleString()}</td>
            <td><span class='${Number(owes.toLocaleString())>0?"status-pill unpaid":"status-pill partial"}' data-i18n="dc.status.partial">${Number(owes.toLocaleString())>0?"unpaid":"partial"}</span></td>
          </tr>`
  return tr;
}
 function renderBrandsRow(data) {
  const brand = data.item.brand || '';
  const pay = Number(data.receipt.pay || 0);
  const owes = Number(data.receipt.owes||0)  ;
  const total = Number(data.price || 0);
  br_owes+=owes
  const tr = document.createElement('tr');
tr.innerHTML=`<tr>
            <td><span class="id-tag credit mono">RCT-${data.id}</span></td>
            <td>${brand.name}</td>
            <td class="mono">$${total}</td>
            <td class="mono">$${pay}</td>
            <td class="mono balance-cell">$${owes}</td>
            <td><span class="${owes>0?'status-pill unpaid':'status-pill partial'}" data-i18n="${owes>0?'dc.status.unpaid':'dc.status.partial'}">${owes>0?'Unpaid':'Partial'}</span></td>
          </tr>`
  return tr;
}
document.addEventListener('DOMContentLoaded',()=> {
  getCustomersOwes()
  getReceipts()
});
  dcSearch.addEventListener('input', runDcFilter);
