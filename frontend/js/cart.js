/* ============================================================
   ZIVO — CART MANAGER
   ============================================================ */

const CART_KEY = 'zivo_cart';

const Cart = {
    // Get all items
    getItems() {
        return JSON.parse(localStorage.getItem(CART_KEY) || '[]');
    },

    // Save items
    _save(items) {
        localStorage.setItem(CART_KEY, JSON.stringify(items));
        updateCartBadge();
        Cart._dispatchUpdate();
    },

    _dispatchUpdate() {
        document.dispatchEvent(new CustomEvent('cart:updated', { detail: Cart.getItems() }));
    },

    // Add item
    addItem(product, qty = 1, size = '') {
        const items = Cart.getItems();
        const key = product._id + (size ? `-${size}` : '');
        const existing = items.find(i => i.key === key);

        if (existing) {
            existing.qty = Math.min(existing.qty + qty, product.countInStock || 99);
        } else {
            items.push({
                key,
                _id: product._id,
                name: product.name,
                image: product.image,
                price: product.price,
                size,
                qty,
                countInStock: product.countInStock || 99,
            });
        }
        Cart._save(items);
        showToast(`${product.name} added to cart!`, 'cart');
    },

    // Remove item
    removeItem(key) {
        const items = Cart.getItems().filter(i => i.key !== key);
        Cart._save(items);
    },

    // Update quantity
    updateQty(key, qty) {
        const items = Cart.getItems();
        const item = items.find(i => i.key === key);
        if (!item) return;
        if (qty <= 0) {
            Cart.removeItem(key);
            return;
        }
        item.qty = Math.min(qty, item.countInStock || 99);
        Cart._save(items);
    },

    // Increment
    increment(key) {
        const items = Cart.getItems();
        const item = items.find(i => i.key === key);
        if (item) Cart.updateQty(key, item.qty + 1);
    },

    // Decrement
    decrement(key) {
        const items = Cart.getItems();
        const item = items.find(i => i.key === key);
        if (item) Cart.updateQty(key, item.qty - 1);
    },

    // Clear all
    clear() {
        Cart._save([]);
    },

    // Get totals
    getSubtotal() {
        return Cart.getItems().reduce((sum, i) => sum + (i.price * i.qty), 0);
    },

    getShipping() {
        const sub = Cart.getSubtotal();
        return sub > 3000 ? 0 : 199;
    },

    getTax() {
        return Math.round(Cart.getSubtotal() * 0.18);
    },

    getTotal() {
        return Cart.getSubtotal() + Cart.getShipping() + Cart.getTax();
    },

    getCount() {
        return Cart.getItems().reduce((sum, i) => sum + i.qty, 0);
    },

    // Build order items for API
    toOrderItems() {
        return Cart.getItems().map(i => ({
            name: i.name,
            qty: i.qty,
            image: i.image,
            price: i.price,
            product: i._id,
        }));
    },
};

/* ──── CART SIDEBAR RENDERER ──────────────────────────────────── */

function initCartSidebar() {
    const sidebar = document.getElementById('cart-sidebar');
    const overlay = document.getElementById('cart-overlay');
    const cartBtn = document.getElementById('cart-btn');
    const closeBtn = document.getElementById('cart-close');
    if (!sidebar) return;

    const openCart = () => {
        sidebar.classList.add('open');
        overlay.classList.add('visible');
        document.body.style.overflow = 'hidden';
        renderCartSidebar();
    };

    const closeCart = () => {
        sidebar.classList.remove('open');
        overlay.classList.remove('visible');
        document.body.style.overflow = '';
    };

    cartBtn?.addEventListener('click', openCart);
    closeBtn?.addEventListener('click', closeCart);
    overlay?.addEventListener('click', closeCart);

    document.addEventListener('cart:updated', () => {
        if (sidebar.classList.contains('open')) renderCartSidebar();
    });
}

function renderCartSidebar() {
    const itemsContainer = document.getElementById('cart-items');
    const emptyEl = document.getElementById('cart-empty');
    const footerEl = document.getElementById('cart-footer');
    if (!itemsContainer) return;

    const items = Cart.getItems();

    if (items.length === 0) {
        itemsContainer.innerHTML = '';
        emptyEl?.style && (emptyEl.style.display = 'flex');
        footerEl?.style && (footerEl.style.display = 'none');
        return;
    }

    emptyEl?.style && (emptyEl.style.display = 'none');
    footerEl?.style && (footerEl.style.display = 'block');

    itemsContainer.innerHTML = items.map(item => `
        <div class="cart-item" data-key="${item.key}">
            <img src="${normalizeImageUrl(item.image)}" class="cart-item-image" alt="${item.name}" onerror="this.onerror=null;this.src='${rootPath()}images/product-image-placeholder.svg'">
            <div class="cart-item-info">
                <div class="cart-item-name">${item.name}</div>
                <div class="cart-item-details">${item.size ? 'Size: ' + item.size : 'One Size'}</div>
                <div class="cart-item-qty">
                    <button class="qty-btn" onclick="Cart.decrement('${item.key}')">−</button>
                    <span class="qty-value">${item.qty}</span>
                    <button class="qty-btn" onclick="Cart.increment('${item.key}')">+</button>
                </div>
            </div>
            <div style="display:flex;flex-direction:column;align-items:flex-end;gap:10px;">
                <div class="cart-item-price">$${(item.price * item.qty).toFixed(2)}</div>
                <button class="cart-item-remove" onclick="Cart.removeItem('${item.key}')">🗑️</button>
            </div>
        </div>
    `).join('');

    // Update totals
    const subtotalEl = document.getElementById('cart-subtotal-val');
    const shippingEl = document.getElementById('cart-shipping-val');
    const totalEl = document.getElementById('cart-total-val');

    if (subtotalEl) subtotalEl.textContent = '$' + Cart.getSubtotal().toFixed(2);
    if (shippingEl) shippingEl.textContent = Cart.getShipping() === 0 ? 'FREE' : '$' + Cart.getShipping().toFixed(2);
    if (totalEl) totalEl.textContent = '$' + Cart.getTotal().toFixed(2);
}

// Init on load
document.addEventListener('DOMContentLoaded', initCartSidebar);
