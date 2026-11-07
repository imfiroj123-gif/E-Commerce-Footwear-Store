/* ============================================================
   ZIVO ADMIN — SHARED JS
   ============================================================ */

const API_BASE = 'http://localhost:5000/api';

function normalizeImageUrl(value) {
    const url = new URL(value.trim());
    if (!['http:', 'https:'].includes(url.protocol)) throw new Error('Use an HTTP or HTTPS image URL.');

    if (url.hostname === 'drive.google.com' || url.hostname === 'www.drive.google.com') {
        const fileId = url.pathname.match(/\/file\/d\/([^/]+)/)?.[1] || url.searchParams.get('id');
        if (!fileId) throw new Error('Use a Google Drive file sharing link, not a folder link.');
        return `https://drive.google.com/thumbnail?id=${encodeURIComponent(fileId)}&sz=w1600`;
    }

    if (url.hostname === 'dropbox.com' || url.hostname === 'www.dropbox.com') {
        url.searchParams.delete('dl');
        url.searchParams.set('raw', '1');
    }
    return url.href;
}

function imageUrlOrPlaceholder(value) {
    try {
        return normalizeImageUrl(value);
    } catch {
        return '../../images/product-image-placeholder.svg';
    }
}

// ── Auth ──────────────────────────────────────────────────────
const Auth = {
    getToken: () => { const u = JSON.parse(localStorage.getItem('zivo_user')||'null'); return u?.token||null; },
    getUser: () => JSON.parse(localStorage.getItem('zivo_user')||'null'),
    setUser: (d) => localStorage.setItem('zivo_user', JSON.stringify(d)),
    isAdmin: () => { const u = JSON.parse(localStorage.getItem('zivo_user')||'null'); return u?.isAdmin||false; },
    logout: () => { localStorage.removeItem('zivo_user'); window.location.href = '../index.html'; },
};

// Guard: redirect if not admin
function requireAdmin() {
    if (!Auth.getToken() || !Auth.isAdmin()) {
        window.location.href = '../index.html';
        return false;
    }
    return true;
}

// ── API Fetch ─────────────────────────────────────────────────
async function api(url, options = {}) {
    const token = Auth.getToken();
    const headers = { 'Content-Type': 'application/json', ...(token?{Authorization:`Bearer ${token}`}:{}), ...(options.headers||{}) };
    const res = await fetch(url, { ...options, headers });
    if (!res.ok) {
        const err = await res.json().catch(() => ({ message: res.statusText }));
        throw new Error(err.message || 'Request failed');
    }
    return res.json();
}

// ── Toast ─────────────────────────────────────────────────────
function showToast(message, type = 'success') {
    let container = document.getElementById('toast-container');
    if (!container) {
        container = document.createElement('div');
        container.className = 'toast-container';
        container.id = 'toast-container';
        document.body.appendChild(container);
    }
    const icons = { success: '✅', error: '❌', info: 'ℹ️', warning: '⚠️' };
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `<span>${icons[type]||'ℹ️'}</span><span class="toast-message">${message}</span><button class="toast-close" onclick="this.parentElement.remove()">×</button>`;
    container.appendChild(toast);
    setTimeout(() => { toast.classList.add('removing'); setTimeout(() => toast.remove(), 300); }, 3500);
}

// ── Sidebar ───────────────────────────────────────────────────
function initSidebar() {
    // Hamburger toggle for mobile
    const hamburger = document.querySelector('.hamburger-admin');
    const sidebar = document.querySelector('.sidebar');
    hamburger?.addEventListener('click', (e) => { e.stopPropagation(); sidebar?.classList.toggle('open'); });
    document.addEventListener('click', (e) => {
        if (window.innerWidth <= 768 && sidebar?.classList.contains('open') && !sidebar.contains(e.target)) {
            sidebar.classList.remove('open');
        }
    });

    // Highlight active nav item
    const path = window.location.pathname;
    document.querySelectorAll('.nav-item[data-href]').forEach(el => {
        if (path.includes(el.dataset.href)) el.classList.add('active');
    });

    // Load user info
    const user = Auth.getUser();
    const nameEl = document.getElementById('sidebar-user-name');
    const avatarEl = document.getElementById('sidebar-user-avatar');
    if (nameEl && user) nameEl.textContent = user.name;
    if (avatarEl && user) avatarEl.textContent = user.name[0].toUpperCase();
}

// ── Format helpers ────────────────────────────────────────────
const fmt = {
    price: (n) => '$' + Number(n||0).toFixed(2),
    date: (d) => new Date(d).toLocaleDateString('en-IN', { year:'numeric', month:'short', day:'numeric' }),
    shortId: (id) => '#' + (id||'').slice(-8).toUpperCase(),
};

// ── Confirm dialog ────────────────────────────────────────────
function confirmAction(message, onConfirm) {
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay active';
    overlay.innerHTML = `
        <div class="modal" style="max-width:400px;text-align:center;">
            <div style="font-size:48px;margin-bottom:16px;">⚠️</div>
            <h3 class="modal-title" style="margin-bottom:12px;">Confirm Action</h3>
            <p style="color:var(--text-2);font-size:15px;margin-bottom:28px;">${message}</p>
            <div style="display:flex;gap:12px;justify-content:center;">
                <button class="btn btn-ghost" onclick="this.closest('.modal-overlay').remove()">Cancel</button>
                <button class="btn btn-danger" id="confirm-yes">Yes, Proceed</button>
            </div>
        </div>`;
    document.body.appendChild(overlay);
    document.getElementById('confirm-yes').onclick = () => { overlay.remove(); onConfirm(); };
}

// ── Init on load ──────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
    requireAdmin();
    initSidebar();
});
