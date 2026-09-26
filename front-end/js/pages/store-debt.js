// store-debt.js — page-specific logic for store-debt.html
// Uses shared shell behavior in js/base.js

import { apis, formatDisplayDate, getData, server } from "../tools/apis.js";

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
  let _modalSubmitHandler = null;
  let _fieldsClickHandler = null;

  /* ---- page logic ---- */
  

  // ---- data model — in-memory only, resets on refresh. Once this needs to
  // persist for real, each loan becomes a row in a store_debts table and
  // each repayment a row in a linked store_debt_repayments table, with the
  // balance computed as amount - SUM(repayments) same as here. ----
  let loanCounter = 3;
  const LOANS = [
    {
      id: 'LOAN-0001',
      lender: "Owner's brother",
      date: 'JUL 15 2026',
      amount: 5000,
      repayments: [
        { date: 'AUG 01 2026', amount: 1000 },
        { date: 'AUG 20 2026', amount: 500 }
      ]
    },
    {
      id: 'LOAN-0002',
      lender: 'Byblos Bank',
      date: 'JUN 01 2026',
      amount: 10000,
      repayments: [
        { date: 'JUL 01 2026', amount: 5000 },
        { date: 'AUG 01 2026', amount: 5000 }
      ]
    }
  ];
  const getLoans = async () => {
    try {
      const respons = await getData(`${server}${apis.get_debts}`, {});
      if (Array.isArray(respons)) {
        for (const loan of respons) {
          LOANS.push({
            id: `LOAN-${loan.id}`,
            lender: loan.lender,
            date: formatDisplayDate(loan.date),
            amount: loan.amount, // was hardcoded to 10000 — use the real amount from the API
            repayments: loan.payments.map(item => {
              return { date: formatDisplayDate(item.date), amount: item.paid };
            })
          });
        }
      }
    } catch (err) {
      console.error('getLoans failed:', err);
    }
  }

  function repaidOf(loan){ return loan.repayments.reduce((s, r) => s + r.amount, 0); }
  function balanceOf(loan){ return loan.amount - repaidOf(loan); }

  function renderLoanRow(loan){
    const repaid = repaidOf(loan);
    const balance = balanceOf(loan);
    const isPaidOff = balance <= 0;
    const row = document.createElement('tr');
    row.dataset.id = loan.id;
    row.dataset.lender = loan.lender;
    row.innerHTML = `
      <td>${loan.lender}</td>
      <td class="mono">${loan.date}</td>
      <td class="mono">$${loan.amount.toLocaleString()}</td>
      <td class="mono">$${repaid.toLocaleString()}</td>
      <td class="mono balance-cell">$${balance.toLocaleString()}</td>
      <td><span class="status-pill ${isPaidOff ? 'paid-off' : 'active-debt'}">${isPaidOff ? 'Paid off' : 'Active'}</span></td>`;
    row.addEventListener('click', () => openLoanDetail(loan.id));
    return row;
  }

  async function  renderAllLoans(){
    await getLoans()
    const tbody = document.getElementById('loansBody');
    tbody.innerHTML = '';
    LOANS.forEach(loan => tbody.appendChild(renderLoanRow(loan)));
    updateSummary();
    runFilter();
  }

  function updateSummary(){
    const borrowed = LOANS.reduce((s, l) => s + l.amount, 0);
    const repaid = LOANS.reduce((s, l) => s + repaidOf(l), 0);
    const owed = borrowed - repaid;
    document.getElementById('summaryBorrowed').textContent = `$${borrowed.toLocaleString()}`;
    document.getElementById('summaryRepaid').textContent = `$${repaid.toLocaleString()}`;
    document.getElementById('summaryOwed').textContent = `$${owed.toLocaleString()}`;
  }

  // ---- search by lender name ----
  const searchInput = document.getElementById('loanSearch');
  const emptyState = document.getElementById('emptyState');
  function runFilter(){
    const q = searchInput.value.trim().toLowerCase();
    const rows = Array.from(document.querySelectorAll('#loansBody tr'));
    let visible = 0;
    rows.forEach(row => {
      const match = q === '' || row.dataset.lender.toLowerCase().includes(q);
      row.style.display = match ? '' : 'none';
      if (match) visible++;
    });
    emptyState.style.display = visible === 0 ? 'block' : 'none';
  }
  searchInput.addEventListener('input', runFilter);

  // ---- loan detail modal: repayment history + record repayment ----
  function renderRepayHistory(loan){
    const repaid = repaidOf(loan);
    const balance = balanceOf(loan);
    const list = loan.repayments.length
      ? loan.repayments.map(r => `
          <div class="repay-row"><span>${r.date}</span><span class="mono">$${r.amount.toLocaleString()}</span></div>
        `).join('')
      : `<div class="repay-empty">No repayments recorded yet.</div>`;

    return `
      <div id="repay-history-section" data-id="${loan.id}">
        <div class="repay-list">${list}</div>
        <button type="button" class="record-btn" data-action="toggle-record">+ Record repayment</button>
        <div class="record-form" id="record-form-repay" style="display:none;">
          <input type="date" class="rp-date">
          <input type="number" class="rp-amount" placeholder="Amount ($)" min="1" max="${balance}">
          <button type="button" class="rp-save" data-action="save-repayment">Save</button>
        </div>
      </div>`;
  }

  function openLoanDetail(id){
    const loan = LOANS.find(l => l.id === id);
    if (!loan) return;
    ensureModalMounted();
    const box = document.getElementById('modalBox');
    box.classList.remove('wide');
    document.getElementById('modalTitle').textContent = loan.lender;
    document.getElementById('modalSubmitBtn').textContent = 'Close';

    function renderBody(){
      const repaid = repaidOf(loan);
      const balance = balanceOf(loan);
      const isPaidOff = balance <= 0;
      const fieldsWrap = document.getElementById('modalFields');
      fieldsWrap.innerHTML = `
        <div class="loan-detail-head">
          <div class="loan-detail-name">${loan.lender}</div>
          <span class="status-pill ${isPaidOff ? 'paid-off' : 'active-debt'}">${isPaidOff ? 'Paid off' : 'Active'}</span>
        </div>
        <div class="loan-detail-grid">
          <div class="loan-detail-item"><span class="label">Date given</span><span class="value mono">${loan.date}</span></div>
          <div class="loan-detail-item"><span class="label">Amount borrowed</span><span class="value mono">$${loan.amount.toLocaleString()}</span></div>
          <div class="loan-detail-item"><span class="label">Repaid so far</span><span class="value mono">$${repaid.toLocaleString()}</span></div>
          <div class="loan-detail-item full"><span class="label">Remaining balance</span><span class="value mono">$${balance.toLocaleString()}</span></div>
        </div>
        <div class="modal-field"><label>Repayment history</label></div>
        ${renderRepayHistory(loan)}
      `;
    }
    renderBody();

    const fieldsWrap = document.getElementById('modalFields');
    if (_fieldsClickHandler) fieldsWrap.removeEventListener('click', _fieldsClickHandler);
    _fieldsClickHandler =async function(e){
      const btn = e.target.closest('[data-action]');
      if (!btn) return;
      const action = btn.dataset.action;

      if (action === 'toggle-record'){
        const formEl = document.getElementById('record-form-repay');
        if (formEl) formEl.style.display = formEl.style.display === 'none' ? 'flex' : 'none';
        return;
      }

      if (action === 'save-repayment'){
        const section = document.getElementById('repay-history-section');
        const dateInput = section.querySelector('.rp-date');
        const amountInput = section.querySelector('.rp-amount');
        const balance = balanceOf(loan);
        const amount = Number(amountInput.value) || 0;

        // validate BEFORE hitting the API, not after
        if (amount <= 0){
          alert('Enter an amount greater than $0.');
          return;
        }
        if (amount > balance){
          alert(`That's more than the remaining balance of $${balance.toLocaleString()}. Enter $${balance.toLocaleString()} or less.`);
          return;
        }

        const dateIso = dateInput.value || new Date().toISOString().slice(0, 10);
        const payload = {
          debt_id: loan.id.slice(5),
          date: dateIso,   // raw ISO date for the backend, not the display-formatted string
          paid: amount     // was sending `balance` — that overpaid the loan by the full remaining amount every time
        };

        let res;
        try {
          res = await getData(`${server}${apis.create_debt_payment}`, payload);
        } catch (err) {
          console.error('create_debt_payment failed:', err);
          alert('Something went wrong');
          return;
        }
        if (!res.accept){
          alert('Something went wrong');
          console.log(res);
          return;
        }
        alert('A payment has been created successfully');

        const dateLabel = dateInput.value
          ? new Date(dateInput.value + 'T00:00:00').toDateString().toUpperCase().split(' ').slice(1).join(' ')
          : new Date().toDateString().toUpperCase().split(' ').slice(1).join(' ');

        loan.repayments.push({ date: dateLabel, amount });

        // Refresh the modal body and the main table row + summary cards.
        renderBody();
        const mainRow = document.querySelector(`#loansBody tr[data-id="${loan.id}"]`);
        if (mainRow){
          const newRow = renderLoanRow(loan);
          mainRow.replaceWith(newRow);
          flashElement(newRow, 'row-flash');
        }
        updateSummary();
        return;
      }
    };
    fieldsWrap.addEventListener('click', _fieldsClickHandler);

    const form = document.getElementById('modalForm');
    if (_modalSubmitHandler) form.removeEventListener('submit', _modalSubmitHandler);
    _modalSubmitHandler = function(e){
      e.preventDefault();
      closeModal();
    };
    form.addEventListener('submit', _modalSubmitHandler);

    requestAnimationFrame(() => document.getElementById('modalOverlay').classList.add('open'));
  }

  // ---- New loan modal ----
  document.getElementById('addLoanBtn').addEventListener('click', () => {
    ensureModalMounted();
    const box = document.getElementById('modalBox');
    box.classList.remove('wide');
    document.getElementById('modalTitle').textContent = 'New loan';
    document.getElementById('modalSubmitBtn').textContent = 'Add loan';

    const fieldsWrap = document.getElementById('modalFields');
    fieldsWrap.innerHTML = `
      <div class="modal-field">
        <label for="nl_lender">Lender name</label>
        <input id="nl_lender" placeholder="e.g. Owner's brother, Byblos Bank" required>
      </div>
      <div class="modal-field">
        <label for="nl_date">Date given</label>
        <input id="nl_date" type="date">
      </div>
      <div class="modal-field">
        <label for="nl_amount">Amount ($)</label>
        <input id="nl_amount" type="number" min="1" step="0.01" placeholder="e.g. 5000">
      </div>
    `;

    const form = document.getElementById('modalForm');
    if (_modalSubmitHandler) form.removeEventListener('submit', _modalSubmitHandler);
    _modalSubmitHandler =async function(e){
      e.preventDefault();
      const lender = document.getElementById('nl_lender').value.trim();
      const dateVal = document.getElementById('nl_date').value;
      const amount = Number(document.getElementById('nl_amount').value) || 0;
      if (!lender || amount <= 0){
        alert('Enter a lender name and an amount greater than $0.');
        return;
      }
      const dateLabel = dateVal
        ? new Date(dateVal + 'T00:00:00').toDateString().toUpperCase().split(' ').slice(1).join(' ')
        : new Date().toDateString().toUpperCase().split(' ').slice(1).join(' ');

      const idStr = String(loanCounter).padStart(4, '0');
      loanCounter++;
      const loan = { id: `LOAN-${idStr}`, lender, date: dateLabel, amount, repayments: [] };

      let payload={
        lender:lender,
        date:dateLabel,
        amount:amount
      }
      let res;
      try {
        res = await getData(`${server}${apis.create_debt}`,payload)
      } catch (err) {
        console.error('create_debt failed:', err);
        alert('Something went wrong')
        return;
      }
      if(!res.accept){
        alert('Something went wrong')
        return;
      }
      alert('You have a new loan')

      LOANS.unshift(loan);
      const tbody = document.getElementById('loansBody');
      const row = renderLoanRow(loan);
      tbody.prepend(row);
      flashElement(row, 'row-flash');
      updateSummary();
      runFilter();

      closeModal();
      form.reset();
    };
    form.addEventListener('submit', _modalSubmitHandler);

    requestAnimationFrame(() => {
      document.getElementById('modalOverlay').classList.add('open');
      document.getElementById('nl_lender').focus();
    });
  });

  renderAllLoans();