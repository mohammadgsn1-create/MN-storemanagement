import {server,apis} from "../tools/apis.js"
// invoices.js — page-specific logic for invoices.html
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
}

/* Flash a freshly-inserted row or card so new entries feel alive */
function flashElement(el, cls){
  el.classList.add(cls);
  el.addEventListener('animationend', () => el.classList.remove(cls), { once: true });
}

/* ============================================================
   New-invoice pop-up: customer / item-or-service / payment
   ============================================================ */

const CUSTOMERS = [
  { id:'C-0091', first:'R.', last:'Haddad', phone:'+961 71 442 018', address:'Beirut, Hamra St.',     addressDesc:'Near ABC Mall, 3rd floor, blue door' },
  { id:'C-0104', first:'S.', last:'Khalil',  phone:'+961 76 220 985', address:'Sidon, Riad El Solh',    addressDesc:'Above Byblos Bank branch' },
  { id:'C-0077', first:'N.', last:'Aziz',    phone:'+961 70 815 340', address:'Beirut, Verdun',         addressDesc:'Verdun 730 tower, 5th floor' },
  { id:'C-0063', first:'L.', last:'Fares',   phone:'+961 78 502 671', address:'Tyre, Old Souk',         addressDesc:'Next to the fish market entrance' },
  { id:'C-0058', first:'D.', last:'Nassar',  phone:'+961 71 990 214', address:'Beirut, Achrafieh',      addressDesc:'Sassine Square, villa 12' },
  { id:'C-0112', first:'M.', last:'Jaber',   phone:'+961 76 118 774', address:'Sidon, Corniche',        addressDesc:'Seaside building, ground floor' }
];

const PRODUCTS = [
  { sku:'S-0041', name:'QuietCool 410 Fridge',    price:1240, description:'410L capacity, inverter compressor, frost-free' },
  { sku:'S-0038', name:'Torrent 9kg Washer',      price:890,  description:'9kg drum, 1400 RPM spin, 15 wash programs' },
  { sku:'S-0052', name:'Ember 5-Burner Range',    price:1650, description:'5-burner gas range with electric oven' },
  { sku:'S-0027', name:'Ember 2-Slot Toaster',    price:360,  description:'2-slot toaster, 7 browning levels' },
  { sku:'S-0019', name:'Climate Air AC-12',       price:720,  description:'12,000 BTU split unit, inverter' },
  { sku:'S-0044', name:'Hydra Slim Dishwasher',   price:1504, description:'Slimline dishwasher, 10 place settings' }
];

const PAYMENT_TYPES = ['Cash', 'OMT', 'Bank Check', 'Whish Money', 'Other'];

async function openInvoiceModal(){
  ensureModalMounted();
   const getItems=await axios.post(`${server}${apis.get_items}`)
  const getCustomers=await axios.post(`${server}${apis.get_customers}`)
  if(getItems.status!==200&&getItems.status!==201&&getCustomers.status!==200&&getCustomers.status){
    alert(getItems.status)
    return;
  }
  else{
   const apiProducts = (getItems.data || []).map(p => ({
  ...p,
  sku: String(p.sku || p.id || p._id), // ضمان وجود sku كـ String
  name: p.name || p.item_name || '',
  price: Number(p.price || 0),
  description: p.description || ''
}));

// توحيد هيكلية بيانات الزبائن القادمة من الـ API
const apiCustomers = (getCustomers.data || []).map(c => ({
  ...c,
  id: String(c.id || c._id), // ضمان وجود id كـ String
  first: c.first || c.first_name || '',
  last: c.last || c.last_name || '',
  phone: c.phone || c.phone_number || '',
  address: c.address || '',
  addressDesc: c.addressDesc || c.address_desc || ''
}));

PRODUCTS.push(...apiProducts);
CUSTOMERS.push(...apiCustomers);
  }
  const box = document.getElementById('modalBox');
  box.classList.add('wide');
  document.getElementById('modalTitle').textContent = T('inv.modal.title');
  document.getElementById('modalSubmitBtn').textContent = T('inv.modal.submit');

  const fieldsWrap = document.getElementById('modalFields');
  fieldsWrap.innerHTML = `
    <div class="inv-section">
      <div class="inv-section-title">${T('dc.col.customer')}</div>
      <div class="modal-field">
        <label for="inv_custSearch">${T('inv.field.existingCustomer')}</label>
        <div class="search-select" id="inv_custSearchWrap">
          <input type="text" id="inv_custSearch" placeholder="${T('inv.field.custSearchPh')}" autocomplete="off">
          <input type="hidden" id="inv_custSelect" value="">
          <div class="search-dropdown" id="inv_custDropdown"></div>
        </div>
      </div>
      <div class="inv-row" style="margin-bottom:14px;">
        <div class="modal-field"><label for="inv_custFirst">${T('inv.field.firstName')}</label><input id="inv_custFirst"></div>
        <div class="modal-field"><label for="inv_custLast">${T('inv.field.lastName')}</label><input id="inv_custLast"></div>
      </div>
      <div class="modal-field"><label for="inv_custPhone">${T('inv.field.phone')}</label><input id="inv_custPhone"></div>
      <div class="modal-field"><label for="inv_custAddress">${T('cust.col.address')}</label><input id="inv_custAddress"></div>
      <div class="modal-field"><label for="inv_custAddressDesc">${T('cust.field.addressDesc')}</label><input id="inv_custAddressDesc" placeholder="${T('inv.field.addressPh')}"></div>
    </div>

    <div class="inv-section">
      <div class="inv-section-title">${T('inv.field.itemOrService')}</div>
      <div class="inv-toggle">
        <label class="inv-toggle-opt active" id="inv_itemTab"><input type="radio" name="inv_mode" id="inv_modeItem" checked>${T('inv.field.item')}</label>
        <label class="inv-toggle-opt" id="inv_serviceTab"><input type="radio" name="inv_mode" id="inv_modeService">${T('nav.services')}</label>
      </div>
      <div id="inv_itemBlock">
        <div id="inv_itemRows"></div>
        <button type="button" class="inv-add-item-btn" id="inv_addItemBtn">
          <svg viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          ${T('inv.field.addAnotherItem')}
        </button>
      </div>
      <div id="inv_serviceBlock" style="display:none;">
        <div class="modal-field"><label for="inv_serviceDesc">${T('inv.field.serviceDesc')}</label><input id="inv_serviceDesc" placeholder="${T('inv.field.serviceDescPh')}"></div>
      </div>
    </div>

    <div class="inv-section">
      <div class="inv-section-title">${T('inv.field.payment')}</div>
      <div class="inv-row">
        <div class="modal-field">
          <label for="inv_payType">${T('inv.field.paymentType')}</label>
          <select id="inv_payType">${PAYMENT_TYPES.map(t => `<option>${t}</option>`).join('')}</select>
        </div>
        <div class="modal-field"><label for="inv_payTotal">${T('inv.field.totalUsd')}</label><input id="inv_payTotal" type="number" min="0" value="0" readonly></div>
      </div>
    </div>
  `;

  // ---- customer search + autofill ----
  const custSearchInput = document.getElementById('inv_custSearch');
  const custHidden = document.getElementById('inv_custSelect');
  const custDropdown = document.getElementById('inv_custDropdown');
  const custWrap = document.getElementById('inv_custSearchWrap');

  function fillCustomerFields(c){
    document.getElementById('inv_custFirst').value = c ? c.first : '';
    document.getElementById('inv_custLast').value = c ? c.last : '';
    document.getElementById('inv_custPhone').value = c ? c.phone : '';
    document.getElementById('inv_custAddress').value = c ? c.address : '';
    document.getElementById('inv_custAddressDesc').value = c ? c.addressDesc : '';
  }

  function renderCustDropdown(query){
    const q = query.trim().toLowerCase();
    const matches = q === '' ? CUSTOMERS : CUSTOMERS.filter(c =>
      `${c.first} ${c.last}`.toLowerCase().includes(q) ||
      c.id.toLowerCase().includes(q) ||
      c.phone.toLowerCase().includes(q)
    );
    custDropdown.innerHTML = matches.length
      ? matches.map(c => `
          <div class="search-dropdown-item" data-id="${c.id}">
            ${c.first} ${c.last}
            <span class="sd-sub">${c.id} · ${c.phone}</span>
          </div>`).join('')
      : `<div class="search-dropdown-empty">No matching customer — fill in the fields below to add a new one</div>`;
    custDropdown.classList.add('open');
  }

  custSearchInput.addEventListener('focus', () => renderCustDropdown(custSearchInput.value));
  custSearchInput.addEventListener('input', () => {
    custHidden.value = '';
    custWrap.classList.remove('has-value');
    renderCustDropdown(custSearchInput.value);
  });
  custSearchInput.addEventListener('blur', () => {
    setTimeout(() => custDropdown.classList.remove('open'), 150);
  });
  custDropdown.addEventListener('mousedown', (e) => {
    const item = e.target.closest('.search-dropdown-item[data-id]');
    if (!item) return;
    e.preventDefault(); // keep focus on input so 'blur' doesn't close the dropdown first
    const c = CUSTOMERS.find(x => x.id === item.dataset.id);
    if (!c) return;
    custHidden.value = c.id;
    custSearchInput.value = `${c.first} ${c.last}`;
    custWrap.classList.add('has-value');
    fillCustomerFields(c);
    custDropdown.classList.remove('open');
  });

  // ---- item / service toggle (mutually exclusive) ----
  const itemBlock = document.getElementById('inv_itemBlock');
  const serviceBlock = document.getElementById('inv_serviceBlock');
  const itemTab = document.getElementById('inv_itemTab');
  const serviceTab = document.getElementById('inv_serviceTab');
  const itemRowsWrap = document.getElementById('inv_itemRows');

  function setMode(mode){
    const isItem = mode === 'item';
    itemBlock.style.display = isItem ? '' : 'none';
    serviceBlock.style.display = isItem ? 'none' : '';
    itemTab.classList.toggle('active', isItem);
    serviceTab.classList.toggle('active', !isItem);
    document.getElementById('inv_payTotal').readOnly = isItem;
    updateTotal();
  }
  document.getElementById('inv_modeItem').addEventListener('change', () => setMode('item'));
  document.getElementById('inv_modeService').addEventListener('change', () => setMode('service'));

  // ---- multiple, distinct line items ----
  let itemRows = [];   // [{ id, sku, qty, subtotal }]
  let rowIdSeq = 0;

  function skuTakenElsewhere(sku, excludeRowId){
    return itemRows.some(r => r.id !== excludeRowId && r.sku === sku);
  }

  // Default subtotal = unit price × qty. Used to pre-fill a row when the
  // item or quantity changes; the person can then type a different amount
  // into the Sub-total field to override it (e.g. a per-item discount),
  // and that override sticks until the item or qty changes again.
  function defaultRowSubtotal(row){
    const p = PRODUCTS.find(x => x.sku === row.sku);
    return p ? p.price * (row.qty || 1) : 0;
  }

  function updateRowDisplay(rowEl, row){
    const p = PRODUCTS.find(x => x.sku === row.sku);
    rowEl.querySelector('.inv-row-sub').value = `$${Number(row.subtotal || 0).toLocaleString()}`;
    rowEl.querySelector('.inv-row-desc').textContent = p ? `${p.name} — ${p.description}` : '';
  }

  function addItemRow(){
    const id = rowIdSeq++;
    itemRows.push({ id, sku: '', qty: 1, subtotal: 0 });

    const rowEl = document.createElement('div');
    rowEl.className = 'inv-item-row';
    rowEl.dataset.rowId = id;
    rowEl.innerHTML = `
      <div class="inv-item-row-main">
        <div class="modal-field">
          <label>${T('dash.col.item')}</label>
          <div class="search-select">
            <input type="text" class="inv-row-search" placeholder="${T('inv.field.itemSearchPh')}" autocomplete="off">
            <input type="hidden" class="inv-row-sku" value="">
            <div class="search-dropdown"></div>
          </div>
        </div>
        <div class="modal-field">
          <label>${T('inv.col.qty')}</label>
          <input type="number" class="inv-row-qty" value="1" min="1">
        </div>
        <div class="modal-field">
          <label>${T('inv.col.subtotal')}</label>
          <input type="text" class="inv-row-sub" value="$0" inputmode="decimal">
        </div>
        <button type="button" class="inv-row-remove" aria-label="Remove item">&times;</button>
      </div>
      <div class="inv-row-desc"></div>`;
    itemRowsWrap.appendChild(rowEl);

    const row = itemRows.find(r => r.id === id);
    const rowWrap = rowEl.querySelector('.search-select');
    const rowSearchInput = rowEl.querySelector('.inv-row-search');
    const rowHiddenSku = rowEl.querySelector('.inv-row-sku');
    const rowDropdown = rowEl.querySelector('.search-dropdown');

    function renderItemDropdown(query){
      const q = query.trim().toLowerCase();
      const available = PRODUCTS.filter(p => p.sku === row.sku || !skuTakenElsewhere(p.sku, row.id));
      const matches = q === '' ? available : available.filter(p =>
        p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q)
      );
      rowDropdown.innerHTML = matches.length
        ? matches.map(p => `
            <div class="search-dropdown-item" data-sku="${p.sku}">
              ${p.name}
              <span class="sd-sub">${p.sku} · $${p.price.toLocaleString()}</span>
            </div>`).join('')
        : `<div class="search-dropdown-empty">No matching item</div>`;
      rowDropdown.classList.add('open');
    }

    rowSearchInput.addEventListener('focus', () => renderItemDropdown(rowSearchInput.value));
    rowSearchInput.addEventListener('input', () => {
      row.sku = '';
      rowHiddenSku.value = '';
      rowWrap.classList.remove('has-value');
      row.subtotal = defaultRowSubtotal(row);
      updateRowDisplay(rowEl, row);
      updateTotal();
      renderItemDropdown(rowSearchInput.value);
    });
    rowSearchInput.addEventListener('blur', () => {
      setTimeout(() => rowDropdown.classList.remove('open'), 150);
    });
    rowDropdown.addEventListener('mousedown', (e) => {
      const item = e.target.closest('.search-dropdown-item[data-sku]');
      if (!item) return;
      e.preventDefault(); // keep focus so 'blur' doesn't close the dropdown before the click registers
      //const p = PRODUCTS.find(x => x.sku === item.dataset.sku);
      const targetSku = String(item.dataset.sku);
  const p = PRODUCTS.find(x => String(x.sku) === targetSku);
      if (!p) return;
      row.sku = p.sku;
      rowHiddenSku.value = p.sku;
      rowSearchInput.value = p.name;
      rowWrap.classList.add('has-value');
      row.subtotal = defaultRowSubtotal(row);
      updateRowDisplay(rowEl, row);
      rowDropdown.classList.remove('open');
      updateTotal();
    });

    rowEl.querySelector('.inv-row-qty').addEventListener('input', function(){
      row.qty = Number(this.value) || 1;
      row.subtotal = defaultRowSubtotal(row);
      updateRowDisplay(rowEl, row);
      updateTotal();
    });
    rowEl.querySelector('.inv-row-remove').addEventListener('click', () => removeItemRow(id));

    // Manual sub-total override — lets the person adjust this line's total
    // directly (e.g. a per-item discount) without touching the overall
    // invoice total, which is always the sum of these line sub-totals.
    const rowSubInput = rowEl.querySelector('.inv-row-sub');
    rowSubInput.addEventListener('input', function(){
      row.subtotal = Number(this.value.replace(/[^0-9.]/g, '')) || 0;
      updateTotal();
    });
    rowSubInput.addEventListener('blur', function(){
      updateRowDisplay(rowEl, row);
    });
  }

  function removeItemRow(id){
    itemRows = itemRows.filter(r => r.id !== id);
    itemRowsWrap.querySelector(`.inv-item-row[data-row-id="${id}"]`)?.remove();
    updateTotal();
  }

  document.getElementById('inv_addItemBtn').addEventListener('click', addItemRow);
  addItemRow(); // start with one row

  // ---- running total ----
  // The overall total is always derived from each line's sub-total (which
  // the person can adjust individually) — it is not itself editable while
  // in item mode, since it's just the sum below.
  function updateTotal(){
    if (itemBlock.style.display === 'none') return;
    const sum = itemRows.reduce((acc, r) => acc + (Number(r.subtotal) || 0), 0);
    document.getElementById('inv_payTotal').value = sum;
  }

  const form = document.getElementById('modalForm');
  if (_modalSubmitHandler){
    form.removeEventListener('submit', _modalSubmitHandler);
  }
  _modalSubmitHandler = function(e){
    e.preventDefault();
    createInvoiceFromModal();
    closeModal();
    box.classList.remove('wide');
    form.reset();
  };
  form.addEventListener('submit', _modalSubmitHandler);

  requestAnimationFrame(() => {
    document.getElementById('modalOverlay').classList.add('open');
    document.getElementById('inv_custSelect').focus();
  });
}

let invoiceCounter = 418;

async function createInvoiceFromModal(){
  const isItem = document.getElementById('inv_itemBlock').style.display !== 'none';

  const custId = document.getElementById('inv_custSelect').value;
  const first = document.getElementById('inv_custFirst').value.trim();
  const last = document.getElementById('inv_custLast').value.trim();
  const phone = document.getElementById('inv_custPhone').value.trim();
  const address = document.getElementById('inv_custAddress').value.trim();
  const addressDesc = document.getElementById('inv_custAddressDesc').value.trim();
  const payType = document.getElementById('inv_payType').value;
  const total = Number(document.getElementById('inv_payTotal').value) || 0;

  const custName = `${first} ${last}`.trim() || 'Walk-in customer';
  const initials = ((first[0] || '') + (last[0] || '')).toUpperCase() || 'NA';
 let itemRowsHtml, servicesNoteLabel, servicesNoteValue,svd;
  let price=0,iid=0,name,quty;
  if (isItem){
    const rows = Array.from(document.querySelectorAll('#inv_itemRows .inv-item-row'))
      .map(rowEl => {
        const sku = rowEl.querySelector('.inv-row-sku').value;
        const qty = rowEl.querySelector('.inv-row-qty').value || '1';
        const p = PRODUCTS.find(x => x.sku === sku);
        price=p.price
        iid=sku
        name=p.name
        quty=qty
        return p ? { sku, name: p.name, qty, sub: p.price * (Number(qty) || 1) } : null;
      })
      .filter(Boolean);

    itemRowsHtml = rows.length
      ? rows.map(r => `<tr>
        <td>${r.name} <div class="item-sku mono">${r.sku}</div></td>
        <td class="mono">${r.qty}</td>
        <td class="mono">$${r.sub.toLocaleString()}</td>
      </tr>`).join('')
      : `<tr><td>—</td><td class="mono">—</td><td class="mono">$0</td></tr>`;
  } else {
    const svcDesc = document.getElementById('inv_serviceDesc').value.trim() || 'Service';
    itemRowsHtml = `<tr>
        <td>${svcDesc} <div class="item-sku mono">SERVICE</div></td>
        <td class="mono">1</td>
        <td class="mono">$${total.toLocaleString()}</td>
      </tr>`;
  }
  servicesNoteLabel = 'Payment';
  servicesNoteValue = `${payType} · $${total.toLocaleString()}`;

  const inb = `INV-${invoiceCounter}`;
  invoiceCounter++;
  const today = new Date().toDateString().toUpperCase().split(' ').slice(1).join(' ');

  const card = document.createElement('div');
  card.className = 'invoice-card';
  card.dataset.inb = inb;
  card.dataset.phone = phone;
  card.innerHTML = `
    <div class="invoice-head">
      <div>
        <span class="invoice-id mono">#${inb}</span>
        <div class="invoice-date mono">${today}</div>
      </div>
      <div class="invoice-total">
        <div class="num mono">$${total.toLocaleString()}</div>
        <div class="label" data-i18n="dc.col.total">Total</div>
      </div>
    </div>
    <div class="invoice-body">
      <div class="cust-block">
        <div class="cust-avatar">${initials}</div>
        <div>
          <div class="cust-name">${custName}</div>
          <div class="cust-meta">
            <span data-i18n="cust.col.cid">C.ID</span> <span class="mono">${custId || '—'}</span><br>
            ${address || '—'}${addressDesc ? ' · ' + addressDesc : ''}<br>
            <span class="mono">${phone || '—'}</span>
          </div>
        </div>
      </div>
      <div class="items-block">
        <table>
          <thead><tr><th data-i18n="dash.col.item">Item</th><th data-i18n="inv.col.qty">Qty</th><th data-i18n="inv.col.subtotal">Sub-total</th></tr></thead>
          <tbody>${itemRowsHtml}</tbody>
        </table>
      </div>
    </div>
    <div class="services-note"><span class="mono">${servicesNoteLabel}</span>${servicesNoteValue}</div>
    <div class="invoice-actions">
      <button type="button" class="card-btn" onclick="printInvoiceCard(this)">
        <svg viewBox="0 0 24 24"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>
        Print
      </button>
      <button type="button" class="card-btn" onclick="sendInvoiceWhatsApp(this)">
        <svg viewBox="0 0 24 24"><path d="M21 11.5a8.38 8.38 0 0 1-1.9 5.4 8.5 8.5 0 0 1-10.5 2.1L3 20l1.1-5.4A8.5 8.5 0 1 1 21 11.5z"/></svg>
        Send WhatsApp
      </button>
    </div>`;
   if(isItem){
   const owes=Number(price)-Number(total)
 const create_invoice=await axios.post(`${server}${apis.create_invoice}`,{
  'type':payType,
  'total_price':price,
  'paid':total,
  'owes':owes
 })
 if(!create_invoice.data.exit){
  const iData=create_invoice.data.invoice_item
  const item=await axios.post(`${server}${apis.get_item_by_id}`,{'id':iid})
  if(item.status!==200&&item.status!==201){
    alert("Item error");
    return;
  
  }
  if(!name){
    alert("name is null");
    return;
  }
  console.log(item.data.serial_number)
  console.log(item.data.message)
  const create_invoice_customer_item=await axios.post(`${server}${apis.create_invoice_customer_item}`,{
    'invoice_id':iData.id,
    'customer_id':custId,
    'serial_number':Number(item.data.serial_number),
    'item_name':name,
    'date':today,
    'total_price':price,
    'services':'buy',
    'quantity':quty
  })
  console.log(create_invoice_customer_item.data.message)
}
else{
  alert(create_invoice.data)
}
}
else{
   const owes=Number(total)-Number(total)
 const create_invoice=await axios.post(`${server}${apis.create_invoice}`,{
  'type':payType,
  'total_price':total,
  'paid':total,
  'owes':owes
 })
 if(!create_invoice.data.exit){
  const iData=create_invoice.data.invoice_item
  const item=await axios.post(`${server}${apis.get_item_by_id}`,{'id':iid})
  if(item.status!==200&&item.status!==201){
    alert("Item error");
    return;
  
  }
  if(!svd){
    alert("name is null");
    return;
  }
  
  console.log(item.data.message)
  const create_invoice_customer_item=await axios.post(`${server}${apis.create_invoice_customer_item}`,{
    'invoice_id':iData.id,
    'customer_id':custId,
    'serial_number':0,
    'item_name':svd,
    'date':today,
    'total_price':total,
    'services':servicesNoteLabel,
    'quantity':0
  })

}
else{
  alert(create_invoice.data)
}
}

  document.getElementById('invoiceList').prepend(card);
  flashElement(card, 'card-flash');
  window.__invoiceCards = window.__invoiceCards || [];
  window.__invoiceCards.unshift(card);
  if (typeof registerNewInvoiceCard === 'function') registerNewInvoiceCard(card);
}

/* ---- print a single invoice ---- */
/* ---- number to English words, for "THE SUM OF" ---- */
function numberToWords(num){
  const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine',
    'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
  const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
  function chunk(n){
    if (n === 0) return '';
    if (n < 20) return ones[n];
    if (n < 100) return tens[Math.floor(n/10)] + (n % 10 ? '-' + ones[n % 10] : '');
    return ones[Math.floor(n/100)] + ' Hundred' + (n % 100 ? ' and ' + chunk(n % 100) : '');
  }
  if (num === 0) return 'Zero';
  const million = Math.floor(num / 1000000);
  const thousand = Math.floor((num % 1000000) / 1000);
  const rest = num % 1000;
  let parts = [];
  if (million) parts.push(chunk(million) + ' Million');
  if (thousand) parts.push(chunk(thousand) + ' Thousand');
  if (rest) parts.push(chunk(rest));
  return parts.join(' ');
}

/* ---- fill in the paper invoice template from a card's data, then print ---- */
function printInvoiceCard(btn){
  const card = btn.closest('.invoice-card');
  const inb = card.dataset.inb || '';
  const seq = (inb.match(/\d+/) || ['0'])[0].replace(/^0+/, '') || '0';
  const dateText = (card.querySelector('.invoice-date')?.textContent || '').trim();
  const parsedDate = new Date(dateText);
  const year = isNaN(parsedDate) ? new Date().getFullYear() : parsedDate.getFullYear();
  const dateStr = isNaN(parsedDate)
    ? dateText
    : String(parsedDate.getDate()).padStart(2,'0') + '/' + String(parsedDate.getMonth()+1).padStart(2,'0') + '/' + parsedDate.getFullYear();

  const custName = (card.querySelector('.cust-name')?.textContent || '').trim();
  const custMeta = card.querySelector('.cust-meta');
  const cidText = (custMeta?.querySelector('.mono')?.textContent || '').trim();
  const custIdNum = cidText.replace(/\D/g, '').padStart(5, '0');
  const metaLines = custMeta ? custMeta.innerHTML.split('<br>').map(s => s.replace(/<[^>]+>/g, '').trim()) : [];
  const custAddress = metaLines[1] || '';
  const custPhone = card.dataset.phone || metaLines[2] || '';

  const totalText = (card.querySelector('.invoice-total .num')?.textContent || '$0').trim();
  const totalNum = Number(totalText.replace(/[^0-9.]/g, '')) || 0;

  const rows = Array.from(card.querySelectorAll('.items-block tbody tr')).map(r => {
    const cells = r.querySelectorAll('td');
    const itemCell = cells[0];
    const name = itemCell ? (itemCell.childNodes[0].textContent || '').trim() : '';
    const sku = itemCell ? (itemCell.querySelector('.item-sku')?.textContent.trim() || '') : '';
    const qty = Number((cells[1]?.textContent || '1').trim()) || 1;
    const subtotal = Number((cells[2]?.textContent || '0').replace(/[^0-9.]/g, '')) || 0;
    const unitPrice = qty ? subtotal / qty : subtotal;
    return { name, sku, qty, unitPrice, subtotal };
  });

  // Build the 30-row grid — real rows first, then blank rows to match the
  // shop's pre-printed paper form.
  const TOTAL_ROWS = 30;
  let bodyHtml = '';
  for (let i = 0; i < TOTAL_ROWS; i++){
    const row = rows[i];
    if (row){
      bodyHtml += `<tr>
        <td class="pi-idx">${i+1}</td>
        <td>${row.sku}</td>
        <td>${row.name}</td>
        <td class="pi-num">${row.qty}</td>
        <td class="pi-num">${row.unitPrice.toLocaleString(undefined,{maximumFractionDigits:2})}</td>
        <td class="pi-num">$0</td>
        <td class="pi-num">$${row.subtotal.toLocaleString()}</td>
      </tr>`;
    } else {
      bodyHtml += `<tr>
        <td class="pi-idx">${i+1}</td>
        <td></td><td></td><td></td><td></td><td></td><td></td>
      </tr>`;
    }
  }
  document.getElementById('pi_itemsBody').innerHTML = bodyHtml;

  const totalQty = rows.reduce((s,r) => s + r.qty, 0);

  document.getElementById('pi_invNb').textContent = `${year} / ${seq.padStart(3,'0')}`;
  document.getElementById('pi_date').textContent = dateStr;
  document.getElementById('pi_custAddress').textContent = custAddress || '—';
  document.getElementById('pi_custPhone').textContent = custPhone || '—';
  document.getElementById('pi_custId').textContent = custIdNum;
  document.getElementById('pi_custName').textContent = custName;
  document.getElementById('pi_custName2').textContent = custName;
  document.getElementById('pi_dateSign').textContent = dateStr;

  document.getElementById('pi_footQty').textContent = totalQty;
  document.getElementById('pi_footUnit').textContent = '';
  document.getElementById('pi_footTotal').textContent = `$${totalNum.toLocaleString()}`;

  // No partial-payment field exists on invoices yet, so this assumes the
  // invoice is paid in full — PAY = TOTAL, REST = $0. Once partial payments
  // are tracked, wire real "paid so far" data in here instead.
  document.getElementById('pi_total').textContent = `$${totalNum.toLocaleString()}`;
  document.getElementById('pi_pay').textContent = `$${totalNum.toLocaleString()}`;
  document.getElementById('pi_rest').textContent = '$0';
  document.getElementById('pi_sumWords').textContent =
    `Only ${numberToWords(Math.round(totalNum))} US Dollar${totalNum === 1 ? '' : 's'} no more`;

  window.print();
}
window.addEventListener('afterprint', () => {});

/* ---- send a single invoice through WhatsApp ---- */
function sendInvoiceWhatsApp(btn){
  const card = btn.closest('.invoice-card');
  const inb = card.dataset.inb || '';
  const phoneDigits = (card.dataset.phone || '').replace(/[^\d]/g, '');
  const custName = (card.querySelector('.cust-name')?.textContent || '').trim();
  const total = (card.querySelector('.invoice-total .num')?.textContent || '').trim();
  const rows = Array.from(card.querySelectorAll('.items-block tbody tr')).map(r => {
    const cells = r.querySelectorAll('td');
    const label = cells[0] ? cells[0].childNodes[0].textContent.trim() : '';
    const qty = cells[1] ? cells[1].textContent.trim() : '';
    const sub = cells[2] ? cells[2].textContent.trim() : '';
    return `- ${label} x${qty}: ${sub}`;
  });

  const lines = [`Invoice #${inb}`, `Customer: ${custName}`, ...rows, `Total: ${total}`];
  const msg = encodeURIComponent(lines.join('\n'));
  const url = phoneDigits ? `https://wa.me/${phoneDigits}?text=${msg}` : `https://wa.me/?text=${msg}`;
  window.open(url, '_blank');
}

  /* ---- page logic ---- */
  

  // ---- functional search by I.nb (primary key) ----
  const searchInput = document.getElementById('invoiceSearch');
  const cards = Array.from(document.querySelectorAll('.invoice-card'));
  const resultCount = document.getElementById('resultCount');
  const emptyState = document.getElementById('emptyState');
  let totalCount = cards.length;

  function runFilter(){
    const q = searchInput.value.trim().toLowerCase();
    let visible = 0;
    cards.forEach(card => {
      const inb = card.dataset.inb.toLowerCase();
      const custName = (card.querySelector('.cust-name')?.textContent || '').toLowerCase();
      const match = q === '' || inb.includes(q) || custName.includes(q);
      card.style.display = match ? '' : 'none';
      if (match) visible++;
    });
    resultCount.innerHTML = `Showing <strong>${visible}</strong> of <strong>${totalCount}</strong> invoices`;
    emptyState.style.display = visible === 0 ? 'block' : 'none';
  }

  searchInput.addEventListener('input', runFilter);

  // ---- Add invoice: opens the customer / item-or-service / payment pop-up ----
  document.getElementById('addInvoiceBtn').addEventListener('click', openInvoiceModal);

  // Called by createInvoiceFromModal() once a new invoice card has been built,
  // so it plugs into the same search/filter/result-count state as the rest.
  window.registerNewInvoiceCard = function(card){
    cards.unshift(card);
    totalCount++;
    runFilter();
  };
function renderInvoiceCardFromDb(data) {
  const inb = data.invoice_id || '0';
  const today = data.date || '';
  const total = Number(data.total_price || 0);

  // دمج الاسم الأول والأخير للعميل
  const firstName = data.first_name || '';
  const lastName = data.last_name || '';
  const custName = `${firstName} ${lastName}`.trim() || 'Walk-in customer';

  const custId = data.customer_id || '—';
  const phone = data.phone_number || '—';
  const address = data.address || '—';
  const addressDesc = data.address_desc || '';

  const itemName = data.item_name || 'Item';
  const qty = data.item_quantity || 1;
  const sku = data.serial_number || 'N/A';
  const payType = data.pay_type || 'Cash';

  const initials = ((firstName[0] || '') + (lastName[0] || '')).toUpperCase() || 'NA';

  const card = document.createElement('div');
  card.className = 'invoice-card';
  card.dataset.inb = inb;
  card.dataset.phone = phone;

  card.innerHTML = `
    <div class="invoice-head">
      <div>
        <span class="invoice-id mono">#${inb}</span>
        <div class="invoice-date mono">${today}</div>
      </div>
      <div class="invoice-total">
        <div class="num mono">$${total.toLocaleString()}</div>
        <div class="label" data-i18n="dc.col.total">Total</div>
      </div>
    </div>
    <div class="invoice-body">
      <div class="cust-block">
        <div class="cust-avatar">${initials}</div>
        <div>
          <div class="cust-name">${custName}</div>
          <div class="cust-meta">
            <span data-i18n="cust.col.cid">C.ID</span> <span class="mono">${custId}</span><br>
            ${address}${addressDesc ? ' · ' + addressDesc : ''}<br>
            <span class="mono">${phone}</span>
          </div>
        </div>
      </div>
      <div class="items-block">
        <table>
          <thead><tr><th data-i18n="dash.col.item">Item</th><th data-i18n="inv.col.qty">Qty</th><th data-i18n="inv.col.subtotal">Sub-total</th></tr></thead>
          <tbody>
            <tr>
              <td>${itemName} <div class="item-sku mono">${sku}</div></td>
              <td class="mono">${qty}</td>
              <td class="mono">$${total.toLocaleString()}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
    <div class="services-note"><span class="mono">Payment</span>${payType} · $${total.toLocaleString()}</div>
    <div class="invoice-actions">
      <button type="button" class="card-btn" onclick="printInvoiceCard(this)">Print</button>
      <button type="button" class="card-btn" onclick="sendInvoiceWhatsApp(this)">Send WhatsApp</button>
    </div>`;

  return card;
}
async function fetchAndRenderInvoices() {
  try {
    
    const response = await axios.post(`${server}${apis.get_all_invoices_customer_items}`); 

    
    const invoicesList = Array.isArray(response.data) ? response.data : (response.data.invoices || []);

    const invoiceListContainer = document.getElementById('invoiceList');
    window.__invoiceCards = window.__invoiceCards || [];

   
    invoicesList.forEach(invoiceData => {
      const card = renderInvoiceCardFromDb(invoiceData);

      
      invoiceListContainer.appendChild(card);
      window.__invoiceCards.push(card);

     
      if (typeof registerNewInvoiceCard === 'function') {
        registerNewInvoiceCard(card);
      }
    });

  } catch (error) {
    console.error( error);
  }
}
document.addEventListener('DOMContentLoaded', () => {
   
    fetchAndRenderInvoices();
});