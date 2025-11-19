// Mobile menu functionality
const menuBtn = document.getElementById('menuBtn');
const mainNav = document.getElementById('mainNav');
const closeMenu = document.getElementById('closeMenu');

menuBtn.addEventListener('click', () => {
  mainNav.classList.add('active');
});

closeMenu.addEventListener('click', () => {
  mainNav.classList.remove('active');
});

// Close menu when clicking on links
const navLinks = document.querySelectorAll('.nav a');
navLinks.forEach(link => {
  link.addEventListener('click', () => {
    mainNav.classList.remove('active');
  });
});

// Dark mode toggle
const darkToggle = document.getElementById('darkToggle');

darkToggle.addEventListener('click', () => {
  const currentTheme = document.documentElement.getAttribute('data-theme');
  const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
  
  document.documentElement.setAttribute('data-theme', newTheme);
  darkToggle.textContent = newTheme === 'dark' ? '☀️' : '🌙';
  
  // Save preference to localStorage
  localStorage.setItem('theme', newTheme);
});

// Check for saved theme preference
const savedTheme = localStorage.getItem('theme');
if (savedTheme) {
  document.documentElement.setAttribute('data-theme', savedTheme);
  darkToggle.textContent = savedTheme === 'dark' ? '☀️' : '🌙';
}

// Active page indicator
function setActivePage() {
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  const navLinks = document.querySelectorAll('.nav a');
  
  navLinks.forEach(link => {
    link.classList.remove('active');
    const linkPage = link.getAttribute('href');
    if (linkPage === currentPage || (currentPage === '' && linkPage === 'index.html')) {
      link.classList.add('active');
    }
  });
}

// Scroll effect for header
window.addEventListener('scroll', () => {
  const header = document.querySelector('.site-header');
  if (window.scrollY > 50) {
    header.classList.add('scrolled');
  } else {
    header.classList.remove('scrolled');
  }
});

// Promo slide close functionality
const closePromo = document.getElementById('closePromo');
const promoSlide = document.getElementById('promoSlide');

if (closePromo && promoSlide) {
  closePromo.addEventListener('click', () => {
    promoSlide.classList.add('hidden');
    localStorage.setItem('promoClosed', 'true');
  });

  // Check if promo was previously closed
  if (localStorage.getItem('promoClosed') === 'true') {
    promoSlide.classList.add('hidden');
  }
}

// Lightbox functionality for gallery images
function initLightbox() {
  const images = document.querySelectorAll('.masonry img, .grid img');
  
  images.forEach(img => {
    img.addEventListener('click', function() {
      openLightbox(this.src, this.alt);
    });
  });
}

function openLightbox(imageSrc, imageAlt) {
  const lightbox = document.createElement('div');
  lightbox.className = 'lightbox';
  lightbox.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.9);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 10000;
    cursor: pointer;
  `;
  
  const img = document.createElement('img');
  img.src = imageSrc;
  img.alt = imageAlt;
  img.style.cssText = `
    max-width: 90%;
    max-height: 90%;
    border-radius: 10px;
    box-shadow: 0 0 30px rgba(0, 0, 0, 0.5);
    cursor: default;
  `;
  
  const closeBtn = document.createElement('button');
  closeBtn.textContent = '✕';
  closeBtn.style.cssText = `
    position: absolute;
    top: 20px;
    right: 20px;
    background: rgba(0, 0, 0, 0.5);
    border: none;
    color: white;
    font-size: 2rem;
    width: 50px;
    height: 50px;
    border-radius: 50%;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
  `;
  
  lightbox.appendChild(img);
  lightbox.appendChild(closeBtn);
  
  closeBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    lightbox.remove();
  });
  
  lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox) {
      lightbox.remove();
    }
  });
  
  document.body.appendChild(lightbox);
}

// ========== GCASH PAYMENT INTEGRATION ==========
function initBookingPage() {
  const bookingForm = document.getElementById('bookingForm');
  const saveDraftBtn = document.getElementById('saveDraft');
  
  // Load draft if exists
  loadDraft();
  
  // Set minimum date to today
  const dateInput = document.getElementById('date');
  if (dateInput) {
    const today = new Date().toISOString().split('T')[0];
    dateInput.min = today;
  }
  
  // Handle URL parameters for pre-filled room selection
  const urlParams = new URLSearchParams(window.location.search);
  const roomParam = urlParams.get('room');
  if (roomParam && document.getElementById('room')) {
    const roomSelect = document.getElementById('room');
    for (let i = 0; i < roomSelect.options.length; i++) {
      if (roomSelect.options[i].text.includes(roomParam)) {
        roomSelect.selectedIndex = i;
        break;
      }
    }
  }
  
  // Save draft functionality
  if (saveDraftBtn) {
    saveDraftBtn.addEventListener('click', saveDraft);
  }
  
  // Form submission - DIRECT TO GCASH
  if (bookingForm) {
    bookingForm.addEventListener('submit', function(e) {
      e.preventDefault();
      // DIRECT TO GCASH AGAD
      processBookingAndGCash();
    });
  }
}

function saveDraft() {
  const formData = {
    name: document.getElementById('name').value,
    email: document.getElementById('email').value,
    phone: document.getElementById('phone').value,
    room: document.getElementById('room').value,
    date: document.getElementById('date').value,
    guests: document.getElementById('guests').value
  };
  
  localStorage.setItem('bookingDraft', JSON.stringify(formData));
  showMessage('Draft saved! You can continue later.', 'success');
}

function loadDraft() {
  const draft = localStorage.getItem('bookingDraft');
  if (draft) {
    const formData = JSON.parse(draft);
    Object.keys(formData).forEach(key => {
      const element = document.getElementById(key);
      if (element && formData[key]) {
        element.value = formData[key];
      }
    });
  }
}

// DIRECT PROCESS TO GCASH
function processBookingAndGCash() {
  // Validate form first
  if (!validateForm()) {
    showMessage('Please fill in all required fields.', 'error');
    return;
  }
  
  const formData = {
    name: document.getElementById('name').value,
    email: document.getElementById('email').value,
    phone: document.getElementById('phone').value,
    room: document.getElementById('room').value,
    date: document.getElementById('date').value,
    guests: document.getElementById('guests').value,
    timestamp: new Date().toISOString(),
    bookingId: 'RESORT' + Date.now()
  };
  
  // Save booking to localStorage
  const bookings = JSON.parse(localStorage.getItem('bookings') || '[]');
  bookings.push(formData);
  localStorage.setItem('bookings', JSON.stringify(books));
  
  // Clear draft
  localStorage.removeItem('bookingDraft');
  
  // DIRECT TO GCASH - NO MESSAGE, NO DELAY
  openGCashPayment(formData);
}

function validateForm() {
  const name = document.getElementById('name').value;
  const email = document.getElementById('email').value;
  const phone = document.getElementById('phone').value;
  const date = document.getElementById('date').value;
  
  if (!name || !email || !phone || !date) {
    return false;
  }
  
  return true;
}

function openGCashPayment(bookingData) {
  const amount = calculateGCashAmount(bookingData.room, bookingData.guests);
  
  // Open GCash window immediately
  const gcashWindow = window.open('', 'GCash Payment', 'width=500,height=700,scrollbars=yes');
  
  gcashWindow.document.write(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>GCash Payment - Heart Of D' Ocean Beach Resort</title>
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        body { 
          font-family: 'Arial', sans-serif; 
          padding: 20px; 
          text-align: center;
          background: linear-gradient(135deg, #0033A0, #0070BA);
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .gcash-container {
          background: white;
          padding: 30px;
          border-radius: 20px;
          box-shadow: 0 10px 30px rgba(0,0,0,0.3);
          max-width: 400px;
          width: 100%;
        }
        .gcash-logo { 
          color: #0033A0; 
          font-size: 2.5em; 
          font-weight: bold;
          margin-bottom: 20px;
        }
        .amount { 
          font-size: 3em; 
          color: #0033A0; 
          margin: 20px 0;
          font-weight: bold;
        }
        .details {
          text-align: left;
          margin: 25px 0;
          padding: 20px;
          background: #f8f9fa;
          border-radius: 12px;
          border-left: 4px solid #0033A0;
        }
        .details p {
          margin: 8px 0;
          color: #333;
        }
        .qr-container {
          background: #fff;
          padding: 25px;
          border: 3px dashed #0033A0;
          border-radius: 15px;
          margin: 20px 0;
        }
        .qr-placeholder {
          font-size: 4em;
          margin: 10px 0;
        }
        .btn { 
          background: #0033A0; 
          color: white; 
          padding: 15px 30px; 
          border: none; 
          border-radius: 25px; 
          font-size: 1.1em; 
          cursor: pointer;
          margin: 10px;
          font-weight: bold;
          width: 200px;
        }
        .btn.success { 
          background: #28a745; 
        }
        .btn.cancel { 
          background: #6c757d; 
        }
        .instruction {
          color: #666;
          font-size: 0.9em;
          margin: 15px 0;
        }
      </style>
    </head>
    <body>
      <div class="gcash-container">
        <div class="gcash-logo">GCash</div>
        <h2>Payment Request</h2>
        <div class="amount">₱${amount.toLocaleString()}</div>
        
        <div class="details">
          <p><strong>Merchant:</strong> Heart Of D' Ocean Beach Resort</p>
          <p><strong>Booking For:</strong> ${bookingData.name}</p>
          <p><strong>Package:</strong> ${bookingData.room.split('—')[0].trim()}</p>
          <p><strong>Check-in:</strong> ${bookingData.date}</p>
          <p><strong>Guests:</strong> ${bookingData.guests}</p>
          <p><strong>Reference ID:</strong> ${bookingData.bookingId}</p>
        </div>
        
        <p class="instruction">Scan QR code below to pay</p>
        
        <div class="qr-container">
          <div class="qr-placeholder">📱</div>
          <div style="font-size: 0.8em; color: #666; margin-top: 10px;">
            GCash QR Code<br>
            <small>Point your GCash app to scan</small>
          </div>
        </div>
        
        <p class="instruction">Or enter mobile number: <strong>0917-123-4567</strong></p>
        
        <div style="margin-top: 25px;">
          <button class="btn success" onclick="paySuccess()">💳 Simulate Payment</button>
          <button class="btn cancel" onclick="window.close()">❌ Cancel</button>
        </div>
      </div>
      
      <script>
        function paySuccess() {
          const successData = {
            payment: 'success',
            booking: ${JSON.stringify(bookingData)},
            amount: ${amount},
            transactionId: 'GC' + Date.now()
          };
          
          alert('💰 Payment Successful!\\\\n\\\\nAmount: ₱${amount.toLocaleString()}\\\\nReference: ${bookingData.bookingId}\\\\n\\\\nThank you for your booking!');
          
          // Send success message back to main window
          if (window.opener && !window.opener.closed) {
            window.opener.postMessage(successData, '*');
          }
          
          window.close();
        }
      </script>
    </body>
    </html>
  `);
}

function calculateGCashAmount(room, guests) {
  const prices = {
    'Cottage A — ₱4,000': 4000,
    'Cottage B — ₱2,500': 2500,
    'Day Trip — ₱1,200': 1200 * parseInt(guests || 1)
  };
  return prices[room] || 0;
}

// Handle payment success from GCash window
window.addEventListener('message', function(event) {
  if (event.data && event.data.payment === 'success') {
    // Show success message on main page
    showMessage('🎉 Payment successful! Your booking is confirmed. We\'ve sent a confirmation email.', 'success');
    
    // Update booking status
    const bookings = JSON.parse(localStorage.getItem('bookings') || '[]');
    const lastBooking = bookings[bookings.length - 1];
    if (lastBooking) {
      lastBooking.paymentStatus = 'paid';
      lastBooking.transactionId = event.data.transactionId;
      localStorage.setItem('bookings', JSON.stringify(bookings));
    }
    
    // Show confirmation details
    setTimeout(() => {
      alert(`🏝️ Booking Confirmed!\\n\\nName: ${event.data.booking.name}\\nAmount: ₱${event.data.amount.toLocaleString()}\\nReference: ${event.data.booking.bookingId}\\n\\nThank you for choosing Heart Of D' Ocean!`);
    }, 1000);
  }
});

function showMessage(message, type = 'info') {
  const formMessage = document.getElementById('formMessage');
  if (formMessage) {
    formMessage.textContent = message;
    formMessage.className = type === 'success' ? 'success-message' : 'muted';
    formMessage.style.display = 'block';
    
    setTimeout(() => {
      formMessage.style.display = 'none';
    }, 5000);
  }
}

// Page-specific initialization
function initPageSpecificFeatures() {
  const currentPage = window.location.pathname.split('/').pop();
  
  if (currentPage === 'booking.html') {
    initBookingPage();
  }
  
  if (currentPage === 'gallery.html') {
    initLightbox();
  }
}

// Initialize everything when page loads
document.addEventListener('DOMContentLoaded', function() {
  setActivePage();
  initPageSpecificFeatures();
  
  console.log('🏝️ Heart Of D\' Ocean Beach Resort website loaded successfully!');
});