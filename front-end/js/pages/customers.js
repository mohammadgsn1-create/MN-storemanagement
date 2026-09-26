import {server,apis} from "../tools/apis.js"
// customers.js — page-specific logic for customers.html
// Uses shared shell behavior in js/base.js

  /* ---- inlined modal.js ---- */
/* ============================================================
   MN Electronics Admin — shared "Add new" pop-up modal logic
   Include this file on every page with a normal script tag
   pointing at modal.js (placed before it's used).
   Usage:
     openModal({
       title: "Add customer",
       submitLabel: "Add customer",
       fields: [
         { id: "name", label: "Full name", required: true },
         { id: "type", label: "Type", type: "select", options: ["A","B"] }
       ],
       onSubmit(values){ ...values.name, values.type... }
     });
   ============================================================ */
let CUSTOMER_INVOICES = {
    'C-0091': [{ inb:'INV-0417', date:'AUG 22 2026', total:1240 }],
    'C-0104': [{ inb:'INV-0416', date:'AUG 21 2026', total:890 }],
    'C-0077': [{ inb:'INV-0415', date:'AUG 20 2026', total:2370 }],
    'C-0063': [{ inb:'INV-0414', date:'AUG 19 2026', total:720 }],
    'C-0058': [{ inb:'INV-0413', date:'AUG 19 2026', total:1240 }],
    'C-0112': [{ inb:'INV-0412', date:'AUG 18 2026', total:1504 }]
  };
const createCustomer=async(fn,ln,ad,ph,no,ct)=>{
    try{
        const response=await axios.post(`${server}${apis.create_customer}`,{
            "first_name":fn,
            "last_name":ln,
            "address":ad,
            "phone_number":ph,
            "note":no,
            
        });
        alert(response.data.message);
        if(ct==="Wholesale"){
          
            const res=await axios.post(`${server}${apis.add_wholesale_customer}`,{"customer_id":response.data.customer.id,"priority_level":1});
        
        }
    }
    catch(error){
        console.error('Error creating customer:', error);
        return null;
    }
}

const getCustomers=async()=>{
  try{
    const customers_table=document.getElementById('customerBody');
    const response=await axios.post(`${server}${apis.get_customers}`,{});
    const data= response.data;
    
    for (const customer of data){
        
        
        const row=document.createElement("tr");
        row.setAttribute("data-cid",customer.id);
        row.setAttribute("data-address-desc",customer.address_description);
         const Wholesale=await axios.post(`${server}${apis.get_wholesale_customers_by_ID}`,{"customer_id":customer.id});
         const orders=await axios.post(`${server}${apis.get_customer_invoices}`,{"customer_id":customer.id});
         const orderData=orders.data;
         const uniqueInvoices = customer.invoice_item
  .flatMap(item => item.invoice ? [{ ...item.invoice, date: item.date }] : [])
  .reduce((acc, invoice) => {
    if (!acc.some(inv => inv.id === invoice.id)) {
      acc.push(invoice);

    }
    return acc;
  }, []);

const total_owes=uniqueInvoices.reduce((sum,inv)=>sum+inv.owes,0)
CUSTOMER_INVOICES[customer.id]=uniqueInvoices.map(item=>{
  return{ inb:`INV-${item.id}`, date:item.date, total:item.total_price,paid:item.paid }
})
         let totalOrders=0;
         const isWholesale=Boolean(Wholesale&&Wholesale.data&&typeof Wholesale.data==='object'&&Object.keys(Wholesale.data).length>0&&Wholesale.data.id);
         const isOrderData=Boolean(orderData&&typeof orderData==='object'&&Object.keys(orderData).length>0);
         if(!isOrderData){
           for (const order of orderData){
            totalOrders+=order.total_price;

         }
         }
        row.innerHTML=`
            <td>
              <div class="cust-cell">
                <div class="cust-avatar">${customer.first_name.substring(0,1).toUpperCase()}${customer.last_name.substring(0,1).toUpperCase()}</div>
                <div><div class="cust-name">${customer.first_name.substring(0,1).toUpperCase()}.${customer.last_name}</div></div>
              </div>
            </td>
            <td class="mono">C-${customer.id}</td>
            <td><span class="type-pill normal">${isWholesale?"Wholesale":"Normal"}</span></td>
            <td>${customer.address}</td>
            <td class="mono">${customer.phone_number}</td>
            <td><span class="orders-pill">${Object.keys(orderData).length} order</span></td>
            <td class="mono">$${totalOrders}</td>
            <td><span class="debt-pill owes">Owes $${total_owes}</span></td>
          `
          customers_table.appendChild(row);
    }
    console.log(CUSTOMER_INVOICES)
  }catch(error){
    console.error('Error fetching customers:', error);
    return [];
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
            <button type="button" class="btn-secondary" id="modalCancelBtn" data-i18n="common.cancel">Cancel</button>
            <button type="submit" class="btn-primary" id="modalSubmitBtn" data-i18n="common.save">Save</button>
          </div>
        </form>
      </div>
    </div>`;
  document.body.appendChild(wrap.firstElementChild);

  const overlay = document.getElementById('modalOverlay');
  document.getElementById('modalCloseBtn').addEventListener('click', closeModal);
  document.getElementById('modalCancelBtn').addEventListener('click', closeModal);
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) closeModal();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && overlay.classList.contains('open')) closeModal();
  });
}

let _modalSubmitHandler = null;
let _fieldsClickHandler = null;

function openModal(config){
  ensureModalMounted();

  const { title, titleKey, submitLabel, submitKey, fields, onSubmit } = config;

  document.getElementById('modalTitle').textContent = titleKey ? T(titleKey) : (title || 'Add item');
  document.getElementById('modalSubmitBtn').textContent = submitKey ? T(submitKey) : (submitLabel || 'Save');

  const fieldsWrap = document.getElementById('modalFields');
  fieldsWrap.innerHTML = fields.map(f => {
    const fid = 'mf_' + f.id;
    const fLabel = f.labelKey ? T(f.labelKey) : f.label;
    const fPlaceholder = f.placeholderKey ? T(f.placeholderKey) : (f.placeholder || '');
    if (f.type === 'select'){
      const opts = (f.options || []).map(o => `<option value="${o}">${o}</option>`).join('');
      return `<div class="modal-field">
        <label for="${fid}">${fLabel}</label>
        <select id="${fid}">${opts}</select>
      </div>`;
    }
    return `<div class="modal-field">
      <label for="${fid}">${fLabel}</label>
      <input type="${f.type || 'text'}" id="${fid}"
             value="${f.value != null ? f.value : ''}"
             placeholder="${fPlaceholder}"
             ${f.required ? 'required' : ''}
             ${f.min != null ? `min="${f.min}"` : ''}
             ${f.step != null ? `step="${f.step}"` : ''}>
    </div>`;
  }).join('');

  const form = document.getElementById('modalForm');
  if (_modalSubmitHandler){
    form.removeEventListener('submit', _modalSubmitHandler);
  }
  _modalSubmitHandler = function(e){
    e.preventDefault();
    const values = {};
    fields.forEach(f => {
      values[f.id] = document.getElementById('mf_' + f.id).value;
    });
    if (typeof onSubmit === 'function') onSubmit(values);
    closeModal();
    form.reset();
  };
  form.addEventListener('submit', _modalSubmitHandler);

  requestAnimationFrame(() => {
    document.getElementById('modalOverlay').classList.add('open');
    const firstInput = fieldsWrap.querySelector('input, select');
    if (firstInput) firstInput.focus();
  });
}

function closeModal(){
  const overlay = document.getElementById('modalOverlay');
  if (overlay) overlay.classList.remove('open');
  const box = document.getElementById('modalBox');
  if (box) box.classList.remove('wide');
}

/* Flash a freshly-inserted row or card so new entries feel alive */
function flashElement(el, cls){
  el.classList.add(cls);
  el.addEventListener('animationend', () => el.classList.remove(cls), { once: true });
}

/* ============================================================
   Payment log — in-memory only (resets on refresh, since there's
   no shared backend yet). Keyed by invoice I.nb, each entry is a
   payment recorded against that invoice: { date, amount }.
   Once the Laravel API is wired in, this should be replaced by a
   real payments table linked to invoice_id, same idea as the
   BillableExpense we built for the Payments page.
   ============================================================ */
const PAYMENTS_LOG = {};

function computeInvoiceStatus(inv){
  const loggedPaid = (PAYMENTS_LOG[inv.inb] || []).reduce((s, p) => s + p.amount, 0);
  const paidSoFar = inv.paid + loggedPaid; 
  const balance = Math.max(inv.total - paidSoFar, 0);
  let status, statusClass;
  if (balance <= 0){ status = 'Paid'; statusClass = 'paid'; }
  else if (paidSoFar <= 0){ status = 'Unpaid'; statusClass = 'unpaid'; }
  else { status = `Paid $${paidSoFar.toLocaleString()} of $${inv.total.toLocaleString()}`; statusClass = 'partial'; }
  return { paidSoFar, balance, status, statusClass };
}

function renderInvoiceBlock(inv, amountOwedAtOpen){
  const { status, statusClass } = computeInvoiceStatus(inv);
  return `
    <div class="cust-inv-block" id="invblock-${inv.inb}" data-inb="${inv.inb}">
      <div class="cust-inv-row">
        <span class="cust-inv-id">#${inv.inb}<span class="cust-inv-date">${inv.date}</span></span>
        <span class="cust-inv-amt">$${inv.total.toLocaleString()}</span>
        <span class="cust-inv-status ${statusClass}">${status}</span>
      </div>
    </div>`;
}

function renderPaymentHistorySection(invoices, amountOwedAtOpen){
  // Flatten every logged payment across all of this customer's invoices
  // into one list, newest first, each still tagged with which invoice it
  // belongs to.
  const rows = [];
  invoices.forEach(inv => {
    (PAYMENTS_LOG[inv.inb] || []).forEach((p, idx) => {
      rows.push({ inb: inv.inb, idx, date: p.date, amount: p.amount });
    });
  });

  const listHtml = rows.length
    ? `<div class="cust-pay-list">` + rows.map(r => `
        <div class="cust-pay-line">
          <span class="link-tag">${r.inb}</span>
          <span class="cust-pay-date">${r.date}</span>
          <span class="cust-pay-amt">+$${r.amount.toLocaleString()}</span>
          <button type="button" class="cust-pay-btn wa" title="Send WhatsApp confirmation" data-inb="${r.inb}" data-idx="${r.idx}" data-action="whatsapp">
            <svg viewBox="0 0 24 24"><path d="M21 11.5a8.5 8.5 0 0 1-12.4 7.5L3 20l1.1-5.4A8.5 8.5 0 1 1 21 11.5z"/></svg>
          </button>
          <button type="button" class="cust-pay-btn pr" title="Print receipt" data-inb="${r.inb}" data-idx="${r.idx}" data-action="print">
            <svg viewBox="0 0 24 24"><path d="M6 9V2h12v7"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><path d="M6 14h12v8H6z"/></svg>
          </button>
        </div>`).join('') + `</div>`
    : `<div class="cust-inv-empty">No payments recorded yet.</div>`;

  const invoiceOptions = invoices.map(inv => `<option value="${inv.inb}">${inv.inb} — $${inv.total.toLocaleString()}</option>`).join('');

  return `
    <div id="payment-history-section">
      ${listHtml}
      <div class="cust-inv-record">
        <button type="button" class="cust-record-btn" data-action="toggle-record">+ Record payment</button>
        <div class="cust-record-form" id="record-form-payment" style="display:none;">
          ${invoices.length > 1 ? `<select class="rp-invoice">${invoiceOptions}</select>` : `<input type="hidden" class="rp-invoice" value="${invoices[0]?.inb || ''}">`}
          <input type="date" class="rp-date" value="${new Date().toISOString().slice(0,10)}">
          <input type="number" class="rp-amount" placeholder="Amount ($)" min="0" step="0.01">
          <button type="button" class="rp-save" data-action="save-payment">Save</button>
        </div>
      </div>
    </div>`;
}

/* ============================================================
   Customer detail view — opened by clicking a row.
   Shows every stored field and lets the full address description
   (street / building / floor) be added or edited.
   ============================================================ */
function openCustomerDetail(row){
  ensureModalMounted();
  const box = document.getElementById('modalBox');
  box.classList.add('wide');

  // Invoice history per customer — matches the single most-recent invoice
  // each customer has on the Invoices page (same I.nb, date, and total).
  // NOTE: the Invoices page only carries one sample invoice per customer
  // right now, and this "Total spent" / "Orders" count on this page implies
  // more history than that (e.g. multiple orders for some customers) — so
  // this list is necessarily incomplete until invoices and customers share
  // one real data store with a full order history per customer.
  

  const cid = row.dataset.cid;
  const name = row.querySelector('.cust-name')?.textContent.trim() || '—';
  const initials = row.querySelector('.cust-avatar')?.textContent.trim() || '—';
  const typePillEl = row.querySelector('.type-pill');
  const type = typePillEl ? typePillEl.textContent.trim() : '—';
  const typeClass = typePillEl && typePillEl.classList.contains('wholesale') ? 'wholesale' : 'normal';
  const cells = row.querySelectorAll('td');
  const address = cells[3] ? cells[3].textContent.trim() : '—';
  const phone = cells[4] ? cells[4].textContent.trim() : '—';
  const orders = cells[5] ? cells[5].textContent.trim() : '—';
  const totalSpent = cells[6] ? cells[6].textContent.trim() : '—';
  const debtPillEl = row.querySelector('.debt-pill');
  const debt = debtPillEl ? debtPillEl.textContent.trim() : '—';
  const owesMatch = debt.match(/[\d,]+/);
  const amountOwed = owesMatch ? Number(owesMatch[0].replace(/,/g, '')) : 0;
  const addressDesc = row.dataset.addressDesc || '';

  const invoices = CUSTOMER_INVOICES[cid] || [];
  const invoicesHtml = invoices.length
    ? `<div class="cust-inv-list">` + invoices.map(inv => renderInvoiceBlock(inv, amountOwed)).join('') + `</div>`
    : `<div class="cust-inv-empty">No invoices on file for this customer yet.</div>`;

  document.getElementById('modalTitle').textContent = name;
  document.getElementById('modalSubmitBtn').textContent = 'Save';

  // The top summary (name / type / phone / address) is either read-only
  // spans or, once "Edit" is clicked, swapped for input fields in place.
  // Orders / Total spent / Debt status stay read-only since they're
  // computed from real order history, not something you type in directly.
  function renderSummaryBlock(editing){
    //-------------------------------------------------------------------------
    if (!editing){
      return `
      <div class="cust-detail-block" id="cust-summary-block">
        <div class="cust-detail-head">
          <div class="cust-avatar">${initials}</div>
          <div>
            <div class="cust-detail-name">${name}</div>
            <div class="cust-detail-id mono">${cid}</div>
          </div>
          <span class="type-pill ${typeClass}">${type}</span>
          <button type="button" class="detail-edit-btn" data-action="edit-summary" aria-label="Edit customer info">
            <svg viewBox="0 0 24 24"><path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>
            Edit
          </button>
        </div>
        <div class="cust-detail-grid">
          <div class="cust-detail-item"><span class="label">Phone</span><span class="value mono">${phone}</span></div>
          <div class="cust-detail-item"><span class="label">Address</span><span class="value">${address}</span></div>
          <div class="cust-detail-item"><span class="label">Orders</span><span class="value">${orders}</span></div>
          <div class="cust-detail-item"><span class="label">Total spent</span><span class="value mono">${totalSpent}</span></div>
          <div class="cust-detail-item full"><span class="label">Debt status</span><span class="value">${debt}</span></div>
        </div>
      </div>`;
    }
    return `
    <div class="cust-detail-block" id="cust-summary-block">
      <div class="cust-detail-head cust-detail-head-editing">
        <div class="cust-avatar">${initials}</div>
        <div class="modal-field" style="flex:1;margin-bottom:0;">
          <label for="cd_name">Full name</label>
          <input id="cd_name" value="${name}">
        </div>
        <div class="modal-field" style="margin-bottom:0;min-width:140px;">
          <label for="cd_type">Type</label>
          <select id="cd_type">
            <option ${type === 'Normal' ? 'selected' : ''}>Normal</option>
            <option ${type === 'Wholesale' ? 'selected' : ''}>Wholesale</option>
          </select>
        </div>
      </div>
      <div class="cust-detail-grid">
        <div class="modal-field"><label for="cd_phone">Phone</label><input id="cd_phone" value="${phone}"></div>
        <div class="modal-field"><label for="cd_address">Address</label><input id="cd_address" value="${address}"></div>
        <div class="cust-detail-item"><span class="label">Orders</span><span class="value">${orders}</span></div>
        <div class="cust-detail-item"><span class="label">Total spent</span><span class="value mono">${totalSpent}</span></div>
        <div class="cust-detail-item full"><span class="label">Debt status</span><span class="value">${debt}</span></div>
      </div>
      <div class="edit-hint">Editing — click Save at the bottom of this window to apply your changes.</div>
    </div>`;
  }

  const fieldsWrap = document.getElementById('modalFields');
  fieldsWrap.innerHTML = `
    ${renderSummaryBlock(false)}<div class="modal-field"><label>Invoices</label></div>
    ${invoicesHtml}
    <div class="modal-field"><label>Payment history</label></div>
    ${renderPaymentHistorySection(invoices, amountOwed)}
    <div class="modal-field">
      <label for="cd_addressDesc">Full address description (street, building, floor)</label>
      <textarea id="cd_addressDesc" rows="3" placeholder="e.g. Hamra St., Rimal Building, 4th floor, apt 12">${addressDesc}</textarea>
    </div>
  `;

  const form = document.getElementById('modalForm');
  if (_fieldsClickHandler){
    fieldsWrap.removeEventListener('click', _fieldsClickHandler);
  }
  _fieldsClickHandler = function(e){
    const btn = e.target.closest('[data-action]');
    if (!btn) return;
    const action = btn.dataset.action;

    if (action === 'edit-summary'){
      document.getElementById('cust-summary-block').outerHTML = renderSummaryBlock(true);
      document.getElementById('cd_name')?.focus();
      return;
    }

    if (action === 'toggle-record'){
      const formEl = document.getElementById('record-form-payment');
      if (formEl) formEl.style.display = formEl.style.display === 'none' ? 'flex' : 'none';
      return;
    }

    if (action === 'save-payment'){
      const section = document.getElementById('payment-history-section');
      const invInput = section.querySelector('.rp-invoice');
      const dateInput = section.querySelector('.rp-date');
      const amountInput = section.querySelector('.rp-amount');
      const inb = invInput.value;
      const inv = invoices.find(x => x.inb === inb);
      const amount = Number(amountInput.value) || 0;
      if (!inv || amount <= 0){
        alert('Pick an invoice and enter an amount greater than $0 before saving.');
        return;
      }
      const dateLabel = dateInput.value
        ? new Date(dateInput.value + 'T00:00:00').toDateString().toUpperCase().split(' ').slice(1).join(' ')
        : new Date().toDateString().toUpperCase().split(' ').slice(1).join(' ');

      if (!PAYMENTS_LOG[inb]) PAYMENTS_LOG[inb] = [];
      PAYMENTS_LOG[inb].push({ date: dateLabel, amount });

      // Refresh the invoice's own status badge and the payment history list.
      const invBlock = document.getElementById(`invblock-${inb}`);
      if (invBlock) invBlock.outerHTML = renderInvoiceBlock(inv, amountOwed);
      section.outerHTML = renderPaymentHistorySection(invoices, amountOwed);
      flashElement(document.getElementById('payment-history-section'), 'row-flash');

      // Reflect the new balance back on the main table's debt pill too.
      const totalBalance = invoices.reduce((sum, i) => sum + computeInvoiceStatus(i).balance, 0);
      const mainDebtPill = row.querySelector('.debt-pill');
      if (mainDebtPill){
        if (totalBalance <= 0){
          mainDebtPill.textContent = 'Clear';
          mainDebtPill.className = 'debt-pill clear';
        } else {
          mainDebtPill.textContent = `Owes $${totalBalance.toLocaleString()}`;
          mainDebtPill.className = 'debt-pill owes';
        }
      }
      return;
    }

    if (action === 'whatsapp'){
      const inb = btn.dataset.inb;
      const inv = invoices.find(x => x.inb === inb);
      if (!inv) return;
      const { balance } = computeInvoiceStatus(inv);
      const payments = PAYMENTS_LOG[inb] || [];
      const idx = Number(btn.dataset.idx);
      const payment = payments[idx];
      if (!payment) return;
      const digits = phone.replace(/\D/g, '');
      const message =
        `Hi ${name}, this confirms we received your payment of $${payment.amount.toLocaleString()} ` +
        `on ${payment.date} for invoice #${inb}. ` +
        (balance > 0 ? `Remaining balance: $${balance.toLocaleString()}.` : `Your invoice is now fully paid.`) +
        ` Thank you — MN Electronics`;
      window.open(`https://wa.me/${digits}?text=${encodeURIComponent(message)}`, '_blank');
      return;
    }

    if (action === 'print'){
      const inb = btn.dataset.inb;
      const inv = invoices.find(x => x.inb === inb);
      if (!inv) return;
      const { balance } = computeInvoiceStatus(inv);
      const payments = PAYMENTS_LOG[inb] || [];
      const idx = Number(btn.dataset.idx);
      const payment = payments[idx];
      if (!payment) return;
      document.getElementById('pr_custName').textContent = name;
      document.getElementById('pr_invoice').textContent = inb;
      document.getElementById('pr_date').textContent = payment.date;
      document.getElementById('pr_amount').textContent = `$${payment.amount.toLocaleString()}`;
      document.getElementById('pr_invTotal').textContent = `$${inv.total.toLocaleString()}`;
      document.getElementById('pr_balance').textContent = `$${balance.toLocaleString()}`;
      window.print();
      return;
    }
  };
  fieldsWrap.addEventListener('click', _fieldsClickHandler);

  if (_modalSubmitHandler){
    form.removeEventListener('submit', _modalSubmitHandler);
  }
  _modalSubmitHandler = function(e){
    e.preventDefault();
    row.dataset.addressDesc = document.getElementById('cd_addressDesc').value.trim();

    // If the summary section was switched into edit mode, its inputs will
    // be present — read them back and update the main table row to match.
    const nameInput = document.getElementById('cd_name');
    if (nameInput){
      const newName = nameInput.value.trim() || name;
      const newType = document.getElementById('cd_type').value;
      const newPhone = document.getElementById('cd_phone').value.trim();
      const newAddress = document.getElementById('cd_address').value.trim();
      const newInitials = newName.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() || initials;

      row.querySelector('.cust-name').textContent = newName;
      row.querySelector('.cust-cell .cust-avatar').textContent = newInitials;
      const tPill = row.querySelector('.type-pill');
      tPill.textContent = newType;
      tPill.className = `type-pill ${newType.toLowerCase() === 'wholesale' ? 'wholesale' : 'normal'}`;

      // Column order: 0 name, 1 C.ID, 2 type, 3 address, 4 phone, 5 orders,
      // 6 total spent, 7 debt status.
      const rowCells = row.querySelectorAll('td');
      if (rowCells[3]) rowCells[3].textContent = newAddress;
      if (rowCells[4]) rowCells[4].textContent = newPhone;
    }

    flashElement(row, 'row-flash');
    closeModal();
    box.classList.remove('wide');
    form.reset();
  };
  form.addEventListener('submit', _modalSubmitHandler);

  requestAnimationFrame(() => {
    document.getElementById('modalOverlay').classList.add('open');
    document.getElementById('cd_addressDesc').focus();
  });
}

  /* ---- page logic ---- */
  

  const searchInput = document.getElementById('customerSearch');
  const rows = Array.from(document.querySelectorAll('#customerBody tr'));
 //const customerBody = document.getElementById('customerBody');
  const resultCount = document.getElementById('resultCount');
  const emptyState = document.getElementById('emptyState');
  const totalCount = rows.length;

  function runFilter(){
    const q = searchInput.value.trim().toLowerCase();
    let visible = 0;
    rows.forEach(row => {
      const name = (row.querySelector('.cust-name')?.textContent || '').toLowerCase();
      const cid = row.dataset.cid.toLowerCase();
      const match = q === '' || name.includes(q) || cid.includes(q);
      row.style.display = match ? '' : 'none';
      if (match) visible++;
    });
    resultCount.innerHTML = `Showing <strong>${visible}</strong> of <strong>1,930</strong> customers`;
    emptyState.style.display = visible === 0 ? 'block' : 'none';
  }
  searchInput.addEventListener('input', runFilter);

  // ---- click a row to view full customer details ----
  //rows.forEach(row => row.addEventListener('click', () => openCustomerDetail(row)));
const customerBody = document.getElementById('customerBody');
customerBody.addEventListener('click', (e) => {
  const row = e.target.closest('tr');
  if (row && customerBody.contains(row)) {
    openCustomerDetail(row);
  }
});
  // ---- Add customer (hardcoded, in-memory only — resets on refresh) ----
  let customerCounter = 113;
  document.getElementById('addCustomerBtn').addEventListener('click', () => {
    openModal({
      title: 'New customer',
      titleKey: 'cust.modal.title',
      submitLabel: 'Add customer',
      submitKey: 'cust.modal.submit',
      fields: [
        { id: 'name',        label: 'Full name',   labelKey: 'cust.field.name',   placeholder: 'e.g. K. Saad', required: true },
        { id: 'type',        label: 'Type',        labelKey: 'prod.col.type',     type: 'select', options: ['Normal', 'Wholesale'] },
        { id: 'address',     label: 'Address',     labelKey: 'cust.col.address',  placeholder: 'e.g. Beirut, Mar Mikhael' },
        { id: 'addressDesc', label: 'Address description (street, building, floor)', labelKey: 'cust.field.addressDesc', placeholder: 'e.g. Mar Mikhael St., Karam Building, 2nd floor' },
        { id: 'phone',       label: 'Phone nb',    labelKey: 'cat.col.phone',     placeholder: 'e.g. +961 71 000 000' }
      ],
      onSubmit(v){
        const idStr = String(customerCounter).padStart(4, '0');
        customerCounter++;
        const cid = `C-${idStr}`;
        const initials = v.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
        const typeClass = v.type.toLowerCase() === 'wholesale' ? 'wholesale' : 'normal';

        const tbody = document.getElementById('customerBody');
        const row = document.createElement('tr');
        row.dataset.cid = cid;
        row.dataset.addressDesc = v.addressDesc || '';
        row.innerHTML = `
          <td>
            <div class="cust-cell">
              <div class="cust-avatar">${initials}</div>
              <div><div class="cust-name">${v.name}</div></div>
            </div>
          </td>
          <td class="mono">${cid}</td>
          <td><span class="type-pill ${typeClass}">${v.type}</span></td>
          <td>${v.address}</td>
          <td class="mono">${v.phone}</td>
          <td><span class="orders-pill">0 orders</span></td>
          <td class="mono">$0</td>
          <td><span class="debt-pill clear" data-i18n="cust.debtClear">Clear</span></td>`;
       row.addEventListener('click', () => openCustomerDetail(row));
      
        tbody.prepend(row);
        flashElement(row, 'row-flash');
        rows.unshift(row);
         createCustomer(v.name.split(' ')[0], v.name.split(' ')[1] || '', v.address,v.phone,v.addressDesc ,v.type);
      }
    });
  });
document.addEventListener('DOMContentLoaded',()=> {
  getCustomers()
})