import {server,apis} from "../tools/apis.js"
// receipts.js — page-specific logic for receipts.html
// Uses the shared modal system in js/modal.js and shared shell behavior in js/base.js

  /* ---- page logic ---- */
  

  const searchInput = document.getElementById('receiptSearch');
  const cards = Array.from(document.querySelectorAll('.receipt-card'));
  const resultCount = document.getElementById('resultCount');
  const emptyState = document.getElementById('emptyState');
  let totalCount = cards.length;

  function runFilter(){
    const q = searchInput.value.trim().toLowerCase();
    let visible = 0;
    cards.forEach(card => {
      const rnb = card.dataset.rnb.toLowerCase();
      const itemNames = Array.from(card.querySelectorAll('.items-block td:first-child'))
        .map(td => td.childNodes[0]?.textContent.trim().toLowerCase() || '').join(' ');
      const brands = Array.from(card.querySelectorAll('.brand-tag')).map(b => b.textContent.toLowerCase()).join(' ');
      const match = q === '' || rnb.includes(q) || itemNames.includes(q) || brands.includes(q);
      card.style.display = match ? '' : 'none';
      if (match) visible++;
    });
    resultCount.innerHTML = `Showing <strong>${visible}</strong> of <strong>${totalCount}</strong> receipts`;
    emptyState.style.display = visible === 0 ? 'block' : 'none';
  }
  searchInput.addEventListener('input', runFilter);

  // ---- Add receipt (hardcoded, in-memory only — resets on refresh) ----
  let receiptCounter = 234;
  let COMPANIES = [
      { name:'Frostline',   location:'Warehouse A · Beirut', phone:'+961 71 200 481', reg:'CR-114820' },
      { name:'Hydra',       location:'Warehouse B · Sidon',  phone:'+961 71 673 908', reg:'CR-098231' },
      { name:'Ember',       location:'Warehouse A · Tyre',   phone:'+961 76 220 985', reg:'CR-205577' },
      { name:'Climate Air', location:'Warehouse C · Sidon',  phone:'+961 70 815 340', reg:'CR-301489' }
    ];
const getCompanies=async ()=>{
        try{
        const companies=await axios.post(`${server}${apis.get_brands}`);
        if(companies.status===200){
        const data=companies.data
        COMPANIES.length=0;
        COMPANIES.push(...data)}
        else{
            alert(`API can't bring data: ${companies.status}`)
        }
        
    }
       
        catch(error){
             console.log(error)
        }
    }
 async function openReceiptModal(){
    ensureModalMounted();
    getCompanies()
    document.getElementById('modalBox').classList.remove('wide');
    document.getElementById('modalTitle').textContent = T('rec.modal.title');
    document.getElementById('modalSubmitBtn').textContent = T('rec.modal.submit');

    const fieldsWrap = document.getElementById('modalFields');
    fieldsWrap.innerHTML = `
      <div class="modal-field">
        <label for="rec_companySearch">${T('prod.col.brand')} / Company</label>
        <div class="search-select" id="rec_companyWrap">
          <input type="text" id="rec_companySearch" placeholder="Type a company name…" autocomplete="off">
          <div class="search-dropdown" id="rec_companyDropdown"></div>
        </div>
      </div>
      <div class="rec-row-company empty" id="rec_companyInfo" style="margin-bottom:16px;"></div>

      <div class="modal-field"><label>${T('dash.col.item')}</label></div>
      <div class="rec-item-notice" id="rec_itemNotice">Pick a company above to search its items.</div>
      <div id="rec_itemRows"></div>
      <button type="button" class="rec-add-item-btn" id="rec_addItemBtn" disabled>
        <svg viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
        Add another item
      </button>

      <div class="rec-row" style="margin-bottom:14px;">
        <div class="modal-field"><label for="rec_totalBefore">${T('rec.field.totalBefore')}</label><input id="rec_totalBefore" type="text" readonly value="$0"></div>
        <div class="modal-field"><label for="rec_discount">${T('rec.field.discountPct')}</label><input id="rec_discount" type="number" placeholder="e.g. 10" min="0"></div>
      </div>
      <div class="rec-row">
        <div class="modal-field"><label for="rec_tva">${T('rec.field.tvaPct')}</label><input id="rec_tva" type="number" placeholder="e.g. 11" min="0"></div>
        <div class="modal-field"><label for="rec_finalTotal">${T('rec.field.finalTotal')}</label><input id="rec_finalTotal" type="text" readonly value="$0"></div>
      </div>
    `;

    // Lookup of known items — matches the Products page's sample data (same
    // S.nb, name, brand and per-unit price used there).
    const RECEIPT_ITEMS = [
      { sku:'S-0041', name:'QuietCool 410 Fridge',   brand:'Frostline',   price:890 },
      { sku:'S-0038', name:'Torrent 9kg Washer',     brand:'Hydra',       price:410 },
      { sku:'S-0052', name:'Ember 5-Burner Range',   brand:'Ember',       price:520 },
      { sku:'S-0019', name:'Climate Air AC-12',      brand:'Climate Air', price:310 },
      { sku:'S-0027', name:'Ember 2-Slot Toaster',   brand:'Ember',       price:18  },
      { sku:'S-0044', name:'Hydra Slim Dishwasher',  brand:'Hydra',       price:340 }
    ];

    // Companies you can pick from — pick one first, then the item search
    // below only shows that company's own items. NOTE: this is keyed off
    // the "Brand" tag used on Products/Receipts, which is a different
    // sample list than the actual entries on the Companies page right now
    // (that page uses Samsung/LG/Toshiba/Apple as placeholder data) — once
    // those two are unified into one real company list, this should read
    // from that instead so a company added there shows up here too.
    

    const itemRowsWrap = document.getElementById('rec_itemRows');
    const itemNotice = document.getElementById('rec_itemNotice');
    const addItemBtn = document.getElementById('rec_addItemBtn');
    const totalBeforeDisplay = document.getElementById('rec_totalBefore');
    const discountInput = document.getElementById('rec_discount');
    const tvaInput = document.getElementById('rec_tva');
    const finalTotalInput = document.getElementById('rec_finalTotal');

    let itemRows = [];   // [{ id, sku, name, brand, qty, price }]
    let rowIdSeq = 0;
    let computedTotalBefore = 0;
    let selectedCompany = null;

    function skuTakenElsewhere(sku, excludeRowId){
      return itemRows.some(r => r.id !== excludeRowId && r.sku === sku);
    }

    function updateRowDisplay(rowEl, row){
      const sub = (row.qty || 0) * (row.price || 0);
      rowEl.querySelector('.rec-row-sub').value = `$${sub.toLocaleString(undefined,{maximumFractionDigits:2})}`;
    }

    function updateTotal(){
      computedTotalBefore = itemRows.reduce((sum, r) => sum + (r.qty || 0) * (r.price || 0), 0);
      totalBeforeDisplay.value = `$${computedTotalBefore.toLocaleString(undefined,{maximumFractionDigits:2})}`;
      recalcTotals();
    }

    function recalcTotals(){
      const base = computedTotalBefore;
      const discPct = Number(discountInput.value) || 0;
      const tvaPct = Number(tvaInput.value) || 0;
      const afterDiscount = base - (base * discPct / 100);
      const final = afterDiscount + (afterDiscount * tvaPct / 100);
      finalTotalInput.value = `$${final.toLocaleString(undefined, {maximumFractionDigits: 2})}`;
    }
    [discountInput, tvaInput].forEach(el => el.addEventListener('input', recalcTotals));

    function addItemRow(){
      const id = rowIdSeq++;
      itemRows.push({ id, sku: '', name: '', brand: '', qty: 1, price: 0 });

      const rowEl = document.createElement('div');
      rowEl.className = 'rec-item-row';
      rowEl.dataset.rowId = id;
      rowEl.innerHTML = `
        <div class="rec-item-row-main">
          <div class="modal-field">
            <label>${T('rec.field.itemSnb')} / ${T('dash.col.item')}</label>
            <div class="search-select">
              <input type="text" class="rec-row-search" placeholder="Type S.nb or item name…" autocomplete="off">
              <div class="search-dropdown"></div>
            </div>
          </div>
          <div class="modal-field">
            <label>${T('rec.col.amount')}</label>
            <input type="number" class="rec-row-qty" value="1" min="1">
          </div>
          <div class="modal-field">
            <label>Unit price</label>
            <input type="number" class="rec-row-price" value="0" min="0">
          </div>
          <div class="modal-field">
            <label>${T('inv.col.subtotal')}</label>
            <input type="text" class="rec-row-sub" readonly value="$0">
          </div>
          <button type="button" class="rec-row-remove" aria-label="Remove item">&times;</button>
        </div>`;
      itemRowsWrap.appendChild(rowEl);

      const row = itemRows.find(r => r.id === id);
      const rowWrap = rowEl.querySelector('.search-select');
      const rowSearchInput = rowEl.querySelector('.rec-row-search');
      const rowPriceInput = rowEl.querySelector('.rec-row-price');
      const rowDropdown = rowEl.querySelector('.search-dropdown');

      function renderItemDropdown(query){
        const q = query.trim().toLowerCase();
        const byCompany = RECEIPT_ITEMS.filter(it => !selectedCompany || it.brand === selectedCompany.name);
        const available = byCompany.filter(it => it.sku === row.sku || !skuTakenElsewhere(it.sku, row.id));
        const matches = q === '' ? available : available.filter(it =>
          it.name.toLowerCase().includes(q) || it.sku.toLowerCase().includes(q)
        );
        rowDropdown.innerHTML = matches.length
          ? matches.map(it => `
              <div class="search-dropdown-item" data-sku="${it.sku}">
                ${it.name}
                <span class="sd-sub">${it.sku} · $${it.price.toLocaleString()}</span>
              </div>`).join('')
          : `<div class="search-dropdown-empty">No matching item for this company</div>`;
        rowDropdown.classList.add('open');
      }

      rowSearchInput.addEventListener('focus', () => renderItemDropdown(rowSearchInput.value));
      rowSearchInput.addEventListener('input', () => {
        row.sku = ''; row.name = ''; row.brand = '';
        rowWrap.classList.remove('has-value');
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
        e.preventDefault();
        const it = RECEIPT_ITEMS.find(x => x.sku === item.dataset.sku);
        if (!it) return;
        row.sku = it.sku; row.name = it.name; row.brand = it.brand; row.price = it.price;
        rowPriceInput.value = it.price;
        rowSearchInput.value = it.name;
        rowWrap.classList.add('has-value');
        updateRowDisplay(rowEl, row);
        rowDropdown.classList.remove('open');
        updateTotal();
      });

      rowPriceInput.addEventListener('input', function(){
        row.price = Number(this.value) || 0;
        updateRowDisplay(rowEl, row);
        updateTotal();
      });
      rowEl.querySelector('.rec-row-qty').addEventListener('input', function(){
        row.qty = Number(this.value) || 1;
        updateRowDisplay(rowEl, row);
        updateTotal();
      });
      rowEl.querySelector('.rec-row-remove').addEventListener('click', () => removeItemRow(id));

      updateRowDisplay(rowEl, row);
    }

    function removeItemRow(id){
      if (itemRows.length <= 1) return; // always keep at least one row
      itemRows = itemRows.filter(r => r.id !== id);
      itemRowsWrap.querySelector(`.rec-item-row[data-row-id="${id}"]`)?.remove();
      updateTotal();
    }

    // ---- company search + gate on the item rows below ----
    const companySearchInput = document.getElementById('rec_companySearch');
    const companyWrap = document.getElementById('rec_companyWrap');
    const companyDropdown = document.getElementById('rec_companyDropdown');
    const companyInfoBox = document.getElementById('rec_companyInfo');

    function resetItemRows(){
      itemRows = [];
      itemRowsWrap.innerHTML = '';
      rowIdSeq = 0;
      if (companySearchInput.value.trim() !== '') addItemRow();
      updateTotal();
    }

    function updateCompanyUI(){
      const hasValue = companySearchInput.value.trim() !== '';
      if (selectedCompany){
        companyInfoBox.classList.remove('empty');
        companyInfoBox.innerHTML = `
          <div class="rc-item">Location<span>${selectedCompany.location}</span></div>
          <div class="rc-item">Phone<span>${selectedCompany.phone}</span></div>
          <div class="rc-item">Registration nb<span>${selectedCompany.reg}</span></div>`;
      } else {
        companyInfoBox.classList.add('empty');
        companyInfoBox.innerHTML = '';
      }
      itemNotice.style.display = hasValue ? 'none' : '';
      addItemBtn.disabled = !hasValue;
    }

    function renderCompanyDropdown(query){
      const q = query.trim().toLowerCase();
      const matches = q === '' ? COMPANIES : COMPANIES.filter(c => c.name.toLowerCase().includes(q));
      companyDropdown.innerHTML = matches.length
        ? matches.map(c => `
            <div class="search-dropdown-item" data-name="${c.name}">
              ${c.name}
              <span class="sd-sub">${c.location}</span>
            </div>`).join('')
        : `<div class="search-dropdown-empty">No matching company — you can still type a new one, but its items won't be filterable yet</div>`;
      companyDropdown.classList.add('open');
    }

    companySearchInput.addEventListener('focus', () => renderCompanyDropdown(companySearchInput.value));
    companySearchInput.addEventListener('input', () => {
      selectedCompany = null;
      companyWrap.classList.remove('has-value');
      updateCompanyUI();
      resetItemRows();
      renderCompanyDropdown(companySearchInput.value);
    });
    companySearchInput.addEventListener('blur', () => {
      setTimeout(() => companyDropdown.classList.remove('open'), 150);
    });
    companyDropdown.addEventListener('mousedown', (e) => {
      const item = e.target.closest('.search-dropdown-item[data-name]');
      if (!item) return;
      e.preventDefault();
      const c = COMPANIES.find(x => x.name === item.dataset.name);
      if (!c) return;
      selectedCompany = c;
      companySearchInput.value = c.name;
      companyWrap.classList.add('has-value');
      updateCompanyUI();
      resetItemRows();
      companyDropdown.classList.remove('open');
    });

    document.getElementById('rec_addItemBtn').addEventListener('click', addItemRow);
    updateCompanyUI();
    updateTotal();

    const form = document.getElementById('modalForm');
    if (_modalSubmitHandler) form.removeEventListener('submit', _modalSubmitHandler);
    _modalSubmitHandler =async function(e){
      e.preventDefault();
      console.log('[receipts] submit handler fired');

      try {
        const validRows = itemRows.filter(r => r.sku);
        if (validRows.length === 0){
          alert('Pick at least one item from the list before saving the receipt.');
          return;
        }

        const totalBefore = computedTotalBefore;
        const discount = Number(discountInput.value) || 0;
        const tva = Number(tvaInput.value) || 0;
        const afterDiscount = totalBefore - (totalBefore * discount / 100);
        const finalTotal = afterDiscount + (afterDiscount * tva / 100);
        const totalQty = validRows.reduce((s, r) => s + (r.qty || 0), 0);
        const discountHtml = discount
          ? `<span class="discount-tag">-${discount}%</span>`
          : `<span class="no-discount">—</span>`;

        const rnb = `RCT-${receiptCounter}`;
        receiptCounter++;
        const today = new Date().toDateString().toUpperCase().split(' ').slice(1).join(' ');
         try {
        // 1. إنشاء الفاتورة الأساسية (Receipt)
        const receiptPayload = {
          total_price: afterDiscount,
          discount:discount || 0,
          TVA: tva || 0
        };

        const receiptRes = await axios.post(`${server}${apis.create_Receipt}`, receiptPayload);
         alert(receiptRes.status)
        if (receiptRes.status !== 200 && receiptRes.status !== 201) {
          alert('Failed to create receipt');
          return;
        }
        

        // استخراج ID الفاتورة المنشأة حديثاً من السيرفر
        const receiptId = receiptRes.data.id || receiptRes.data.receipt?.id || receiptRes.data.receipts_id;

        // 2. الحصول على تاريخ اليوم بتنسيق YYYY-MM-DD
        const currentDate = new Date().toISOString().split('T')[0];

        // 3. إرسال عناصر الفاتورة (Receipt Items)
        const itemPromises = itemRowsWrap.map(row => {
          const itemPayload = {
            receipts_id: receiptId,
            item_id: row.id || row.sku,
            item_name: row.name,
            date: currentDate,
            quantity: row.qty,
            discount: discount,
            sub_total: totalBefore
          };

          return axios.post(`${server}${apis.create_Receipt_Item}`, itemPayload);
        });

        await Promise.all(itemPromises);

        alert('Receipt and items created successfully!');
        closeModal();
        form.reset();

      } catch (error) {
        console.error('Error submitting receipt:', error);
        alert('An error occurred while saving the receipt.');
      }
    
        const rowsHtml = validRows.map(r => `
          <tr>
            <td>${r.name} <div class="item-sku mono">${r.sku}</div></td>
            <td><span class="brand-tag">${r.brand}</span></td>
            <td class="mono">${r.qty}</td>
            <td>${discountHtml}</td>
            <td class="mono">$${(r.qty * r.price).toLocaleString()}</td>
          </tr>`).join('');

        const card = document.createElement('div');
        card.className = 'receipt-card';
        card.dataset.rnb = rnb;
        card.innerHTML = `
          <div class="receipt-head">
            <div>
              <span class="receipt-id mono">#${rnb}</span>
              <div class="receipt-date mono">${today}</div>
            </div>
            <div class="receipt-total">
              <div class="num mono">$${finalTotal.toLocaleString(undefined, {maximumFractionDigits: 2})}</div>
              <div class="label" data-i18n="rec.totalPrice">Total price</div>
            </div>
          </div>
          <div class="items-block">
            <table>
              <thead><tr><th data-i18n="dash.col.item">Item</th><th data-i18n="prod.col.brand">Brand</th><th data-i18n="rec.col.amount">Amount</th><th data-i18n="rec.col.discount">Discount</th><th data-i18n="inv.col.subtotal">Sub-total</th></tr></thead>
              <tbody>${rowsHtml}</tbody>
            </table>
          </div>
          <div class="receipt-breakdown">
            <div class="brk-row"><span>Total before discount</span><span class="mono">$${totalBefore.toLocaleString()}</span></div>
            <div class="brk-row"><span>TVA${tva ? ` (${tva}%)` : ''}</span><span class="mono">${tva ? '+$' + (afterDiscount * tva / 100).toLocaleString(undefined, {maximumFractionDigits: 2}) : '—'}</span></div>
            <div class="brk-row brk-final"><span>Total after discount &amp; TVA</span><span class="mono">$${finalTotal.toLocaleString(undefined, {maximumFractionDigits: 2})}</span></div>
          </div>
          <div class="receipt-foot">
            <span><span class="mono">Items</span>${validRows.length}</span>
            <span><span class="mono">Amount total</span>${totalQty}</span>
          </div>`;

        document.getElementById('receiptList').prepend(card);
        flashElement(card, 'card-flash');
        cards.unshift(card);
        totalCount++;
        runFilter();
        console.log('[receipts] card added:', rnb);
      } catch (err) {
        console.error('[receipts] FAILED to build/add card:', err);
        alert('Something went wrong creating the receipt — check the console (F12) for details: ' + err.message);
      }

      closeModal();
      form.reset();
    };
    form.addEventListener('submit', _modalSubmitHandler);

    requestAnimationFrame(() => {
      document.getElementById('modalOverlay').classList.add('open');
      document.getElementById('rec_companySearch')?.focus();
    });
  }
const receiptsItems=async ()=>{
  try{
    const receiptItem=await axios.post(`${server}${apis.get_receipts_items}`,{})
    const receiptList=document.getElementById('receiptList');
    if(receiptItem.status===200||receiptItem.status===201){
     const data=receiptItem.data;
      for(const element of data){
       const card=document.createElement('div');
       card.classList.add('receipt-card');
       card.setAttribute('data-rnb',element.id)
       const receipt=await axios.post(`${server}${apis.get_receipt}`,{"receipt_id":element.receipt_id})
       const item=await axios.post(`${server}${apis.get_item_by_id}`,{'id':element.item_id})
       if(receipt.status!==200 && receipt.status!==201&&item.status!==200&&item.status!==201)
       {
        alert(`receipt:${receipt.status}| item:${item.status}`)
       }
      
       const brand =await axios.post(`${server}${apis.get_brand_by_id}`,{"brand_id":item.data.brand_id})
       card.innerHTML=`  <div class="receipt-head">
          <div>
            <span class="receipt-id mono">${element.receipt_id}</span>
            <div class="receipt-date mono">${element.date}</div>
          </div>
          <div class="receipt-total">
            <div class="num mono">$${element.price}</div>
            <div class="label" data-i18n="rec.totalPrice">Total price</div>
          </div>
        </div>
        <div class="items-block">
          <table>
            <thead><tr><th data-i18n="dash.col.item">Item</th><th data-i18n="prod.col.brand">Brand</th><th data-i18n="rec.col.amount">Amount</th><th data-i18n="rec.col.discount">Discount</th><th data-i18n="inv.col.subtotal">Sub-total</th></tr></thead>
            <tbody>
              <tr>
                <td>${item.data.name} <div class="item-sku mono">${item.data.serial_number}</div></td>
                <td><span class="brand-tag">${brand.data.name}</span></td>
                <td class="mono">${element.quantity}</td>
                <td><span class="no-discount">${receipt.data.TVA||'_'}</span></td>
                <td class="mono">$${element.subtotal}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div class="receipt-breakdown">
          <div class="brk-row"><span>Total before discount</span><span class="mono">$${element.price}</span></div>
          <div class="brk-row"><span>TVA</span><span class="mono">${receipt.data.TVA}</span></div>
          <div class="brk-row brk-final"><span>Total after discount &amp; TVA</span><span class="mono">$${Number(element.price||0)+Number(receipt.data.TVA||0)}</span></div>
        </div>
        <div class="receipt-foot">
          <span><span class="mono">Items</span>${element.quantity}</span>
          <span><span class="mono">Amount total</span>${element.quantity}</span>
        </div>`
        receiptList.appendChild(card);
      }
    }
  }
  catch(error){
    console.log(error)
  }
  }
  document.getElementById('addReceiptBtn').addEventListener('click', openReceiptModal);
document.addEventListener('DOMContentLoaded', () => {
  receiptsItems()
})