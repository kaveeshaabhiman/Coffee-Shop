/**
 * NOIR - Premium Coffee Experience
 * Frontend JavaScript for interactions, cart, and live data
 */

document.addEventListener('DOMContentLoaded', () => {
    // === Navigation & Mobile Menu ===
    const nav = document.getElementById('navbar');
    const mobileToggle = document.getElementById('mobileToggle');
    const mobileMenu = document.getElementById('mobileMenu');
    const cursorGlow = document.getElementById('cursor-glow');

    // === Custom Cursor Glow ===
    document.addEventListener('mousemove', (e) => {
        if (cursorGlow) {
            cursorGlow.style.left = e.clientX + 'px';
            cursorGlow.style.top = e.clientY + 'px';
            cursorGlow.style.display = 'block';
        }
    });

    // === Preloader & Entrance ===
    window.addEventListener('load', () => {
        const preloader = document.getElementById('preloader');
        const heroImg = document.querySelector('.hero-bg-img');

        if (preloader) {
            setTimeout(() => {
                preloader.classList.add('loaded');
                if (heroImg) {
                    heroImg.classList.add('revealed');
                    setTimeout(() => heroImg.classList.add('zooming'), 2500);
                }
                document.querySelectorAll('.hero .reveal-up').forEach((el, i) => {
                    setTimeout(() => el.classList.add('revealed'), 400 + (i * 150));
                });
            }, 1000);
        }
    });

    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) nav.classList.add('scrolled');
        else nav.classList.remove('scrolled');

        const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
        const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        const scrolled = (winScroll / height) * 100;
        const progressBar = document.getElementById('scrollProgress');
        if (progressBar) progressBar.style.width = scrolled + "%";
    });

    if (mobileToggle) {
        mobileToggle.addEventListener('click', () => {
            mobileToggle.classList.toggle('active');
            mobileMenu.classList.toggle('active');
            document.body.style.overflow = mobileMenu.classList.contains('active') ? 'hidden' : '';
        });
    }

    // === Menu Rendering ===
    const menuGrid = document.getElementById('menuGrid');
    const menuTabs = document.querySelectorAll('.menu-tab');

    const menuItems = JSON.parse(localStorage.getItem('noir_menu')) || {
        hot: [
            { name: 'Classic Espresso', desc: 'Rich, bold, and perfectly extracted single or double shot', price: 'Rs. 450', emoji: '☕', image: 'https://images.unsplash.com/photo-1510591509098-f4fdc6d0ff04?w=400&q=80', tag: '', status: 'available' }
        ],
        cold: [], special: [], food: []
    };

    function renderMenu(category) {
        if (!menuGrid) return;
        menuGrid.style.opacity = '0';
        menuGrid.style.transform = 'translateY(10px)';

        setTimeout(() => {
            const items = menuItems[category] || [];
            menuGrid.innerHTML = items.map((item, index) => `
                <div class="menu-card reveal-up" style="--delay: ${index * 0.1}s">
                    <div class="menu-card-inner">
                        <div class="menu-card-img-wrap">
                            <img src="${item.image}" alt="${item.name}" class="menu-card-img" loading="lazy">
                            <div class="menu-card-overlay">
                                <button class="add-to-cart-btn" onclick="addToOrder('${item.name}')" aria-label="Add to order">
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                        <path d="M12 5v14M5 12h14"/>
                                    </svg>
                                    <span>Add to Order</span>
                                </button>
                            </div>
                            ${item.tag ? `<span class="menu-card-tag">${item.tag}</span>` : ''}
                            <div class="menu-card-price-badge">${item.price}</div>
                        </div>
                        <div class="menu-card-details">
                            <div class="menu-card-meta">
                                <span class="menu-card-emoji">${item.emoji}</span>
                                <span class="menu-card-category">${category}</span>
                            </div>
                            <h3 class="menu-card-title">${item.name}</h3>
                            <p class="menu-card-desc">${item.desc}</p>
                        </div>
                    </div>
                </div>
            `).join('');

            menuGrid.style.opacity = '1';
            menuGrid.style.transform = 'translateY(0)';
            document.querySelectorAll('.reveal-up, .reveal-left, .reveal-right').forEach(el => revealObserver.observe(el));
        }, 300);
    }

    if (menuTabs.length > 0) {
        renderMenu('hot');
        menuTabs.forEach(tab => {
            tab.addEventListener('click', () => {
                menuTabs.forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                renderMenu(tab.getAttribute('data-category'));
            });
        });
    }

    // === Cart System ===
    let cart = JSON.parse(localStorage.getItem('noir_cart')) || [];
    const cartToggle = document.getElementById('cartToggle');
    const cartClose = document.getElementById('cartClose');
    const cartSidebar = document.getElementById('cartSidebar');
    const cartOverlay = document.getElementById('cartOverlay');
    const cartItemsContainer = document.getElementById('cartItemsContainer');
    const cartTotalValue = document.getElementById('cartTotalValue');
    const cartCount = document.querySelector('.cart-count');
    const checkoutBtn = document.getElementById('checkoutBtn');
    const checkoutModal = document.getElementById('checkoutModal');
    const checkoutForm = document.getElementById('checkoutForm');

    function updateCartUI() {
        localStorage.setItem('noir_cart', JSON.stringify(cart));
        const totalItems = cart.reduce((acc, itm) => acc + (itm.quantity || 1), 0);
        if (cartCount) cartCount.textContent = totalItems;

        if (cart.length === 0) {
            cartItemsContainer.innerHTML = '<div class="cart-empty-state"><p>Your cart is empty.</p></div>';
            cartTotalValue.textContent = 'Rs. 0';
            checkoutBtn.disabled = true;
        } else {
            let total = 0;
            cartItemsContainer.innerHTML = cart.map((item, index) => {
                const itemPrice = parseInt(item.price.replace('Rs. ', '')) || 0;
                const itemTotal = itemPrice * (item.quantity || 1);
                total += itemTotal;
                return `
                    <div class="cart-item">
                        <div class="cart-item-info">
                            <h4>${item.name}</h4>
                            <p>${item.price}</p>
                        </div>
                        <div class="cart-quantity-controls">
                            <button class="qty-btn" onclick="changeQuantity(${index}, -1)">-</button>
                            <span class="qty-val">${item.quantity || 1}</span>
                            <button class="qty-btn" onclick="changeQuantity(${index}, 1)">+</button>
                        </div>
                        <button class="cart-item-remove" onclick="removeFromCart(${index})" title="Remove item">✕</button>
                    </div>
                `;
            }).join('');
            cartTotalValue.textContent = `Rs. ${total}`;
            checkoutBtn.disabled = false;
        }
    }

    window.addToOrder = function (name) {
        let found = null;
        Object.values(menuItems).forEach(cat => {
            const itm = cat.find(i => i.name === name);
            if (itm) found = itm;
        });
        if (found) {
            const existingIndex = cart.findIndex(item => item.name === name);
            if (existingIndex > -1) {
                cart[existingIndex].quantity = (cart[existingIndex].quantity || 1) + 1;
            } else {
                cart.push({ ...found, quantity: 1 });
            }
            updateCartUI();
            showToast(`${name} added!`, '☕');
        }
    };

    window.changeQuantity = function (index, delta) {
        if (!cart[index]) return;
        cart[index].quantity = (cart[index].quantity || 1) + delta;
        if (cart[index].quantity < 1) {
            cart.splice(index, 1);
        }
        updateCartUI();
    };

    window.removeFromCart = function (index) {
        cart.splice(index, 1);
        updateCartUI();
    };

    window.openCart = function () {
        cartSidebar.classList.add('active');
        cartOverlay.classList.add('active');
    };

    window.closeCart = function () {
        cartSidebar.classList.remove('active');
        cartOverlay.classList.remove('active');
    };

    if (cartToggle) cartToggle.addEventListener('click', openCart);
    if (cartClose) cartClose.addEventListener('click', closeCart);
    if (cartOverlay) cartOverlay.addEventListener('click', closeCart);

    // === Order Type Toggle (Delivery / Pickup) ===
    // Store Kegalle coordinates
    const STORE_LAT = 7.2513;
    const STORE_LNG = 80.3464;
    let detectedDistanceKm = null;

    // Haversine formula to get km distance between two GPS coords
    function haversineKm(lat1, lon1, lat2, lon2) {
        const R = 6371;
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLon = (lon2 - lon1) * Math.PI / 180;
        const a = Math.sin(dLat/2)**2 + Math.cos(lat1*Math.PI/180) * Math.cos(lat2*Math.PI/180) * Math.sin(dLon/2)**2;
        return R * 2 * Math.asin(Math.sqrt(a));
    }

    function getDeliveryChargeByDistance(km) {
        const s = JSON.parse(localStorage.getItem('noir_settings')) || {};
        if (km <= 50) return parseInt(s.deliveryZone1) || 250;
        if (km <= 100) return parseInt(s.deliveryZone2) || 500;
        return parseInt(s.deliveryZone3) || 1000;
    }

    window.detectLocation = function () {
        const btn = document.getElementById('detectLocationBtn');
        const info = document.getElementById('distanceInfo');
        if (!navigator.geolocation) {
            info.textContent = '❌ Geolocation not supported by your browser.';
            info.style.color = '#e74c3c';
            return;
        }
        btn.textContent = '📶 Detecting...';
        btn.disabled = true;
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                const km = haversineKm(pos.coords.latitude, pos.coords.longitude, STORE_LAT, STORE_LNG);
                detectedDistanceKm = Math.round(km * 10) / 10;
                const charge = getDeliveryChargeByDistance(detectedDistanceKm);
                const zone = detectedDistanceKm <= 50 ? '(Zone 1)' : detectedDistanceKm <= 100 ? '(Zone 2)' : '(Zone 3)';
                info.innerHTML = `📍 <strong style="color:#c8a97e">${detectedDistanceKm} km</strong> from store ${zone} &rarr; <strong style="color:#e67e22">Rs. ${charge}</strong>`;
                info.style.color = '#aaa';
                btn.textContent = '✅ Location Detected';
                btn.style.background = 'rgba(46,204,113,0.15)';
                btn.style.borderColor = '#2ecc71';
                btn.style.color = '#2ecc71';
                updateCheckoutBill('delivery');
                validateOrderButton();
            },
            (err) => {
                info.textContent = '❌ Please allow location access to calculate delivery charge.';
                info.style.color = '#e74c3c';
                detectedDistanceKm = null;
                btn.textContent = '📍 Try Again';
                btn.disabled = false;
                validateOrderButton();
            },
            { timeout: 10000 }
        );
    };

    function validateOrderButton() {
        const type = document.getElementById('orderType').value;
        const btn = document.getElementById('placeOrderBtn');
        const text = document.getElementById('placeOrderText');
        const payMethod = document.getElementById('paymentMethod').value;
        
        const name = document.getElementById('orderName').value;
        const phone = document.getElementById('orderPhone').value;
        const address = document.getElementById('orderAddress').value;

        const detailsValid = name && phone && (type !== 'delivery' || (address && detectedDistanceKm !== null));

        if (payMethod === 'online') {
            // Hide place order button, show pay now in summary instead
            btn.style.display = 'none';
        } else {
            btn.style.display = 'flex';
            if (type === 'delivery' && detectedDistanceKm === null) {
                btn.disabled = true;
                btn.style.opacity = '0.5';
                if (text) text.textContent = 'Detection Required 📍';
            } else {
                btn.disabled = !detailsValid;
                btn.style.opacity = detailsValid ? '1' : '0.5';
                if (text) text.textContent = 'Place Order';
            }
        }
        
        // Refresh summary to update Pay Now button visibility
        updateCheckoutBill(type);
    }

    // Add listeners for live validation
    document.getElementById('orderName')?.addEventListener('input', validateOrderButton);
    document.getElementById('orderPhone')?.addEventListener('input', validateOrderButton);
    document.getElementById('orderAddress')?.addEventListener('input', validateOrderButton);

    window.selectOrderType = function (type) {
        document.getElementById('orderType').value = type;

        const btnD = document.getElementById('btnDelivery');
        const btnP = document.getElementById('btnPickup');
        const addrWrap = document.getElementById('addressFieldWrap');
        const locationWrap = document.getElementById('locationDetectWrap');
        const addrInput = document.getElementById('orderAddress');
        
        // Update Payment Method Labels
        const cashLabel = document.getElementById('cashLabel');
        const cashIcon = document.getElementById('cashIcon');

        if (type === 'delivery') {
            btnD.classList.add('active');
            btnP.classList.remove('active');
            addrWrap.style.display = 'flex';
            if (locationWrap) locationWrap.style.display = 'block';
            addrInput.required = true;
            if (cashLabel) cashLabel.textContent = 'Cash on Delivery';
            if (cashIcon) cashIcon.textContent = '💵';
        } else {
            btnP.classList.add('active');
            btnD.classList.remove('active');
            addrWrap.style.display = 'none';
            if (locationWrap) locationWrap.style.display = 'none';
            addrInput.required = false;
            addrInput.value = '';
            detectedDistanceKm = null;
            if (cashLabel) cashLabel.textContent = 'Pay at Shop';
            if (cashIcon) cashIcon.textContent = '🏪';
        }

        updateCheckoutBill(type);
        validateOrderButton();
    };

    window.selectPaymentMethod = function (method) {
        document.getElementById('paymentMethod').value = method;
        const btnC = document.getElementById('payCash');
        const btnO = document.getElementById('payOnline');

        if (method === 'cash') {
            btnC.classList.add('active');
            btnO.classList.remove('active');
        } else {
            btnO.classList.add('active');
            btnC.classList.remove('active');
        }
        validateOrderButton(); // This will refresh summary and update button visibility
    };

    window.handleOnlinePaymentButtonClick = function() {
        // This is only called when button is visible (form valid)
        const type = document.getElementById('orderType').value;
        const { grandTotal } = updateCheckoutBill(type);
        
        document.getElementById('paymentTotalAmount').textContent = `Rs. ${grandTotal}`;
        document.getElementById('paymentModal').classList.add('active');
    };

    function updateCheckoutBill(type) {
        let deliveryCharge = 0;
        let distanceLabel = '';
        let locationRequired = false;

        if (type === 'delivery') {
            if (detectedDistanceKm !== null) {
                deliveryCharge = getDeliveryChargeByDistance(detectedDistanceKm);
                const zone = detectedDistanceKm <= 50 ? 'Zone 1' : detectedDistanceKm <= 100 ? 'Zone 2' : 'Zone 3';
                distanceLabel = `${detectedDistanceKm}km &middot; ${zone}`;
            } else {
                deliveryCharge = 0;
                distanceLabel = 'Waiting for location...';
                locationRequired = true;
            }
        }

        let subtotal = 0;
        const itemsHtml = cart.map(i => {
            const itemPrice = parseInt(i.price.replace('Rs. ', '')) || 0;
            const itemQty = i.quantity || 1;
            const itemTotal = itemPrice * itemQty;
            subtotal += itemTotal;
            return `<div class="summary-item"><span>${itemQty}x ${i.name}</span><span>Rs. ${itemTotal}</span></div>`;
        }).join('');

        const grandTotal = subtotal + deliveryCharge;
        const payMethod = document.getElementById('paymentMethod').value;
        const payLabel = payMethod === 'online' ? '💳 Online Payment' : (type === 'pickup' ? '🏪 Pay at Shop' : '💵 Cash on Delivery');

        document.getElementById('checkoutSummary').innerHTML =
            `<div class="bill-receipt-header">☕ NOIR COFFEE — ORDER RECEIPT</div>`
            + itemsHtml
            + `<div class="summary-divider"></div>
            <div class="summary-item summary-subtotal"><span>Subtotal</span><span>Rs. ${subtotal}</span></div>
            ${type === 'delivery'
                ? `<div class="summary-item summary-delivery"><span>🚚 Delivery <small style="opacity:0.6">${distanceLabel}</small></span><span>${locationRequired ? '---' : 'Rs. ' + deliveryCharge}</span></div>`
                : `<div class="summary-item" style="padding:4px 14px;opacity:0.6;font-size:0.75rem;"><span>🏪 Pickup</span><span style="color:#2ecc71;font-size:0.72rem;">Free</span></div>`
            }
            <div class="summary-item" style="padding:4px 14px;opacity:0.6;font-size:0.75rem;"><span>Payment Method</span><span>${payLabel}</span></div>
            <div class="summary-item summary-total"><span>Grand Total</span><span>${locationRequired ? '---' : 'Rs. ' + grandTotal}</span></div>
            ${(payMethod === 'online' && isFormFullyValid())
                ? `<div style="padding:10px 14px; animation: slideUp 0.3s ease;">
                    <button type="button" class="btn btn-primary btn-full" id="onlinePayNowBtn" 
                        onclick="handleOnlinePaymentButtonClick()" 
                        style="background: linear-gradient(135deg, #c8a97e, #e8d5b5); color: #000; border: none; font-weight: 800; letter-spacing: 1px; box-shadow: 0 10px 20px rgba(200,169,126,0.3); transform: scale(1.02); transition: all 0.3s;">
                        💳 ONLINE PAY NOW
                    </button>
                    <p style="font-size: 0.65rem; color: #2ecc71; text-align: center; margin-top: 8px; font-weight: 600;">✨ Ready to secure your transaction</p>
                   </div>` 
                : (payMethod === 'online' ? `<p style="font-size: 0.65rem; color: #666; text-align: center; padding: 10px; font-style: italic;">Complete your details to enable online payment</p>` : '')}`;

        return { subtotal, deliveryCharge, grandTotal };
    }

    function isFormFullyValid() {
        const name = document.getElementById('orderName').value;
        const phone = document.getElementById('orderPhone').value;
        const type = document.getElementById('orderType').value;
        const address = document.getElementById('orderAddress').value;
        return name && phone && (type !== 'delivery' || (address && detectedDistanceKm !== null));
    }

    // === Checkout ===
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', () => {
            document.getElementById('checkoutModal').classList.add('active');
            // Reset to delivery on each open
            selectOrderType('delivery');
            updateCheckoutBill('delivery');
            validateOrderButton();
        });
    }

    document.getElementById('checkoutClose')?.addEventListener('click', () => checkoutModal.classList.remove('active'));

    checkoutForm?.addEventListener('submit', (e) => {
        e.preventDefault();
        const orderType = document.getElementById('orderType').value;
        const { subtotal, deliveryCharge, grandTotal } = updateCheckoutBill(orderType);
        const paymentMethod = document.getElementById('paymentMethod').value;

        if (paymentMethod === 'online') {
            // Open Payment Modal instead of finalizing
            const s = JSON.parse(localStorage.getItem('noir_settings'));
            const paymentAcc = document.getElementById('paymentStoreAccount');
            if (paymentAcc) {
                paymentAcc.innerHTML = `<strong>Merchant Account:</strong><br>${s?.paymentAccount || 'BOC - 123456789 - Kegalle'}`;
            }
            
            document.getElementById('paymentTotalAmount').textContent = `Rs. ${grandTotal}`;
            document.getElementById('paymentModal').classList.add('active');
            return;
        }

        const orderId = 'ORD-' + Math.floor(Math.random() * 9000 + 1000);
        const orderData = {
            id: orderId,
            customerName: document.getElementById('orderName').value,
            phone: document.getElementById('orderPhone').value,
            orderType: orderType,
            paymentMethod: paymentMethod,
            address: orderType === 'delivery' ? document.getElementById('orderAddress').value : 'Pickup from store',
            table: orderType === 'pickup' ? 'Pickup' : 'Delivery',
            distance: detectedDistanceKm ? `${detectedDistanceKm} km` : null,
            items: cart,
            subtotal: `Rs. ${subtotal}`,
            deliveryCharge: deliveryCharge > 0 ? `Rs. ${deliveryCharge}` : 'Free',
            total: `Rs. ${grandTotal}`,
            status: 'pending',
            date: new Date().toLocaleString(),
            timestamp: Date.now()
        };

        const existingOrders = JSON.parse(localStorage.getItem('noir_orders')) || [];
        existingOrders.unshift(orderData);
        localStorage.setItem('noir_orders', JSON.stringify(existingOrders));

        const myOrders = JSON.parse(localStorage.getItem('noir_my_orders')) || [];
        myOrders.unshift({ id: orderId, timestamp: Date.now() });
        localStorage.setItem('noir_my_orders', JSON.stringify(myOrders));

        cart = [];
        updateCartUI();
        renderActiveOrders();
        checkoutModal.classList.remove('active');
        closeCart();
        showToast('Order successful! Wait for confirmation.', '✅');
        checkoutForm.reset();
    });

    // --- 💳 Online Card Payment Logic ---
    const cardPaymentForm = document.getElementById('cardPaymentForm');
    const paymentModal = document.getElementById('paymentModal');
    const paymentClose = document.getElementById('paymentClose');

    paymentClose?.addEventListener('click', () => paymentModal.classList.remove('active'));

    // Live Preview Updates
    document.getElementById('cardNumber')?.addEventListener('input', (e) => {
        let val = e.target.value.replace(/\D/g, '').substring(0, 16);
        let formatted = val.match(/.{1,4}/g)?.join(' ') || '•••• •••• •••• ••••';
        e.target.value = val.match(/.{1,4}/g)?.join(' ') || val;
        document.getElementById('previewCardNumber').textContent = formatted;
    });

    document.getElementById('cardName')?.addEventListener('input', (e) => {
        document.getElementById('previewCardName').textContent = e.target.value.toUpperCase() || 'CARD HOLDER';
    });

    document.getElementById('cardExpiry')?.addEventListener('input', (e) => {
        let val = e.target.value.replace(/\D/g, '').substring(0, 4);
        if (val.length >= 2) val = val.substring(0, 2) + '/' + val.substring(2);
        e.target.value = val;
        document.getElementById('previewCardExpiry').textContent = val || 'MM/YY';
    });

    cardPaymentForm?.addEventListener('submit', (e) => {
        e.preventDefault();
        const btn = document.getElementById('confirmPaymentBtn');
        const originalText = btn.innerHTML;
        const total = document.getElementById('paymentTotalAmount').textContent;
        
        btn.disabled = true;
        btn.innerHTML = '<span class="loading-spinner"></span> Processing...';

        // Simulate Bank Gateway Delay
        setTimeout(() => {
            finalizeOrderAfterPayment();
            
            // Transform Modal into Success screen
            const modalBody = document.querySelector('.payment-modal-content');
            if (modalBody) {
                modalBody.innerHTML = `
                    <div class="payment-success-screen">
                        <div class="success-icon-wrap">
                            <span class="success-checkmark">✓</span>
                        </div>
                        <h2>Payment Successful!</h2>
                        <p>Your transaction has been securely processed and sent to the merchant account.</p>
                        
                        <div class="success-details">
                            <div class="success-row"><span>Order ID</span><span id="successOrderId">---</span></div>
                            <div class="success-row"><span>Amount Paid</span><span>${total}</span></div>
                            <div class="success-row"><span>Status</span><span>COMPLETED</span></div>
                        </div>

                        <button class="btn btn-primary" onclick="closeSuccessAndOrders()" style="min-width: 160px;">Done</button>
                    </div>
                `;
                
                // Set the real Order ID generated in finalizeOrderAfterPayment
                const lastOrder = JSON.parse(localStorage.getItem('noir_orders'))[0];
                document.getElementById('successOrderId').textContent = lastOrder.id;
            }

            cardPaymentForm.reset();
            // Reset preview
            document.getElementById('previewCardNumber').textContent = '•••• •••• •••• ••••';
            document.getElementById('previewCardName').textContent = 'CARD HOLDER';
            document.getElementById('previewCardExpiry').textContent = 'MM/YY';
        }, 2200);
    });

    window.closeSuccessAndOrders = function() {
        const modal = document.getElementById('paymentModal');
        modal.classList.remove('active');
        // Restore modal structure after delay for next time
        setTimeout(() => {
            location.reload(); 
        }, 500);
    };

    function finalizeOrderAfterPayment() {
        const orderType = document.getElementById('orderType').value;
        const { subtotal, deliveryCharge, grandTotal } = updateCheckoutBill(orderType);
        const orderId = 'ORD-' + Math.floor(Math.random() * 9000 + 1000);
        
        const orderData = {
            id: orderId,
            customerName: document.getElementById('orderName').value,
            phone: document.getElementById('orderPhone').value,
            orderType: orderType,
            paymentMethod: 'online',
            address: orderType === 'delivery' ? document.getElementById('orderAddress').value : 'Pickup from store',
            table: orderType === 'pickup' ? 'Pickup' : 'Delivery',
            distance: detectedDistanceKm ? `${detectedDistanceKm} km` : null,
            items: cart,
            subtotal: `Rs. ${subtotal}`,
            deliveryCharge: deliveryCharge > 0 ? `Rs. ${deliveryCharge}` : 'Free',
            total: `Rs. ${grandTotal}`,
            status: 'pending',
            date: new Date().toLocaleString(),
            timestamp: Date.now()
        };

        const existingOrders = JSON.parse(localStorage.getItem('noir_orders')) || [];
        existingOrders.unshift(orderData);
        localStorage.setItem('noir_orders', JSON.stringify(existingOrders));

        const myOrders = JSON.parse(localStorage.getItem('noir_my_orders')) || [];
        myOrders.unshift({ id: orderId, timestamp: Date.now() });
        localStorage.setItem('noir_my_orders', JSON.stringify(myOrders));

        cart = [];
        updateCartUI();
        renderActiveOrders();
        checkoutModal.classList.remove('active');
        closeCart();
        showToast('Payment Successful! Order placed.', '💰');
        checkoutForm.reset();
    }

    // === Order Tracking ===
    let countdownInterval = null; // track interval so we can clear it

    function renderActiveOrders() {
        const myOrdersLocal = JSON.parse(localStorage.getItem('noir_my_orders')) || [];
        const globalOrders = JSON.parse(localStorage.getItem('noir_orders')) || [];
        const section = document.getElementById('activeOrdersSection');
        const container = document.getElementById('myOrdersItems');
        const badge = document.getElementById('orderTrackerBadge');
        const trackerList = document.getElementById('trackerOrdersList');
        const badgeText = badge?.querySelector('.tracker-badge-text');

        if (!container) return;
        const tracked = globalOrders.filter(o => myOrdersLocal.some(l => l.id === o.id) && o.status === 'pending');

        // Clear previous countdown
        if (countdownInterval) clearInterval(countdownInterval);

        if (tracked.length > 0) {
            section.style.display = 'block';
            badge.style.display = 'block';
            if (badgeText) badgeText.textContent = `Tracking ${tracked.length} Order${tracked.length > 1 ? 's' : ''}...`;

            // Helper: format seconds as M:SS
            function formatTime(sec) {
                const m = Math.floor(sec / 60);
                const s = sec % 60;
                return `${m}:${s.toString().padStart(2, '0')}`;
            }

            // Build HTML for both panels
            function buildOrderHTML(o, containerClass) {
                const local = myOrdersLocal.find(l => l.id === o.id);
                const elapsed = Math.floor((Date.now() - local.timestamp) / 1000);
                const remaining = Math.max(0, 300 - elapsed); // 5 min = 300s
                const canCancel = remaining > 0;

                if (containerClass === 'badge') {
                    return `
                        <div class="tracker-order-row">
                            <div class="tracker-order-info">
                                <span class="tracker-order-id">${o.id}</span>
                                <span class="tracker-order-status">⏳ PENDING</span>
                            </div>
                            ${canCancel
                                ? `<button class="tracker-cancel-btn" onclick="cancelMyOrder('${o.id}')">✕ <span class="cancel-timer-${o.id}">${formatTime(remaining)}</span></button>`
                                : `<span class="tracker-locked">🔒 Locked</span>`
                            }
                        </div>`;
                } else {
                    return `<div class="active-order-card" style="background:#1a1a1a;padding:12px;border-radius:8px;margin-bottom:10px;border:1px solid #333;">
                        <div style="display:flex;justify-content:space-between;margin-bottom:8px;">
                            <span style="color:#c8a97e">${o.id}</span>
                            <span style="color:#f1c40f">⏳ PENDING</span>
                        </div>
                        ${canCancel
                            ? `<button class="btn btn-ghost btn-sm" onclick="cancelMyOrder('${o.id}')" style="width:100%;color:#ec7063">Cancel &nbsp;<span class="cancel-sidebar-timer-${o.id}" style="font-size:0.75rem;opacity:0.8">${formatTime(remaining)}</span></button>`
                            : `<p style="font-size:11px;text-align:center;color:#555">🔒 Cancel time expired</p>`
                        }
                    </div>`;
                }
            }

            if (trackerList) trackerList.innerHTML = tracked.map(o => buildOrderHTML(o, 'badge')).join('');
            container.innerHTML = tracked.map(o => buildOrderHTML(o, 'sidebar')).join('');

            // Live countdown — update every second
            countdownInterval = setInterval(() => {
                tracked.forEach(o => {
                    const local = myOrdersLocal.find(l => l.id === o.id);
                    if (!local) return;
                    const elapsed = Math.floor((Date.now() - local.timestamp) / 1000);
                    const remaining = Math.max(0, 300 - elapsed);

                    // Update badge timer
                    const badgeTimer = document.querySelector(`.cancel-timer-${o.id}`);
                    if (badgeTimer) {
                        if (remaining > 0) {
                            badgeTimer.textContent = formatTime(remaining);
                        } else {
                            // Time up — re-render to switch to locked
                            renderActiveOrders();
                        }
                    }

                    // Update sidebar timer
                    const sidebarTimer = document.querySelector(`.cancel-sidebar-timer-${o.id}`);
                    if (sidebarTimer) sidebarTimer.textContent = formatTime(remaining);
                });
            }, 1000);

        } else {
            section.style.display = 'none';
            badge.style.display = 'none';
        }
    }

    // Toggle tracker expandable panel
    window.toggleTrackerPanel = function () {
        const panel = document.getElementById('trackerPanel');
        const chevron = document.getElementById('trackerChevron');
        if (!panel) return;
        const isOpen = panel.classList.toggle('open');
        if (chevron) chevron.textContent = isOpen ? '▾' : '▴';
    };

    window.cancelMyOrder = function (id) {
        if (!confirm('Cancel this order?')) return;
        let os = JSON.parse(localStorage.getItem('noir_orders')) || [];
        localStorage.setItem('noir_orders', JSON.stringify(os.filter(o => o.id !== id)));
        let my = JSON.parse(localStorage.getItem('noir_my_orders')) || [];
        localStorage.setItem('noir_my_orders', JSON.stringify(my.filter(o => o.id !== id)));
        renderActiveOrders();
        showToast('Order cancelled', '🗑️');
    };

    // === Contact Form ===
    document.getElementById('contactForm')?.addEventListener('submit', (e) => {
        e.preventDefault();
        const msg = {
            sender: document.getElementById('formName').value,
            email: document.getElementById('formEmail').value,
            subject: document.getElementById('formSubject').value,
            text: document.getElementById('formMessage').value,
            time: new Date().toLocaleString()
        };
        const msgs = JSON.parse(localStorage.getItem('noir_messages')) || [];
        msgs.unshift(msg);
        localStorage.setItem('noir_messages', JSON.stringify(msgs));
        showToast('Message sent!', '📧');
        e.target.reset();
    });

    // === Dynamic Site Data ===
    function initSiteData() {
        const defaultGallery = [
            { title: 'The Midnight Pour', url: 'https://images.unsplash.com/photo-1510591509098-f4fdc6d0ff04?w=800&q=80', tag: 'Featured', size: 'large' },
            { title: 'Artisan Selection', url: 'https://images.unsplash.com/photo-1559496417-e7f25cb247f3?w=600&q=80', tag: 'Expert Choice', size: 'normal' },
            { title: 'Morning Reflection', url: 'https://images.unsplash.com/photo-1507133750040-4a8f9489d35f?w=600&q=80', tag: '', size: 'normal' },
            { title: 'Gourmet Pairings', url: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=600&q=80', tag: '', size: 'normal' },
            { title: 'Shadow & Steam', url: 'https://images.unsplash.com/photo-1495774856032-8b90bbb32b32?w=600&q=80', tag: '', size: 'normal' },
            { title: 'Roast & Ritual', url: 'https://images.unsplash.com/photo-1426260193283-c4daed7c2024?w=800&q=80', tag: 'Signature', size: 'large' },
            { title: 'City Sanctuary', url: 'https://images.unsplash.com/photo-1497515114629-f71d768fd07c?w=600&q=80', tag: 'Atmosphere', size: 'normal' },
            { title: 'Crafted Curves', url: 'https://images.unsplash.com/photo-1559925393-8be0ec4767c8?w=600&q=80', tag: '', size: 'normal' }
        ];
        const gallery = JSON.parse(localStorage.getItem('noir_gallery')) || defaultGallery;
        const s = JSON.parse(localStorage.getItem('noir_settings'));

        if (s) {
            const parts = s.storeName.split(' ');
            if (document.getElementById('siteNameMain')) document.getElementById('siteNameMain').textContent = parts[0];
            if (document.getElementById('siteNameSub')) document.getElementById('siteNameSub').textContent = parts.slice(1).join(' ');
            if (document.getElementById('addrText')) document.getElementById('addrText').innerHTML = `${s.storeAddress}<br>Sri Lanka`;
            if (document.getElementById('hoursText')) document.getElementById('hoursText').innerHTML = `Mon–Fri: ${s.hoursWeek}<br>Sat–Sun: ${s.hoursWeekend}`;
            if (document.getElementById('phoneText')) document.getElementById('phoneText').innerHTML = `${s.storePhone}<br>hello@noircoffee.lk`;

            if (s.heroImg && document.getElementById('heroImg')) document.getElementById('heroImg').src = s.heroImg;
            if (s.aboutImg1 && document.getElementById('aboutImg1')) document.getElementById('aboutImg1').src = s.aboutImg1;
            if (s.aboutImg2 && document.getElementById('aboutImg2')) document.getElementById('aboutImg2').src = s.aboutImg2;
            if (s.aboutImg3 && document.getElementById('aboutImg3')) document.getElementById('aboutImg3').src = s.aboutImg3;
            if (s.awardImg && document.getElementById('awardImg')) document.getElementById('awardImg').src = s.awardImg;
            if (s.avatar1 && document.getElementById('avatar1')) document.getElementById('avatar1').src = s.avatar1;
            if (s.avatar2 && document.getElementById('avatar2')) document.getElementById('avatar2').src = s.avatar2;
            if (s.avatar3 && document.getElementById('avatar3')) document.getElementById('avatar3').src = s.avatar3;
            if (s.ctaImg && document.getElementById('ctaImg')) document.getElementById('ctaImg').src = s.ctaImg;

            applySectionBackgrounds(s);
        }

        const gGrid = document.getElementById('galleryGrid');
        if (gGrid && gallery.length > 0) {
            gGrid.innerHTML = gallery.map((item, idx) => `
                <div class="gallery-item ${item.size === 'large' ? 'gallery-item-large' : ''} reveal-up" style="--delay: ${0.1 * (idx % 4)}s">
                    <img src="${item.url}" alt="${item.title}">
                    <div class="gallery-overlay">${item.tag ? `<span class="gallery-tag">${item.tag}</span>` : ''}<h3>${item.title}</h3></div>
                </div>
            `).join('');
            document.querySelectorAll('.reveal-up').forEach(el => revealObserver.observe(el));
            applyGalleryTilt();
        }
    }

    function applySectionBackgrounds(s) {
        const sections = {
            'about': s.aboutBg, 'process': s.processBg, 'menu': s.menuBg,
            'gallery': s.galleryBg, 'testimonials': s.testimonialBg, 'contact': s.contactBg
        };
        for (const [id, url] of Object.entries(sections)) {
            const section = document.getElementById(id);
            if (section && url) {
                if (section.querySelector('.section-bg')) continue;
                const bgDiv = document.createElement('div');
                bgDiv.className = 'section-bg';
                bgDiv.innerHTML = `<div class="section-bg-overlay"></div><img src="${url}" alt="" loading="lazy">`;
                section.prepend(bgDiv);
            }
        }
    }

    function applyGalleryTilt() {
        document.querySelectorAll('.gallery-item').forEach(item => {
            item.addEventListener('mousemove', (e) => {
                const rect = item.getBoundingClientRect();
                const x = (e.clientX - rect.left) / rect.width - 0.5;
                const y = (e.clientY - rect.top) / rect.height - 0.5;
                item.style.transform = `perspective(1000px) rotateY(${x * 8}deg) rotateX(${-y * 8}deg) scale(1.03)`;
            });
            item.addEventListener('mouseleave', () => {
                item.style.transform = 'perspective(1000px) rotateY(0) rotateX(0) scale(1)';
            });
        });
    }

    function createParticles() {
        const container = document.getElementById('ambient-particles');
        if (!container) return;
        for (let i = 0; i < 20; i++) {
            const p = document.createElement('div');
            p.className = 'particle';
            p.style.cssText = `
                position: absolute;
                width: ${Math.random() * 4 + 2}px;
                height: ${Math.random() * 4 + 2}px;
                background: var(--accent);
                opacity: ${Math.random() * 0.15};
                border-radius: 50%;
                top: ${Math.random() * 100}%;
                left: ${Math.random() * 100}%;
                pointer-events: none;
                animation: floatParticle ${Math.random() * 15 + 10}s linear infinite;
            `;
            container.appendChild(p);
        }
    }

    function showToast(m, i) {
        const t = document.createElement('div');
        t.className = 'toast';
        t.innerHTML = `<span>${i}</span> <span>${m}</span>`;
        document.getElementById('toastContainer')?.appendChild(t);
        setTimeout(() => t.remove(), 3000);
    }

    // === Scroll Reveal ===
    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('revealed'); revealObserver.unobserve(e.target); } });
    }, { threshold: 0.1 });

    document.querySelectorAll('.section, .cta-section, .reveal-up, .reveal-left, .reveal-right').forEach(el => revealObserver.observe(el));

    // === Magnetic Buttons ===
    const magneticBtns = document.querySelectorAll('.btn, .nav-cta, .menu-tab');
    magneticBtns.forEach(btn => {
        btn.addEventListener('mousemove', (e) => {
            const rect = btn.getBoundingClientRect();
            const x = e.clientX - rect.left - rect.width / 2;
            const y = e.clientY - rect.top - rect.height / 2;
            btn.style.transform = `translate(${x * 0.3}px, ${y * 0.5}px)`;
        });
        btn.addEventListener('mouseleave', () => { btn.style.transform = 'translate(0, 0)'; });
    });

    // === Hero Parallax ===
    window.addEventListener('scroll', () => {
        const hero = document.querySelector('.hero');
        const scrolled = window.scrollY;
        if (hero && scrolled < window.innerHeight) {
            const img = hero.querySelector('.hero-bg-img');
            const content = hero.querySelector('.hero-content');
            if (img) img.style.transform = `scale(1.1) translateY(${scrolled * 0.3}px)`;
            if (content) content.style.transform = `translateY(${scrolled * 0.4}px)`;
            if (content) content.style.opacity = 1 - (scrolled / (window.innerHeight * 0.8));
        }
    });

    // Initial Calls
    initSiteData();
    updateCartUI();
    renderActiveOrders();
    createParticles();
    setInterval(renderActiveOrders, 60000);
});
