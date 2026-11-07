/* ============================================================
   ZIVO — HOMEPAGE MAIN JS
   ============================================================ */

// ── AOS Init ─────────────────────────────────────────────────
AOS.init({
    duration: 800,
    once: true,
    offset: 60,
    easing: 'ease-out-quad',
});

// ── Native Scrolling (Lenis removed for better UX) ────────────────
// GSAP will use native scroll events instead.

// ── GSAP ─────────────────────────────────────────────────────
gsap.registerPlugin(ScrollTrigger);

// Navbar
gsap.from('.navbar', {
    y: -80,
    opacity: 0,
    duration: 1.2,
    ease: 'power3.out',
    delay: 0.2,
});

// Hero title word by word
gsap.from('.hero-title .word, .hero-title .accent-word', {
    opacity: 0,
    y: 60,
    duration: 0.9,
    stagger: 0.15,
    delay: 0.8,
    ease: 'power3.out',
});

gsap.from('.hero-scroll-indicator', {
    opacity: 0,
    duration: 1,
    delay: 2,
});

// Section animations via ScrollTrigger
gsap.utils.toArray('.section-title').forEach(el => {
    gsap.from(el, {
        scrollTrigger: { trigger: el, start: 'top 85%', once: true },
        opacity: 0,
        y: 40,
        duration: 0.8,
        ease: 'power3.out',
    });
});

// ── Three.js Hero Background ─────────────────────────────────
const canvas = document.getElementById('hero-canvas');
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });

renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

// Particles geometry
const particlesCount = window.innerWidth < 768 ? 1500 : 3000;
const positions = new Float32Array(particlesCount * 3);
const colors = new Float32Array(particlesCount * 3);

for (let i = 0; i < particlesCount * 3; i += 3) {
    positions[i] = (Math.random() - 0.5) * 12;
    positions[i + 1] = (Math.random() - 0.5) * 12;
    positions[i + 2] = (Math.random() - 0.5) * 12;

    // Mix pink and gold colors
    const mix = Math.random();
    if (mix > 0.7) {
        colors[i] = 0.788; colors[i + 1] = 0.663; colors[i + 2] = 0.431; // gold
    } else {
        colors[i] = 0.91; colors[i + 1] = 0.196; colors[i + 2] = 0.353; // accent
    }
}

const geometry = new THREE.BufferGeometry();
geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

const material = new THREE.PointsMaterial({
    size: 0.018,
    vertexColors: true,
    transparent: true,
    opacity: 0.75,
    sizeAttenuation: true,
});

const particles = new THREE.Points(geometry, material);
scene.add(particles);
camera.position.z = 4;

// Mouse parallax
let mouseX = 0, mouseY = 0;
document.addEventListener('mousemove', (e) => {
    mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
    mouseY = -(e.clientY / window.innerHeight - 0.5) * 2;
}, { passive: true });

const clock = new THREE.Clock();
function animateParticles() {
    requestAnimationFrame(animateParticles);
    const t = clock.getElapsedTime();

    particles.rotation.y = t * 0.04 + mouseX * 0.08;
    particles.rotation.x = t * 0.02 + mouseY * 0.04;

    renderer.render(scene, camera);
}
animateParticles();

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}, { passive: true });

// ── Counter Animation ─────────────────────────────────────────
function animateCounter(el, target, suffix = '+') {
    let current = 0;
    const step = target / 60;
    const format = (n) => n >= 1000 ? (n / 1000).toFixed(0) + 'K' : n.toString();
    const timer = setInterval(() => {
        current = Math.min(current + step, target);
        el.textContent = format(Math.floor(current)) + suffix;
        if (current >= target) clearInterval(timer);
    }, 20);
}

const statsObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.querySelectorAll('[data-count]').forEach(el => {
                animateCounter(el, parseInt(el.dataset.count));
            });
            statsObserver.disconnect();
        }
    });
}, { threshold: 0.3 });

const statsBar = document.querySelector('.stats-bar');
if (statsBar) statsObserver.observe(statsBar);

// ── Featured Products Swiper ──────────────────────────────────
async function loadFeaturedProducts() {
    try {
        const res = await fetch(`${API_BASE}/products/featured`);
        const products = await res.json();
        const container = document.getElementById('featured-products');

        if (!products || products.length === 0) {
            container.innerHTML = '<div class="swiper-slide" style="display:flex;align-items:center;justify-content:center;color:var(--text-muted);">No featured products yet. Seed the database!</div>';
            return;
        }

        container.innerHTML = products.map(p => renderProductCard(p)).join('');

        // Init swiper after content loaded
        new Swiper('.featured-swiper', {
            slidesPerView: 'auto',
            spaceBetween: 24,
            navigation: {
                prevEl: '#featured-prev',
                nextEl: '#featured-next',
            },
            grabCursor: true,
            freeMode: true,
        });

    } catch (err) {
        console.error('Error loading featured products:', err);
        document.getElementById('featured-products').innerHTML =
            '<div class="swiper-slide"><p style="color:var(--text-muted);padding:40px;">Could not connect to server. Make sure it\'s running on port 5000.</p></div>';
    }
}

// ── New Arrivals ──────────────────────────────────────────────
async function loadNewArrivals() {
    try {
        const res = await fetch(`${API_BASE}/products?sort=newest&pageSize=4`);
        const data = await res.json();
        const container = document.getElementById('new-arrivals');

        if (!data.products || data.products.length === 0) {
            container.innerHTML = '<p style="color:var(--text-muted);grid-column:1/-1;text-align:center;">Run the seed script to populate products!</p>';
            return;
        }

        container.innerHTML = data.products.map(p => renderProductCard(p, false)).join('');
    } catch (err) {
        console.error('Error loading new arrivals:', err);
        document.getElementById('new-arrivals').innerHTML =
            '<p style="color:var(--text-muted);grid-column:1/-1;text-align:center;">Server offline — start the backend server.</p>';
    }
}

// ── Product Card Renderer ─────────────────────────────────────
function renderProductCard(p, isSlide = true) {
    const discount = p.originalPrice > p.price
        ? Math.round(100 - (p.price / p.originalPrice * 100))
        : 0;

    const wrap = isSlide ? 'swiper-slide' : '';

    return `
    <div class="${wrap}" style="${isSlide ? 'width:300px;' : ''}">
        <div class="product-card" onclick="window.location='pages/product.html?id=${p._id}'">
            <div class="product-card-image">
                <img src="${normalizeImageUrl(p.image)}" alt="${p.name}" loading="lazy"
                     onerror="this.onerror=null;this.src='images/product-image-placeholder.svg'">
                <div class="product-badges">
                    ${p.isNewArrival ? '<span class="badge badge-new">New</span>' : ''}
                    ${p.category === 'Limited' ? '<span class="badge badge-limited">Limited</span>' : ''}
                    ${discount > 0 ? `<span class="badge badge-sale">-${discount}%</span>` : ''}
                </div>
                <div class="product-card-actions">
                    <button class="product-action-btn" onclick="event.stopPropagation();wishlistProduct('${p._id}')" title="Wishlist">♡</button>
                    <button class="product-action-btn" onclick="event.stopPropagation();quickAddToCart(${JSON.stringify(p).replace(/"/g, '&quot;')})" title="Quick Add">🛒</button>
                </div>
            </div>
            <div class="product-card-body">
                <p class="product-card-category">${p.category}</p>
                <h3 class="product-card-name">${p.name}</h3>
                <div class="product-card-rating">
                    <span class="stars">${'★'.repeat(Math.round(p.rating || 0))}${'☆'.repeat(5 - Math.round(p.rating || 0))}</span>
                    <span class="rating-count">(${p.numReviews || 0})</span>
                </div>
                <div class="product-card-footer">
                    <div class="product-card-price">
                        <span class="price-current">$${p.price}</span>
                        ${p.originalPrice > p.price ? `<span class="price-original">$${p.originalPrice}</span>` : ''}
                    </div>
                    <button class="btn-add-cart" onclick="event.stopPropagation();quickAddToCart(${JSON.stringify(p).replace(/"/g, '&quot;')})">
                        Add
                    </button>
                </div>
            </div>
        </div>
    </div>`;
}

function quickAddToCart(product) {
    Cart.addItem(product, 1, '');
    document.getElementById('cart-btn').click();
}

function wishlistProduct(id) {
    showToast('Added to wishlist! ❤️', 'info');
}

// ── Newsletter ────────────────────────────────────────────────
function handleNewsletterSubmit(e) {
    e.preventDefault();
    const email = document.getElementById('newsletter-email').value;
    showToast(`✨ You're in! Check ${email} for exclusive drops.`, 'success', 4000);
    e.target.reset();
}

// ── User nav click ────────────────────────────────────────────
function handleUserClick() {
    if (Auth.isLoggedIn()) {
        const user = Auth.getUser();
        if (user.isAdmin) {
            window.location.href = 'admin/index.html';
        } else {
            window.location.href = 'pages/orders.html';
        }
    } else {
        window.location.href = 'pages/login.html';
    }
}

// ── Init ──────────────────────────────────────────────────────
loadFeaturedProducts();
loadNewArrivals();
