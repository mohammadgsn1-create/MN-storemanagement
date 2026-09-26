import {server,apis} from "../tools/apis.js"
// products.js — page-specific logic for products.html
// Uses shared shell behavior in js/base.js

  /* Canonical product type list — keep in sync with the filter chips in the
   toolbar above. value = slug used for filtering/data-type, label = display
   text (also the data-i18n key suffix: prod.cat.<camelCase of slug>). */
const getItems = async () => {
  try {
    const response = await axios.post(`${server}${apis.get_items}`,{});
    const products_body = document.getElementById('productsBody');
    const data = await response.data;
   
    for (const item of data) {
      
      const getwarehouse = await axios.post(`${server}${apis.get_warehouse}`,{"serial_number":item.serial_number});
       
      const getItemBrand=await axios.post(`${server}${apis.get_brand_by_id}`,{"brand_id":item.brand_id});
      const brandData=getItemBrand.data;
      
      const newProducts = document.createElement('tr');
      const isWareHouse=Boolean(getwarehouse.data&&typeof getwarehouse.data==='object'&&Object.keys(getwarehouse).length>0);
      newProducts.classList.add("row-hover");
      if(isWareHouse){
        console.log(item)
        newProducts.innerHTML=`<td class="mono">S-${item.serial_number}</td>
            <td class="mono id-sub">${item.Barcode}</td>
            <td>
              <div class="prod-name"><span class="swatch" style="background:#C9D3E0"></span>${item.name}</div>
              <div class="prod-sub">${item.height}x${item.width}x${item.depth} cm</div>
            </td>
            <td><span class="brand-tag">${brandData.name}</span></td>
            <td data-i18n="prod.cat.refrigeration">${item.type}</td>
            <td><div class="origin-cell"><svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg><span data-i18n="prod.origin.kr">${item.Origin}</span></div></td>
            <td class="mono">${item.height}x${item.width}x${item.depth}</td>
            <td data-i18n="prod.wh.a"> ${getwarehouse.name}</td>
            <td class="mono">$${item.price}</td>
            <td><input type="number" class="min-input" value="20" min="0"></td>
            <td>
              <div class="stock-cell">
                <div class="stock-bar"><div class="stock-fill" style="width:74%"></div></div>
                <span class="stock-num">74</span>
              </div>
            </td>
            <td>
              <div class="row-actions">
                <button class="icon-btn" aria-label="Edit product"><svg viewBox="0 0 24 24"><path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg></button>
                <button class="icon-btn" aria-label="Delete product"><svg viewBox="0 0 24 24"><path d="M3 6h18"/><path d="M8 6V4h8v2"/><path d="M19 6l-1 14H6L5 6"/></svg></button>
              </div>
            </td>`
      }
     products_body.appendChild(newProducts);
    
    }
    return data;
  }
    catch (error) {
    console.error('Error fetching items:', error);
    return [];
  }
};


const createProduct=async (params)=>{
  const {sn,n,t,c,h,w,d,p,bi,ba,o,wn,wl,st,tva,dis,mins}=params
  alert(p)
    try{
    console.log(bi)
    const brand=await axios.post(`${server}${apis.get_brand_by_name}`,{"name":bi})
    
    if(brand.status!==200&&brand.status!==201){
     alert(`Brand Error bi: ${bdata.id}`)
     
    }
    const bdata=brand.data;
    console.log(brand)
    const item=await axios.post(`${server}${apis.get_item_by_serial_number}`,{"serial_number":sn});
    if(!item.data.exist){
    const new_product=await axios.post(`${server}${apis.create_item}`,{
        'serial_number':sn,
        'name':n,
        'type':t,
        'color':c,
        'height':h,
        'width':w,
        'depth':d,
        'price':p,
        'brand_id':bdata.id,
        'barcode':ba,
        'Origin':o,
        'TVA':tva,
        'discount':dis
    })
    
if(new_product.status!==200&&new_product.status!==201){
    alert("Error");
}
else{
    alert(`The product has bin created successfully `)
    const getwarehouse=await axios.post(`${server}${apis.get_warehouse}`,{"name":wn,"location":wl});
    alert(`code status: ${getwarehouse.status}`)
    if(!getwarehouse.data.exist){
        const created=await axios.post(`${server}${apis.create_stored_in_item}`,{
            'serial_number':sn,
            'location':wl,
            'amount':st,
            'name':wn,
            'min_stock':mins
        })
        console.log(created)
        if(created.status!==200&&created.status!==201){
            alert(`Warehouse creating error: ${created.status}`)
        }
        else{
            alert(`Warehouse created successfully${"message: "+created.data.message}`)
        }
    }
}

}
else{
    const update_item=await axios.post(`${server}${apis.update_item}`,
        {"serial_number":sn,
        'name':n,
        'type':t,
        'color':c,
        'height':h,
        'width':w,
        'depth':d,
        'price':p,
        'brand_id':bdata.id,
        'barcode':ba,
        'Origin':o

    })
     const update_items=await axios.post(`${server}${apis.update_stored_in_item}`,{
            "serial_number":sn,
            "location":wl,
            "amount":st,
            "name":wn
        })
        if(update_items.status.ok){
            alert(`Warehouse update error: ${ update_item.data.message}`)
        }
        else{
            alert(`Warehouse updated successfully`)
        }
}
}
    catch(error){
        alert(error);
    }

}
const PRODUCT_TYPES = [
  { value: 'refrigeration',     label: 'Refrigeration' },
  { value: 'washing-machines',  label: 'Washing machines' },
  { value: 'cooking',           label: 'Cooking' },
  { value: 'climate',           label: 'Climate' },
  { value: 'mixers',            label: 'Mixers' },
  { value: 'blenders',          label: 'Blenders' },
  { value: 'coffee-machines',   label: 'Coffee machines' },
  { value: 'water-dispensers',  label: 'Water dispensers' }
];

/* Companies list for the "Brand" dropdown — keep in sync with the
   companies on the Companies page. Front-end-only for now (no shared
   database yet), so this is hardcoded; once products and companies
   share a real data store, this should be replaced by an actual
   fetch of the companies list. */
let COMPANIES = [
  { value: 'samsung', label: 'Samsung' },
  { value: 'lg',       label: 'LG' },
  { value: 'toshiba',  label: 'Toshiba' },
  { value: 'apple',    label: 'Apple' }
];
async function getCompanies() {
    try {
        const response = await axios.post(`${server}${apis.get_brands}`,{});
        if(response.status!==200&&response.status!==201){
          alert('Fail to fetch companies'),
          console.log(response)
        }
        
        const data = response.data;
       
        for(const item of data){
           COMPANIES.push({value:item.name,label:item.name})
        }
       
        
      }

    catch(err){
      console.log(err)
    }}
/* Country-of-origin options for the "Made in" dropdown — edit freely. */
const ORIGIN_COUNTRIES = [
  { value: 'south-korea', label: 'South Korea' },
  { value: 'germany',     label: 'Germany' },
  { value: 'italy',       label: 'Italy' },
  { value: 'japan',       label: 'Japan' },
  { value: 'china',       label: 'China' },
  { value: 'usa',         label: 'USA' },
  { value: 'turkey',      label: 'Turkey' }
];

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
    const fullClass = f.full ? ' field-full' : '';
    if (f.type === 'select'){
      const opts = (f.options || []).map(o => {
        const val = (o && typeof o === 'object') ? o.value : o;
        const lbl = (o && typeof o === 'object') ? o.label : o;
        return `<option value="${val}">${lbl}</option>`;
      }).join('');
      return `<div class="modal-field${fullClass}">
        <label for="${fid}">${fLabel}</label>
        <select id="${fid}">${opts}</select>
      </div>`;
    }
    return `<div class="modal-field${fullClass}">
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

  /* ---- page logic ---- */
  

  // ---- functional search by S.nb (serial number) + type filter chips ----
  const productSearchInput = document.getElementById('productSearch');
  let activeType = 'all';

  function runProductFilter(){
    const q = productSearchInput.value.trim().toLowerCase();
    document.querySelectorAll('#productsBody tr').forEach(row => {
      const snb = (row.querySelector('td.mono')?.textContent || '').toLowerCase();
      const name = (row.querySelector('.prod-name')?.textContent || '').toLowerCase();
      const matchesSearch = (q === '' || snb.includes(q) || name.includes(q));
      const matchesType = (activeType === 'all' || row.dataset.type === activeType);
      row.style.display = (matchesSearch && matchesType) ? '' : 'none';
    });
  }
  productSearchInput.addEventListener('input', runProductFilter);

  // Type filter chips
  document.querySelectorAll('#typeFilters .filter-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      document.querySelectorAll('#typeFilters .filter-chip').forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      activeType = chip.dataset.type;
      runProductFilter();
    });
  });

  // ---- Add product (hardcoded, in-memory only — resets on refresh) ----
  // Price lookup keyed by S.nb — stand-in for the real per-item purchase
  // price recorded when a receipt is entered (see Receipts page). In this
  // front-end-only build there's no shared database yet, so this table is
  // just the known items; once receipts and products share a real data
  // store, this lookup should be replaced by an actual query against
  // that item's most recent receipt entry.
  const RECEIPT_PRICE_LOOKUP = {
    'S-0041': 890, 'S-0038': 410, 'S-0052': 520,
    'S-0019': 310, 'S-0027': 18,  'S-0044': 340
  };
  const NAME_TO_SNB = {
    'quietcool 410 fridge': 'S-0041', 'torrent 9kg washer': 'S-0038',
    'ember 5-burner range': 'S-0052', 'climate air ac-12': 'S-0019',
    'ember 2-slot toaster': 'S-0027', 'hydra slim dishwasher': 'S-0044'
  };
  function tryAutofillPrice(){
    const snbEl = document.getElementById('mf_snb');
    const nameEl = document.getElementById('mf_name');
    const priceEl = document.getElementById('mf_price');
    if (!snbEl || !nameEl || !priceEl) return;
    const snb = snbEl.value.trim().toUpperCase();
    const name = nameEl.value.trim().toLowerCase();
    const match = RECEIPT_PRICE_LOOKUP[snb] ?? RECEIPT_PRICE_LOOKUP[NAME_TO_SNB[name]];
    if (match != null){
      priceEl.value = match;
      priceEl.classList.add('autofilled');
    } else {
      priceEl.classList.remove('autofilled');
    }
  }

  document.getElementById('addProductBtn').addEventListener('click',async () => {
   await getCompanies()
    openModal({
      title: 'Add product',
      titleKey: 'prod.modal.title',
      submitLabel: 'Add product',
      submitKey: 'prod.modal.submit',
      fields: [
        { id: 'snb',       label: 'S.nb',          labelKey: 'prod.col.snb',       placeholder: 'S-0053', required: true },
        { id: 'barcode',   label: 'Barcode',        labelKey: 'prod.col.barcode',   placeholder: 'e.g. 8901234567897' },
        { id: 'name',      label: 'Item name',     labelKey: 'prod.field.name',    placeholder: 'e.g. QuietCool 500 Fridge', required: true, full: true },
        { id: 'color',   label: 'color',        labelKey: 'prod.col.color',   placeholder: 'e.g. white' },
        { id: 'dims',      label: 'Dimensions',    labelKey: 'prod.col.dimensions',placeholder: 'e.g. 180x70x65 cm' },
        { id: 'brand',     label: 'Brand',         labelKey: 'prod.col.brand',     type: 'select', options: COMPANIES },
        { id: 'type',      label: 'Type',          labelKey: 'prod.col.type',      type: 'select', options: PRODUCT_TYPES },
        { id: 'origin',    label: 'Made in',       labelKey: 'prod.field.madeIn',  type: 'select', options: ORIGIN_COUNTRIES },
        { id: 'warehouse', label: 'Warehouse',     labelKey: 'prod.col.warehouse', placeholder: 'e.g. Warehouse A' },
        { id: 'price',       label: 'Price (auto-filled from receipt)', labelKey: 'prod.field.priceFromReceipt', type: 'number', value: '0', min: '0', step: '0.01' },
        { id: 'sellingprice',label: 'Selling price ($)', labelKey: 'prod.col.sellingPrice', type: 'number', value: '0', min: '0', step: '0.01' },
        { id: 'discount',    label: 'Discount (%)',      labelKey: 'prod.col.discount',     type: 'number', value: '0', min: '0', max: '100' },
        { id: 'tva',         label: 'TVA (%)',           labelKey: 'prod.col.tva',          type: 'number', value: '11', min: '0' },
        { id: 'stock',     label: 'Stock',         labelKey: 'prod.col.stock',     type: 'number', value: '0', min: '0' },
        { id: 'minstock',  label: 'Min stock (alert threshold)', labelKey: 'prod.field.minStock', type: 'number', value: '20', min: '0' }
      ],
      onSubmit(v){
        const tbody = document.getElementById('productsBody');
        const stock = Math.max(0, Math.min(100, Number(v.stock) || 0));
        const min = Math.max(0, Number(v.minstock) || 0);
        const fillClass = stockFillClass(stock, min);
        const row = document.createElement('tr');
        row.className = 'row-hover';
        row.dataset.stock = stock;
        row.dataset.type = v.type;
        const typeLabel = (PRODUCT_TYPES.find(t => t.value === v.type) || {}).label || v.type;
        const brandLabel = (COMPANIES.find(c => c.value === v.brand) || {}).label || v.brand;
        const originLabel = (ORIGIN_COUNTRIES.find(o => o.value === v.origin) || {}).label || v.origin;
        row.innerHTML = `
          <td class="mono">${v.snb}</td>
          <td class="mono id-sub">${v.barcode || '—'}</td>
          <td>
            <div class="prod-name"><span class="swatch" style="background:#3DA5FF"></span>${v.name}</div>
            <div class="prod-sub">${v.dims}</div>
          </td>
          <td><span class="brand-tag">${brandLabel}</span></td>
          <td>${typeLabel}</td>
          <td><div class="origin-cell"><svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>${originLabel || '—'}</div></td>
          <td class="mono">${v.dims}</td>
          <td>${v.warehouse}</td>
          <td class="mono">$${Number(v.sellingprice.toLocaleString() || 0)}</td>
          <td>${Number(v.discount) ? `<span class="discount-tag">-${v.discount}%</span>` : '<span class="no-discount">—</span>'}</td>
          <td class="mono">${Number(v.tva) || 0}%</td>
          <td><input type="number" class="min-input" value="${min}" min="0"></td>
          <td>
            <div class="stock-cell">
              <div class="stock-bar"><div class="stock-fill ${fillClass}" style="width:${stock}%"></div></div>
              <span class="stock-num">${stock}</span>
            </div>
          </td>
          <td>
            <div class="row-actions">
              <button class="icon-btn" aria-label="Edit product"><svg viewBox="0 0 24 24"><path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg></button>
              <button class="icon-btn" aria-label="Delete product"><svg viewBox="0 0 24 24"><path d="M3 6h18"/><path d="M8 6V4h8v2"/><path d="M19 6l-1 14H6L5 6"/></svg></button>
            </div>
          </td>`;
        tbody.prepend(row);
        flashElement(row, 'row-flash');
        wireMinInput(row.querySelector('.min-input'), row);
        checkStockAlerts();
        runProductFilter();
        //sn,n,t,c,h,w,d,p,bi,ba,o,wn,wl,st
        const dims=v.dims.split('x');
        const warehouse=v.warehouse.split(',');
        console.log(COMPANIES.find(c => c.value === v.brand))
        const params={
          sn:v.snb,
          n:v.name,
          t:v.type,
          c:v.color,
          h:dims[0],
          w:dims[1],
          d:dims[2],
          p:Number(v.sellingprice.toLocaleString() || 0),
          bi:v.brand,
          ba:v.barcode,
          o:v.origin,
          wn:warehouse[0],
          wl:warehouse[1]||'',
          st:stock,
          tva:v.tva,
          dis:v.discount,
          mins:v.minstock
        }
        createProduct(params);
      }
    });

    // Wire up auto-fill: once S.nb or the item name is typed, check the
    // lookup and fill the Price field automatically.
    document.getElementById('mf_snb').addEventListener('input', tryAutofillPrice);
    document.getElementById('mf_name').addEventListener('input', tryAutofillPrice);
  });

  // ---- low-stock alerts, driven by each row's own manually-set minimum ----
  function stockFillClass(stock, min){
    if (stock <= min) return 'crit';
    if (stock <= min * 1.5) return 'low';
    return '';
  }

  function recalcRow(row){
    const stock = Number(row.dataset.stock) || 0;
    const minInput = row.querySelector('.min-input');
    const min = Math.max(0, Number(minInput.value) || 0);
    const fill = row.querySelector('.stock-fill');
    fill.className = 'stock-fill ' + stockFillClass(stock, min);
  }

  function checkStockAlerts(){
    const banner = document.getElementById('stockAlertBanner');
    const list = document.getElementById('stockAlertList');
    const rows = document.querySelectorAll('#productsBody tr');
    const offenders = [];

    rows.forEach(row => {
      const stock = Number(row.dataset.stock) || 0;
      const minInput = row.querySelector('.min-input');
      const min = Math.max(0, Number(minInput.value) || 0);
      if (stock <= min){
        const name = row.querySelector('.prod-name').textContent.trim();
        offenders.push(`${name} — <span class="mono">${stock}/${min}</span>`);
      }
    });

    if (offenders.length > 0){
      list.innerHTML = offenders.join('<br>');
      banner.classList.add('show');
    } else {
      banner.classList.remove('show');
    }
  }

  function wireMinInput(input, row){
    input.addEventListener('input', () => {
      recalcRow(row);
      checkStockAlerts();
    });
  }

  document.querySelectorAll('#productsBody tr').forEach(row => {
    wireMinInput(row.querySelector('.min-input'), row);
  });

  document.getElementById('stockAlertDismiss').addEventListener('click', () => {
    document.getElementById('stockAlertBanner').classList.remove('show');
  });

  checkStockAlerts();
document.addEventListener('DOMContentLoaded', () => {
  getItems();
  
})