import {server,apis} from "../tools/apis.js"
// companies.js — page-specific logic for companies.html
// Uses the shared modal system in js/modal.js and shared shell behavior in js/base.js

  /* ---- page logic ---- */
  

  // ---- functional search by company name ----
  async function getCompanies() {
    try {
        const response = await axios.post(`${server}${apis.get_brands}`,{});
        const data = response.data;
        const openModalBtn=document.querySelector("#openModalBtn");
        const companies=document.querySelector("#brandsBody");
        data.forEach(brand => {
            const row=document.createElement("tr");
           
            row.innerHTML=`
                <tr data-bid="B-001">
            <td>
              <div class="brand-cell brand-cell-clickable">
                <div class="brand-mark">${brand.name.substring(0, 2).toUpperCase()}</div>
                <div class="brand-name">${brand.name}</div>
              </div>
            </td>
            <td class="mono">${brand.id}</td>
            <td class="mono">${brand.registration_no}</td>
            <td>
              <div class="loc-cell">
                <svg viewBox="0 0 24 24"><path d="M12 21s-7-6.2-7-11a7 7 0 0 1 14 0c0 4.8-7 11-7 11z"/><circle cx="12" cy="10" r="2.5"/></svg>
                Warehouse ${brand.location}
              </div>
            </td>
            <td>
              <div class="phone-cell">
                <span class="phone-pill"><svg viewBox="0 0 24 24"><path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3 19.5 19.5 0 0 1-6-6 19.8 19.8 0 0 1-3-8.7A2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.3 1.8.6 2.7a2 2 0 0 1-.5 2.1L8 9.7a16 16 0 0 0 6 6l1.2-1.2a2 2 0 0 1 2.1-.5c.9.3 1.8.5 2.7.6a2 2 0 0 1 1.7 2z"/></svg>${brand.phone_number}</span>
              </div>
            </td>
            <td class="stat-num-cell">3</td>
            <td>
              <div class="row-actions">
                <button class="icon-btn" aria-label="Edit company"><svg viewBox="0 0 24 24"><path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg></button>
                <button class="icon-btn" aria-label="Company options"><svg viewBox="0 0 24 24"><circle cx="12" cy="5" r="1.2"/><circle cx="12" cy="12" r="1.2"/><circle cx="12" cy="19" r="1.2"/></svg></button>
              </div>
            </td>
          </tr>
            `;
            companies.appendChild(row);
        });
    } catch (error) {
        console.log(error);
        console.error("Error fetching companies:", error);
        throw error;
    }
}
const add_br=async (name,location,phone,email,reg,v_of_items)=>{
  alert(`Adding brand: ${name}, ${location}, ${phone}, ${email}, ${reg}, ${v_of_items}`);
    try {
   
    
     const form=document.getElementById('modalFields');
        
        const textInputs=form.querySelectorAll('input, textarea, select');
        const response = await axios.post(`${server}${apis.create_brand}`,{
          "name": name,
          "location": location||'',
          "v_of_items": v_of_items,
          "email": email||'N/A',
          "phone_number": phone||'',
          "registration_no": reg||0,
        }, {
          headers: {
            "Content-Type": "application/json",
            "Accept": "application/json"
          }
        });
        const data = response.data;
        console.log(data);
    } catch (error) {
      alert("Error adding brand: " + error.message,error.code);
        console.log(error);
        console.error("Error adding brand:", error);
        throw error;
    }
}
  const companySearchInput = document.getElementById('companySearch');
  const companyBody = document.getElementById('brandsBody');
  function runCompanyFilter(){
    const q = companySearchInput.value.trim().toLowerCase();
    Array.from(companyBody.querySelectorAll('tr')).forEach(row => {
      const name = (row.querySelector('.brand-name')?.textContent || '').toLowerCase();
      const finnum = (row.querySelectorAll('td.mono')[1]?.textContent || '').toLowerCase();
      row.style.display = (q === '' || name.includes(q) || finnum.includes(q)) ? '' : 'none';
    });
  }
  companySearchInput.addEventListener('input', runCompanyFilter);

  // ---- Add brand (hardcoded, in-memory only — resets on refresh) ----
  let brandCounter = 7;
  document.getElementById('addBrandBtn').addEventListener('click', () => {
    openModal({
      title: 'Add company',
      titleKey: 'cat.modal.title',
      submitLabel: 'Add company',
      submitKey: 'cat.modal.submit',
      fields: [
        { id: 'name',     label: 'Company name',                labelKey: 'cat.field.name',     placeholder: 'e.g. Samsung', required: true },
        { id: 'finnumber',label: 'Financial number',              labelKey: 'cat.field.finnumber', placeholder: 'e.g. FN-114820' },
        { id: 'location', label: 'Warehouse & city',            labelKey: 'cat.field.location',  placeholder: 'e.g. Warehouse A · Beirut' },
        { id: 'phones',   label: 'Phone nb (comma separated for multiple)', labelKey: 'cat.field.phones', placeholder: 'e.g. +961 71 200 481, +961 01 344 902' },
        { id: 'email',   label: 'email add ', labelKey: 'cat.field.email', placeholder: 'e.g. example@gmail.com' },
        { id: 'salesmen', label: 'Salesmen',                    labelKey: 'cat.col.salesmen',    type: 'number', value: '0', min: '0' }
      ],
      onSubmit(v){
        const tbody = document.getElementById('brandsBody');
        const idStr = String(brandCounter).padStart(3, '0');
        const bid = `B-${idStr}`;
        brandCounter++;
        const mark = v.name.slice(0, 2).toUpperCase();

        const phoneList = (v.phones || '').split(',').map(p => p.trim()).filter(Boolean);
        const phoneHtml = (phoneList.length ? phoneList : ['Unassigned']).map(p => `
          <span class="phone-pill"><svg viewBox="0 0 24 24"><path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3 19.5 19.5 0 0 1-6-6 19.8 19.8 0 0 1-3-8.7A2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.3 1.8.6 2.7a2 2 0 0 1-.5 2.1L8 9.7a16 16 0 0 0 6 6l1.2-1.2a2 2 0 0 1 2.1-.5c.9.3 1.8.5 2.7.6a2 2 0 0 1 1.7 2z"/></svg>${p}</span>
        `).join('');

        const row = document.createElement('tr');
        row.dataset.bid = bid;
        row.innerHTML = `
          <td>
            <div class="brand-cell brand-cell-clickable">
              <div class="brand-mark">${mark}</div>
              <div class="brand-name">${v.name}</div>
            </div>
          </td>
          <td class="mono">${bid}</td>
          <td class="mono">${v.finnumber || '—'}</td>
          <td>
            <div class="loc-cell">
              <svg viewBox="0 0 24 24"><path d="M12 21s-7-6.2-7-11a7 7 0 0 1 14 0c0 4.8-7 11-7 11z"/><circle cx="12" cy="10" r="2.5"/></svg>
              ${v.location || 'Unassigned'}
            </div>
          </td>
          <td><div class="phone-cell">${phoneHtml}</div></td>
          <td class="stat-num-cell">${v.salesmen}</td>
          <td>
            <div class="row-actions">
              <button class="icon-btn" aria-label="Edit company"><svg viewBox="0 0 24 24"><path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg></button>
              <button class="icon-btn" aria-label="Company options"><svg viewBox="0 0 24 24"><circle cx="12" cy="5" r="1.2"/><circle cx="12" cy="12" r="1.2"/><circle cx="12" cy="19" r="1.2"/></svg></button>
            </div>
          </td>`;
        tbody.prepend(row);
        flashElement(row, 'row-flash');
        wireBrandClick(row.querySelector('.brand-cell-clickable'), bid, v.name);
        add_br(v.name, v.location, phoneList.join(', '),  v.email,v.finnumber,brandCounter);
      }
    });
  });

  // ---- click a brand to see only its own products, with full details ----
  // Hardcoded per B.ID for now — once the database is live this becomes a
  // GET /api/brands/{id}/items call instead of a lookup in this object.
  // "cost" here is what this company charges MN Electronics per unit (i.e.
  // the purchase price from that specific supplier), not the selling price
  // shown on the Products page — a given item can have a different cost
  // depending on which company/brand it's sourced from.
  const BRAND_PRODUCTS = {
    'B-001': [
      { name: 'Galaxy A54 Smartphone', sku: 'S-0061', type: 'Mobile', dims: '15.8×7.6×0.8 cm', warehouse: 'Warehouse A', stock: 42, cost: 260 },
      { name: '55" QLED Smart TV',     sku: 'S-0062', type: 'Television', dims: '123×71×6 cm', warehouse: 'Warehouse A', stock: 15, cost: 480 },
      { name: 'Front-Load Washer WW90', sku: 'S-0063', type: 'Laundry', dims: '60×60×85 cm', warehouse: 'Warehouse A', stock: 9, cost: 390 }
    ],
    'B-002': [
      { name: '1.5 Ton Split AC',   sku: 'S-0071', type: 'Climate', dims: '80×28×60 cm', warehouse: 'Warehouse B', stock: 22, cost: 340 },
      { name: '8kg Tumble Dryer',   sku: 'S-0072', type: 'Laundry', dims: '60×60×85 cm', warehouse: 'Warehouse B', stock: 11, cost: 310 }
    ],
    'B-003': [
      { name: '43" LED TV',            sku: 'S-0081', type: 'Television', dims: '97×57×8 cm', warehouse: 'Warehouse A', stock: 18, cost: 210 },
      { name: 'Satellite C50 Laptop',  sku: 'S-0082', type: 'Computing', dims: '36×25×2 cm', warehouse: 'Warehouse A', stock: 7, cost: 450 },
      { name: 'Digital Rice Cooker',   sku: 'S-0083', type: 'Kitchen', dims: '26×26×22 cm', warehouse: 'Warehouse A', stock: 26, cost: 32 },
      { name: 'Cordless Electric Kettle', sku: 'S-0084', type: 'Kitchen', dims: '15×22×20 cm', warehouse: 'Warehouse A', stock: 33, cost: 14 }
    ],
    'B-004': [
      { name: 'iPhone 14',          sku: 'S-0091', type: 'Mobile', dims: '14.7×7.2×0.8 cm', warehouse: 'Warehouse C', stock: 19, cost: 620 },
      { name: 'MacBook Air M2',     sku: 'S-0092', type: 'Computing', dims: '30×21×1 cm', warehouse: 'Warehouse C', stock: 8, cost: 950 }
    ],
    'B-005': [
      { name: 'Refrigerator GR-B247', sku: 'S-0101', type: 'Refrigeration', dims: '70×68×178 cm', warehouse: 'Warehouse B', stock: 12, cost: 410 },
      { name: 'Microwave MS2042',     sku: 'S-0102', type: 'Kitchen', dims: '48×39×28 cm', warehouse: 'Warehouse B', stock: 20, cost: 65 }
    ],
    'B-006': [
      { name: 'Galaxy Tab S9',    sku: 'S-0111', type: 'Tablet', dims: '25.4×16.5×0.6 cm', warehouse: 'Warehouse C', stock: 14, cost: 380 },
      { name: 'Soundbar HW-Q600', sku: 'S-0112', type: 'Audio', dims: '98×6×11 cm', warehouse: 'Warehouse C', stock: 10, cost: 150 }
    ]
  };

  function showBrandProducts(bid, brandName){
    ensureModalMounted();
    document.getElementById('modalTitle').textContent = `${brandName} — Products`;
    document.getElementById('modalSubmitBtn').textContent = 'Close';

    const products = BRAND_PRODUCTS[bid] || [];
    const fieldsWrap = document.getElementById('modalFields');

    if (products.length === 0){
      fieldsWrap.innerHTML = `<div class="product-view-empty">No products recorded for this brand yet.</div>`;
    } else {
      fieldsWrap.innerHTML = `<div class="product-view-list">` + products.map(p => `
        <div class="product-view-item">
          <div class="product-view-name">${p.name}</div>
          <div class="product-view-meta">
            <div>S.nb <span class="mono">${p.sku}</span></div>
            <div>Type <span>${p.type}</span></div>
            <div>Dimensions <span class="mono">${p.dims}</span></div>
            <div>Warehouse <span>${p.warehouse}</span></div>
            <div>Stock <span class="mono">${p.stock}</span></div>
            <div>Cost from this company <span class="mono">$${Number(p.cost || 0).toLocaleString()}</span></div>
          </div>
        </div>
      `).join('') + `</div>`;
    }

    const form = document.getElementById('modalForm');
    if (_modalSubmitHandler) form.removeEventListener('submit', _modalSubmitHandler);
    _modalSubmitHandler = function(e){ e.preventDefault(); closeModal(); };
    form.addEventListener('submit', _modalSubmitHandler);

    requestAnimationFrame(() => document.getElementById('modalOverlay').classList.add('open'));
  }

  function wireBrandClick(cellEl, bid, brandName){
    cellEl.addEventListener('click', () => showBrandProducts(bid, brandName));
  }

  document.querySelectorAll('#brandsBody tr').forEach(row => {
    const cell = row.querySelector('.brand-cell-clickable');
    if (cell) wireBrandClick(cell, row.dataset.bid, row.querySelector('.brand-name').textContent.trim());
  });
document.addEventListener('DOMContentLoaded',()=> {
getCompanies();
})