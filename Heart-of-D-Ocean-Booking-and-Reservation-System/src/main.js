// main.js - single file for client-side demo logic
(function(){
  // simple utility
  const $ = (sel, ctx=document)=> ctx.querySelector(sel);
  const $$ = (sel, ctx=document)=> Array.from(ctx.querySelectorAll(sel));

  /* --------- Promo slide behavior ---------- */
  const promo = $('#promoSlide');
  if(promo){
    const close = $('#closePromo');
    if(localStorage.getItem('promoClosed') === '1') promo.classList.add('hidden');
    close?.addEventListener('click', ()=> {
      promo.classList.add('hidden'); localStorage.setItem('promoClosed','1');
    });
  }

  /* --------- Dark mode toggle ---------- */
  function applyTheme(theme){
    if(theme === 'dark') document.documentElement.setAttribute('data-theme','dark');
    else document.documentElement.removeAttribute('data-theme');
  }
  const stored = localStorage.getItem('theme') || 'light';
  applyTheme(stored);
  $$('#darkToggle, #darkToggle2').forEach(btn=>{
    btn?.addEventListener('click', ()=>{
      const next = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      applyTheme(next);
      localStorage.setItem('theme', next);
    });
  });

  /* --------- Mini gallery on home & gallery page ---------- */
  const galleryImgs = [
    "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1200&q=60",
    "https://images.unsplash.com/photo-1503264116251-35a269479413?w=1200&q=60",
    "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1200&q=60",
    "https://images.unsplash.com/photo-1493558103817-58b2924bce98?w=1200&q=60",
    "https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=1200&q=60"
  ];
  // fill mini gallery
  const mg = $('#miniGallery');
  if(mg){
    galleryImgs.slice(0,4).forEach(u=>{
      const img = document.createElement('img'); img.src = u; img.loading = 'lazy';
      mg.appendChild(img);
    });
  }
  // gallery page full
  const grid = $('#galleryGrid');
  if(grid){
    galleryImgs.forEach(u=>{
      const img = document.createElement('img'); img.src=u; img.loading='lazy';
      grid.appendChild(img);
    });
  }

  /* --------- Booking storage logic ---------- */
  function getBookings(){ return JSON.parse(localStorage.getItem('bookings')||'[]'); }
  function saveBookings(list){ localStorage.setItem('bookings', JSON.stringify(list)); }

  const bookingForm = $('#bookingForm');
  if(bookingForm){
    // prefill room if query param present
    const params = new URLSearchParams(location.search);
    const pre = params.get('room');
    if(pre) $('#room').value = decodeURIComponent(pre);

    bookingForm.addEventListener('submit', e=>{
      e.preventDefault();
      const b = {
        id: 'B'+Date.now(),
        name: $('#name').value.trim(),
        email: $('#email').value.trim(),
        phone: $('#phone').value.trim(),
        room: $('#room').value,
        date: $('#date').value,
        guests: Number($('#guests').value),
        created: new Date().toISOString()
      };
      const list = getBookings();
      list.push(b);
      saveBookings(list);
      $('#formMessage').textContent = 'Booking saved locally. Redirecting to payment...';

      // simulate external payment redirect using PayPal sandbox link (demo)
      const amount = estimateAmount(b.room);
      setTimeout(()=> {
        // open in new tab (simulate secure external checkout)
        const payUrl = `https://www.paypal.com/pay?amount=${amount}&currency=PHP`;
        window.open(payUrl,'_blank');
        $('#formMessage').textContent = 'Payment page opened in new tab. Booking stored locally.';
      }, 700);
      bookingForm.reset();
    });

    $('#saveDraft')?.addEventListener('click', ()=>{
      const draft = {
        name: $('#name').value, email: $('#email').value, room: $('#room').value
      };
      localStorage.setItem('bookingDraft', JSON.stringify(draft));
      $('#formMessage').textContent = 'Draft saved locally.';
    });

    // restore draft if exists
    const d = localStorage.getItem('bookingDraft');
    if(d){ try{ const dd = JSON.parse(d); if(dd.name) $('#name').value = dd.name; if(dd.email) $('#email').value = dd.email; }catch(e){} }
  }

  function estimateAmount(room){
    if(room.includes('Cottage A')) return 4000;
    if(room.includes('Cottage B')) return 2500;
    if(room.includes('Day Trip')) return 1200;
    return 1000;
  }

  /* --------- Admin login & dashboard (client-side demo only) ---------- */
  const adminLoginBtn = $('#adminLogin');
  if(adminLoginBtn){
    adminLoginBtn.addEventListener('click', ()=>{
      const u = $('#adminUser').value.trim();
      const p = $('#adminPass').value;
      // HARD-CODED CREDENTIALS for prototype ONLY
      if(u === 'admin' && p === 'bluecove123'){
        sessionStorage.setItem('adminAuth','1');
        showAdmin();
      } else {
        $('#adminMsg').textContent = 'Invalid credentials (demo). Use admin / bluecove123';
      }
    });
  }

  function showAdmin(){
    $('#loginCard').style.display = 'none';
    $('#dashboard').style.display = 'block';
    $('#logoutBtn').style.display = 'inline';
    renderDashboard();
    // simulate live new bookings arriving every 12s (demo)
    window.demoIncoming = setInterval(()=> {
      const sample = { id:'B'+Date.now(), name:'Guest'+Math.floor(Math.random()*90+10),
        room: ['Cottage A','Cottage B','Day Trip'][Math.floor(Math.random()*3)],
        date: new Date().toISOString(), created:new Date().toISOString() };
      const list = getBookings(); list.push(sample); saveBookings(list);
      renderDashboard();
    }, 12000);
  }

  $('#logoutBtn')?.addEventListener('click', ()=>{
    sessionStorage.removeItem('adminAuth'); $('#dashboard').style.display='none'; $('#loginCard').style.display='';
    $('#logoutBtn').style.display='none';
    clearInterval(window.demoIncoming);
  });

  function renderDashboard(){
    const list = getBookings();
    $('#statTotal').textContent = list.length;
    // today count
    const today = list.filter(b=>{
      const d = new Date(b.created); const t = new Date();
      return d.toDateString() === t.toDateString();
    }).length;
    $('#statToday').textContent = today;
    const rev = list.reduce((s,b)=>{
      return s + estimateAmount(b.room);
    },0);
    $('#statRevenue').textContent = '₱'+rev.toLocaleString();

    const out = $('#bookingsList');
    if(!out) return;
    out.innerHTML = '';
    list.slice().reverse().forEach(b=>{
      const div = document.createElement('div'); div.className='card';
      div.innerHTML = `<strong>${b.name}</strong> <div class="muted">${b.room} • ${new Date(b.created).toLocaleString()}</div><div>${b.email||''} ${b.phone? '• '+b.phone : ''}</div>`;
      out.appendChild(div);
    });
  }

  // auto show admin if already authenticated
  if(location.pathname.endsWith('admin.html') && sessionStorage.getItem('adminAuth') === '1'){
    showAdmin();
  }

  /* --------- On load, if admin page and not logged in, show login tip ------- */
  if(location.pathname.endsWith('admin.html') && sessionStorage.getItem('adminAuth') !== '1'){
    $('#adminMsg').textContent = 'Demo admin credentials — user: admin, pass: bluecove123';
  }

  /* small UI: mobile menu toggles */
  $$('#menuBtn, #menuBtn2').forEach(mb=>{
    mb?.addEventListener('click', ()=>{
      const nav = document.querySelector('.nav');
      if(nav) nav.style.display = nav.style.display === 'flex' ? 'none':'flex';
    });
  });

})();
