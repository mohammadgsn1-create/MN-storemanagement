import {server,apis} from "../tools/apis.js"
// payments.js — page-specific logic for payments.html
// Uses shared shell behavior in js/base.js

  

  // ============================================================
  // Shared modal plumbing (same pattern used on every other page)
  // ============================================================
  
  const getBillable=async ()=>{
    //billableBody
    const billable_body=document.getElementById('billableBody')
    const response=await axios.post(`${server}${apis.get_billable}`);
    const data=response.data;
    if(response.status!==200&&response.status!==201){
        alert("Something went wrong")
        return;
    }
    console.log(data)
    for(const invoice of data){
     const tr=document.createElement('tr');
     tr.innerHTML=`
            <td class="mono">${formatDisplayDate(invoice.date)}</td>
            <td>${invoice.services}</td>
            <td class="mono">$${invoice.total_price}</td>
            <td><span class="link-tag">INV-${invoice.record_id}</span></td>
            <td>${invoice.first_name.substring(0,1)}. ${invoice.last_name}</td>
     `
     billable_body.appendChild(tr);
    }

  }
  const getPayments=async()=>{
    try{
        const payment_table=document.getElementById('expensesBody');
        const payment=await axios.post(`${server}${apis.get_payments}`);
        if(payment.status!==200&&payment.status!==201){
            alert(`Error:${payment.message}`)
        }
        const data=payment.data;
        for(const p of data){
           const displayDate = formatDisplayDate(p.Date || new Date());
           const tr=document.createElement('tr');
           tr.innerHTML=`
           <td class="mono">${displayDate}</td>
            <td>Coffee &amp; ${p.payment_des}</td>
            <td class="mono">${p.amount}</td>
           `
           payment_table.appendChild(tr);
        }
        
    }
    catch(error){
        alert(`${error}`)
    }
  }
  function ensureModalMounted(){
    if (document.getElementById('modalOverlay')) return;
    const wrap = document.createElement('div');
    wrap.innerHTML = `
      <div class="modal-overlay" id="modalOverlay">
        <div class="modal-box" id="modalBox" role="dialog" aria-modal="true" aria-labelledby="modalTitle">
          <div class="modal-head">
            <h3 id="modalTitle"></h3>
            <button type="button" class="modal-close" id="modalCloseBtn" aria-label="Close">&times;</button>
          </div>
          <form id="modalForm" novalidate>
            <div id="modalFields"></div>
            <div class="modal-actions">
              <button type="button" class="btn-secondary" id="modalCancelBtn">Cancel</button>
              <button type="submit" class="btn-primary-lg" id="modalSubmitBtn">Save</button>
            </div>
          </form>
        </div>
      </div>`;
    document.body.appendChild(wrap.firstElementChild);
    const overlay = document.getElementById('modalOverlay');
    document.getElementById('modalCloseBtn').addEventListener('click', closeModal);
    document.getElementById('modalCancelBtn').addEventListener('click', closeModal);
    overlay.addEventListener('click', (e) => { if (e.target === overlay) closeModal(); });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && overlay.classList.contains('open')) closeModal();
    });
  }
  function closeModal(){
    const overlay = document.getElementById('modalOverlay');
    if (overlay) overlay.classList.remove('open');
  }
  function flashElement(el, cls){
    el.classList.add(cls);
    el.addEventListener('animationend', () => el.classList.remove(cls), { once: true });
  }
  function todayStr(){
    return new Date().toDateString().toUpperCase().split(' ').slice(1).join(' ');
  }

  // ============================================================
  // Totals
  // ============================================================
  function recalcTotals(){
    let expTotal = 0;
    document.querySelectorAll('#expensesBody tr').forEach(r => {
      const amt = Number((r.children[2]?.textContent || '0').replace(/[^0-9.]/g, '')) || 0;
      expTotal += amt;
    });
    let billTotal = 0;
    document.querySelectorAll('#billableBody tr').forEach(r => {
      const amt = Number((r.children[2]?.textContent || '0').replace(/[^0-9.]/g, '')) || 0;
      billTotal += amt;
    });
    document.getElementById('totalExpenses').textContent = `$${expTotal.toLocaleString()}`;
    document.getElementById('totalBillable').textContent = `$${billTotal.toLocaleString()}`;
  }

  // ============================================================
  // Search (by description / customer / invoice)
  // ============================================================
  document.getElementById('expenseSearch').addEventListener('input', function(){
    const q = this.value.trim().toLowerCase();
    document.querySelectorAll('#expensesBody tr').forEach(r => {
      const desc = (r.children[1]?.textContent || '').toLowerCase();
      r.style.display = (q === '' || desc.includes(q)) ? '' : 'none';
    });
  });
  document.getElementById('billableSearch').addEventListener('input', function(){
    const q = this.value.trim().toLowerCase();
    document.querySelectorAll('#billableBody tr').forEach(r => {
      const text = r.textContent.toLowerCase();
      r.style.display = (q === '' || text.includes(q)) ? '' : 'none';
    });
  });

  // ============================================================
  // Add Expense — simple modal (date, description, amount)
  // ============================================================
  document.getElementById('addExpenseBtn').addEventListener('click', () => {
    ensureModalMounted();
    document.getElementById('modalTitle').textContent = 'Add expense';
    document.getElementById('modalSubmitBtn').textContent = 'Add expense';
    document.getElementById('modalFields').innerHTML = `
      <div class="modal-field"><label for="mf_date">Date</label><input type="date" id="mf_date" value="${new Date().toISOString().slice(0,10)}" required></div>
      <div class="modal-field"><label for="mf_desc">Description</label><input type="text" id="mf_desc" placeholder="e.g. Coffee for staff" required></div>
      <div class="modal-field"><label for="mf_amount">Total cost ($)</label><input type="number" id="mf_amount" min="0" step="0.01" value="0" required></div>
    `;
    const form = document.getElementById('modalForm');
    const handler =async function(e){
      e.preventDefault();
      const dateVal = document.getElementById('mf_date').value;
      const desc = document.getElementById('mf_desc').value.trim();
      const amount = Number(document.getElementById('mf_amount').value) || 0;
      const dateLabel = dateVal
        ? new Date(dateVal + 'T00:00:00').toDateString().toUpperCase().split(' ').slice(1).join(' ')
        : todayStr();
       try{
       const create_payment=await axios.post(`${server}${apis.create_payments}`,{
        "date":formattedDate,
        "payments_des":desc,
        "amount":amount
       })
       alert(create_payment.message)
      }
      catch(error){
        alert(`Something went wrong:${error}`)
      }
      const row = document.createElement('tr');
      row.innerHTML = `
        <td class="mono">${dateLabel}</td>
        <td>${desc}</td>
        <td class="mono">$${amount.toLocaleString()}</td>`;
      document.getElementById('expensesBody').prepend(row);
      flashElement(row, 'row-flash');
      recalcTotals();
      closeModal();
      form.reset();
      form.removeEventListener('submit', handler);
    };
    form.addEventListener('submit', handler);
    requestAnimationFrame(() => {
      document.getElementById('modalOverlay').classList.add('open');
      document.getElementById('mf_desc').focus();
    });
  });

  // ============================================================
  // Add Billable expense — date, description, amount, + which
  // invoice/customer it gets passed on to (search-select, same
  // pattern used for item/company lookups on other pages).
  //
  // NOTE: this invoice list is the same 6 sample invoices used on
  // the Invoices page — a stand-in for a real query against actual
  // invoice records once there's a shared backend. Selecting one
  // here does NOT yet add this cost onto that invoice's own total
  // on the Invoices page itself; it only records the link here.
  // Wiring that through is a good next step once the API is connected.
  // ============================================================
  let BILLABLE_INVOICES = [
    { inb:'INV-0417', customer:'R. Haddad' },
    { inb:'INV-0416', customer:'S. Khalil' },
    { inb:'INV-0415', customer:'N. Aziz' },
    { inb:'INV-0414', customer:'L. Fares' },
    { inb:'INV-0413', customer:'D. Nassar' },
    { inb:'INV-0412', customer:'M. Jaber' }
  ];
    const getCustomersInvoices = async () => {
  try {
    const response = await axios.post(`${server}${apis.get_all_invoices_customer_items}`);
    
    const itemsList = response.data;
    console.log("Items List:", itemsList);

    if (Array.isArray(itemsList)) {
      BILLABLE_INVOICES = itemsList.map(item => ({
        inb: `INV-${item.record_id}`,
        customer: `${item.first_name || ''} ${item.last_name || ''}`.trim(),
        c_id:item.customer_id
      }));
    }

    
  } catch (error) {
    console.error("Fetch error:", error);
  }
};
  document.getElementById('addBillableBtn').addEventListener('click', () => {
    ensureModalMounted();
    document.getElementById('modalTitle').textContent = 'Add billable expense';
    document.getElementById('modalSubmitBtn').textContent = 'Add billable expense';
    document.getElementById('modalFields').innerHTML = `
      <div class="modal-field"><label for="mf_date">Date</label><input type="date" id="mf_date" value="${new Date().toISOString().slice(0,10)}" required></div>
      <div class="modal-field"><label for="mf_desc">Description</label><input type="text" id="mf_desc" placeholder="e.g. Delivery fee — Speedex" required></div>
      <div class="modal-field"><label for="mf_amount">Total cost ($)</label><input type="number" id="mf_amount" min="0" step="0.01" value="0" required></div>
      <div class="modal-field">
        <label for="mf_invSearch">Invoice / Customer</label>
        <div class="search-select" id="mf_invWrap">
          <input type="text" id="mf_invSearch" placeholder="Type an invoice nb or customer name…" autocomplete="off" required>
          <div class="search-dropdown" id="mf_invDropdown"></div>
        </div>
      </div>
    `;

    let selectedInvoice = null;
    const invInput = document.getElementById('mf_invSearch');
    const invWrap = document.getElementById('mf_invWrap');
    const invDropdown = document.getElementById('mf_invDropdown');

    function renderInvDropdown(query){
      const q = query.trim().toLowerCase();
      const matches = q === '' ? BILLABLE_INVOICES : BILLABLE_INVOICES.filter(inv =>
        inv.inb.toLowerCase().includes(q) || inv.customer.toLowerCase().includes(q)
      );
      invDropdown.innerHTML = matches.length
        ? matches.map(inv => `
            <div class="search-dropdown-item" data-inb="${inv.inb}">
              ${inv.customer}
              <span class="sd-sub">${inv.inb}</span>
            </div>`).join('')
        : `<div class="search-dropdown-empty">No matching invoice</div>`;
      invDropdown.classList.add('open');
    }
    invInput.addEventListener('focus', () => renderInvDropdown(invInput.value));
    invInput.addEventListener('input', () => {
      selectedInvoice = null;
      invWrap.classList.remove('has-value');
      renderInvDropdown(invInput.value);
    });
    invInput.addEventListener('blur', () => setTimeout(() => invDropdown.classList.remove('open'), 150));
    invDropdown.addEventListener('mousedown', (e) => {
      const item = e.target.closest('.search-dropdown-item[data-inb]');
      if (!item) return;
      e.preventDefault();
      const inv = BILLABLE_INVOICES.find(x => x.inb === item.dataset.inb);
       customer=inv;
      if (!inv) return;
      selectedInvoice = inv;
      invInput.value = `${inv.customer} (${inv.inb})`;
      invWrap.classList.add('has-value');
      invDropdown.classList.remove('open');
    });

    const form = document.getElementById('modalForm');
    const handler =async function(e){
      e.preventDefault();
      if (!selectedInvoice){
        alert('Pick an invoice/customer from the list before saving.');
        return;
      }
      const dateVal = document.getElementById('mf_date').value;
      const desc = document.getElementById('mf_desc').value.trim();
      const amount = Number(document.getElementById('mf_amount').value) || 0;
      const dateLabel = dateVal
        ? new Date(dateVal + 'T00:00:00').toDateString().toUpperCase().split(' ').slice(1).join(' ')
        : todayStr();
       try{
     const formattedDate = dateVal ? dateVal : new Date().toISOString().split('T')[0];
    const create_invoice_customer_item=await axios.post(`${server}${apis.create_invoice_customer_item}`,{
    'invoice_id':Number(customer.inb.split('-')[1]),
    'customer_id':customer.c_id,
    'serial_number':0,
    'item_name':"billable",
    'date':formattedDate,
    'total_price':amount,
    'services':desc,
    'quantity':0
  })
  console.log(create_invoice_customer_item.data)
  if(create_invoice_customer_item.status===200||create_invoice_customer_item.status===201){
    alert('done')
  }
  else{
    alert(`Error: ${create_invoice_customer_item.message} , code:${create_invoice_customer_item.status}`)
  }
  }
  catch(error){
    alert(`Something went wrong:${error}`);
    return;
  }
      const row = document.createElement('tr');
      row.innerHTML = `
        <td class="mono">${dateLabel}</td>
        <td>${desc}</td>
        <td class="mono">$${amount.toLocaleString()}</td>
        <td><span class="link-tag">${selectedInvoice.inb}</span></td>
        <td>${selectedInvoice.customer}</td>`;
      document.getElementById('billableBody').prepend(row);
      flashElement(row, 'row-flash');
      recalcTotals();
      closeModal();
      form.reset();
      form.removeEventListener('submit', handler);
    };
    form.addEventListener('submit', handler);
    requestAnimationFrame(() => {
      document.getElementById('modalOverlay').classList.add('open');
      document.getElementById('mf_desc').focus();
    });
  });
  function formatDisplayDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  const month = d.toLocaleString('en-US', { month: 'short' }).toUpperCase(); // AUG
  const day = String(d.getDate()).padStart(2, '0');                          // 22
  const year = d.getFullYear();                                             // 2026
  
  return `${month} ${day} ${year}`;
}

  recalcTotals();
document.addEventListener('DOMContentLoaded', () => {
  getCustomersInvoices();
  getPayments();
  getBillable();
});