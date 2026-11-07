/* ============================================================
   ZIVO — SHARED UTILITIES
   ============================================================ */

const API_BASE = 'http://localhost:5000/api';

function normalizeImageUrl(value) {
    try {
        const url = new URL(value.trim());
        if (!['http:', 'https:'].includes(url.protocol)) return value;

        if (url.hostname === 'drive.google.com' || url.hostname === 'www.drive.google.com') {
            const fileId = url.pathname.match(/\/file\/d\/([^/]+)/)?.[1] || url.searchParams.get('id');
            if (fileId) return `https://drive.google.com/thumbnail?id=${encodeURIComponent(fileId)}&sz=w1600`;
        }

        if (url.hostname === 'dropbox.com' || url.hostname === 'www.dropbox.com') {
            url.searchParams.delete('dl');
            url.searchParams.set('raw', '1');
        }
        return url.href;
    } catch {
        return value;
    }
}

// ── Auth helpers ──────────────────────────────────────────────
const Auth = {
    getToken: () => {
        const user = JSON.parse(localStorage.getItem('zivo_user') || 'null');
        return user ? user.token : null;
    },
    getUser: () => JSON.parse(localStorage.getItem('zivo_user') || 'null'),
    setUser: (data) => localStorage.setItem('zivo_user', JSON.stringify(data)),
    removeUser: () => localStorage.removeItem('zivo_user'),
    isLoggedIn: () => !!Auth.getToken(),
    isAdmin: () => {
        const u = Auth.getUser();
        return u && u.isAdmin;
    },
    logout: () => {
        Auth.removeUser();
        showToast('Logged out successfully', 'info');
        setTimeout(() => { window.location.href = rootPath() + 'index.html'; }, 1000);
    }
};

// ── Fetch helpers ─────────────────────────────────────────────
async function authFetch(url, options = {}) {
    const token = Auth.getToken();
    const headers = {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(options.headers || {}),
    };
    const res = await fetch(url, { ...options, headers });
    if (!res.ok) {
        const err = await res.json().catch(() => ({ message: res.statusText }));
        throw new Error(err.message || 'Request failed');
    }
    return res.json();
}

// ── Formatting ────────────────────────────────────────────────
function formatPrice(price) {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0,
    }).format(price);
}

function formatPriceUSD(price) {
    return '$' + Number(price).toFixed(2);
}

function formatDate(dateStr) {
    return new Date(dateStr).toLocaleDateString('en-IN', {
        year: 'numeric', month: 'short', day: 'numeric'
    });
}

// ── Stars ─────────────────────────────────────────────────────
function renderStars(rating) {
    const full = Math.floor(rating);
    const half = rating % 1 >= 0.5 ? 1 : 0;
    const empty = 5 - full - half;
    return '★'.repeat(full) + (half ? '½' : '') + '☆'.repeat(empty);
}

// ── Debounce ──────────────────────────────────────────────────
function debounce(fn, wait = 300) {
    let timer;
    return (...args) => {
        clearTimeout(timer);
        timer = setTimeout(() => fn(...args), wait);
    };
}

// ── Path helpers ──────────────────────────────────────────────
function rootPath() {
    const depth = window.location.pathname.split('/').filter(Boolean).length;
    if (depth <= 1) return '';
    if (window.location.pathname.includes('/admin/')) {
        const adminDepth = window.location.pathname.split('/admin/')[1].split('/').filter(Boolean).length;
        return '../'.repeat(adminDepth + 1);
    }
    return '../'.repeat(depth - 1);
}

function isAtRoot() {
    return window.location.pathname.endsWith('index.html') || 
           window.location.pathname === '/';
}

// ── Toast Notifications ───────────────────────────────────────
function showToast(message, type = 'success', duration = 3500) {
    let container = document.getElementById('toast-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toast-container';
        container.className = 'toast-container';
        document.body.appendChild(container);
    }

    const icons = { success: '✅', error: '❌', info: 'ℹ️', warning: '⚠️', cart: '🛒' };

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
        <span class="toast-icon">${icons[type] || icons.info}</span>
        <span class="toast-message">${message}</span>
        <button class="toast-close" onclick="removeToast(this.parentElement)">×</button>
    `;

    container.appendChild(toast);
    setTimeout(() => removeToast(toast), duration);
}

function removeToast(el) {
    if (!el || !el.parentElement) return;
    el.classList.add('removing');
    setTimeout(() => el.remove(), 300);
}

// ── Navbar scroll behavior ────────────────────────────────────
function initNavbar() {
    const navbar = document.querySelector('.navbar');
    if (!navbar) return;
    window.addEventListener('scroll', () => {
        navbar.classList.toggle('scrolled', window.scrollY > 60);
    }, { passive: true });
}

// ── Hamburger menu ────────────────────────────────────────────
function initMobileNav() {
    const hamburger = document.querySelector('.hamburger');
    const mobileNav = document.querySelector('.mobile-nav');
    if (!hamburger || !mobileNav) return;

    hamburger.addEventListener('click', (e) => {
        e.stopPropagation();
        hamburger.classList.toggle('active');
        mobileNav.classList.toggle('open');
    });

    document.addEventListener('click', (e) => {
        if (mobileNav.classList.contains('open') && !mobileNav.contains(e.target) && !hamburger.contains(e.target)) {
            hamburger.classList.remove('active');
            mobileNav.classList.remove('open');
        }
    });
}

// ── Custom cursor ─────────────────────────────────────────────
function initCursor() {
    if (window.matchMedia('(pointer: coarse)').matches) return;

    const dot = document.createElement('div');
    dot.className = 'cursor-dot';
    const ring = document.createElement('div');
    ring.className = 'cursor-ring';
    document.body.appendChild(dot);
    document.body.appendChild(ring);

    let mouseX = 0, mouseY = 0;
    let ringX = 0, ringY = 0;

    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
        dot.style.left = mouseX + 'px';
        dot.style.top = mouseY + 'px';
    });

    function animateRing() {
        ringX += (mouseX - ringX) * 0.12;
        ringY += (mouseY - ringY) * 0.12;
        ring.style.left = ringX + 'px';
        ring.style.top = ringY + 'px';
        requestAnimationFrame(animateRing);
    }
    animateRing();

    document.querySelectorAll('a, button, [data-hover]').forEach(el => {
        el.addEventListener('mouseenter', () => ring.classList.add('hovered'));
        el.addEventListener('mouseleave', () => ring.classList.remove('hovered'));
    });
}

// ── Search overlay ────────────────────────────────────────────
function initSearch() {
    const searchBtn = document.getElementById('search-btn');
    const searchOverlay = document.getElementById('search-overlay');
    const searchClose = document.getElementById('search-close');
    const searchInput = document.getElementById('search-input');
    if (!searchBtn || !searchOverlay) return;

    const openSearch = () => {
        searchOverlay.classList.add('active');
        setTimeout(() => searchInput.focus(), 300);
    };

    const closeSearch = () => searchOverlay.classList.remove('active');
    const searchProducts = (query) => {
        const value = query.trim();
        if (!value) return;
        window.location.href = rootPath() + 'pages/shop.html?keyword=' + encodeURIComponent(value);
    };

    if (searchInput) {
        searchInput.setAttribute('aria-label', 'Search products');
        const suggestions = document.createElement('div');
        suggestions.className = 'search-suggestions';
        suggestions.setAttribute('aria-label', 'Recommended product categories');
        suggestions.innerHTML = '<p class="search-suggestions-title">Browse popular categories</p><div class="search-suggestion-list"></div>';
        const suggestionList = suggestions.querySelector('.search-suggestion-list');
        ['Sneakers', 'Boots', 'Luxury', 'Sports', 'Casual', 'Limited'].forEach(category => {
            const button = document.createElement('button');
            button.type = 'button';
            button.className = 'search-suggestion';
            button.textContent = category;
            button.addEventListener('click', () => {
                window.location.href = rootPath() + 'pages/shop.html?category=' + encodeURIComponent(category);
            });
            suggestionList.appendChild(button);
        });
        searchInput.insertAdjacentElement('afterend', suggestions);
    }

    searchBtn.addEventListener('click', openSearch);
    searchClose?.addEventListener('click', closeSearch);
    searchOverlay.addEventListener('click', (e) => { if (e.target === searchOverlay) closeSearch(); });
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeSearch();
        if ((e.ctrlKey || e.metaKey) && e.key === 'k') { e.preventDefault(); openSearch(); }
    });

    searchInput?.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            searchProducts(searchInput.value);
        }
    });
}

// ── Update nav cart badge ─────────────────────────────────────
function updateCartBadge() {
    const cartItems = Cart.getItems();
    const count = cartItems.reduce((sum, item) => sum + item.qty, 0);
    const badge = document.getElementById('cart-count');
    if (!badge) return;
    badge.textContent = count > 9 ? '9+' : count;
    badge.classList.toggle('visible', count > 0);
}

// ── Update nav user icon ──────────────────────────────────────
function updateNavUser() {
    const userBtn = document.getElementById('user-btn');
    if (!userBtn) return;
    if (Auth.isLoggedIn()) {
        userBtn.title = Auth.getUser().name;
    }
}

// ── Init common ───────────────────────────────────────────────
function initCommon() {
    initNavbar();
    initMobileNav();
    initCursor();
    initSearch();
    updateCartBadge();
    updateNavUser();
}

// Auto-init when DOM ready
document.addEventListener('DOMContentLoaded', initCommon);
