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

                // Show hero image first with a scale-in
                if (heroImg) {
                    heroImg.classList.add('revealed');
                    setTimeout(() => heroImg.classList.add('zooming'), 2500);
                }

                // Sequential text reveal
                document.querySelectorAll('.hero .reveal-up').forEach((el, i) => {
                    setTimeout(() => {
                        el.classList.add('revealed');
                    }, 400 + (i * 150));
                });
            }, 1000);
        }
    });

    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) nav.classList.add('scrolled');
        else nav.classList.remove('scrolled');

        // Scroll progress
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

    // Fallback default menu items if localStorage is empty
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

            // Re-observe new items
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
        if (cartCount) cartCount.textContent = cart.length;

        if (cart.length === 0) {
            cartItemsContainer.innerHTML = '<div class="cart-empty-state"><p>Your cart is empty.</p></div>';
            cartTotalValue.textContent = 'Rs. 0';
            checkoutBtn.disabled = true;
        } else {
            let total = 0;
            cartItemsContainer.innerHTML = cart.map((item, index) => {
                total += parseInt(item.price.replace('Rs. ', '')) || 0;
                return `
                    <div class="cart-item">
                        <div><h4>${item.name}</h4><p>${item.price}</p></div>
                        <button class="cart-item-remove" onclick="removeFromCart(${index})">✕</button>
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
            cart.push(found);
            updateCartUI();
            showToast(`${name} added!`, '☕');
        }
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

    // === Checkout ===
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', () => {
            document.getElementById('checkoutModal').classList.add('active');
            let total = 0;
            document.getElementById('checkoutSummary').innerHTML = cart.map(i => {
                total += parseInt(i.price.replace('Rs. ', ''));
                return `<div class="summary-item"><span>${i.name}</span><span>${i.price}</span></div>`;
            }).join('') + `<div class="summary-item" style="border-top:1px solid #333;margin-top:10px;padding-top:10px;font-weight:bold;"><span>Total</span><span>Rs. ${total}</span></div>`;
        });
    }

    document.getElementById('checkoutClose')?.addEventListener('click', () => checkoutModal.classList.remove('active'));

    checkoutForm?.addEventListener('submit', (e) => {
        e.preventDefault();
        const orderId = 'ORD-' + Math.floor(Math.random() * 9000 + 1000);
        const orderData = {
            id: orderId,
            customerName: document.getElementById('orderName').value,
            phone: document.getElementById('orderPhone').value,
            table: document.getElementById('orderTable').value || 'N/A',
            items: cart,
            total: cartTotalValue.textContent,
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

    // === Order Tracking ===
    function renderActiveOrders() {
        const myOrdersLocal = JSON.parse(localStorage.getItem('noir_my_orders')) || [];
        const globalOrders = JSON.parse(localStorage.getItem('noir_orders')) || [];
        const section = document.getElementById('activeOrdersSection');
        const container = document.getElementById('myOrdersItems');
        const badge = document.getElementById('orderTrackerBadge');

        if (!container) return;
        const tracked = globalOrders.filter(o => myOrdersLocal.some(l => l.id === o.id) && o.status === 'pending');

        if (tracked.length > 0) {
            section.style.display = 'block';
            badge.style.display = 'flex';
            badge.querySelector('span:last-child').textContent = `Tracking ${tracked.length} Order...`;
            container.innerHTML = tracked.map(o => {
                const local = myOrdersLocal.find(l => l.id === o.id);
                const canCancel = (Date.now() - local.timestamp) / 60000 < 5;
                return `<div class="active-order-card" style="background:#1a1a1a;padding:12px;border-radius:8px;margin-bottom:10px;border:1px solid #333;">
                    <div style="display:flex;justify-content:space-between;margin-bottom:8px;"><span style="color:#c8a97e">${o.id}</span><span style="color:#f1c40f">⌛ PENDING</span></div>
                    ${canCancel ? `<button class="btn btn-ghost btn-sm" onclick="cancelMyOrder('${o.id}')" style="width:100%;color:#ec7063">Cancel Order</button>` : `<p style="font-size:10px;text-align:center;">Locked for prep</p>`}
                </div>`;
            }).join('');
        } else {
            section.style.display = 'none';
            badge.style.display = 'none';
        }
    }

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

            // Dynamic Images
            if (s.heroImg && document.getElementById('heroImg')) document.getElementById('heroImg').src = s.heroImg;
            if (s.aboutImg1 && document.getElementById('aboutImg1')) document.getElementById('aboutImg1').src = s.aboutImg1;
            if (s.aboutImg2 && document.getElementById('aboutImg2')) document.getElementById('aboutImg2').src = s.aboutImg2;
            if (s.aboutImg3 && document.getElementById('aboutImg3')) document.getElementById('aboutImg3').src = s.aboutImg3;
            if (s.awardImg && document.getElementById('awardImg')) document.getElementById('awardImg').src = s.awardImg;
            if (s.avatar1 && document.getElementById('avatar1')) document.getElementById('avatar1').src = s.avatar1;
            if (s.avatar2 && document.getElementById('avatar2')) document.getElementById('avatar2').src = s.avatar2;
            if (s.avatar3 && document.getElementById('avatar3')) document.getElementById('avatar3').src = s.avatar3;
            if (s.ctaImg && document.getElementById('ctaImg')) document.getElementById('ctaImg').src = s.ctaImg;

            // Apply Section Backgrounds
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

            // Re-apply reveal and tilt
            document.querySelectorAll('.reveal-up').forEach(el => revealObserver.observe(el));
            applyGalleryTilt();
        }
    }

    // Creative Section Backgrounds
    function applySectionBackgrounds(s) {
        const sections = {
            'about': s.aboutBg,
            'process': s.processBg,
            'menu': s.menuBg,
            'gallery': s.galleryBg,
            'testimonials': s.testimonialBg,
            'contact': s.contactBg
        };

        for (const [id, url] of Object.entries(sections)) {
            const section = document.getElementById(id);
            if (section && url) {
                // Check if already has a bg to avoid duplicates
                if (section.querySelector('.section-bg')) continue;

                const bgDiv = document.createElement('div');
                bgDiv.className = 'section-bg';
                bgDiv.innerHTML = `
                    <div class="section-bg-overlay"></div>
                    <img src="${url}" alt="" loading="lazy">
                `;
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

    // === Floating Particles ===
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

    // === Toast ===
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
        btn.addEventListener('mouseleave', () => {
            btn.style.transform = 'translate(0, 0)';
        });
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
