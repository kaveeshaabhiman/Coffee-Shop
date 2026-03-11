/**
 * NOIR - Cafe Admin Dashboard
 * Handles Menu, Orders, Messages, Gallery, and Settings management
 */

// ===== MULTI-ADMIN AUTH SYSTEM =====
(function () {
    const SESSION_KEY = 'noir_admin_auth';
    const MASTER_ADMIN_DEFAULT = { name: 'Super Admin', email: 'kaveeshaabhiman12345@gmail.com', password: 'K.Abhiman123' };

    const getSuperAdmin = () => {
        return JSON.parse(localStorage.getItem('noir_super_admin')) || MASTER_ADMIN_DEFAULT;
    };

    const loginScreen = document.getElementById('loginScreen');
    const loginForm = document.getElementById('loginForm');
    const emailInput = document.getElementById('adminEmailInput');
    const pwInput = document.getElementById('adminPasswordInput');
    const loginError = document.getElementById('loginError');
    const togglePw = document.getElementById('togglePw');

    // Load available admins
    const getAdmins = () => {
        const stored = JSON.parse(localStorage.getItem('noir_admins')) || [];
        return [getSuperAdmin(), ...stored];
    };

    // Check if already authenticated this session
    if (sessionStorage.getItem(SESSION_KEY) === 'true') {
        loginScreen.classList.add('hidden');
        setTimeout(() => loginScreen.remove(), 700);
    }

    // Password toggle
    togglePw.addEventListener('click', () => {
        pwInput.type = pwInput.type === 'password' ? 'text' : 'password';
        togglePw.textContent = pwInput.type === 'password' ? '👁' : '🙈';
    });

    // Login form submit
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = emailInput.value.toLowerCase();
        const pass = pwInput.value;
        const allAdmins = getAdmins();

        const user = allAdmins.find(a => a.email.toLowerCase() === email && a.password === pass);

        if (user) {
            if (user.status === 'blocked') {
                loginError.textContent = '❌ This account has been blocked. Contact Super Admin.';
                loginError.style.display = 'block';
                return;
            }
            sessionStorage.setItem(SESSION_KEY, 'true');
            sessionStorage.setItem('noir_active_user', JSON.stringify({ name: user.name, email: user.email }));
            loginError.style.display = 'none';
            loginScreen.classList.add('hidden');
            setTimeout(() => {
                loginScreen.remove();
                location.reload(); // Apply restricted views
            }, 700);
        } else {
            loginError.textContent = '❌ Invalid email or password.';
            loginError.style.display = 'block';
            loginError.style.animation = 'shake 0.4s ease';
            pwInput.value = '';
            pwInput.focus();
        }
    });
})();

document.addEventListener('DOMContentLoaded', () => {

    // --- Default Data ---
    const defaultMenu = {
        hot: [
            { name: 'Classic Espresso', desc: 'Rich, bold, and perfectly extracted single or double shot', price: 'Rs. 450', emoji: '☕', image: 'https://images.unsplash.com/photo-1510591509098-f4fdc6d0ff04?w=400&q=80', tag: '', status: 'available' },
            { name: 'Cappuccino', desc: 'Velvety foam atop our signature espresso blend', price: 'Rs. 550', emoji: '☕', image: 'https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=400&q=80', tag: 'Popular', status: 'available' },
            { name: 'Caramel Latte', desc: 'Smooth espresso with steamed milk and rich caramel', price: 'Rs. 650', emoji: '🍯', image: 'https://images.unsplash.com/photo-1599398054066-846f28917f38?w=400&q=80', tag: '', status: 'available' }
        ],
        cold: [
            { name: 'Cold Brew', desc: 'Steeped 18 hours for ultra-smooth richness', price: 'Rs. 600', emoji: '🧊', image: 'https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?w=400&q=80', tag: 'Bestseller', status: 'available' }
        ],
        special: [
            { name: 'Affogato', desc: 'Vanilla gelato drowned in hot espresso', price: 'Rs. 800', emoji: '🍨', image: 'https://images.unsplash.com/photo-1594610367111-71330c6d2780?w=400&q=80', tag: "Chef's Pick", status: 'available' }
        ],
        food: [
            { name: 'Butter Croissant', desc: 'Flaky, golden French-style pastry', price: 'Rs. 380', emoji: '🥐', image: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=400&q=80', tag: 'Fresh Daily', status: 'available' }
        ]
    };

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

    const defaultSettings = {
        storeName: 'NOIR Coffee Experience',
        storeAddress: '42 Galle Road, Colombo 03',
        storePhone: '+94 77 123 4567',
        hoursWeek: '7:00 AM – 10:00 PM',
        hoursWeekend: '8:00 AM – 11:00 PM',
        heroImg: 'https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=1920&q=80',
        aboutImg1: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800&q=80',
        aboutImg2: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=600&q=80',
        aboutImg3: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=400&q=80',
        awardImg: 'https://images.unsplash.com/photo-1511920170033-f83969a4c34b?w=400&q=80',
        avatar1: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&q=80',
        avatar2: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&q=80',
        avatar3: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&q=80',
        ctaImg: 'https://images.unsplash.com/photo-1445116572660-236099ec97a0?w=1920&q=80',
        aboutBg: 'https://images.unsplash.com/photo-1464349153735-7db50ed83c84?w=1920&q=80',
        processBg: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=1920&q=80',
        menuBg: 'https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=1920&q=80',
        galleryBg: 'https://images.unsplash.com/photo-1507133750040-4a8f9489d35f?w=1920&q=80',
        testimonialBg: 'https://images.unsplash.com/photo-1511920170033-f83969a4c34b?w=1920&q=80',
        contactBg: 'https://images.unsplash.com/photo-1521017432531-fbd92d744264?w=1920&q=80',
        paymentAccount: 'BOC - 123456789 - Kegalle'
    };

    // --- State Management ---
    const state = {
        menuItems: JSON.parse(localStorage.getItem('noir_menu')) || defaultMenu,
        orders: JSON.parse(localStorage.getItem('noir_orders')) || [],
        messages: JSON.parse(localStorage.getItem('noir_messages')) || [],
        gallery: JSON.parse(localStorage.getItem('noir_gallery')) || defaultGallery,
        superAdmin: JSON.parse(localStorage.getItem('noir_super_admin')) || { name: 'Super Admin', email: 'kaveeshaabhiman12345@gmail.com', password: 'K.Abhiman123' },
        admins: JSON.parse(localStorage.getItem('noir_admins')) || [],
        settings: { ...defaultSettings, ...(JSON.parse(localStorage.getItem('noir_settings')) || {}) }
    };

    // Populate missing defaults
    if (!localStorage.getItem('noir_gallery')) localStorage.setItem('noir_gallery', JSON.stringify(defaultGallery));
    if (!localStorage.getItem('noir_settings')) localStorage.setItem('noir_settings', JSON.stringify(defaultSettings));
    if (!localStorage.getItem('noir_menu')) localStorage.setItem('noir_menu', JSON.stringify(defaultMenu));

    const activeUser = JSON.parse(sessionStorage.getItem('noir_active_user'));
    const isSuperAdmin = activeUser && activeUser.email.toLowerCase() === 'kaveeshaabhiman12345@gmail.com';

    function applyRoleRestrictions() {
        // Hide/Show Super Admin only setting field (Legacy id removed from HTML)
        const superField = document.getElementById('superAdminOnlyField');
        if (superField) {
            superField.style.display = isSuperAdmin ? 'block' : 'none';
        }

        // Hide "Admins" tab from other admins
        const adminsTab = document.querySelector('.nav-item[data-tab="admins"]');
        if (adminsTab && !isSuperAdmin) {
            adminsTab.style.display = 'none';
        }

        // Hide "Payments" tab from other admins
        const paymentsTab = document.getElementById('navPayments');
        if (paymentsTab && !isSuperAdmin) {
            paymentsTab.style.display = 'none';
        }
    }

    // Call it immediately
    applyRoleRestrictions();

    // --- DOM Elements ---
    const sidebar = document.getElementById('sidebar');
    const navItems = document.querySelectorAll('.nav-item[data-tab]');
    const tabPanes = document.querySelectorAll('.tab-pane');
    const pageTitle = document.getElementById('pageTitle');

    // Feature Containers
    const menuTableBody = document.getElementById('menuTableBody');
    const ordersTableBody = document.getElementById('ordersTableBody');
    const messagesContainer = document.getElementById('messagesContainer');
    const galleryTableBody = document.getElementById('galleryTableBody');

    // Badges
    const orderBadge = document.getElementById('orderBadge');
    const messageBadge = document.getElementById('messageBadge');

    // Modal Elements
    const menuModal = document.getElementById('menuModal');
    const galleryModal = document.getElementById('galleryModal');
    const orderDetailsModal = document.getElementById('orderDetailsModal');
    const adminModal = document.getElementById('adminModal');
    const adminsTableBody = document.getElementById('adminsTableBody');

    // --- Tab Switching ---
    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const tabId = item.getAttribute('data-tab');
            navItems.forEach(nav => nav.classList.remove('active'));
            item.classList.add('active');
            tabPanes.forEach(pane => pane.classList.remove('active'));
            document.getElementById(tabId).classList.add('active');
            pageTitle.textContent = item.querySelector('span:last-child').textContent;

            // Refresh content
            if (tabId === 'dashboard') updateDashboardStats();
            if (tabId === 'orders') renderOrdersTable();
            if (tabId === 'menu') renderMenuTable();
            if (tabId === 'gallery') renderGalleryTable();
            if (tabId === 'messages') renderMessages();
            if (tabId === 'admins') renderAdminsTable();
            if (tabId === 'settings') loadSettings();
            if (tabId === 'payments') loadSettings();
        });
    });

    // --- Menu Logic ---
    window.editMenu = function (cat, idx) {
        const item = state.menuItems[cat][idx];
        document.getElementById('modalTitle').textContent = 'Edit Menu Item';
        document.getElementById('itemName').value = item.name;
        document.getElementById('itemDesc').value = item.desc;
        document.getElementById('itemPrice').value = item.price;
        document.getElementById('itemCategory').value = cat;
        document.getElementById('itemImageUrl').value = item.image;
        document.getElementById('itemEmoji').value = item.emoji || '☕';
        document.getElementById('itemTag').value = item.tag || '';
        document.getElementById('itemIndex').value = idx;
        document.getElementById('itemCategoryOrigin').value = cat;
        menuModal.classList.add('active');
    };

    document.getElementById('addMenuItemBtn')?.addEventListener('click', () => {
        document.getElementById('modalTitle').textContent = 'Add New Item';
        document.getElementById('menuForm').reset();
        document.getElementById('itemIndex').value = '';
        menuModal.classList.add('active');
    });

    document.getElementById('menuForm')?.addEventListener('submit', (e) => {
        e.preventDefault();
        const cat = document.getElementById('itemCategory').value;
        const originCat = document.getElementById('itemCategoryOrigin').value;
        const idx = document.getElementById('itemIndex').value;

        const newItem = {
            name: document.getElementById('itemName').value,
            desc: document.getElementById('itemDesc').value,
            price: document.getElementById('itemPrice').value,
            emoji: document.getElementById('itemEmoji').value,
            image: document.getElementById('itemImageUrl').value,
            tag: document.getElementById('itemTag').value,
            status: 'available'
        };

        if (idx !== '') {
            if (originCat !== cat) {
                state.menuItems[originCat].splice(idx, 1);
                state.menuItems[cat].push(newItem);
            } else {
                state.menuItems[cat][idx] = newItem;
            }
        } else {
            state.menuItems[cat].unshift(newItem);
        }

        localStorage.setItem('noir_menu', JSON.stringify(state.menuItems));
        renderMenuTable();
        menuModal.classList.remove('active');
    });

    function renderMenuTable() {
        if (!menuTableBody) return;
        let html = '';
        Object.keys(state.menuItems).forEach(cat => {
            state.menuItems[cat].forEach((item, idx) => {
                html += `<tr>
                    <td><div style='display:flex;align-items:center;gap:10px;'><img src='${item.image}' style='width:35px;height:35px;border-radius:4px;'><strong>${item.name}</strong></div></td>
                    <td>${cat.toUpperCase()}</td>
                    <td>${item.price}</td>
                    <td><span class='status available'>available</span></td>
                    <td>
                        <button class='btn btn-ghost btn-sm' onclick='editMenu("${cat}",${idx})'>Edit</button>
                        <button class='btn btn-ghost btn-sm' onclick='deleteMenu("${cat}",${idx})' style='color:#ec7063'>✕</button>
                    </td>
                </tr>`;
            });
        });
        menuTableBody.innerHTML = html || '<tr><td colspan="5" align="center">No items.</td></tr>';
    }

    window.deleteMenu = function (cat, idx) {
        if (confirm('Delete this item?')) {
            state.menuItems[cat].splice(idx, 1);
            localStorage.setItem('noir_menu', JSON.stringify(state.menuItems));
            renderMenuTable();
        }
    };

    // --- Gallery Logic ---
    window.editGallery = function (idx) {
        const item = state.gallery[idx];
        document.getElementById('galleryModalTitle').textContent = 'Edit Photo';
        document.getElementById('galleryItemTitle').value = item.title;
        document.getElementById('galleryItemUrl').value = item.url;
        document.getElementById('galleryItemTag').value = item.tag || '';
        document.getElementById('galleryItemSize').value = item.size || 'normal';
        document.getElementById('galleryItemIndex').value = idx;
        galleryModal.classList.add('active');
    };

    document.getElementById('addGalleryItemBtn')?.addEventListener('click', () => {
        document.getElementById('galleryModalTitle').textContent = 'Add Photo';
        document.getElementById('galleryForm').reset();
        document.getElementById('galleryItemIndex').value = '';
        galleryModal.classList.add('active');
    });

    document.getElementById('galleryForm')?.addEventListener('submit', (e) => {
        e.preventDefault();
        const idx = document.getElementById('galleryItemIndex').value;
        const newItem = {
            title: document.getElementById('galleryItemTitle').value,
            url: document.getElementById('galleryItemUrl').value,
            tag: document.getElementById('galleryItemTag').value,
            size: document.getElementById('galleryItemSize').value
        };
        if (idx !== '') state.gallery[idx] = newItem;
        else state.gallery.unshift(newItem);
        localStorage.setItem('noir_gallery', JSON.stringify(state.gallery));
        renderGalleryTable();
        galleryModal.classList.add('active');
    });

    function renderGalleryTable() {
        if (!galleryTableBody) return;
        galleryTableBody.innerHTML = state.gallery.map((item, idx) => `
            <tr>
                <td><img src="${item.url}" style="width:60px;height:40px;border-radius:4px;object-fit:cover;"></td>
                <td><strong>${item.title}</strong></td>
                <td>${item.tag || '<span style="color:#666">None</span>'}</td>
                <td>
                    <button class="btn btn-ghost btn-sm" onclick="editGallery(${idx})">Edit</button>
                    <button class="btn btn-ghost btn-sm" onclick="deleteGallery(${idx})" style="color:#ec7063">✕</button>
                </td>
            </tr>
        `).join('');
    }

    window.deleteGallery = function (idx) {
        if (confirm('Delete this photo?')) {
            state.gallery.splice(idx, 1);
            localStorage.setItem('noir_gallery', JSON.stringify(state.gallery));
            renderGalleryTable();
        }
    };

    // --- Settings ---
    function loadSettings() {
        const s = state.settings;
        if (document.getElementById('settingStoreName')) document.getElementById('settingStoreName').value = s.storeName;
        if (document.getElementById('settingStoreAddress')) document.getElementById('settingStoreAddress').value = s.storeAddress;
        if (document.getElementById('settingStorePhone')) document.getElementById('settingStorePhone').value = s.storePhone;
        if (document.getElementById('settingHoursWeek')) document.getElementById('settingHoursWeek').value = s.hoursWeek;
        if (document.getElementById('settingHoursWeekend')) document.getElementById('settingHoursWeekend').value = s.hoursWeekend;
        if (document.getElementById('settingDeliveryZone1')) document.getElementById('settingDeliveryZone1').value = s.deliveryZone1 ?? 250;
        if (document.getElementById('settingDeliveryZone2')) document.getElementById('settingDeliveryZone2').value = s.deliveryZone2 ?? 500;
        if (document.getElementById('settingDeliveryZone3')) document.getElementById('settingDeliveryZone3').value = s.deliveryZone3 ?? 1000;
        
        // Online Payment Tab fields
        if (document.getElementById('settingBankName')) {
            const parts = (s.paymentAccount || '').split(' - ');
            document.getElementById('settingBankName').value = parts[0] || '';
            document.getElementById('settingAccountNo').value = parts[1] || '';
            document.getElementById('settingBranch').value = parts[2] || '';
            updateAccountPreview();
        }
        // Visual Settings
        if (document.getElementById('settingHeroImg')) document.getElementById('settingHeroImg').value = s.heroImg || '';
        if (document.getElementById('settingAboutImg1')) document.getElementById('settingAboutImg1').value = s.aboutImg1 || '';
        if (document.getElementById('settingAboutImg2')) document.getElementById('settingAboutImg2').value = s.aboutImg2 || '';
        if (document.getElementById('settingAboutImg3')) document.getElementById('settingAboutImg3').value = s.aboutImg3 || '';
        if (document.getElementById('settingAwardImg')) document.getElementById('settingAwardImg').value = s.awardImg || '';
        if (document.getElementById('settingAvatar1')) document.getElementById('settingAvatar1').value = s.avatar1 || '';
        if (document.getElementById('settingAvatar2')) document.getElementById('settingAvatar2').value = s.avatar2 || '';
        if (document.getElementById('settingAvatar3')) document.getElementById('settingAvatar3').value = s.avatar3 || '';
        if (document.getElementById('settingCtaImg')) document.getElementById('settingCtaImg').value = s.ctaImg || '';
        if (document.getElementById('settingAboutBg')) document.getElementById('settingAboutBg').value = s.aboutBg || '';
        if (document.getElementById('settingProcessBg')) document.getElementById('settingProcessBg').value = s.processBg || '';
        if (document.getElementById('settingMenuBg')) document.getElementById('settingMenuBg').value = s.menuBg || '';
        if (document.getElementById('settingGalleryBg')) document.getElementById('settingGalleryBg').value = s.galleryBg || '';
        if (document.getElementById('settingTestimonialBg')) document.getElementById('settingTestimonialBg').value = s.testimonialBg || '';
        if (document.getElementById('settingContactBg')) document.getElementById('settingContactBg').value = s.contactBg || '';
    }

    // --- Real-time Account Preview logic ---
    function updateAccountPreview() {
        const bankInput = document.getElementById('settingBankName');
        const accInput = document.getElementById('settingAccountNo');
        const branchInput = document.getElementById('settingBranch');

        if (document.getElementById('previewBank') && bankInput) {
            document.getElementById('previewBank').textContent = bankInput.value || 'BANK NAME';
            document.getElementById('previewAcc').textContent = accInput.value || '•••• •••• ••••';
            document.getElementById('previewBranch').textContent = branchInput.value || 'CITY NAME';
        }
    }

    ['settingBankName', 'settingAccountNo', 'settingBranch'].forEach(id => {
        document.getElementById(id)?.addEventListener('input', updateAccountPreview);
    });

    document.getElementById('settingsForm')?.addEventListener('submit', (e) => {
        e.preventDefault();
        state.settings = {
            ...state.settings,
            storeName: document.getElementById('settingStoreName').value,
            storeAddress: document.getElementById('settingStoreAddress').value,
            storePhone: document.getElementById('settingStorePhone').value,
            hoursWeek: document.getElementById('settingHoursWeek').value,
            hoursWeekend: document.getElementById('settingHoursWeekend').value,
            deliveryZone1: parseInt(document.getElementById('settingDeliveryZone1').value) || 250,
            deliveryZone2: parseInt(document.getElementById('settingDeliveryZone2').value) || 500,
            deliveryZone3: parseInt(document.getElementById('settingDeliveryZone3').value) || 1000
        };
        localStorage.setItem('noir_settings', JSON.stringify(state.settings));
        alert(`Store settings saved!`);
    });

    document.getElementById('paymentSettingsForm')?.addEventListener('submit', (e) => {
        e.preventDefault();
        const b = document.getElementById('settingBankName').value;
        const a = document.getElementById('settingAccountNo').value;
        const br = document.getElementById('settingBranch').value;
        
        state.settings = {
            ...state.settings,
            paymentAccount: `${b} - ${a} - ${br}`
        };
        localStorage.setItem('noir_settings', JSON.stringify(state.settings));
        alert('Vault Secured: Payment Details Updated!');
    });

    document.getElementById('visualSettingsForm')?.addEventListener('submit', (e) => {
        e.preventDefault();
        state.settings = {
            ...state.settings,
            heroImg: document.getElementById('settingHeroImg').value,
            aboutImg1: document.getElementById('settingAboutImg1').value,
            aboutImg2: document.getElementById('settingAboutImg2').value,
            aboutImg3: document.getElementById('settingAboutImg3').value,
            awardImg: document.getElementById('settingAwardImg').value,
            avatar1: document.getElementById('settingAvatar1').value,
            avatar2: document.getElementById('settingAvatar2').value,
            avatar3: document.getElementById('settingAvatar3').value,
            ctaImg: document.getElementById('settingCtaImg').value,
            aboutBg: document.getElementById('settingAboutBg').value,
            processBg: document.getElementById('settingProcessBg').value,
            menuBg: document.getElementById('settingMenuBg').value,
            galleryBg: document.getElementById('settingGalleryBg').value,
            testimonialBg: document.getElementById('settingTestimonialBg').value,
            contactBg: document.getElementById('settingContactBg').value
        };
        localStorage.setItem('noir_settings', JSON.stringify(state.settings));
        alert('Visual settings saved!');
    });

    // --- Orders & Stats ---
    function renderOrdersTable() {
        if (!ordersTableBody) return;
        state.orders = JSON.parse(localStorage.getItem('noir_orders')) || [];
        const pendingCount = state.orders.filter(o => o.status === 'pending').length;
        if (orderBadge) {
            orderBadge.textContent = pendingCount;
            orderBadge.style.display = pendingCount > 0 ? 'flex' : 'none';
        }
        ordersTableBody.innerHTML = state.orders.map(o => `<tr>
            <td><code>${o.id}</code><br><small style="color:#666">${o.date}</small></td>
            <td>
                <strong style="color:#f5f0eb">${o.customerName}</strong><br>
                <small>📞 ${o.phone}</small><br>
                ${o.orderType === 'pickup'
                    ? `<small style="color:#2ecc71">🏪 Pickup from store</small>`
                    : `<small style="color:#c8a97e">📍 ${o.address || 'N/A'}</small>`
                }<br>
                ${o.distance ? `<small style="color:#aaa">📶 ${o.distance} km away</small><br>` : ''}
            </td>
            <td>
                <ul style="padding-left:0; margin:0;">
                    ${o.items.map(i => `<li class="item-li"><strong>${i.quantity || 1}x</strong> ${i.name}</li>`).join('')}
                </ul>
            </td>
            <td>
                <span style="color:#888;font-size:0.78rem">Subtotal: ${o.subtotal || o.total}</span><br>
                ${o.orderType === 'pickup'
                    ? `<span style="color:#2ecc71;font-size:0.78rem">🏪 Pickup: Free</span>`
                    : `<span style="color:#e67e22;font-size:0.78rem">🚚 Delivery: ${o.deliveryCharge || 'Rs. 0'}</span>`
                }<br>
                <strong style="color:#c8a97e">Total: ${o.total}</strong><br>
                <small style="color:var(--accent); font-weight:600">💳 ${o.paymentMethod === 'online' ? 'Online Payment' : (o.orderType === 'pickup' ? 'Pay at Shop' : 'Cash on Delivery')}</small>
            </td>
            <td><span class="status ${o.status}">${o.status}</span></td>
            <td>
                <div style="display:flex; flex-direction:column; gap:6px;">
                    <button class="btn btn-primary btn-sm" onclick="viewOrderInvoice('${o.id}')">View</button>
                    ${o.status === 'pending' ? `<button class="btn btn-ghost btn-sm" onclick="confirmOrder('${o.id}')" style="border-color:#2ecc71; color:#2ecc71">Confirm</button>` : ''}
                    <button class="btn btn-ghost btn-sm" onclick="deleteOrder('${o.id}')" style="color:#ec7063">✕</button>
                </div>
            </td>
        </tr>`).join('') || '<tr><td colspan="6" align="center">No orders.</td></tr>';
        updateDashboardStats();
    }

    window.confirmOrder = function (id) {
        let os = JSON.parse(localStorage.getItem('noir_orders')) || [];
        const o = os.find(ord => ord.id === id);
        if (o) { o.status = 'completed'; localStorage.setItem('noir_orders', JSON.stringify(os)); renderOrdersTable(); }
    };

    window.deleteOrder = function (id) {
        if (confirm('Delete order?')) {
            let os = JSON.parse(localStorage.getItem('noir_orders')) || [];
            localStorage.setItem('noir_orders', JSON.stringify(os.filter(ord => ord.id !== id)));
            renderOrdersTable();
        }
    };

    window.viewOrderInvoice = function (id) {
        const o = state.orders.find(ord => ord.id === id);
        if (!o) return;

        const content = document.getElementById('orderDetailsContent');
        const modal = document.getElementById('orderDetailsModal');

        const payLabel = o.paymentMethod === 'online' ? 'Online Payment' : (o.orderType === 'pickup' ? 'Pay at Shop' : 'Cash on Delivery');

        content.innerHTML = `
            <div class="invoice-section">
                <span class="invoice-label">Order ID & Date</span>
                <div class="invoice-value">${o.id} &middot; ${o.date}</div>
            </div>
            <div class="invoice-section">
                <span class="invoice-label">Customer Information</span>
                <div class="invoice-value">${o.customerName}</div>
                <div class="invoice-value" style="font-size:0.8rem; opacity:0.8;">📞 ${o.phone}</div>
                <div class="invoice-value" style="font-size:0.8rem; opacity:0.8; margin-top:4px;">📍 ${o.address}</div>
                ${o.distance ? `<div class="invoice-value" style="font-size:0.75rem; color:var(--accent);">📶 ${o.distance} away from store</div>` : ''}
            </div>
            <div class="invoice-section">
                <span class="invoice-label">Items Ordered</span>
                <div class="invoice-items-list">
                    ${o.items.map(i => `
                        <div class="invoice-item">
                            <span class="name">${i.quantity || 1}x ${i.name}</span>
                            <span class="price">${i.price}</span>
                        </div>
                    `).join('')}
                </div>
            </div>
            <div class="invoice-section" style="background:rgba(200,169,126,0.03); padding:10px; border-radius:8px;">
                <span class="invoice-label">Billing & Payment</span>
                <div class="invoice-item">
                    <span>Subtotal</span>
                    <span>${o.subtotal || o.total}</span>
                </div>
                <div class="invoice-item">
                    <span>${o.orderType === 'pickup' ? '🏪 Pickup' : '🚚 Delivery'}</span>
                    <span>${o.deliveryCharge || 'Free'}</span>
                </div>
                <div class="invoice-total-row">
                    <span>GRAND TOTAL</span>
                    <span>${o.total}</span>
                </div>
                <div style="margin-top:10px; font-size:0.75rem; text-align:right; color:var(--accent);">
                    <strong>Payment:</strong> ${payLabel}
                </div>
            </div>
        `;

        modal.classList.add('active');
    };

    // --- Admin/Staff Logic ---
    function renderAdminsTable() {
        if (!adminsTableBody) return;
        
        // Render Super Admin row first (un-deletable, un-blockable)
        let html = `
            <tr style="background:rgba(200,169,126,0.05); border-left:4px solid var(--accent);">
                <td><strong>${state.superAdmin.name}</strong> <small style="display:block;color:var(--accent);font-size:0.7rem;">(System Owner)</small></td>
                <td>${state.superAdmin.email}</td>
                <td><code style="background:rgba(200,169,126,0.1); padding:2px 6px; border-radius:4px; font-size:0.75rem;">••••••••</code></td>
                <td><span class="status active">Active</span></td>
                <td>
                    <button class="btn btn-ghost btn-sm" onclick="editSuperAdmin()">Edit</button>
                </td>
            </tr>
        `;

        // Render other staff
        html += state.admins.map((adm, idx) => `
            <tr>
                <td><strong>${adm.name}</strong></td>
                <td>${adm.email}</td>
                <td><code style="background:rgba(200,169,126,0.1); padding:2px 6px; border-radius:4px; font-size:0.75rem;">••••••••</code></td>
                <td>
                    <span class="status ${adm.status || 'active'}">${adm.status || 'active'}</span>
                </td>
                <td>
                    <div style="display:flex; gap:6px;">
                        <button class="btn btn-ghost btn-sm" onclick="editAdmin(${idx})">Edit</button>
                        <button class="btn btn-ghost btn-sm" onclick="toggleAdminStatus(${idx})" style="color:${adm.status === 'blocked' ? '#2ecc71' : '#f1c40f'}">
                            ${adm.status === 'blocked' ? 'Unblock' : 'Block'}
                        </button>
                        <button class="btn btn-ghost btn-sm" onclick="deleteAdmin(${idx})" style="color:#ec7063">✕</button>
                    </div>
                </td>
            </tr>
        `).join('');

        adminsTableBody.innerHTML = html || '<tr><td colspan="5" align="center">No extra staff members.</td></tr>';
    }

    window.editSuperAdmin = function () {
        document.getElementById('adminModalTitle').textContent = 'Edit System Owner';
        document.getElementById('staffName').value = state.superAdmin.name;
        document.getElementById('staffEmail').value = state.superAdmin.email;
        document.getElementById('staffPassword').value = state.superAdmin.password;
        document.getElementById('adminIndex').value = 'SUPER';
        adminModal.classList.add('active');
    };

    window.toggleAdminStatus = function (idx) {
        state.admins[idx].status = state.admins[idx].status === 'blocked' ? 'active' : 'blocked';
        localStorage.setItem('noir_admins', JSON.stringify(state.admins));
        renderAdminsTable();
    };

    document.getElementById('addAdminBtn')?.addEventListener('click', () => {
        document.getElementById('adminModalTitle').textContent = 'Add Staff Member';
        document.getElementById('adminForm').reset();
        document.getElementById('adminIndex').value = '';
        adminModal.classList.add('active');
    });

    window.editAdmin = function (idx) {
        const adm = state.admins[idx];
        document.getElementById('adminModalTitle').textContent = 'Edit Member';
        document.getElementById('staffName').value = adm.name;
        document.getElementById('staffEmail').value = adm.email;
        document.getElementById('staffPassword').value = adm.password;
        document.getElementById('adminIndex').value = idx;
        adminModal.classList.add('active');
    };

    document.getElementById('adminForm')?.addEventListener('submit', (e) => {
        e.preventDefault();
        const idx = document.getElementById('adminIndex').value;
        const newDetails = {
            name: document.getElementById('staffName').value,
            email: document.getElementById('staffEmail').value,
            password: document.getElementById('staffPassword').value,
            status: (idx !== '' && idx !== 'SUPER') ? state.admins[idx].status : 'active'
        };

        if (idx === 'SUPER') {
            state.superAdmin = newDetails;
            localStorage.setItem('noir_super_admin', JSON.stringify(newDetails));
            // Force logout if super admin email/pass changed for security? 
            // For now just update profile.
            loadActiveUser();
        } else if (idx !== '') {
            state.admins[idx] = newDetails;
            localStorage.setItem('noir_admins', JSON.stringify(state.admins));
        } else {
            state.admins.push(newDetails);
            localStorage.setItem('noir_admins', JSON.stringify(state.admins));
        }

        renderAdminsTable();
        adminModal.classList.remove('active');
    });

    window.deleteAdmin = function (idx) {
        const adm = state.admins[idx];
        const active = JSON.parse(sessionStorage.getItem('noir_active_user'));
        
        if (active && active.email === adm.email) {
            alert("You cannot delete the account you are currently logged into.");
            return;
        }

        if (confirm('Remove this staff member?')) {
            state.admins.splice(idx, 1);
            localStorage.setItem('noir_admins', JSON.stringify(state.admins));
            renderAdminsTable();
        }
    };

    function renderMessages() {
        if (!messagesContainer) return;
        state.messages = JSON.parse(localStorage.getItem('noir_messages')) || [];
        if (messageBadge) {
            messageBadge.textContent = state.messages.length;
            messageBadge.style.display = state.messages.length > 0 ? 'flex' : 'none';
        }
        messagesContainer.innerHTML = state.messages.map((m, idx) => `
            <div class="message-item">
                <div class="message-meta"><span>${m.sender}</span><span>${m.time}</span></div>
                <div class="message-content"><strong>${m.subject}</strong><p>${m.text}</p></div>
                <div class="message-actions"><a href="mailto:${m.email}" class="btn btn-primary btn-sm">Reply</a><button class="btn btn-ghost btn-sm" onclick="deleteMessage(${idx})" style="color:#ec7063">✕</button></div>
            </div>
        `).join('') || '<div align="center">No messages.</div>';
    }

    window.deleteMessage = function (idx) {
        if (confirm('Delete message?')) {
            state.messages.splice(idx, 1);
            localStorage.setItem('noir_messages', JSON.stringify(state.messages));
            renderMessages();
            updateDashboardStats();
        }
    };

    function updateDashboardStats() {
        const os = JSON.parse(localStorage.getItem('noir_orders')) || [];
        const ms = JSON.parse(localStorage.getItem('noir_messages')) || [];
        
        // 1. Core Stats
        const rev = os.reduce((a, b) => a + (parseInt(b.total.replace('Rs. ', '')) || 0), 0);
        if (document.getElementById('statOrders')) document.getElementById('statOrders').textContent = os.length;
        if (document.getElementById('statRevenue')) document.getElementById('statRevenue').textContent = 'Rs. ' + rev;
        if (document.getElementById('statMessages')) document.getElementById('statMessages').textContent = ms.length;
        if (document.getElementById('statCustomers')) document.getElementById('statCustomers').textContent = new Set(os.map(o => o.phone)).size;

        renderSalesOverview(os);
        renderPopularItems(os);
    }

    function renderSalesOverview(orders) {
        const container = document.getElementById('salesChartContainer');
        if (!container) return;

        // Group last 7 days
        const days = [];
        for (let i = 6; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            days.push({
                dateStr: d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
                short: d.toLocaleDateString(undefined, { weekday: 'short' }).charAt(0),
                total: 0
            });
        }

        orders.forEach(o => {
            // Assume o.date is something like "Mar 11, 2026, 11:30 PM"
            const orderDate = new Date(o.date);
            const key = orderDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
            const dayObj = days.find(d => d.dateStr === key);
            if (dayObj) {
                dayObj.total += (parseInt(o.total.replace('Rs. ', '')) || 0);
            }
        });

        const maxTotal = Math.max(...days.map(d => d.total), 100);

        container.innerHTML = days.map(d => `
            <div class="chart-bar-wrap">
                <div class="chart-bar" style="height: ${(d.total / maxTotal) * 100}%" data-value="Rs. ${d.total}"></div>
                <span class="chart-label">${d.short}</span>
            </div>
        `).join('');
    }

    function renderPopularItems(orders) {
        const container = document.getElementById('popularItemsList');
        if (!container) return;

        const itemsCount = {};
        orders.forEach(o => {
            o.items.forEach(i => {
                itemsCount[i.name] = (itemsCount[i.name] || 0) + (i.quantity || 1);
            });
        });

        const sorted = Object.entries(itemsCount)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5);

        const maxCount = sorted.length > 0 ? sorted[0][1] : 1;

        container.innerHTML = sorted.map(([name, count]) => `
            <div class="popular-item">
                <div class="popular-item-info">
                    <span class="popular-item-name">${name}</span>
                    <span class="popular-item-count">${count} sold</span>
                </div>
                <div class="progress-bar-bg">
                    <div class="progress-bar-fill" style="width: ${(count / maxCount) * 100}%"></div>
                </div>
            </div>
        `).join('') || '<div align="center" style="color:var(--text-muted); padding-top:20px;">No sales data yet</div>';
    }

    // Modal Close logic
    document.querySelectorAll('.modal-close').forEach(b => b.addEventListener('click', () => {
        menuModal.classList.remove('active');
        galleryModal.classList.remove('active');
        orderDetailsModal.classList.remove('active');
        adminModal.classList.remove('active');
    }));

    function loadActiveUser() {
        const superDefault = { name: 'Super Admin', email: 'kaveeshaabhiman12345@gmail.com' };
        const savedSuper = JSON.parse(localStorage.getItem('noir_super_admin')) || superDefault;
        const user = JSON.parse(sessionStorage.getItem('noir_active_user')) || savedSuper;

        if (document.getElementById('activeUserName')) document.getElementById('activeUserName').textContent = user.name;
        if (document.getElementById('activeUserAvatar')) {
            document.getElementById('activeUserAvatar').textContent = (user.email || 'A').charAt(0).toUpperCase();
        }
        
        const isSuper = user.email === savedSuper.email;
        if (document.getElementById('activeUserRole')) {
            document.getElementById('activeUserRole').textContent = isSuper ? 'System Owner' : 'Staff Member';
        }

        // HIDDEN: Non-super admins cannot see "Manage Staff" tab
        const adminNavLink = document.querySelector('.nav-item[data-tab="admins"]');
        if (adminNavLink) {
            adminNavLink.style.display = isSuper ? 'flex' : 'none';
        }
    }

    // Init
    loadActiveUser();
    updateDashboardStats();
    renderMenuTable();
    renderOrdersTable();
    renderMessages();
    renderGalleryTable();
    renderAdminsTable();
    loadSettings();
});
