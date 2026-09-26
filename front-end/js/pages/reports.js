// reports.js — page-specific logic for reports.html
// Uses shared shell behavior in js/base.js

  import { apis, formatDisplayDate, getData, server } from "../tools/apis.js";

  let activeType = 'invoices'; // was missing entirely — idLabel()/renderTable() referenced it before it existed, throwing a ReferenceError on load

  // ---- source data, now loaded from the API via getReportData() below ----
  const DATA = {
    invoices: [],
    receipts: []
  };

  // Fetches the raw invoice line items and receipts and maps them into the
  // flat { id, party, date, total } shape this page's table/report/lookup
  // code expects.
  //
  // apis.get_all_invoices_customer_items (/getAllInvoiceCustomerItems)
  // returns one FLAT record per line item, not one per invoice — e.g. two
  // records can share the same invoice_id (one per item on that invoice).
  // So we group by invoice_id and sum each group's total_price to get one
  // row per invoice, using the customer's flat first_name/last_name and
  // the first record's date. Confirmed against a real response — this
  // mapping matches it.
  //
  // apis.get_brands (/getAllBrands) returns each brand with its items[],
  // and each item has a `receipt` object (or null if it was never put on a
  // receipt) with { receipt_id, date, subtotal, ... }. A receipt can cover
  // several items, so we group by receipt_id and sum subtotal, same as the
  // invoice grouping above. NOTE: this endpoint has no parent-company
  // field (the old sample data's "Frostline (Samsung)" format doesn't
  // exist here) — party is just the brand name.
  async function getReportData(){
    try {
      const [lineItemsRes, brandsRes] = await Promise.all([
        getData(`${server}${apis.get_all_invoices_customer_items}`, {}),
        getData(`${server}${apis.get_brands}`, {})
      ]);

      if (Array.isArray(lineItemsRes)) {
        const invoicesById = {};
        for (const line of lineItemsRes) {
          const id = `INV-${line.invoice_id}`;
          if (!invoicesById[id]) {
            invoicesById[id] = {
              id,
              party: `${line.first_name.charAt(0).toUpperCase()}. ${line.last_name}`,
              date: formatDisplayDate(line.date),
              total: 0
            };
          }
          invoicesById[id].total += line.total_price;
        }
        DATA.invoices = Object.values(invoicesById);
      }

      if (Array.isArray(brandsRes)) {
        const receiptsById = {};
        for (const brand of brandsRes) {
          for (const item of (brand.items || [])) {
            if (!item.receipt) continue;
            const rid = `RCT-${item.receipt.receipt_id}`;
            if (!receiptsById[rid]) {
              receiptsById[rid] = {
                id: rid,
                party: brand.name,
                date: formatDisplayDate(item.receipt.date),
                total: 0
              };
            }
            receiptsById[rid].total += item.receipt.subtotal;
          }
        }
        DATA.receipts = Object.values(receiptsById);
      }
    } catch (err) {
      console.error('getReportData failed:', err);
    }
  }

  // Customer debt status — matches the "Debt status" column on the
  // Customers page for these same sample customers. Once invoices/payments
  // share a real database, this should be a live sum of (invoice total −
  // payments logged) per customer instead of a hardcoded lookup.
  const CUSTOMER_DEBT = {
    "R. Haddad": 540,
    "S. Khalil": 890,
    "N. Aziz":   870,
    "L. Fares":  0,
    "D. Nassar": 0,
    "M. Jaber":  0
  };

  // Receipts store the brand name together with its parent company in
  // parentheses (e.g. "Frostline (Samsung)") since Receipts/Products and
  // the Companies page currently use two different sample name sets — see
  // the note in receipts.html. Company search below matches on either name.
  function parseCompanyParty(party){
    const m = party.match(/^(.*)\s\((.*)\)$/);
    return m ? { brand: m[1], parent: m[2] } : { brand: party, parent: '' };
  }

  function getCustomerNames(){
    return [...new Set(DATA.invoices.map(i => i.party))];
  }
  function getCompanyNames(){
    const set = new Set();
    DATA.receipts.forEach(r => {
      const { brand, parent } = parseCompanyParty(r.party);
      set.add(r.party); // keep the combined display string as the canonical key
    });
    return [...set];
  }
  let reportCounter = 13;

  const tabInvoices = document.getElementById('tabInvoices');
  const tabReceipts = document.getElementById('tabReceipts');
  const sourceThead = document.getElementById('sourceThead');
  const sourceBody = document.getElementById('sourceBody');
  const selectAll = document.getElementById('selectAll');
  const selectionCount = document.getElementById('selectionCount');
  const generateBtn = document.getElementById('generateBtn');
  const savedReportsBody = document.getElementById('savedReportsBody');

  function idLabel(){
    return activeType === 'invoices' ? 'Invoices' : 'Receipts';
  }

  function renderTable(){
    sourceThead.innerHTML = `<tr>
      <th></th>
      <th>${idLabel()}</th>
      <th data-i18n="rp.col.party">Customer / Brand</th>
      <th data-i18n="rp.col.date">Date</th>
      <th data-i18n="rp.col.total">Total</th>
    </tr>`;
    sourceBody.innerHTML = DATA[activeType].map(row => `
      <tr>
        <td class="checkbox-cell"><input type="checkbox" class="row-check" data-id="${row.id}" data-party="${row.party}" data-date="${row.date}" data-total="${row.total}"></td>
        <td class="mono">${row.id}</td>
        <td>${row.party}</td>
        <td class="mono">${row.date}</td>
        <td class="mono">$${row.total.toLocaleString()}</td>
      </tr>
    `).join('');
    selectAll.checked = false;
    attachRowListeners();
    updateSelectionCount();
  }

  function attachRowListeners(){
    document.querySelectorAll('.row-check').forEach(cb => {
      cb.addEventListener('change', updateSelectionCount);
    });
  }

  function updateSelectionCount(){
    const checked = document.querySelectorAll('.row-check:checked');
    selectionCount.innerHTML = `<strong>${checked.length}</strong> selected`;
    generateBtn.disabled = checked.length === 0;
  }

  tabInvoices.addEventListener('click', () => {
    activeType = 'invoices';
    tabInvoices.classList.add('active');
    tabReceipts.classList.remove('active');
    renderTable();
  });
  tabReceipts.addEventListener('click', () => {
    activeType = 'receipts';
    tabReceipts.classList.add('active');
    tabInvoices.classList.remove('active');
    renderTable();
  });
  selectAll.addEventListener('change', () => {
    document.querySelectorAll('.row-check').forEach(cb => cb.checked = selectAll.checked);
    updateSelectionCount();
  });

  function buildAndPrint(type, items){
    const heading = document.getElementById('printHeading');
    const meta = document.getElementById('printMeta');
    const thead = document.getElementById('printThead');
    const tbody = document.getElementById('printBody');
    const totalEl = document.getElementById('printTotal');

    const label = type === 'invoices' ? 'Invoice Report' : 'Receipt Report';
    heading.textContent = `MN Electronics — ${label}`;
    meta.textContent = `Generated ${new Date().toDateString()} · ${items.length} item(s)`;

    thead.innerHTML = `<tr>
      <th>${type === 'invoices' ? 'Invoice' : 'Receipt'}</th>
      <th>${type === 'invoices' ? 'Customer' : 'Brand'}</th>
      <th>Date</th>
      <th>Total</th>
    </tr>`;

    let sum = 0;
    tbody.innerHTML = items.map(it => {
      sum += it.total;
      return `<tr><td>${it.id}</td><td>${it.party}</td><td>${it.date}</td><td>$${it.total.toLocaleString()}</td></tr>`;
    }).join('');
    totalEl.textContent = `Grand total: $${sum.toLocaleString()}`;
    document.getElementById('printExtra').textContent = '';

    window.print();
  }

  function addSavedReport(type, ids){
    const idStr = String(reportCounter).padStart(4, '0');
    reportCounter++;
    const typeLabel = type === 'invoices' ? 'Invoices' : 'Receipts';
    const row = document.createElement('tr');
    row.dataset.type = type;
    row.dataset.ids = ids.join(',');
    row.innerHTML = `
      <td class="mono">RPT-${idStr}</td>
      <td><span class="type-tag ${type}">${typeLabel}</span></td>
      <td class="mono">${new Date().toDateString().toUpperCase()}</td>
      <td class="mono">${ids.length}</td>
      <td>
        <button class="icon-btn reprint-btn" aria-label="Reprint report">
          <svg viewBox="0 0 24 24"><path d="M6 9V2h12v7"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>
        </button>
      </td>`;
    savedReportsBody.prepend(row);
    attachReprintListeners();
  }

  generateBtn.addEventListener('click', () => {
    const checked = Array.from(document.querySelectorAll('.row-check:checked'));
    if (checked.length === 0) return;
    const items = checked.map(cb => ({
      id: cb.dataset.id, party: cb.dataset.party, date: cb.dataset.date, total: Number(cb.dataset.total)
    }));
    buildAndPrint(activeType, items);
    addSavedReport(activeType, items.map(i => i.id));
  });

  function attachReprintListeners(){
    document.querySelectorAll('.reprint-btn').forEach(btn => {
      btn.onclick = () => {
        const row = btn.closest('tr');
        const type = row.dataset.type;
        const ids = row.dataset.ids.split(',');
        const pool = DATA[type];
        const items = ids.map(id => pool.find(p => p.id === id)).filter(Boolean);
        if (items.length === 0){
          // saved report references an id not in the current sample pool — still print what we know
          buildAndPrint(type, ids.map(id => ({ id, party: '—', date: '—', total: 0 })));
        } else {
          buildAndPrint(type, items);
        }
      };
    });
  }

  // ---- Customer report lookup ----
  const custLookupSearch = document.getElementById('custLookupSearch');
  const custLookupDropdown = document.getElementById('custLookupDropdown');
  const custLookupResult = document.getElementById('custLookupResult');
  let selectedCustomer = null;

  function renderCustDropdown(query){
    const q = query.trim().toLowerCase();
    const names = getCustomerNames();
    const matches = q === '' ? names : names.filter(n => n.toLowerCase().includes(q));
    custLookupDropdown.innerHTML = matches.length
      ? matches.map(n => `<div class="lookup-dropdown-item" data-name="${n}">${n}</div>`).join('')
      : `<div class="lookup-dropdown-empty">No matching customer</div>`;
    custLookupDropdown.classList.add('open');
  }
  custLookupSearch.addEventListener('focus', () => renderCustDropdown(custLookupSearch.value));
  custLookupSearch.addEventListener('input', () => renderCustDropdown(custLookupSearch.value));
  custLookupSearch.addEventListener('blur', () => setTimeout(() => custLookupDropdown.classList.remove('open'), 150));
  custLookupDropdown.addEventListener('mousedown', (e) => {
    const item = e.target.closest('.lookup-dropdown-item[data-name]');
    if (!item) return;
    e.preventDefault();
    selectedCustomer = item.dataset.name;
    custLookupSearch.value = selectedCustomer;
    custLookupDropdown.classList.remove('open');
    renderCustomerResult(selectedCustomer);
  });

  function renderCustomerResult(name){
    const orders = DATA.invoices.filter(i => i.party === name);
    const total = orders.reduce((s, o) => s + o.total, 0);
    const owed = CUSTOMER_DEBT[name] || 0;
    const debtBadge = owed > 0
      ? `<span class="lookup-badge owes">Owes $${owed.toLocaleString()}</span>`
      : `<span class="lookup-badge clear">All debts cleared</span>`;

    custLookupResult.innerHTML = `
      <div class="lookup-result-head">
        <span class="lookup-result-name">${name}</span>
        ${debtBadge}
      </div>
      ${orders.map(o => `
        <div class="lookup-row"><span>${o.id} <span class="mono" style="color:var(--steel);">· ${o.date}</span></span><span class="mono">$${o.total.toLocaleString()}</span></div>
      `).join('')}
      <div class="lookup-total-row"><span>Total ordered</span><span class="mono">$${total.toLocaleString()}</span></div>
      <button class="btn-primary lookup-print-btn" id="custPrintBtn">
        <svg viewBox="0 0 24 24"><path d="M6 9V2h12v7"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>
        Print customer report
      </button>`;

    document.getElementById('custPrintBtn').addEventListener('click', () => buildAndPrintCustomerReport(name));
  }

  function buildAndPrintCustomerReport(name){
    const orders = DATA.invoices.filter(i => i.party === name);
    const total = orders.reduce((s, o) => s + o.total, 0);
    const owed = CUSTOMER_DEBT[name] || 0;

    document.getElementById('printHeading').textContent = `MN Electronics — Customer Report`;
    document.getElementById('printMeta').textContent = `${name} · Generated ${new Date().toDateString()} · ${orders.length} order(s)`;
    document.getElementById('printThead').innerHTML = `<tr><th>Invoice</th><th>Date</th><th>Total</th></tr>`;
    document.getElementById('printBody').innerHTML = orders.map(o =>
      `<tr><td>${o.id}</td><td>${o.date}</td><td>$${o.total.toLocaleString()}</td></tr>`
    ).join('');
    document.getElementById('printTotal').textContent = `Total ordered: $${total.toLocaleString()}`;
    document.getElementById('printExtra').textContent = owed > 0
      ? `Outstanding balance: $${owed.toLocaleString()}`
      : `All debts cleared`;
    window.print();
  }

  // ---- Company report lookup ----
  const companyLookupSearch = document.getElementById('companyLookupSearch');
  const companyLookupDropdown = document.getElementById('companyLookupDropdown');
  const companyLookupResult = document.getElementById('companyLookupResult');

  function renderCompanyDropdown(query){
    const q = query.trim().toLowerCase();
    const names = getCompanyNames();
    const matches = q === '' ? names : names.filter(n => n.toLowerCase().includes(q));
    companyLookupDropdown.innerHTML = matches.length
      ? matches.map(n => `<div class="lookup-dropdown-item" data-name="${n}">${n}</div>`).join('')
      : `<div class="lookup-dropdown-empty">No matching company</div>`;
    companyLookupDropdown.classList.add('open');
  }
  companyLookupSearch.addEventListener('focus', () => renderCompanyDropdown(companyLookupSearch.value));
  companyLookupSearch.addEventListener('input', () => renderCompanyDropdown(companyLookupSearch.value));
  companyLookupSearch.addEventListener('blur', () => setTimeout(() => companyLookupDropdown.classList.remove('open'), 150));
  companyLookupDropdown.addEventListener('mousedown', (e) => {
    const item = e.target.closest('.lookup-dropdown-item[data-name]');
    if (!item) return;
    e.preventDefault();
    const name = item.dataset.name;
    companyLookupSearch.value = name;
    companyLookupDropdown.classList.remove('open');
    renderCompanyResult(name);
  });

  // NOTE: each receipt's own total is treated here as what's owed to that
  // company from that purchase date — this page doesn't yet track partial
  // payments per receipt. For live, up-to-date balances after payments,
  // see the Debit & Credit page.
  function renderCompanyResult(name){
    const receipts = DATA.receipts.filter(r => r.party === name);
    const totalOwed = receipts.reduce((s, r) => s + r.total, 0);

    companyLookupResult.innerHTML = `
      <div class="lookup-result-head">
        <span class="lookup-result-name">${name}</span>
      </div>
      ${receipts.map(r => `
        <div class="lookup-row"><span>${r.id} <span class="mono" style="color:var(--steel);">· ${r.date}</span></span><span class="mono">$${r.total.toLocaleString()}</span></div>
      `).join('')}
      <div class="lookup-total-row"><span>Total owed across all receipts</span><span class="mono">$${totalOwed.toLocaleString()}</span></div>
      <div class="lookup-empty-hint" style="margin-top:8px;">For live balances after partial payments, check the Debit &amp; Credit page.</div>
      <button class="btn-primary lookup-print-btn" id="companyPrintBtn">
        <svg viewBox="0 0 24 24"><path d="M6 9V2h12v7"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>
        Print company report
      </button>`;

    document.getElementById('companyPrintBtn').addEventListener('click', () => buildAndPrintCompanyReport(name));
  }

  function buildAndPrintCompanyReport(name){
    const receipts = DATA.receipts.filter(r => r.party === name);
    const totalOwed = receipts.reduce((s, r) => s + r.total, 0);

    document.getElementById('printHeading').textContent = `MN Electronics — Company Report`;
    document.getElementById('printMeta').textContent = `${name} · Generated ${new Date().toDateString()} · ${receipts.length} receipt(s)`;
    document.getElementById('printThead').innerHTML = `<tr><th>Receipt</th><th>Date</th><th>Amount</th></tr>`;
    document.getElementById('printBody').innerHTML = receipts.map(r =>
      `<tr><td>${r.id}</td><td>${r.date}</td><td>$${r.total.toLocaleString()}</td></tr>`
    ).join('');
    document.getElementById('printTotal').textContent = `Total owed: $${totalOwed.toLocaleString()}`;
    document.getElementById('printExtra').textContent = '';
    window.print();
  }

  (async () => {
    await getReportData();
    renderTable();
    attachReprintListeners();
  })();