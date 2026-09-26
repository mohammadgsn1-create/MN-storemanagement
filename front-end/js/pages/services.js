// services.js — page-specific logic for services.html
// Uses the shared modal system in js/modal.js and shared shell behavior in js/base.js

  /* ---- page logic ---- */
  

  // ---- Add service (hardcoded, in-memory only — resets on refresh) ----
  const SERVICE_ICONS = {
    Maintenance: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.6a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>',
    Delivery: '<rect x="1" y="3" width="15" height="13"/><path d="M16 8h4l3 3v5h-7V8z"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/>',
    Other: '<path d="M20.5 7.3 12 2 3.5 7.3 12 12.6 20.5 7.3Z"/><path d="M3.5 7.3v9.4L12 22l8.5-5.3V7.3"/><path d="M12 12.6V22"/>'
  };

  document.getElementById('addServiceBtn').addEventListener('click', () => {
    openModal({
      title: 'Add service',
      titleKey: 'sv.modal.title',
      submitLabel: 'Add service',
      submitKey: 'sv.modal.submit',
      fields: [
        { id: 'name',     label: 'Service name', labelKey: 'sv.field.name', placeholder: 'e.g. Same-Day Repair', required: true },
        { id: 'type',     label: 'Type', labelKey: 'prod.col.type', type: 'select', options: ['Maintenance', 'Delivery', 'Other'] },
        { id: 'price',    label: 'Price ($)', labelKey: 'sv.field.price', type: 'number', value: '0', min: '0' },
        { id: 'duration', label: 'Duration', labelKey: 'sv.field.duration', placeholder: 'e.g. 45 min, 1–2 days' },
        { id: 'status',   label: 'Status', labelKey: 'sv.field.status', type: 'select', options: ['Active', 'Inactive'] }
      ],
      onSubmit(v){
        const iconPath = SERVICE_ICONS[v.type] || SERVICE_ICONS.Other;
        const badgeClass = v.status === 'Active' ? 'active' : 'inactive';

        const card = document.createElement('div');
        card.className = 'service-card';
        card.innerHTML = `
          <div class="service-top">
            <div class="service-icon"><svg viewBox="0 0 24 24">${iconPath}</svg></div>
            <span class="service-badge ${badgeClass}">${v.status}</span>
          </div>
          <div class="service-name">${v.name}</div>
          <div class="service-type">${v.type}</div>
          <div class="service-meta">
            <div>
              <div class="service-price mono">$${Number(v.price).toLocaleString()}</div>
              <div class="service-price-label">Price</div>
            </div>
            <div class="service-duration">
              <div class="service-duration-val mono">${v.duration || '—'}</div>
              <div class="service-duration-label">Duration</div>
            </div>
          </div>`;

        document.getElementById('serviceGrid').prepend(card);
        flashElement(card, 'card-flash');
      }
    });
  });
