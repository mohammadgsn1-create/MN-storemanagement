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

  
