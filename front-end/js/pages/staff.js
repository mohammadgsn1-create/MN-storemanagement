import {server,apis} from "../tools/apis.js"
// staff.js — page-specific logic for staff.html
// Uses the shared modal system in js/modal.js and shared shell behavior in js/base.js

  /* ---- page logic ---- */
  

  const searchInput = document.getElementById('staffSearch');
  const cards = Array.from(document.querySelectorAll('.staff-card'));
  const resultCount = document.getElementById('resultCount');
  const emptyState = document.getElementById('emptyState');
  let totalCount = cards.length;

  function runFilter(){
    const q = searchInput.value.trim().toLowerCase();
    let visible = 0;
    cards.forEach(card => {
      const sid = card.dataset.sid.toLowerCase();
      const name = (card.querySelector('.staff-name')?.textContent || '').toLowerCase();
      const match = q === '' || sid.includes(q) || name.includes(q);
      card.style.display = match ? '' : 'none';
      if (match) visible++;
    });
    resultCount.innerHTML = `Showing <strong>${visible}</strong> of <strong>${totalCount}</strong> salesmen`;
    emptyState.style.display = visible === 0 ? 'block' : 'none';
  }
  searchInput.addEventListener('input', runFilter);

  // ---- Add staff (hardcoded, in-memory only — resets on refresh) ----
  let staffCounter = 15;
  document.getElementById('addStaffBtn').addEventListener('click', () => {
    openModal({
      title: 'New staff member',
      titleKey: 'staff.modal.title',
      submitLabel: 'Add staff',
      submitKey: 'staff.modal.submit',
      fields: [
        { id: 'name',   label: 'Full name', labelKey: 'cust.field.name', placeholder: 'e.g. R. Baz', required: true },
        { id: 'phone',  label: 'Phone nb',  labelKey: 'cat.col.phone',   placeholder: 'e.g. +961 71 000 000' },
        { id: 'brands', label: 'Assigned brands (comma separated)', labelKey: 'staff.field.brands', placeholder: 'e.g. Frostline, Ember' }
      ],
    async  onSubmit(v){
        const sidStr = String(staffCounter).padStart(3, '0');
        staffCounter++;
        const sid = `SM-${sidStr}`;
        const initials = v.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
        const brandTags = (v.brands || '')
          .split(',').map(b => b.trim()).filter(Boolean)
          .map(b => `<span class="brand-tag">${b}</span>`).join('');

        const card = document.createElement('div');
        card.className = 'staff-card';
        card.dataset.sid = sid;
        card.innerHTML = `
          <div class="staff-top">
            <div class="staff-avatar">${initials}</div>
            <div>
              <div class="staff-name">${v.name}</div>
              <div class="staff-id mono">S.ID ${sid}</div>
            </div>
          </div>
          <div class="staff-detail">
            <svg viewBox="0 0 24 24"><path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3 19.5 19.5 0 0 1-6-6 19.8 19.8 0 0 1-3-8.7A2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.3 1.8.6 2.7a2 2 0 0 1-.5 2.1L8 9.7a16 16 0 0 0 6 6l1.2-1.2a2 2 0 0 1 2.1-.5c.9.3 1.8.5 2.7.6a2 2 0 0 1 1.7 2z"/></svg>
            ${v.phone || '—'}
          </div>
          <div class="staff-brands">${brandTags || '<span class="brand-tag">Unassigned</span>'}</div>`;
         try{
          console.log(v.brands)
            const response=await axios.post(`${server}${apis.create_sales_man}`,{
                'name':v.name,
                'phone_number':v.phone,
                'works_in':v.brands||''
            })
            if(response.status!==200&&response.status!==201){
                alert(`sales_man creation error:${response.status} ${v.name} ${v.phone}`)
                return
            }
            console.log(`${Number(sid||0)}`)
            const data=response.data.salesman;
              console.log(response)
            const create_sales_man_brand=await axios.post(`${server}${apis.create_brand_sales_man}`,{
                'brand_id':data.works_in,
                'sales_man_id':data.id
            })
            if(create_sales_man_brand.status!==200&&create_sales_man_brand.status!==201){
               alert(`Error brand salesman creation:${create_sales_man_brand.status}`)
               return
            }
          
             alert('Salesman created successfully')
        }
        catch(error){
            alert('Something went wrong')
            console.log(error)
        }
        document.getElementById('staffGrid').prepend(card);
        flashElement(card, 'card-flash');
        cards.unshift(card);
        totalCount++;
        runFilter();
      }
    });
  });
   const getSalesMen=async ()=>{
    const get_sales_man=await axios.post(`${server}${apis.get_sales_man}`);
    if(get_sales_man.status!==200&&get_sales_man.status!==201){
        alert("fetch data error")
        return
    }
    const staffGrid=document.getElementById('staffGrid')
    const data=get_sales_man.data
    if(Array.isArray(data)){
        data.forEach(item=>{
            const payload={
                s_name:item.name,
                b_name:item.brand.name,
                s_id:item.id,
                s_phone:item.phone_number
            }
            const div=itemFormate(payload)
            staffGrid.appendChild(div)
        })
    }
  }
  const itemFormate=(v)=>{
    const {s_name,b_name,s_id,s_phone}=v
    const name=s_name.split(' ')
    let div=document.createElement('div');
    div.classList.add('staff-card')
    div.setAttribute('data-sid',`SM-${s_id}`)
    div.innerHTML=`
        <div class="staff-top">
          <div class="staff-avatar">${name[0].substring(0,1).toUpperCase()}${name[1].substring(0,1).toUpperCase()||''}</div>
          <div>
            <div class="staff-name">${s_name.substring(0,1).toUpperCase()}.${name[1]}</div>
            <div class="staff-id mono">S.ID SM-${s_id}</div>
          </div>
        </div>
        <div class="staff-detail">
          <svg viewBox="0 0 24 24"><path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3 19.5 19.5 0 0 1-6-6 19.8 19.8 0 0 1-3-8.7A2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.3 1.8.6 2.7a2 2 0 0 1-.5 2.1L8 9.7a16 16 0 0 0 6 6l1.2-1.2a2 2 0 0 1 2.1-.5c.9.3 1.8.5 2.7.6a2 2 0 0 1 1.7 2z"/></svg>
          ${s_phone}
        </div>
        <div class="staff-brands">
          <span class="brand-tag">${b_name}</span>
        </div>
      `
      return div
  }
  document.addEventListener('DOMContentLoaded', () => {
   
    getSalesMen();
});
