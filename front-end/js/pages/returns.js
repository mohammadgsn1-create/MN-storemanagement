import {server,apis,getData,formatDisplayDate} from "../tools/apis.js"
// returns.js — page-specific logic for returns.html
// Uses shared shell behavior in js/base.js
 
  /* ---- inlined modal.js ---- */
  
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
 
  /* ---- page logic ---- */
  
 
  // ---- source data — matches the same sample customers/invoices used on
  // the Customers and Invoices pages, so a return here references a real
  // invoice you'd recognize elsewhere. Once invoices share a real database,
  // this lookup becomes a live query instead of a hardcoded object.
  const CUSTOMERS = [
    { id:'C-0091', name:'R. Haddad' },
    { id:'C-0104', name:'S. Khalil' },
    { id:'C-0077', name:'N. Aziz' },
    { id:'C-0063', name:'L. Fares' },
    { id:'C-0058', name:'D. Nassar' },
    { id:'C-0112', name:'M. Jaber' }
  ];
 
  const INVOICES = {
    'C-0091': [{ inb:'INV-0417', date:'AUG 22 2026', items:[
      { sku:'S-0041', name:'QuietCool 410 Fridge', qty:1, price:1240 }
    ]}],
    'C-0104': [{ inb:'INV-0416', date:'AUG 21 2026', items:[
      { sku:'S-0038', name:'Torrent 9kg Washer', qty:1, price:890 }
    ]}],
    'C-0077': [{ inb:'INV-0415', date:'AUG 20 2026', items:[
      { sku:'S-0052', name:'Ember 5-Burner Range', qty:1, price:1650 },
      { sku:'S-0027', name:'Ember 2-Slot Toaster', qty:2, price:360 }
    ]}],
    'C-0063': [{ inb:'INV-0414', date:'AUG 19 2026', items:[
      { sku:'S-0019', name:'Climate Air AC-12', qty:1, price:720 }
    ]}],
    'C-0058': [{ inb:'INV-0413', date:'AUG 19 2026', items:[
      { sku:'S-0041', name:'QuietCool 410 Fridge', qty:1, price:1240 }
    ]}],
    'C-0112': [{ inb:'INV-0412', date:'AUG 18 2026', items:[
      { sku:'S-0044', name:'Hydra Slim Dishwasher', qty:1, price:1504 }
    ]}]
  };
 
  const PAYMENT_TYPES = ['Cash', 'OMT', 'Bank Check', 'Whish Money', 'Other'];
 
  let returnCounter = 3;
  const getRevenue = async () => {
  try {
    const data = await getData(`${server}${apis.get_customers}`);
    if (!Array.isArray(data)) return;
 
    for (const cust of data) {
      if(cust.return.length===0){
        continue
      }
      const custId = `C-${cust.id}`;
 
      // group line items by invoice_id so items on the same invoice
      // end up together in one `items: []`, not one invoice entry each
      const invoicesById = {};
      for (const line of cust.invoice_item) {
        const inb = `INV-${line.invoice_id}`;
        if (!invoicesById[inb]) {
          invoicesById[inb] = { inb, date: formatDisplayDate(line.date), items: [] };
        }
        if (line.item) {
          invoicesById[inb].items.push({
            sku: `S-${line.item.id}`,
            name: line.item.name,
            qty: line.quantity || 1,       // guard against quantity: 0
            price: line.item.price,
            sn:line.item.serial_number         // unit price — NOT line.paid
          });
        }
      }
 
      INVOICES[custId] = Object.values(invoicesById);
      CUSTOMERS.push({
        id: custId,
        name: `${cust.first_name.charAt(0).toUpperCase()}. ${cust.last_name}`
      });
    }
 
    console.log(`getRevenue: loaded ${data.length} customers from the API, CUSTOMERS now has ${CUSTOMERS.length} total`);
    renderInvoiceRows();
  } catch (err) {
    console.error('getRevenue failed:', err);
  } finally {
    const addBtn = document.getElementById('addReturnBtn');
    if (addBtn) addBtn.disabled = false;
  }
};
 
// ---- paints fetched invoices into the #returnsBody table ----
// NOTE: this table's columns were built for actual *returns* (rid, date,
// customer, product, invoice, refund $, method). Raw invoices don't have
// a return id or refund method, so those columns are filled with the
// invoice number / a placeholder. Swap this out once there's a real
// "orders" or "revenue" table/section to render into instead.
function renderInvoiceRows(){
  const tbody = document.getElementById('returnsBody');
  if (!tbody) return;
 
  for (const custId in INVOICES) {
    const customer = CUSTOMERS.find(c => c.id === custId);
    if (!customer) continue;
 
    for (const inv of INVOICES[custId]) {
      if (inv.items.length === 0) continue; // skip invoices with no line items (e.g. quantity: 0 only)
 
      const total = inv.items.reduce((s, i) => s + i.price * i.qty, 0);
      const productLabel = inv.items.length === 1 ? inv.items[0].name : `${inv.items.length} items`;
      const qtyLabel = inv.items.length === 1 ? `Qty ${inv.items[0].qty}` : '';
 
      const row = document.createElement('tr');
      row.dataset.rid = inv.inb;
      row.dataset.refund = total;
      row.dataset.customer = customer.name;
      row.dataset.product = inv.items.map(i => i.name).join(', ');
      row.innerHTML = `
        <td class="mono">${inv.inb}</td>
        <td class="mono">${inv.date}</td>
        <td>${customer.name}</td>
        <td>${productLabel}${qtyLabel ? `<div class="item-sub mono">${qtyLabel}</div>` : ''}</td>
        <td class="mono">${inv.inb}</td>
        <td class="mono">$${total.toLocaleString()}</td>
        <td><span class="method-tag">-</span></td>`;
      tbody.appendChild(row);
    }
  }
 
  updateSummary();
  runFilter();
}
  // ---- summary totals, recalculated from whatever is in the table ----
  function updateSummary(){
    const rows = Array.from(document.querySelectorAll('#returnsBody tr'));
    const total = rows.reduce((s, r) => s + (Number(r.dataset.refund) || 0), 0);
    document.getElementById('summaryCount').textContent = rows.length;
    document.getElementById('summaryRefund').textContent = `$${total.toLocaleString()}`;
  }
 
  // ---- search across customer / product / return nb ----
  const searchInput = document.getElementById('returnSearch');
  const emptyState = document.getElementById('emptyState');
  function runFilter(){
    const q = searchInput.value.trim().toLowerCase();
    const rows = Array.from(document.querySelectorAll('#returnsBody tr'));
    let visible = 0;
    rows.forEach(row => {
      const rid = row.dataset.rid.toLowerCase();
      const customer = row.dataset.customer.toLowerCase();
      const product = row.dataset.product.toLowerCase();
      const match = q === '' || rid.includes(q) || customer.includes(q) || product.includes(q);
      row.style.display = match ? '' : 'none';
      if (match) visible++;
    });
    emptyState.style.display = visible === 0 ? 'block' : 'none';
  }
  searchInput.addEventListener('input', runFilter);
 
  // ---- New return modal ----
  function openReturnModal(){
    ensureModalMounted();
    const box = document.getElementById('modalBox');
    box.classList.add('wide');
    document.getElementById('modalTitle').textContent = 'New return';
    document.getElementById('modalSubmitBtn').textContent = 'Process return';
 
    const fieldsWrap = document.getElementById('modalFields');
    fieldsWrap.innerHTML = `
      <div class="modal-field">
        <label for="ret_custSearch">Customer</label>
        <div class="search-select" id="ret_custWrap">
          <input type="text" id="ret_custSearch" placeholder="Type a customer name…" autocomplete="off">
          <input type="hidden" id="ret_custSelect" value="">
          <div class="search-dropdown" id="ret_custDropdown"></div>
        </div>
      </div>
 
      <div class="modal-field">
        <label for="ret_invoiceSelect">Invoice</label>
        <select id="ret_invoiceSelect" disabled><option value="">Pick a customer first…</option></select>
      </div>
 
      <div class="modal-field"><label>Items to return</label></div>
      <div class="ret-item-notice" id="ret_itemNotice">Pick an invoice above to see its items.</div>
      <div id="ret_itemRows"></div>
 
      <div class="modal-field">
        <label for="ret_method">Refund method</label>
        <select id="ret_method">${PAYMENT_TYPES.map(t => `<option>${t}</option>`).join('')}</select>
      </div>
      <div class="modal-field">
        <label for="ret_reason">Reason (optional)</label>
        <textarea id="ret_reason" rows="2" placeholder="e.g. Customer changed their mind, defective unit…"></textarea>
      </div>
 
      <div class="ret-refund-row">
        <span>Refund total</span>
        <span class="mono" id="ret_refundTotal">$0</span>
      </div>
    `;
 
    // ---- customer search + autofill ----
    const custSearchInput = document.getElementById('ret_custSearch');
    const custHidden = document.getElementById('ret_custSelect');
    const custDropdown = document.getElementById('ret_custDropdown');
    const custWrap = document.getElementById('ret_custWrap');
    const invoiceSelect = document.getElementById('ret_invoiceSelect');
    const itemNotice = document.getElementById('ret_itemNotice');
    const itemRowsWrap = document.getElementById('ret_itemRows');
    const refundTotalEl = document.getElementById('ret_refundTotal');
 
    let currentInvoice = null;
 
    function renderCustDropdown(query){
      const q = query.trim().toLowerCase();
      const matches = q === '' ? CUSTOMERS : CUSTOMERS.filter(c =>
        c.name.toLowerCase().includes(q) || c.id.toLowerCase().includes(q)
      );
      custDropdown.innerHTML = matches.length
        ? matches.map(c => `
            <div class="search-dropdown-item" data-id="${c.id}">
              ${c.name}
              <span class="sd-sub">${c.id}</span>
            </div>`).join('')
        : `<div class="search-dropdown-empty">No matching customer</div>`;
      custDropdown.classList.add('open');
    }
    custSearchInput.addEventListener('focus', () => renderCustDropdown(custSearchInput.value));
    custSearchInput.addEventListener('input', () => {
      custHidden.value = '';
      custWrap.classList.remove('has-value');
      resetInvoiceAndItems();
      renderCustDropdown(custSearchInput.value);
    });
    custSearchInput.addEventListener('blur', () => {
      setTimeout(() => custDropdown.classList.remove('open'), 150);
    });
    custDropdown.addEventListener('mousedown', (e) => {
      const item = e.target.closest('.search-dropdown-item[data-id]');
      if (!item) return;
      e.preventDefault();
      const c = CUSTOMERS.find(x => x.id === item.dataset.id);
      if (!c) return;
      custHidden.value = c.id;
      custSearchInput.value = c.name;
      custWrap.classList.add('has-value');
      custDropdown.classList.remove('open');
      populateInvoicesForCustomer(c.id);
    });
 
    function resetInvoiceAndItems(){
      invoiceSelect.innerHTML = `<option value="">Pick a customer first…</option>`;
      invoiceSelect.disabled = true;
      currentInvoice = null;
      itemNotice.style.display = '';
      itemNotice.textContent = 'Pick an invoice above to see its items.';
      itemRowsWrap.innerHTML = '';
      refundTotalEl.textContent = '$0';
    }
 
    function populateInvoicesForCustomer(custId){
      const invoices = INVOICES[custId] || [];
      if (invoices.length === 0){
        invoiceSelect.innerHTML = `<option value="">No invoices on file</option>`;
        invoiceSelect.disabled = true;
        itemNotice.textContent = 'This customer has no invoices on file yet.';
        itemRowsWrap.innerHTML = '';
        refundTotalEl.textContent = '$0';
        return;
      }
      invoiceSelect.innerHTML = `<option value="">Select an invoice…</option>` +
        invoices.map(inv => `<option value="${inv.inb}">${inv.inb} — ${inv.date} — $${inv.items.reduce((s,i)=>s+i.price*i.qty,0).toLocaleString()}</option>`).join('');
      invoiceSelect.disabled = false;
      currentInvoice = null;
      itemNotice.style.display = '';
      itemNotice.textContent = 'Pick an invoice above to see its items.';
      itemRowsWrap.innerHTML = '';
      refundTotalEl.textContent = '$0';
    }
 
    invoiceSelect.addEventListener('change', () => {
      const custId = custHidden.value;
      const invoices = INVOICES[custId] || [];
      const inv = invoices.find(i => i.inb === invoiceSelect.value);
      currentInvoice = inv || null;
      renderItemRows();
    });
 
    // Every item on the invoice defaults to fully checked, with its full
    // purchased quantity — auto-filling exactly what the customer bought,
    // its date (via the invoice), and its price, per the request that
    // everything fill in automatically once the invoice is picked.
    function renderItemRows(){
      if (!currentInvoice){
        itemRowsWrap.innerHTML = '';
        itemNotice.style.display = '';
        refundTotalEl.textContent = '$0';
        return;
      }
      itemNotice.style.display = 'none';
      itemRowsWrap.innerHTML = currentInvoice.items.map((it, idx) => `
        <div class="ret-item-row" data-idx="${idx}">
          <input type="checkbox" class="ret-item-check" checked>
          <div class="ret-item-info">
            <div class="ret-item-name">${it.name}</div>
            <div class="ret-item-meta mono">${it.sku} · $${it.price.toLocaleString()} each · purchased ${currentInvoice.date}</div>
          </div>
          <div class="ret-item-qty">
            <label>Qty</label>
            <input type="number" class="ret-item-qtyinput" value="${it.qty}" min="1" max="${it.qty}">
          </div>
        </div>
      `).join('');
      itemRowsWrap.querySelectorAll('.ret-item-row').forEach(row => {
        row.querySelector('.ret-item-check').addEventListener('change', recalcRefund);
        row.querySelector('.ret-item-qtyinput').addEventListener('input', recalcRefund);
      });
      recalcRefund();
    }
 
    function recalcRefund(){
      if (!currentInvoice){ refundTotalEl.textContent = '$0'; return; }
      let total = 0;
      itemRowsWrap.querySelectorAll('.ret-item-row').forEach(row => {
        const idx = Number(row.dataset.idx);
        const checked = row.querySelector('.ret-item-check').checked;
        if (!checked) return;
        const it = currentInvoice.items[idx];
        const qtyInput = row.querySelector('.ret-item-qtyinput');
        const qty = Math.min(it.qty, Math.max(1, Number(qtyInput.value) || 1));
        qtyInput.value = qty;
        total += qty * it.price;
      });
      refundTotalEl.textContent = `$${total.toLocaleString()}`;
    }
 
    const form = document.getElementById('modalForm');
    if (_modalSubmitHandler){
      form.removeEventListener('submit', _modalSubmitHandler);
    }
    _modalSubmitHandler = async function(e){
      e.preventDefault();
      const custId = custHidden.value;
      const customer = CUSTOMERS.find(c => c.id === custId);
      if (!customer || !currentInvoice){
        alert('Pick a customer and one of their invoices before processing the return.');
        return;
      }
      const selectedRows = Array.from(itemRowsWrap.querySelectorAll('.ret-item-row'))
        .filter(row => row.querySelector('.ret-item-check').checked)
        .map(row => {
          const idx = Number(row.dataset.idx);
          const it = currentInvoice.items[idx];
          const qty = Number(row.querySelector('.ret-item-qtyinput').value) || 0;
          return { name: it.name, sku: it.sku, qty, price: it.price, subtotal: qty * it.price,serial_number:it.sn };
        })
        .filter(r => r.qty > 0);
 
      if (selectedRows.length === 0){
        alert('Select at least one item to return.');
        return;
      }
 
      const method = document.getElementById('ret_method').value;
      const reason = document.getElementById('ret_reason').value;
      const refundTotal = selectedRows.reduce((s, r) => s + r.subtotal, 0);
 
      // ---- persist the return to the backend ----
      // TODO: swap `apis.create_return` / `postData` for your real endpoint
      // and POST helper names once they're decided (postData needs adding
      // to apis.js — same shape as getData, just with method: 'POST' and
      // a JSON body).
      const submitBtn = document.getElementById('modalSubmitBtn');
      submitBtn.disabled = true;
      let created;
     const date = new Date().toDateString().toUpperCase().split(' ').slice(1).join(' ');
     
      const payload={
          customer_id: custId.slice(2),
          invoice_id: currentInvoice.inb.slice(4),
          serial_number: selectedRows[0].serial_number,
          item_name:selectedRows[0].name,
          date:date,
          total_price:selectedRows[0].price,
          pay_type:method,
          quantity: selectedRows[0].qty
        }
      console.log(payload)
      try {
        created = await getData(`${server}${apis.create_return}`, payload);
        if(created.accept){
          alert('Returned successfully')
        }
        else{
          alert('Something went wrong')
          console.log(created)
        }
      } catch (err) {
        console.error('Failed to create return:', err);
        alert('Could not save the return. Please try again.');
        submitBtn.disabled = false;
        return;
      }
      submitBtn.disabled = false;
      
      // Use the backend's own id for the row if it returns one, otherwise
      // fall back to the local counter.
      const idStr = created?.id != null
        ? String(created.id).padStart(4, '0')
        : String(returnCounter).padStart(4, '0');
      returnCounter++;
      const rid = `RET-${idStr}`;
      const today = new Date().toDateString().toUpperCase().split(' ').slice(1).join(' ');
      const productLabel = selectedRows.length === 1
        ? selectedRows[0].name
        : `${selectedRows.length} items`;
      const qtyLabel = selectedRows.length === 1 ? `Qty ${selectedRows[0].qty}` : '';
 
      const tbody = document.getElementById('returnsBody');
      const row = document.createElement('tr');
      row.dataset.rid = rid;
      row.dataset.refund = refundTotal;
      row.dataset.customer = customer.name;
      row.dataset.product = selectedRows.map(r => r.name).join(', ');
      row.innerHTML = `
        <td class="mono">${rid}</td>
        <td class="mono">${today}</td>
        <td>${customer.name}</td>
        <td>${productLabel}${qtyLabel ? `<div class="item-sub mono">${qtyLabel}</div>` : ''}</td>
        <td class="mono">${currentInvoice.inb}</td>
        <td class="mono">$${refundTotal.toLocaleString()}</td>
        <td><span class="method-tag">${method}</span></td>`;
      tbody.prepend(row);
      flashElement(row, 'row-flash');
      updateSummary();
      runFilter();
 
      closeModal();
      box.classList.remove('wide');
      form.reset();
    };
    form.addEventListener('submit', _modalSubmitHandler);
 
    requestAnimationFrame(() => {
      document.getElementById('modalOverlay').classList.add('open');
      custSearchInput.focus();
    });
  }
 
  let _modalSubmitHandler = null;
  const addReturnBtn = document.getElementById('addReturnBtn');
  addReturnBtn.disabled = true; // re-enabled once getRevenue() finishes (success or failure)
  addReturnBtn.addEventListener('click', openReturnModal);
 
  updateSummary();
document.addEventListener('DOMContentLoaded', () => {
  getRevenue()
})