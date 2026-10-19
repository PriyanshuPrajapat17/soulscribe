// Soulscribe — static interactions

// Mobile drawer
function initDrawer() {
  const openBtn = document.querySelector("[data-open-menu]");
  const closeBtn = document.querySelector("[data-close-menu]");
  const overlay = document.querySelector("[data-overlay]");
  const drawer = document.querySelector("[data-drawer]");
  if (!openBtn) return;
  const open = () => { overlay.classList.add("open"); drawer.classList.add("open"); document.body.style.overflow = "hidden"; };
  const close = () => { overlay.classList.remove("open"); drawer.classList.remove("open"); document.body.style.overflow = ""; };
  openBtn.addEventListener("click", open);
  closeBtn.addEventListener("click", close);
  overlay.addEventListener("click", close);
}

// Reveal on scroll
function initReveal() {
  const els = document.querySelectorAll(".reveal");
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) {
        const delay = e.target.dataset.delay || 0;
        setTimeout(() => e.target.classList.add("in"), delay);
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });
  els.forEach((el) => io.observe(el));
}

// Hero names staggered reveal (home)
function initHeroNames() {
  const names = document.querySelectorAll(".hero-names .names span");
  if (!names.length) return;
  let i = 0;
  const tick = () => {
    for (let k = 0; k < 3 && i < names.length; k++, i++) names[i].classList.add("show");
    if (i < names.length) setTimeout(tick, 700);
  };
  setTimeout(tick, 600);
}

// Shop tabs
function initTabs() {
  const tabs = document.querySelectorAll("[data-tab]");
  if (!tabs.length) return;
  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      const target = tab.dataset.tab;
      tabs.forEach((t) => t.classList.toggle("active", t === tab));
      document.querySelectorAll("[data-panel]").forEach((p) => {
        p.classList.toggle("hidden", p.dataset.panel !== target);
      });
      // Re-render to update counts dynamically based on active tab
      renderShopGrids();
    });
  });
}

// Accordions + FAQ
function initToggles() {
  document.querySelectorAll("[data-toggle]").forEach((btn) => {
    if (btn.dataset.toggleBound) return;
    btn.dataset.toggleBound = "true";
    btn.addEventListener("click", () => {
      const currentGroup = btn.closest("[data-toggle-group]");
      if (!currentGroup) return;
      const isOpen = currentGroup.classList.contains("open");
      
      const parent = currentGroup.parentElement;
      if (parent) {
        parent.querySelectorAll("[data-toggle-group]").forEach((group) => {
          group.classList.remove("open");
        });
      }
      
      if (!isOpen) {
        currentGroup.classList.add("open");
      }
    });
  });
}
window.initToggles = initToggles;

// Load more reviews
function initLoadMore() {
  const btn = document.querySelector("[data-load-more]");
  if (!btn) return;
  btn.addEventListener("click", () => {
    document.querySelectorAll("[data-extra-review]").forEach((el) => el.classList.remove("hidden"));
    btn.style.display = "none";
  });
}

// Behind the Bliss — scroll-driven pen along path
function initBtb() {
  const wrap = document.querySelector("[data-btb]");
  if (!wrap) return;
  const path = wrap.querySelector("[data-path]");
  const pen = wrap.querySelector("[data-pen]");
  if (!path || !pen) return;
  const len = path.getTotalLength();
  path.style.strokeDasharray = len;
  const onScroll = () => {
    const rect = wrap.getBoundingClientRect();
    const vh = window.innerHeight;
    const total = rect.height - vh * 0.6;
    const scrolled = Math.min(Math.max(-rect.top + vh * 0.25, 0), total);
    const p = total > 0 ? scrolled / total : 0;
    path.style.strokeDashoffset = len * (1 - p);
    const currentLen = len * p;
    const pt = path.getPointAtLength(currentLen);
    const pt1 = path.getPointAtLength(Math.max(0, currentLen - 2));
    const pt2 = path.getPointAtLength(Math.min(len, currentLen + 2));
    let angle = 45;
    if (pt2.x !== pt1.x || pt2.y !== pt1.y) {
      angle = (Math.atan2(pt2.y - pt1.y, pt2.x - pt1.x) * 180) / Math.PI;
    }
    // Pen graphic nib points straight down (+Y / 90deg), so rotation is angle - 90
    pen.setAttribute("transform", `translate(${pt.x}, ${pt.y}) rotate(${angle - 90})`);
  };
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll);
}

function initAccountButtons() {
  document.querySelectorAll('[aria-label="Account"]').forEach(btn => {
    btn.style.cursor = 'pointer';
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const isSub = window.location.pathname.includes('/product/');
      window.location.href = isSub ? '../login.html' : 'login.html';
    });
  });
}

document.addEventListener("DOMContentLoaded", () => {
  initDrawer();
  initAccountButtons();
  initReveal();
  initHeroNames();
  initTabs();
  initToggles();
  initLoadMore();
  initBtb();
});



// =======================
// Shopify Integration
// =======================

const SHOP_URL = "website-3000-namashree.myshopify.com";
const STOREFRONT_TOKEN = "04e046afb6cdb1602f3d74fa2adad958";
window.SHOP_URL = SHOP_URL;
window.STOREFRONT_TOKEN = STOREFRONT_TOKEN;

// File name to Shopify handle mapping
const FILE_TO_HANDLE = {
  "heart-of-virtues.html": "heart-of-virtues-journaling-kit",
  "prayers-from-within.html": "prayers-from-within-journaling-kit",
  "thankyou-krishna.html": "thankyou-krishna",
  "mercy-and-meltdowns.html": "mercy-and-meltdowns-journaling-kit",
  "108-days-with-krishna.html": "108-days-with-krishna-journaling-kit",
  "shravanam-to-smaranam.html": "shravanam-to-smaranam-journaling-kit",
  "daily-bliss-planner.html": "daily-prioritizer",
  "morning-pages.html": "do-it-for-krsna",
  "gratitude-companion.html": "holistic-jotter",
  "soulful-saturdays.html": "soulful-self-care-checklist",
  "reflect-and-rise.html": "balance-being",
  "pause-and-ponder.html": "sadhana-in-sync"
};

// Check if page is inside product subdirectory
const isProductPage = window.location.pathname.split('/').includes('product') || window.location.href.includes('/product/');
const pathPrefix = isProductPage ? '../' : '';

// Helper to resolve URL for product details
function getProductUrl(handle) {
  const filename = Object.keys(FILE_TO_HANDLE).find(key => FILE_TO_HANDLE[key] === handle);
  if (isProductPage) {
    if (filename) return filename;
    return 'detail.html?handle=' + handle;
  } else {
    if (filename) return 'product/' + filename;
    return 'product/detail.html?handle=' + handle;
  }
}

// Local Cart Manager
const CartManager = {
  get() {
    try {
      return JSON.parse(localStorage.getItem('soulscribe_cart') || '[]');
    } catch {
      return [];
    }
  },
  save(cart) {
    localStorage.setItem('soulscribe_cart', JSON.stringify(cart));
    this.updateUI();
  },
  add(variantId, title, price, image, handle, quantity = 1) {
    let cart = this.get();
    const existing = cart.find(item => item.variantId === variantId);
    if (existing) {
      existing.quantity += quantity;
    } else {
      cart.push({ variantId, title, price: parseFloat(price), image, handle, quantity });
    }
    this.save(cart);
    this.open();
  },
  updateQty(variantId, change) {
    let cart = this.get();
    const item = cart.find(item => item.variantId === variantId);
    if (item) {
      item.quantity += change;
      if (item.quantity <= 0) {
        cart = cart.filter(i => i.variantId !== variantId);
      }
    }
    this.save(cart);
  },
  remove(variantId) {
    let cart = this.get();
    cart = cart.filter(item => item.variantId !== variantId);
    this.save(cart);
  },
  getCartCount() {
    return this.get().reduce((sum, item) => sum + item.quantity, 0);
  },
  getCartTotal() {
    return this.get().reduce((sum, item) => sum + (item.price * item.quantity), 0);
  },
  open() {
    const drawer = document.querySelector('[data-cart-drawer]');
    const overlay = document.querySelector('[data-overlay]');
    if (drawer && overlay) {
      drawer.classList.add('open');
      overlay.classList.add('open');
      document.body.style.overflow = 'hidden';
    }
  },
  close() {
    const drawer = document.querySelector('[data-cart-drawer]');
    const overlay = document.querySelector('[data-overlay]');
    if (drawer && overlay) {
      // Don't remove overlay if mobile nav drawer is also open
      const menuDrawer = document.querySelector('[data-drawer]');
      if (!menuDrawer || !menuDrawer.classList.contains('open')) {
        overlay.classList.remove('open');
        document.body.style.overflow = '';
      }
      drawer.classList.remove('open');
    }
  },
  updateUI() {
    const count = this.getCartCount();
    
    // Update header cart button badge
    document.querySelectorAll('.soulscribe-header button[aria-label="Cart"]').forEach(btn => {
      let badge = btn.querySelector('.cart-badge');
      if (!badge && count > 0) {
        badge = document.createElement('span');
        badge.className = 'cart-badge';
        btn.appendChild(badge);
      }
      if (badge) {
        badge.textContent = count;
        badge.style.display = count > 0 ? 'flex' : 'none';
      }
    });

    // Render cart items
    const container = document.querySelector('[data-cart-items]');
    if (!container) return;

    const cart = this.get();
    if (cart.length === 0) {
      container.innerHTML = `
        <div class="cart-empty">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" style="color:var(--teal-accent)"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
          <p>Your journey is waiting to begin. Your cart is currently empty.</p>
          <a class="btn-outline" href="${pathPrefix}shop.html" style="margin-top: 0.5rem;">Continue Shopping</a>
        </div>
      `;
      const foot = document.querySelector('[data-cart-foot]');
      if (foot) foot.style.display = 'none';
    } else {
      const foot = document.querySelector('[data-cart-foot]');
      if (foot) foot.style.display = 'flex';

      container.innerHTML = cart.map(item => {
        const itemUrl = getProductUrl(item.handle);
        const imgSrc = item.image.startsWith('http') ? item.image : (pathPrefix + item.image);

        return `
          <div class="cart-item">
            <a href="${itemUrl}"><img src="${imgSrc}" alt="${item.title}"></a>
            <div class="cart-item-details">
              <h3><a href="${itemUrl}">${item.title}</a></h3>
              <div class="price">INR ${Math.round(item.price)}</div>
              <div class="cart-item-qty">
                <button onclick="window.CartManager.updateQty('${item.variantId}', -1)" aria-label="Decrease quantity">−</button>
                <span>${item.quantity}</span>
                <button onclick="window.CartManager.updateQty('${item.variantId}', 1)" aria-label="Increase quantity">+</button>
              </div>
              <button class="cart-item-remove" onclick="window.CartManager.remove('${item.variantId}')">Remove</button>
            </div>
          </div>
        `;
      }).join('');

      const subtotalEl = document.querySelector('[data-cart-subtotal]');
      if (subtotalEl) {
        subtotalEl.textContent = `INR ${Math.round(this.getCartTotal())}`;
      }
    }
  }
};
window.CartManager = CartManager;

// Redirect to checkout via cartCreate mutation
async function redirectToCheckout() {
  const cart = CartManager.get();
  if (cart.length === 0) return;

  const checkoutBtn = document.querySelector('[data-cart-checkout]');
  if (checkoutBtn) {
    checkoutBtn.disabled = true;
    checkoutBtn.textContent = 'Redirecting...';
  }

  const lines = cart.map(item => ({
    merchandiseId: item.variantId,
    quantity: item.quantity
  }));

  const query = `
    mutation cartCreate($input: CartInput) {
      cartCreate(input: $input) {
        cart {
          id
          checkoutUrl
        }
        userErrors {
          field
          message
        }
      }
    }
  `;

  try {
    const response = await fetch(
      `https://${SHOP_URL}/api/2025-01/graphql.json`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Shopify-Storefront-Access-Token": STOREFRONT_TOKEN
        },
        body: JSON.stringify({
          query,
          variables: { input: { lines } }
        })
      }
    );

    const result = await response.json();
    if (result.data?.cartCreate?.cart?.checkoutUrl) {
      window.location.href = result.data.cartCreate.cart.checkoutUrl;
    } else {
      console.error("Cart creation failed:", result.data?.cartCreate?.userErrors);
      alert("Checkout failed. Please try again.");
      if (checkoutBtn) {
        checkoutBtn.disabled = false;
        checkoutBtn.textContent = 'Proceed to Checkout';
      }
    }
  } catch (err) {
    console.error("Checkout redirection error:", err);
    alert("Checkout is currently unavailable. Please try again later.");
    if (checkoutBtn) {
      checkoutBtn.disabled = false;
      checkoutBtn.textContent = 'Proceed to Checkout';
    }
  }
}

// Inject and initialize Cart Drawer DOM elements
function initCartDrawer() {
  if (!document.querySelector('[data-cart-drawer]')) {
    const drawerHtml = `
      <div class="cart-drawer" data-cart-drawer>
        <div class="cart-drawer-head">
          <h2>Your Journey</h2>
          <button class="icon-btn" data-close-cart aria-label="Close cart"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>
        </div>
        <div class="cart-items" data-cart-items></div>
        <div class="cart-drawer-foot" data-cart-foot>
          <div class="cart-subtotal">
            <span>Subtotal</span>
            <span data-cart-subtotal>INR 0.00</span>
          </div>
          <button class="btn-sun" data-cart-checkout>Proceed to Checkout</button>
          <p class="cta-sub" style="margin-top: 0.25rem; font-size:0.8rem; text-align:center;">Secure checkout powered by Shopify.</p>
        </div>
      </div>
    `;
    document.body.insertAdjacentHTML("beforeend", drawerHtml);
  }

  // Bind Open Cart buttons
  document.querySelectorAll('.soulscribe-header button[aria-label="Cart"]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      CartManager.open();
    });
  });

  // Bind Close Cart buttons
  const closeBtn = document.querySelector('[data-close-cart]');
  if (closeBtn) {
    closeBtn.addEventListener('click', () => CartManager.close());
  }

  const overlay = document.querySelector('[data-overlay]');
  if (overlay) {
    overlay.addEventListener('click', () => CartManager.close());
  }

  // Bind Checkout button
  const checkoutBtn = document.querySelector('[data-cart-checkout]');
  if (checkoutBtn) {
    checkoutBtn.addEventListener('click', redirectToCheckout);
  }

  CartManager.updateUI();
}

// ----------------------------------------------------
// Static Products Data (loaded from products_data.json)
// ----------------------------------------------------
// Static Products Data (loaded from Shopify Storefront API)
// ----------------------------------------------------
let shopProducts = { kits: [], planners: [] };

// Fetch live product collections from Shopify Storefront API
async function fetchShopProducts() {
  const query = `
  {
    collections(first: 10) {
      nodes {
        id
        title
        handle
        products(first: 30) {
          nodes {
            id
            title
            handle
            description
            featuredImage { url }
            images(first: 5) { nodes { url } }
            variants(first: 1) {
              nodes {
                id
                price { amount currencyCode }
                availableForSale
              }
            }
          }
        }
      }
    }
  }
  `;

  try {
    const response = await fetch(
      `https://${SHOP_URL}/api/2025-01/graphql.json`,
      {
        method: "POST",
        cache: "no-store",
        headers: {
          "Content-Type": "application/json",
          "X-Shopify-Storefront-Access-Token": STOREFRONT_TOKEN
        },
        body: JSON.stringify({ query })
      }
    );

    const result = await response.json();
    const collections = result.data?.collections?.nodes || [];

    shopProducts.kits = [];
    shopProducts.planners = [];

    collections.forEach(col => {
      if (col.handle === 'journaling-kits') {
        shopProducts.kits = col.products.nodes;
      } else if (col.handle === 'planners' || col.handle === 'pocket-planners') {
        shopProducts.planners = shopProducts.planners.concat(col.products.nodes);
      }
    });

    // Remove duplicates from planners (if any)
    const seen = new Set();
    shopProducts.planners = shopProducts.planners.filter(item => {
      const duplicate = seen.has(item.id);
      seen.add(item.id);
      return !duplicate;
    });

    renderShopGrids();
  } catch (err) {
    console.error("Error loading products from Shopify:", err);
    // Fallback if Shopify API fails
    try {
      const fallbackRes = await fetch("products_data.json");
      const fallbackData = await fallbackRes.json();
      const collections = fallbackData.data?.collections?.nodes || [];
      shopProducts.kits = [];
      shopProducts.planners = [];
      collections.forEach(col => {
        if (col.handle === 'journaling-kits') {
          shopProducts.kits = col.products.nodes;
        } else if (col.handle === 'planners' || col.handle === 'pocket-planners') {
          shopProducts.planners = shopProducts.planners.concat(col.products.nodes);
        }
      });
      renderShopGrids();
    } catch (e) {
      console.error("Fallback load error:", e);
    }
  }
}

function cleanProductTitle(title) {
  if (!title) return "";
  return title.replace(/\s*JOURNALING\s+KIT\s*/ig, " ").replace(/\s+/g, " ").trim();
}

function renderShopGrids() {
  const kitsContainer = document.getElementById("kits-products");
  const plannersContainer = document.getElementById("planners-products");
  const allContainer = document.getElementById("all-products");

  console.log("renderShopGrids running. Containers:", {
    kits: !!kitsContainer,
    planners: !!plannersContainer,
    all: !!allContainer
  });

  if (!kitsContainer || !plannersContainer) return;

  // Get Sort and Filter criteria
  const sortSelect = document.getElementById("sort-select");
  const filterSelect = document.getElementById("filter-select");

  const sortVal = sortSelect ? sortSelect.value : "featured";
  const filterVal = filterSelect ? filterSelect.value : "all";

  // Filter and sort products
  const kitsToRender = processProducts(shopProducts.kits, sortVal, filterVal);
  const plannersToRender = processProducts(shopProducts.planners, sortVal, filterVal);
  const allToRender = processProducts([...shopProducts.kits, ...shopProducts.planners], sortVal, filterVal);

  // Update total counts based on active tab
  const activeTab = document.querySelector(".tab.active");
  const activeTabName = activeTab ? activeTab.dataset.tab : "kits";
  
  let displayedCount = 0;
  if (activeTabName === "kits") {
    displayedCount = kitsToRender.length;
  } else if (activeTabName === "planners") {
    displayedCount = plannersToRender.length;
  } else if (activeTabName === "all") {
    displayedCount = allToRender.length;
  }

  console.log("Count update details:", {
    activeTabName,
    kitsCount: kitsToRender.length,
    plannersCount: plannersToRender.length,
    allCount: allToRender.length,
    displayedCount
  });

  const countLabel = document.querySelector(".shop-bar p");
  if (countLabel) {
    countLabel.textContent = `Showing all ${displayedCount} results`;
  }

  // Render Kits
  if (kitsToRender.length === 0) {
    kitsContainer.innerHTML = `<p style="grid-column: 1/-1; text-align: center; color: var(--muted-foreground); margin: 3rem 0;">No journaling kits found matching your search.</p>`;
  } else {
    kitsContainer.innerHTML = kitsToRender.map((p, idx) => generateProductCardHtml(p, idx)).join('');
  }

  // Render Planners
  if (plannersToRender.length === 0) {
    plannersContainer.innerHTML = `<p style="grid-column: 1/-1; text-align: center; color: var(--muted-foreground); margin: 3rem 0;">No daily planners found matching your search.</p>`;
  } else {
    plannersContainer.innerHTML = plannersToRender.map((p, idx) => generateProductCardHtml(p, idx)).join('');
  }

  // Render All
  if (allContainer) {
    if (allToRender.length === 0) {
      allContainer.innerHTML = `<p style="grid-column: 1/-1; text-align: center; color: var(--muted-foreground); margin: 3rem 0;">No products found matching your search.</p>`;
    } else {
      allContainer.innerHTML = allToRender.map((p, idx) => generateProductCardHtml(p, idx)).join('');
    }
  }

  // Re-run intersection observer to reveal cards on scroll
  if (typeof initReveal === "function") {
    initReveal();
  }
}

const SOULS_FAVOURITE_ORDER = [
  "thankyou-krishna",
  "thankyou-krishna-journaling-kit",
  "108-days-with-krishna-journaling-kit",
  "do-it-for-krsna",
  "balance-being",
  "mercy-and-meltdowns-journaling-kit",
  "daily-soulful-reflection",
  "a-day-to-connect-with-krishna",
  "daily-prioritizer",
  "holistic-jotter",
  "shravanam-to-smaranam-journaling-kit",
  "heart-of-virtues-journaling-kit",
  "sadhana-in-sync",
  "soulful-self-care-checklist"
];

const FEATURED_ORDER = [
  "do-it-for-krsna",
  "heart-of-virtues-journaling-kit",
  "balance-being",
  "thankyou-krishna",
  "thankyou-krishna-journaling-kit",
  "108-days-with-krishna-journaling-kit",
  "sadhana-in-sync",
  "shravanam-to-smaranam-journaling-kit",
  "a-day-to-connect-with-krishna",
  "mercy-and-meltdowns-journaling-kit",
  "holistic-jotter",
  "daily-prioritizer",
  "soulful-self-care-checklist",
  "daily-soulful-reflection"
];

const INTEREST_FILTERS = {
  gratitude: [
    "thankyou-krishna",
    "thankyou-krishna-journaling-kit",
    "a-day-to-connect-with-krishna",
    "daily-soulful-reflection",
    "soulful-self-care-checklist"
  ],
  prayer: [
    "prayers-from-within-journaling-kit",
    "mercy-and-meltdowns-journaling-kit",
    "do-it-for-krsna",
    "balance-being"
  ],
  productivity: [
    "bhakti-wins",
    "sadhana-in-sync",
    "daily-prioritizer",
    "holistic-jotter",
    "108-days-with-krishna-journaling-kit"
  ],
  reflection: [
    "heart-of-virtues-journaling-kit",
    "shravanam-to-smaranam-journaling-kit",
    "daily-soulful-reflection",
    "108-days-with-krishna-journaling-kit",
    "balance-being"
  ],
  wellbeing: [
    "soulful-self-care-checklist",
    "balance-being",
    "heart-of-virtues-journaling-kit",
    "do-it-for-krsna"
  ]
};

function processProducts(productsList, sort, filter) {
  let list = [...productsList];

  // 1. Apply Filter
  if (filter !== "all") {
    const allowedHandles = INTEREST_FILTERS[filter] || [];
    list = list.filter(p => allowedHandles.includes(p.handle));
  }

  // 2. Apply Sort
  if (sort === "souls-favourite") {
    list.sort((a, b) => {
      let idxA = SOULS_FAVOURITE_ORDER.indexOf(a.handle);
      let idxB = SOULS_FAVOURITE_ORDER.indexOf(b.handle);
      if (idxA === -1) idxA = 999;
      if (idxB === -1) idxB = 999;
      return idxA - idxB;
    });
  } else if (sort === "featured") {
    list.sort((a, b) => {
      let idxA = FEATURED_ORDER.indexOf(a.handle);
      let idxB = FEATURED_ORDER.indexOf(b.handle);
      if (idxA === -1) idxA = 999;
      if (idxB === -1) idxB = 999;
      return idxA - idxB;
    });
  } else if (sort === "title-asc") {
    list.sort((a, b) => cleanProductTitle(a.title).localeCompare(cleanProductTitle(b.title)));
  } else if (sort === "title-desc") {
    list.sort((a, b) => cleanProductTitle(b.title).localeCompare(cleanProductTitle(a.title)));
  }

  return list;
}

const LOCAL_DISPLAY_BOOKS = {
  "108-days-with-krishna-journaling-kit": "assets/dispaly_book/108 days with krsna.png",
  "heart-of-virtues-journaling-kit": "assets/dispaly_book/heart of virtues.png",
  "mercy-and-meltdowns-journaling-kit": "assets/dispaly_book/mercy & meltdowns.png",
  "prayers-from-within-journaling-kit": "assets/dispaly_book/prayers from within.png",
  "shravanam-to-smaranam-journaling-kit": "assets/dispaly_book/shravanam to smaranam.png",
  "thankyou-krishna": "assets/dispaly_book/thank you krsna.png",
  "thankyou-krishna-journaling-kit": "assets/dispaly_book/thank you krsna.png"
};

const LOCAL_HOVER_IMAGES = {
  "thankyou-krishna": "assets/product_photos/THANKYOU KRISHNA JOURNALING KIT/29.png",
  "thankyou-krishna-journaling-kit": "assets/product_photos/THANKYOU KRISHNA JOURNALING KIT/29.png"
};

function getProductFirstImage(p) {
  const localImg = LOCAL_DISPLAY_BOOKS[p.handle];
  if (localImg) {
    return pathPrefix + localImg;
  }
  return p.images?.nodes?.[1]?.url || p.featuredImage?.url || 'assets/journal-kit.jpg';
}

function arrangeProductImages(imagesArray, handle) {
  if (!imagesArray || imagesArray.length === 0) return [];
  const localImg = LOCAL_DISPLAY_BOOKS[handle];
  if (localImg) {
    const result = [{ url: pathPrefix + localImg }];
    if (imagesArray.length > 0) {
      result.push(imagesArray[0]); // original index 0 (flatlay)
    }
    for (let i = 2; i < imagesArray.length; i++) {
      result.push(imagesArray[i]);
    }
    return result;
  } else {
    const result = [...imagesArray];
    if (result.length > 1) {
      const temp = result[0];
      result[0] = result[1];
      result[1] = temp;
    }
    return result;
  }
}

function generateProductCardHtml(p, idx) {
  const url = getProductUrl(p.handle);
  const cleanTitle = cleanProductTitle(p.title);
  const price = Math.round(parseFloat(p.variants.nodes[0].price.amount));
  const delay = (idx % 3) * 80;

  const defaultImg = getProductFirstImage(p);
  const hoverImg = (LOCAL_HOVER_IMAGES[p.handle] ? pathPrefix + LOCAL_HOVER_IMAGES[p.handle] : null) || p.images?.nodes?.[0]?.url || p.featuredImage?.url || 'assets/journal-kit.jpg';
  const hasMultiple = (p.images?.nodes && p.images.nodes.length > 0) || LOCAL_DISPLAY_BOOKS[p.handle] || LOCAL_HOVER_IMAGES[p.handle];

  if (hasMultiple) {
    return `
      <div class="product-card reveal" data-delay="${delay}">
        <a href="${url}" style="width:100%">
          <div class="img">
            <img src="${defaultImg}" alt="${cleanTitle}" class="default-img" loading="lazy">
            <img src="${hoverImg}" alt="${cleanTitle}" class="hover-img" loading="lazy">
          </div>
          <h3>${cleanTitle}</h3>
        </a>
        <p class="price">INR ${price}</p>
        <a class="btn-outline" href="${url}">Begin my journey</a>
      </div>
    `;
  } else {
    return `
      <div class="product-card reveal" data-delay="${delay}">
        <a href="${url}" style="width:100%">
          <div class="img">
            <img src="${defaultImg}" alt="${cleanTitle}" class="default-img" loading="lazy">
          </div>
          <h3>${cleanTitle}</h3>
        </a>
        <p class="price">INR ${price}</p>
        <a class="btn-outline" href="${url}">Begin my journey</a>
      </div>
    `;
  }
}

// ----------------------------------------------------
// Shopify Product Details Page Bindings & Metadata
// ----------------------------------------------------

const PRODUCT_CUSTOM_META = {
  "prayers-from-within-journaling-kit": {
    tagline: "A sacred space to speak your heart\u2026 and gently feel heard, held, and guided from within.",
    ctaSub: "A few quiet minutes a day\u2026 can change how you experience everything.",
    price: "1551.00",
    experience: [
      "A lighter heart, with emotions expressed instead of carried",
      "A growing sense that Krishna is listening with love, not judging",
      "Prayers that evolve from asking to loving Him more",
      "A quiet spiritual intimacy that stays with you long after you've closed the journal"
    ],
    inside: [
      "120+ undated prayer pages to gently begin with",
      "A simple structure to guide you through prayer—gratitude, surrender, honesty, and seeking shelter",
      "Soft prompts and affirmations to help you open up, even on days when words feel distant",
      "Immersive audio experience (QR-enabled) to ease you into a prayerful state",
      "Thoughtfully designed pages for reflection, including “All About Me” and lookback moments",
      "Wisdom quotes woven through your journey to keep you anchored",
      "A quiet space to pray for others—expanding your heart beyond yourself",
      "A5 size | 165 pages | Undated | 100 GSM natural paper | Matte finish hardbound keepsake bind"
    ],
    forYou: [
      "You want to pray… but don’t always know how to begin",
      "Your prayers feel repetitive, or disconnected from what you truly feel",
      "You carry thoughts, guilt, or emotions you’ve never fully expressed",
      "You long for a more personal, and genuine connection with Krishna"
    ],
    specs: [
      "Thoughtfully Crafted",
      "Packed with Intention",
      "Secure & Trusted Checkout",
      "Delivered with Care"
    ],
    review: "This journal taught me that prayer isn't about perfect words…it's about being honest with Krishna",
    author: "— Shyam G., Mumbai"
  },
  "mercy-and-meltdowns-journaling-kit": {
    tagline: "A gentle companion for your highest highs and lowest lows\u2026 where every \u2018Dear Krishna\u2019 brings you closer to Him.",
    ctaSub: "You deserve to be heard and quietly held by the Lord.",
    price: "1551.00",
    experience: [
      "A shift from feeling alone in your struggles… to feeling quietly supported",
      "A more honest and personal connection with Krishna—as a listener, not just a distant presence",
      "The ability to see meaning, guidance, and growth even in difficult moments"
    ],
    inside: [
      "120+ undated pages beginning with “Dear Krishna, This happened with me today…”",
      "A simple, honest space to share your day—your highs, your lows and your unfiltered thoughts",
      "Gentle spiritual affirmations and guidance to help you open up without overthinking",
      "Immersive audio experience (QR-enabled) to support you through emotional moments",
      "Reflection prompts and inner self care hacks” to help you process challenges with awareness",
      "Wisdom quotes woven throughout to remind you of Krishna’s presence and mercy",
      "Lookback pages to recall moments touched by the Lord’s mercy",
      "A5 size | 165 pages | Undated | 100 GSM natural paper | Matte finish hardbound keepsake bind"
    ],
    forYou: [
      "You carry your struggles alone, even though you don’t have to",
      "Your meltdowns feel overwhelming, with no clear way to process them",
      "You've experienced His mercy but struggle to remember it when you need it most",
      "You sense Krishna is there, but the connection still feels one-sided"
    ],
    specs: [
      "Thoughtfully Crafted",
      "Packed with Intention",
      "Secure & Trusted Checkout",
      "Delivered with Care"
    ],
    review: "I didn’t realise how much I was holding in until I started writing to Krishna like this. My meltdowns still come—but now they soften into something I can sit with.",
    author: "— Gaurangi D., ~Boston"
  },
  "108-days-with-krishna-journaling-kit": {
    tagline: "A gentle 108-day journey inward… where each question helps you grow, reflect, and evolve within.",
    ctaSub: "You don’t have to rush through your spiritual journey… just return to it, one day at a time.",
    price: "1551.00",
    experience: [
      "Realizations that stay with you—written, remembered, and deeply felt",
      "A quiet confidence that your spiritual journey is unfolding, even on slower days",
      "A visible growth in your inner consciousness and a more relishing spiritual lifestyle"
    ],
    inside: [
      "152 guided prompts—one for each day of your inward journey",
      "A simple, structured space to reflect on your spiritual thoughts, prayers, and realizations",
      "Gentle questions to help you explore your inner consciousness and relationship with Krishna",
      "Prompts across seva, sadhana, sanga, and surrender to bring depth into everyday practice",
      "Reflection frameworks to understand your strengths, struggles, and growth",
      "Immersive audio experience (QR-enabled) to feel Krishna's mercy at every step",
      "Wisdom quotes woven throughout to keep you anchored and inspired",
      "A5 size | 165 pages | Undated | 100 GSM natural paper | Matte finish hardbound keepsake bind"
    ],
    forYou: [
      "You want to feel closer to Krishna… but don’t know where to begin",
      "Your spiritual practice feels routine, yet something deeper feels missing",
      "You have realizations that come… but don’t stay",
      "You want to pause, reflect, and truly see your spiritual growth over time"
    ],
    specs: [
      "Thoughtfully Crafted",
      "Packed with Intention",
      "Secure & Trusted Checkout",
      "Delivered with Care"
    ],
    review: "Some days the answers come easily, some days they don’t—but every time I show up, I feel a little more clear, a little more grounded.",
    author: "— Kavya R., Delhi"
  },
  "heart-of-virtues-journaling-kit": {
    tagline: "A path taken inward where each value you nurture quietly nourishes your heart.",
    ctaSub: "Take the first step to uncover the values already within you.",
    price: "1551.00",
    experience: [
      "The ability to pause, reflect, and respond with more intention",
      "A quiet shift from trying to be better… to naturally becoming it",
      "A strong presence of mind in response to highs and lows of life"
    ],
    inside: [
      "25+ core values to explore and align with",
      "120+ undated pages to explore one core value at a time",
      "Gentle affirmations to anchor you in your higher nature",
      "Immersive audio experience (QR-enabled) to strengthen your heart",
      "Core Values Evaluator to track your inner growth",
      "Reflection pages inspired from the scriptures to learn from ideals.",
      "Wisdom quotes woven throughout to keep you aligned and inspired",
      "A5 size | 165 pages | Undated | 100 GSM natural paper | Matte finish hardbound keepsake bind"
    ],
    forYou: [
      "You often react in ways you later wish you had handled differently",
      "You admire qualities in others and wish to cultivate them within yourself",
      "You wish to grow but don’t know where to start from"
    ],
    specs: [
      "Thoughtfully Crafted",
      "Packed with Intention",
      "Secure & Trusted Checkout",
      "Delivered with Care"
    ],
    review: "This journal helped me realise that real growth is quiet. I’ve started responding more patiently, thinking more kindly… and it feels natural now.",
    author: "— Madhuri G., Bangalore"
  },
  "shravanam-to-smaranam-journaling-kit": {
    tagline: "A guided journey from hearing to remembering where each learning and realisation begins to stay, shape and softly transform you.",
    ctaSub: "Go from receiving wisdom to living it in your everyday actions.",
    price: "1551.00",
    experience: [
      "The quiet confidence that comes from knowing you're living what you've learned",
      "A deeper ability to remember Krishna beyond just moments of hearing",
      "Realizations that don’t just inspire… but stay and guide your actions",
      "A scriptural perspective towards moments of decision making in life"
    ],
    inside: [
      "60+ structured pages with simple reflective prompts",
      "A guided framework to help you absorb, reflect, and apply what you receive",
      "Gentle affirmations to prepare your mind before you begin to apply your learnings",
      "Immersive audio experience (QR-enabled) to deepen your realisations.",
      "The D.I.K.W. framework to move from information insight to wisdom",
      "Reflection pages to track your learnings, challenges, and moments of growth",
      "A visual journey map: Receive → Reflect → Implement → Remember",
      "A5 size | 165 pages | Undated | 100 GSM natural paper | Matte finish hardbound keepsake bind"
    ],
    forYou: [
      "You wish to move from passive hearing to active assimilation.",
      "You take notes during spiritual talks, but they're scattered—and you never look at them again.",
      "You feel a gap between what you know… and how you respond to situations",
      "Your realizations feel powerful in the moment, but fade quickly"
    ],
    specs: [
      "Thoughtfully Crafted",
      "Packed with Intention",
      "Secure & Trusted Checkout",
      "Delivered with Care"
    ],
    review: "For years I listened, but nothing stayed. This journal helped me slow down and absorb. Now what I hear actually reflects in how I live.",
    author: "— Vrajasundar das, Alachua"
  },
  "thankyou-krishna": {
    tagline: "A gentle space to notice, cherish, and thank Krishna for the quiet ways He\u2019s always been there.",
    ctaSub: "Take the first step\u2014pause, look back, and thank the Lord.",
    price: "1551.00",
    experience: [
      "A natural shift from worry and lack… to appreciation and trust",
      "The ability to notice Krishna’s mercy in even the simplest moments",
      "A lighter, fuller heart—where gratitude becomes a way of being"
    ],
    inside: [
      "120+ undated pages to capture daily moments of gratitude—big and small",
      "Gratitude affirmations that soften the heart to receive Krishna's love",
      "Immersive audio experience (QR-enabled) to bring you into a state of gratitude",
      "Daily anchors to reflect on blessings, lessons, and unseen protection",
      "Hidden challenges to keep the spark of thankfulness and positivity",
      "A reflective gratitude report card to celebrate",
      "Wisdom quotes woven throughout to deepen your gratitude practice",
      "A5 size | 165 pages | Undated | 100 GSM natural paper | Matte finish hardbound keepsake bind"
    ],
    forYou: [
      "You often focus on what’s going wrong… and forget what’s quietly going right",
      "You know gratitude matters, but struggle to truly feel it",
      "You want to recognise Krishna’s presence in your everyday life",
      "You’re wishing to gently move from overthinking to appreciating"
    ],
    specs: [
      "Thoughtfully Crafted",
      "Packed with Intention",
      "Secure & Trusted Checkout",
      "Delivered with Care"
    ],
    review: "This is my third gratitude journal from Soulscribe… and something has truly shifted. I don’t just write gratitude anymore—I feel it, in the smallest moments too.",
    author: "— Radhika P., Mumbai"
  },
  "thankyou-krishna-journaling-kit": {
    tagline: "A gentle space to notice, cherish, and thank Krishna for the quiet ways He\u2019s always been there.",
    ctaSub: "Take the first step\u2014pause, look back, and thank the Lord.",
    price: "1551.00",
    experience: [
      "A natural shift from worry and lack… to appreciation and trust",
      "The ability to notice Krishna’s mercy in even the simplest moments",
      "A lighter, fuller heart—where gratitude becomes a way of being"
    ],
    inside: [
      "120+ undated pages to capture daily moments of gratitude—big and small",
      "Gratitude affirmations that soften the heart to receive Krishna's love",
      "Immersive audio experience (QR-enabled) to bring you into a state of gratitude",
      "Daily anchors to reflect on blessings, lessons, and unseen protection",
      "Hidden challenges to keep the spark of thankfulness and positivity",
      "A reflective gratitude report card to celebrate",
      "Wisdom quotes woven throughout to deepen your gratitude practice",
      "A5 size | 165 pages | Undated | 100 GSM natural paper | Matte finish hardbound keepsake bind"
    ],
    forYou: [
      "You often focus on what’s going wrong… and forget what’s quietly going right",
      "You know gratitude matters, but struggle to truly feel it",
      "You want to recognise Krishna’s presence in your everyday life",
      "You’re wishing to gently move from overthinking to appreciating"
    ],
    specs: [
      "Thoughtfully Crafted",
      "Packed with Intention",
      "Secure & Trusted Checkout",
      "Delivered with Care"
    ],
    review: "This is my third gratitude journal from Soulscribe… and something has truly shifted. I don’t just write gratitude anymore—I feel it, in the smallest moments too.",
    author: "— Radhika P., Mumbai"
  },
  "daily-prioritizer": {
    tagline: "A pocket-sized pause before the chaos begins\u2014so your day flows with purpose, not just pressure.",
    ctaSub: "Start your day with intention\u2026 and let everything else follow.",
    price: "333.00",
    experience: [],
    inside: [
      "A gentle shift from reacting… to consciously planning your day",
      "Undated, tear-off format—carry it with you, wherever you go",
      "Takes just 2 minutes to fill, yet shapes your entire day",
      "4×7 inches | Pocket-friendly | 60 pages | 100 GSM paper | Undated"
    ],
    forYou: [],
    specs: [
      "Thoughtfully Crafted",
      "Packed with Intention",
      "Secure & Trusted Checkout",
      "Delivered with Care"
    ],
    review: "I didn’t realise how scattered my days felt until I started this. Now I begin with clarity—and everything feels lighter.",
    author: "— Haripriya, Bangalore"
  },
  "do-it-for-krsna": {
    tagline: "A simple way to offer your daily actions one small intention at a time.",
    ctaSub: "A quiet reminder\u2026 that even the smallest moments can be an offering to the Lord.",
    price: "333.00",
    experience: [],
    inside: [
      "A subtle shift from being self conscious to being Krishna conscious",
      "Simple structure to list down your daily to-do's",
      "Takes just 10 seconds to fill, stays with you all day",
      "4×7 inches | Pocket-friendly | 60 pages | 100 GSM paper | Undated"
    ],
    forYou: [],
    specs: [
      "Thoughtfully Crafted",
      "Packed with Intention",
      "Secure & Trusted Checkout",
      "Delivered with Care"
    ],
    review: "It’s just takes —but it changes how I do everything. My day feels more connected, less mechanical.",
    author: "— Nitin, Vadodara"
  },
  "holistic-jotter": {
    tagline: "A simple way to stay connected through your day\u2014morning to night, one small win at a time.",
    ctaSub: "Small moments of devotion\u2026 gently woven into your entire day.",
    price: "333.00",
    experience: [],
    inside: [
      "Three simple sections: Morning • Afternoon • Evening",
      "A gentle way to stay aware of your spiritual moments through the day",
      "Helps you notice and record your small spiritual wins easily",
      "Undated, easy-to-use format that fits naturally into your routine",
      "A4 / Mini format | 60 pages | 100 GSM paper | Tearable | Hardbound base"
    ],
    forYou: [],
    specs: [
      "Thoughtfully Crafted",
      "Packed with Intention",
      "Secure & Trusted Checkout",
      "Delivered with Care"
    ],
    review: "I didn’t realise where my time was going until I started using this. Now my day feels more intentional—and somehow, I still get more done.",
    author: "— Aditi, Chicago"
  },
  "soulful-self-care-checklist": {
    tagline: "A simple daily practice to check in with yourself\u2014so you don\u2019t forget to care for what truly matters.",
    ctaSub: "A few mindful check-ins can gently change how your day feels.",
    price: "666.00",
    experience: [],
    inside: [
      "20 gentle soul-care activities to support your day",
      "Space to set 3 simple intentions for yourself",
      "Hydration tracker • Sleep tracker • Mood check-in",
      "A small space to note moments that felt like blessings",
      "A4 size | 60 pages | Undated | 100 GSM paper | Tearable | Hardbound base"
    ],
    forYou: [],
    specs: [
      "Thoughtfully Crafted",
      "Packed with Intention",
      "Secure & Trusted Checkout",
      "Delivered with Care"
    ],
    review: "I stopped running through my days on autopilot. This helped me slow down and actually take care of myself.",
    author: "— Devaki N., Guwahati"
  },
  "balance-being": {
    tagline: "A simple way to stay balanced through your day.",
    ctaSub: "It\u2019s important to focus on all aspects of life one moment at a time.",
    price: "666.00",
    experience: [],
    inside: [
      "Four simple quadrants: Physical • Emotional • Intellectual • Spiritual",
      "A gentle way to notice where you need to show up for yourself",
      "Undated, tear-off format—use at your own pace, no pressure",
      "A4 size | 60 pages | Undated | 100 GSM paper | Tearable | Hardbound base"
    ],
    forYou: [],
    specs: [
      "Thoughtfully Crafted",
      "Packed with Intention",
      "Secure & Trusted Checkout",
      "Delivered with Care"
    ],
    review: "I finally understood what balance feels like. Just one page a day keeps me grounded and a lot less overwhelmed.",
    author: "— Madhav K., Bangalore"
  },
  "sadhana-in-sync": {
    tagline: "A weekly rhythm that helps you stay gently consistent.",
    ctaSub: "Plan your spiritual life before your day plans itself.",
    price: "666.00",
    experience: [],
    inside: [
      "Inside Your Practice",
      "A full Monday to Sunday view—your entire week, at a glance",
      "A dedicated space to anchor your weekly spiritual intention",
      "A simple way to stay connected to your sadhana amidst responsibilities",
      "Clean, uncluttered layout for calm clarity and focus",
      "A4 size | 60 pages | Undated | 100 GSM paper | Tearable | Hardbound base"
    ],
    forYou: [],
    specs: [
      "Thoughtfully Crafted",
      "Packed with Intention",
      "Secure & Trusted Checkout",
      "Delivered with Care"
    ],
    review: "Seeing my whole week in one place changed everything. My sadhana finally feels steady—not something I keep restarting.",
    author: "— Gaurangi, Pune"
  }
};

window.PRODUCT_CUSTOM_META = PRODUCT_CUSTOM_META;

const RECOMMENDATIONS_MAP = {
  "prayers-from-within-journaling-kit": ["sadhana-in-sync", "balance-being", "thankyou-krishna"],
  "mercy-and-meltdowns-journaling-kit": ["do-it-for-krsna", "soulful-self-care-checklist", "thankyou-krishna"],
  "108-days-with-krishna-journaling-kit": ["do-it-for-krsna", "sadhana-in-sync", "heart-of-virtues-journaling-kit"],
  "heart-of-virtues-journaling-kit": ["shravanam-to-smaranam-journaling-kit", "balance-being", "prayers-from-within-journaling-kit"],
  "shravanam-to-smaranam-journaling-kit": ["108-days-with-krishna-journaling-kit", "balance-being", "sadhana-in-sync"],
  "thankyou-krishna": ["prayers-from-within-journaling-kit", "do-it-for-krsna", "balance-being"],
  "thankyou-krishna-journaling-kit": ["prayers-from-within-journaling-kit", "do-it-for-krsna", "balance-being"],
  "daily-prioritizer": ["sadhana-in-sync", "balance-being", "thankyou-krishna"],
  "do-it-for-krsna": ["daily-prioritizer", "thankyou-krishna", "prayers-from-within-journaling-kit"],
  "holistic-jotter": ["daily-prioritizer", "sadhana-in-sync", "thankyou-krishna"],
  "soulful-self-care-checklist": ["holistic-jotter", "sadhana-in-sync", "prayers-from-within-journaling-kit"],
  "balance-being": ["108-days-with-krishna-journaling-kit", "prayers-from-within-journaling-kit", "holistic-jotter"],
  "sadhana-in-sync": ["daily-prioritizer", "balance-being", "thankyou-krishna"]
};

window.RECOMMENDATIONS_MAP = RECOMMENDATIONS_MAP;

async function initProductPageBindings() {
  const body = document.body;
  const handle = body.getAttribute('data-shopify-handle');
  if (!handle) return;

  const query = `
    query getProductByHandle($handle: String!) {
      product(handle: $handle) {
        id
        title
        handle
        description
        featuredImage { url }
        images(first: 6) { nodes { url } }
        variants(first: 1) {
          nodes {
            id
            title
            price { amount currencyCode }
            availableForSale
          }
        }
      }
      products(first: 10) {
        nodes {
          id
          title
          handle
          featuredImage { url }
          images(first: 5) { nodes { url } }
          variants(first: 1) {
            nodes {
              id
              price { amount currencyCode }
              availableForSale
            }
          }
        }
      }
    }
  `;

  try {
    // Fetch live price & data from Shopify (no cache so price changes reflect immediately)
    const response = await fetch(
      `https://${SHOP_URL}/api/2025-01/graphql.json`,
      {
        method: "POST",
        cache: "no-store",
        headers: {
          "Content-Type": "application/json",
          "X-Shopify-Storefront-Access-Token": STOREFRONT_TOKEN
        },
        body: JSON.stringify({ query, variables: { handle } })
      }
    );

    const result = await response.json();
    const allProducts = (result.data?.products?.nodes || []);
    let product = result.data?.product;


    if (!product) {
      console.warn("Product not found on Shopify:", handle);
      return;
    }

    const variant = product.variants.nodes[0];
    const priceAmount = parseFloat(variant.price.amount);
    const customMeta = PRODUCT_CUSTOM_META[product.handle] || PRODUCT_CUSTOM_META[product.handle + "-journaling-kit"] || {};
    const finalPrice = priceAmount; // live from Shopify

    // Update document title
    document.title = `${product.title} — Soulscribe`;

    // Update Page Header H1 Title
    const titleEl = document.querySelector('.pd-info h1') || document.querySelector('h1');
    if (titleEl) {
      titleEl.textContent = product.title;
    }

    // Update Price Display
    const priceEl = document.querySelector('.pd-price');
    if (priceEl) {
      priceEl.textContent = `INR ${Math.round(finalPrice)}`;
    }

    // Update Tagline / Description
    const taglineEl = document.querySelector('.pd-info .tagline');
    if (taglineEl) {
      taglineEl.textContent = customMeta.tagline || product.description;
    }

    // Update CTA subtext below button
    const ctaSubEl = document.querySelector('.cta-sub');
    if (ctaSubEl && customMeta.ctaSub) {
      ctaSubEl.textContent = customMeta.ctaSub;
    }

    // Check if this product is a planner
    const PLANNER_HANDLES = [
      'daily-prioritizer',
      'do-it-for-krsna',
      'holistic-jotter',
      'soulful-self-care-checklist',
      'balance-being',
      'sadhana-in-sync'
    ];
    const isPlanner = PLANNER_HANDLES.includes(product.handle) ||
                      (product.productType && product.productType.toLowerCase().includes('planner')) ||
                      document.body.classList.contains('is-planner');

    if (isPlanner) {
      document.body.classList.add('is-planner');
    }

    // Update Image Gallery
    const galleryEl = document.querySelector('.pd-gallery');
    if (galleryEl) {
      let productImages = product.images?.nodes || [];
      productImages = arrangeProductImages(productImages, product.handle);

      if (isPlanner) {
        // PLANNERS ONLY: Exactly one photo on left as fix, NO AI images, NO carousel wrapper
        const singleImgUrl = productImages[0]?.url || product.featuredImage?.url;
        if (singleImgUrl) {
          galleryEl.innerHTML = `<img src="${singleImgUrl}" alt="${product.title}" loading="eager">`;
        }
        // Remove carousel wrapper / nav buttons if any were created
        const parent = galleryEl.parentElement;
        if (parent && parent.classList.contains('pd-gallery-wrapper')) {
          parent.parentNode.insertBefore(galleryEl, parent);
          parent.remove();
        }
      } else {
        // JOURNALING KITS ONLY: Multi-image gallery with real kit photos (NO AI-generated images)
        if (productImages.length > 0) {
          let imagesHtml = productImages.map((img, idx) => `
            <img src="${img.url}" alt="${product.title} view ${idx + 1}" loading="${idx === 0 ? 'eager' : 'lazy'}">
          `).join('');
          galleryEl.innerHTML = imagesHtml;

          // Wrap the gallery to support swipe navigation buttons & indicator dots on mobile
          if (galleryEl && !galleryEl.parentElement.classList.contains('pd-gallery-wrapper')) {
            const wrapper = document.createElement('div');
            wrapper.className = 'pd-gallery-wrapper';
            galleryEl.parentNode.insertBefore(wrapper, galleryEl);
            wrapper.appendChild(galleryEl);

            const prevBtn = document.createElement('button');
            prevBtn.className = 'gallery-nav-btn prev';
            prevBtn.innerHTML = '‹';
            prevBtn.setAttribute('aria-label', 'Previous image');

            const nextBtn = document.createElement('button');
            nextBtn.className = 'gallery-nav-btn next';
            nextBtn.innerHTML = '›';
            nextBtn.setAttribute('aria-label', 'Next image');

            wrapper.appendChild(prevBtn);
            wrapper.appendChild(nextBtn);

            // Indicator Dots
            const images = galleryEl.querySelectorAll('img');
            const dotsContainer = document.createElement('div');
            dotsContainer.className = 'pd-gallery-dots';

            if (images.length > 1) {
              images.forEach((_, i) => {
                const dot = document.createElement('span');
                dot.className = `gallery-dot ${i === 0 ? 'active' : ''}`;
                dot.addEventListener('click', () => {
                  images[i].scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'start' });
                });
                dotsContainer.appendChild(dot);
              });
              wrapper.appendChild(dotsContainer);

              // Update active dot on scroll
              galleryEl.addEventListener('scroll', () => {
                const scrollLeft = galleryEl.scrollLeft;
                const imgWidth = galleryEl.clientWidth;
                const activeIdx = Math.round(scrollLeft / imgWidth);
                dotsContainer.querySelectorAll('.gallery-dot').forEach((dot, idx) => {
                  dot.classList.toggle('active', idx === activeIdx);
                });
              });

              prevBtn.addEventListener('click', (e) => {
                e.preventDefault();
                galleryEl.scrollBy({ left: -galleryEl.clientWidth * 0.9, behavior: 'smooth' });
              });

              nextBtn.addEventListener('click', (e) => {
                e.preventDefault();
                galleryEl.scrollBy({ left: galleryEl.clientWidth * 0.9, behavior: 'smooth' });
              });
            }
          }
        }
      }
    }

    // Inject "What Souls Experience" dynamic accordion
    let experienceWrapper = document.getElementById('details-experience-wrapper');
    if (customMeta.experience && customMeta.experience.length > 0) {
      if (!experienceWrapper) {
        const accordionHtml = `
          <div class="accordion" id="details-experience-wrapper" data-toggle-group>
            <button class="accordion-btn" data-toggle>What Souls Experience <svg class="chev" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><polyline points="6 9 12 15 18 9"/></svg></button>
            <div class="accordion-body">
              <div>
                <ul id="details-experience">
                  ${customMeta.experience.map(item => `<li>${item}</li>`).join('')}
                </ul>
              </div>
            </div>
          </div>
        `;

        let detailsCareAccordion = null;
        document.querySelectorAll('.accordion').forEach(acc => {
          const btn = acc.querySelector('.accordion-btn');
          if (btn && btn.textContent.toLowerCase().includes('details and care')) {
            detailsCareAccordion = acc;
          }
        });

        if (detailsCareAccordion) {
          detailsCareAccordion.insertAdjacentHTML('beforebegin', accordionHtml);
        } else {
          const accordions = document.querySelectorAll('.accordion');
          if (accordions.length > 0) {
            accordions[accordions.length - 1].insertAdjacentHTML('afterend', accordionHtml);
          }
        }
        initToggles();
      } else {
        experienceWrapper.style.display = 'block';
        const listEl = experienceWrapper.querySelector('#details-experience');
        if (listEl) {
          listEl.innerHTML = customMeta.experience.map(item => `<li>${item}</li>`).join('');
        }
      }
    } else {
      if (experienceWrapper) {
        experienceWrapper.style.display = 'none';
      }
    }

    // Update Accordions Specs Lists
    document.querySelectorAll('.accordion').forEach(accordion => {
      const btn = accordion.querySelector('.accordion-btn');
      if (!btn) return;
      const text = btn.textContent.toLowerCase();
      const listContainer = accordion.querySelector('.accordion-body div');
      if (!listContainer) return;

      if (text.includes('inside your practice') && customMeta.inside) {
        listContainer.innerHTML = `<ul>${customMeta.inside.map(item => `<li>${item}</li>`).join('')}</ul>`;
      } else if (text.includes('this is for you if')) {
        // Hide accordion for planners (forYou is empty []) — spreadsheet shows NA
        if (customMeta.forYou && customMeta.forYou.length > 0) {
          listContainer.innerHTML = `<ul>${customMeta.forYou.map(item => `<li>${item}</li>`).join('')}</ul>`;
        } else {
          accordion.style.display = 'none';
        }
      } else if (text.includes('what souls experience')) {
        // Hide accordion for planners (experience is empty []) — spreadsheet shows NA
        if (customMeta.experience && customMeta.experience.length > 0) {
          listContainer.innerHTML = `<ul>${customMeta.experience.map(item => `<li>${item}</li>`).join('')}</ul>`;
        } else {
          accordion.style.display = 'none';
        }
      } else if (text.includes('details and care') && customMeta.specs) {
        listContainer.innerHTML = `<ul>${customMeta.specs.map(item => `<li>${item}</li>`).join('')}</ul>
          <p style="padding:0 0 1.25rem 1.25rem;font-size:0.875rem;color:color-mix(in oklab,var(--foreground) 80%,transparent)">
            <strong>Shipping &amp; Returns</strong><br>
            We craft every order with care and usually ship within 2 working days. Delivery takes 5–7 days within India, and 8–10 days worldwide. Each journal is created with intention just for you, so returns aren't available at the moment.
          </p>`;
      }
    });

    // Update review text on static product pages (select italic paragraph in review section)
    if (customMeta.review) {
      const reviewEl = document.querySelector('section .wrap-sm p[style*="italic"]');
      if (reviewEl) reviewEl.textContent = `"${customMeta.review}"`;
      const authorEl = document.querySelector('section .wrap-sm p[style*="margin-top:1rem"]');
      if (authorEl) authorEl.textContent = customMeta.author || '';
    }

    // Set up quantity selector events
    const qtyContainer = document.querySelector('.qty');
    let quantity = 1;
    if (qtyContainer) {
      const decBtn = qtyContainer.querySelector('button[aria-label="decrease"]');
      const incBtn = qtyContainer.querySelector('button[aria-label="increase"]');
      const countSpan = qtyContainer.querySelector('span');

      const updateCount = () => {
        if (countSpan) countSpan.textContent = quantity;
      };

      if (decBtn) {
        decBtn.addEventListener('click', (e) => {
          e.preventDefault();
          if (quantity > 1) { quantity--; updateCount(); }
        });
      }
      if (incBtn) {
        incBtn.addEventListener('click', (e) => {
          e.preventDefault();
          quantity++;
          updateCount();
        });
      }
    }

    // Bind Add to Cart action button
    const atcBtn = document.querySelector('.btn-sun');
    if (atcBtn) {
      if (!variant.availableForSale) {
        atcBtn.textContent = "Sold Out";
        atcBtn.disabled = true;
      } else {
        atcBtn.textContent = "Begin my journey";
        atcBtn.disabled = false;
        atcBtn.replaceWith(atcBtn.cloneNode(true));
        const newAtcBtn = document.querySelector('.btn-sun');
        newAtcBtn.addEventListener('click', (e) => {
          e.preventDefault();
          const imgUrl = product.featuredImage?.url || 'assets/journal-kit.jpg';
          CartManager.add(
            variant.id,
            product.title,
            finalPrice,
            imgUrl,
            product.handle,
            quantity
          );
        });
      }
    }

    // Render Recommended products ("Souls also love") from static data
    const recommendedContainer = document.querySelector('section .products-grid') || document.querySelector('.products-grid');
    if (recommendedContainer && allProducts.length > 0) {
      let recommendedList = [];
      const recHandles = RECOMMENDATIONS_MAP[product.handle] || RECOMMENDATIONS_MAP[product.handle + "-journaling-kit"];
      if (recHandles) {
        recommendedList = recHandles.map(h => allProducts.find(p => p.handle === h || p.handle === h + "-journaling-kit")).filter(Boolean);
      }
      if (recommendedList.length < 3) {
        const fallbacks = allProducts.filter(p => p.handle !== product.handle && !recommendedList.some(r => r.handle === p.handle));
        recommendedList = [...recommendedList, ...fallbacks].slice(0, 3);
      }

      // Set the color of "Souls also love" heading to light blue
      const recommendedSection = recommendedContainer.closest('section');
      if (recommendedSection) {
        const heading = recommendedSection.querySelector('h2.heading');
        if (heading) heading.style.color = 'var(--teal-accent)';
      }

      recommendedContainer.innerHTML = recommendedList.map((p, idx) => {
        const itemUrl = getProductUrl(p.handle);
        const itemPrice = Math.round(parseFloat(p.variants.nodes[0].price.amount));
        const itemImg = getProductFirstImage(p);
        const delay = idx * 100;

        return `
          <div class="product-card reveal" data-delay="${delay}">
            <a href="${itemUrl}" style="width:100%">
              <div class="img"><img src="${itemImg}" alt="${cleanProductTitle(p.title)}" loading="lazy"></div>
              <h3>${cleanProductTitle(p.title)}</h3>
            </a>
            <p class="price">INR ${itemPrice}</p>
          </div>
        `;
      }).join('');

      if (typeof initReveal === "function") {
        initReveal();
      }
      initRecommendedCarousel();
    }
  } catch (err) {
    console.error("Error setting up product page bindings:", err);
  } finally {
    document.body.classList.add('loaded');
  }
}

// ----------------------------------------------------
// Homepage Featured Products (from local static data)
// ----------------------------------------------------
async function initHomepageFeaturedProducts() {
  const container = document.getElementById('featured-products');
  if (!container) return;

  const query = `
    {
      products(first: 3) {
        nodes {
          id
          title
          handle
          featuredImage { url }
          variants(first: 1) {
            nodes {
              id
              price { amount currencyCode }
              availableForSale
            }
          }
        }
      }
    }
  `;

  try {
    const response = await fetch(
      `https://${SHOP_URL}/api/2025-01/graphql.json`,
      {
        method: "POST",
        cache: "no-store",
        headers: {
          "Content-Type": "application/json",
          "X-Shopify-Storefront-Access-Token": STOREFRONT_TOKEN
        },
        body: JSON.stringify({ query })
      }
    );

    const result = await response.json();
    const products = (result.data?.products?.nodes || []);

    if (products.length === 0) {
      container.innerHTML = `<p style="grid-column: 1/-1; text-align: center; color: var(--muted-foreground);">No featured products found.</p>`;
      return;
    }

    container.innerHTML = products.map((p, idx) => {
      const url = getProductUrl(p.handle);
      const itemCustomMeta = PRODUCT_CUSTOM_META[p.handle] || PRODUCT_CUSTOM_META[p.handle + "-journaling-kit"] || {};
      const price = Math.round(parseFloat(p.variants.nodes[0].price.amount));
      const imgUrl = getProductFirstImage(p);
      const delay = idx * 100;

      return `
        <div class="product-card hover-lift reveal" data-delay="${delay}">
          <a href="${url}" style="width:100%">
            <div class="img"><img src="${imgUrl}" alt="${cleanProductTitle(p.title)}" loading="lazy"></div>
            <h3>${cleanProductTitle(p.title)}</h3>
          </a>
          <p class="price">INR ${price}</p>
          <a class="btn-outline" href="${url}">Begin my journey</a>
        </div>
      `;
    }).join('');

    if (typeof initReveal === "function") {
      initReveal();
    }
  } catch (err) {
    console.error("Error loading featured products:", err);
    container.innerHTML = `<p style="grid-column: 1/-1; text-align: center; color: var(--muted-foreground);">Unable to load featured products at this time.</p>`;
  }
}

// Global Form Validation & Backend Persistence
function initFormValidation() {
  document.addEventListener("input", (e) => {
    if (e.target && e.target.type === "tel") {
      let val = e.target.value;
      let digits = val.replace(/\D/g, "");
      if (digits.length > 10) {
        digits = digits.slice(0, 10);
      }
      e.target.value = digits;
    }
  });

  document.addEventListener("submit", async (e) => {
    const form = e.target;
    if (form.getAttribute("data-no-intercept") === "true") return;

    // Check telephone constraints
    const tels = form.querySelectorAll('input[type="tel"]');
    for (let tel of tels) {
      let val = tel.value.replace(/\D/g, "");
      if (tel.required && (val.length < 10)) {
        tel.setCustomValidity("Phone number must be 10 digits");
        tel.reportValidity();
        e.preventDefault();
        return;
      } else {
        tel.setCustomValidity("");
      }
    }

    // Check email constraints
    const emails = form.querySelectorAll('input[type="email"]');
    for (let email of emails) {
      const val = email.value;
      if (email.required && !val.includes('@')) {
        email.setCustomValidity("Email address must contain @");
        email.reportValidity();
        e.preventDefault();
        return;
      } else {
        email.setCustomValidity("");
      }
    }

    // Collect input values
    const formData = new FormData(form);
    const dataObj = {};
    formData.forEach((val, key) => { dataObj[key] = val; });

    // Also get unnamed fields by ID or type if FormData misses them
    form.querySelectorAll('input, select, textarea').forEach(el => {
      if (el.value && !dataObj[el.name || el.id]) {
        dataObj[el.name || el.id || el.type] = el.value;
      }
    });

    const formType = form.id || form.className || 'generic_form';

    try {
      await fetch('/api/form-submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ formType, data: dataObj })
      });
      console.log(`[Form] Submitted ${formType} to backend`);
    } catch (err) {
      console.warn("Backend submission fallback:", err);
    }

    // Show feedback toast if element exists or create temporary notice
    const successBox = form.parentNode.querySelector('.rise-form-success, .form-success');
    if (successBox) {
      form.style.display = 'none';
      successBox.style.display = 'block';
    } else {
      let toast = document.querySelector('.toast');
      if (!toast) {
        toast = document.createElement('div');
        toast.className = 'toast';
        toast.innerHTML = `<div class="toast-icon">🌸</div><div class="toast-content">Thank you! Your details have been submitted successfully.</div>`;
        document.body.appendChild(toast);
      }
      toast.classList.add('show');
      setTimeout(() => toast.classList.remove('show'), 4000);
      form.reset();
    }
  });
}

// Initialize on DOM Ready
document.addEventListener("DOMContentLoaded", () => {
  initFormValidation();
  initCartDrawer();
  
  // If on shop page, load dynamic products
  if (document.getElementById("kits-products") && document.getElementById("planners-products")) {
    fetchShopProducts();

    // Bind sort/filter select changes
    const sortSelect = document.getElementById("sort-select");
    const filterSelect = document.getElementById("filter-select");
    if (sortSelect) sortSelect.addEventListener("change", renderShopGrids);
    if (filterSelect) filterSelect.addEventListener("change", renderShopGrids);
  }

  // If on homepage, load featured products
  initHomepageFeaturedProducts();

  // If on a product page, initialize bindings
  initProductPageBindings();
  
  // Initialize recommended products left/right carousel buttons if present
  initRecommendedCarousel();
});

// recommended products left/right carousel navigation
function initRecommendedCarousel() {
  const container = document.getElementById('recommended-products');
  if (!container) return;

  let heading = container.previousElementSibling;
  while (heading && heading.tagName !== 'H2') {
    heading = heading.previousElementSibling;
  }
  if (!heading) return;

  let headerWrapper = container.parentNode.querySelector('.carousel-header-wrapper');
  if (!headerWrapper) {
    headerWrapper = document.createElement('div');
    headerWrapper.className = 'carousel-header-wrapper';
    headerWrapper.style.cssText = 'display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; flex-wrap: wrap; gap: 1rem;';

    heading.parentNode.insertBefore(headerWrapper, heading);
    headerWrapper.appendChild(heading);
    heading.style.marginBottom = '0';
    heading.style.textAlign = 'left';

    const nav = document.createElement('div');
    nav.className = 'carousel-nav-buttons';
    nav.style.cssText = 'display: flex; gap: 0.75rem; align-items: center;';

    const prevBtn = document.createElement('button');
    prevBtn.className = 'carousel-nav-btn prev';
    prevBtn.setAttribute('aria-label', 'Previous products');
    prevBtn.innerHTML = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>`;

    const nextBtn = document.createElement('button');
    nextBtn.className = 'carousel-nav-btn next';
    nextBtn.setAttribute('aria-label', 'Next products');
    nextBtn.innerHTML = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>`;

    nav.appendChild(prevBtn);
    nav.appendChild(nextBtn);
    headerWrapper.appendChild(nav);

    const btnStyle = 'background: #ffffff; border: 1.5px solid #ffdd4f; width: 2.5rem; height: 2.5rem; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: #0d3f5a; transition: all 0.2s ease; cursor: pointer; box-shadow: 0 2px 6px rgba(0,0,0,0.04); padding: 0;';
    prevBtn.style.cssText = btnStyle;
    nextBtn.style.cssText = btnStyle;

    const addHover = (btn) => {
      btn.addEventListener('mouseenter', () => {
        btn.style.background = '#fffde6';
        btn.style.transform = 'scale(1.05)';
      });
      btn.addEventListener('mouseleave', () => {
        btn.style.background = '#ffffff';
        btn.style.transform = 'scale(1)';
      });
    };
    addHover(prevBtn);
    addHover(nextBtn);

    const getScrollAmount = () => {
      const firstCard = container.querySelector('.product-card');
      return firstCard ? firstCard.clientWidth + 16 : container.clientWidth * 0.8;
    };

    prevBtn.addEventListener('click', () => {
      container.scrollBy({ left: -getScrollAmount(), behavior: 'smooth' });
    });

    nextBtn.addEventListener('click', () => {
      container.scrollBy({ left: getScrollAmount(), behavior: 'smooth' });
    });
  }

  const updateButtonsVisibility = () => {
    const nav = headerWrapper.querySelector('.carousel-nav-buttons');
    if (nav) {
      const isScrollable = container.scrollWidth > container.clientWidth;
      nav.style.display = isScrollable ? 'flex' : 'none';
    }
  };

  updateButtonsVisibility();
  window.addEventListener('resize', updateButtonsVisibility);
  window.updateRecommendedCarouselNav = updateButtonsVisibility;

  setTimeout(updateButtonsVisibility, 500);
  setTimeout(updateButtonsVisibility, 1500);
}
window.initRecommendedCarousel = initRecommendedCarousel;
// Global Form Handling & Validation
document.addEventListener('DOMContentLoaded', () => {
  const forms = document.querySelectorAll('form');
  forms.forEach(form => {
    // We skip the search/newsletter forms if we want, but the prompt says 'ALL FORMS'
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      if (!form.checkValidity()) {
        form.reportValidity();
        return;
      }
      
      // Collect data
      const formData = new FormData(form);
      const data = Object.fromEntries(formData.entries());
      
      // We simulate sending data to a webhook (Google Sheet / Dataverse)
      // Since no URL was provided, we just log and show success.
      console.log('Form data ready to be sent to Webhook:', data);
      
      const submitBtn = form.querySelector('button[type="submit"]');
      const originalText = submitBtn ? submitBtn.innerHTML : '';
      if (submitBtn) {
        submitBtn.innerHTML = 'Sending...';
        submitBtn.disabled = true;
      }
      
      try {
        // Mock API Call Delay
        await new Promise(r => setTimeout(r, 1000));
        
        // Success behavior
        form.reset();
        
        // Check if there is a custom success message div next to the form
        const successDiv = form.nextElementSibling;
        if (successDiv && successDiv.classList.contains('rise-form-success')) {
          form.style.display = 'none';
          successDiv.style.display = 'block';
        } else {
          // generic fallback alert
          alert('Thank you! Your information has been submitted successfully.');
        }
      } catch (err) {
        alert('Something went wrong. Please try again.');
      } finally {
        if (submitBtn) {
          submitBtn.innerHTML = originalText;
          submitBtn.disabled = false;
        }
      }
    });
  });
});

// ===== GLOBAL UI ENHANCEMENTS (PHASE 1) =====
function initGlobalUI() {
  // 1. Highlight Active Nav Link with yellow color (#ffdd4f)
  const fullPath = window.location.pathname.toLowerCase();
  const currentPath = fullPath.split('/').pop() || 'index.html';
  const isProduct = fullPath.includes('/product/');
  const isBlog = fullPath.includes('gratitude') || fullPath.includes('journaling-101') || 
                fullPath.includes('morning-shapes') || fullPath.includes('what-5-minutes') || 
                fullPath.includes('stuck-spiritually') || fullPath.includes('dont-need');

  document.querySelectorAll('.drawer nav a, header nav a, .soulscribe-header a').forEach(link => {
    const href = link.getAttribute('href');
    if (!href) return;
    const linkPath = href.split('/').pop().split('#')[0].toLowerCase();
    
    let isMatch = (linkPath === currentPath || (currentPath === '' && linkPath === 'index.html'));
    if (isProduct && linkPath === 'shop.html') isMatch = true;
    if (isBlog && linkPath === 'nectar-for-soul.html') isMatch = true;

    if (isMatch) {
      link.classList.add('active');
      link.style.color = '#ffdd4f';
      link.style.fontWeight = '700';
    }
  });

  // 2. Global User Icon Click Handler: Redirect to Dashboard (if authenticated) or Login
  document.addEventListener('click', (e) => {
    const userTrigger = e.target.closest('.soulscribe-header a[aria-label="Account"], .soulscribe-header a[title="Account"], .soulscribe-header [data-account]');
    if (userTrigger) {
      e.preventDefault();
      const prefix = isProduct ? '../' : '';
      const token = localStorage.getItem('ss_token');
      window.location.href = prefix + (token ? 'dashboard.html' : 'login.html');
    }
  });

  // 3. Global Cart Button Handler: Open "Your Journey" from Right
  document.addEventListener('click', (e) => {
    const cartTrigger = e.target.closest('[data-open-cart], .soulscribe-header button[aria-label="Cart"], .soulscribe-header a[aria-label="Cart"], button[title="Cart"]');
    if (cartTrigger) {
      e.preventDefault();
      if (window.CartManager) {
        window.CartManager.open();
      }
    }
  });

  // 4. Footer Email Submission Validation & Success Message
  document.querySelectorAll('footer form, .footer-grid form').forEach(form => {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const emailInput = form.querySelector('input[type="email"], input[placeholder*="Email"]');
      if (!emailInput) return;
      const val = emailInput.value.trim();
      let msgEl = form.parentNode.querySelector('.footer-email-msg');
      if (!msgEl) {
        msgEl = document.createElement('p');
        msgEl.className = 'footer-email-msg';
        msgEl.style.cssText = 'margin-top: 0.5rem; font-size: 0.85rem; font-weight: 700; color: #0d3f5a;';
        form.parentNode.insertBefore(msgEl, form.nextSibling);
      }
      if (!val.includes('@')) {
        msgEl.textContent = 'Please enter a valid email address containing @';
        msgEl.style.color = '#d9381e';
        emailInput.focus();
        return;
      }
      emailInput.value = '';
      msgEl.textContent = 'Thankyou for showing your interest!';
      msgEl.style.color = '#0d3f5a';
    });
  });

  // 5. Mobile Footer Accordion Toggle Indicator
  document.querySelectorAll('.footer-accordion-toggle').forEach(btn => {
    btn.addEventListener('click', () => {
      const body = btn.nextElementSibling;
      if (!body) return;
      const span = btn.querySelector('span');
      if (span) {
        // Toggle indicator + or −
        span.textContent = body.classList.contains('open') ? '−' : '+';
      }
    });
  });

  // 6. Dynamic Instagram Feed
  initInstagramFeed();
}

function initInstagramFeed() {
  const beholdEl = document.getElementById('behold-feed');
  const grid = document.getElementById('instagram-grid');
  if (!grid) return;

  // If Behold hosted widget loads, hide fallback grid
  if (beholdEl) {
    const checkBehold = () => {
      if (beholdEl.children.length > 0 || beholdEl.shadowRoot) {
        grid.style.display = 'none';
        return true;
      }
      return false;
    };
    if (!checkBehold()) {
      const observer = new MutationObserver(() => {
        if (checkBehold()) observer.disconnect();
      });
      observer.observe(beholdEl, { childList: true, subtree: true });
    }
  }

  // Fetch live feed from server if available (renders only real posts, never hardcoded)
  fetch('/api/instagram-feed')
    .then(r => {
      if (!r.ok) throw new Error('Network error');
      return r.json();
    })
    .then(data => {
      if (data && data.posts && Array.isArray(data.posts) && data.posts.length > 0) {
        const posts = data.posts.slice(0, 5);
        grid.innerHTML = posts.map(p => `
          <a class="instagram-post" href="${p.url || 'https://www.instagram.com/soulscribe.official/'}" target="_blank" rel="noopener noreferrer" aria-label="View post on Instagram">
            <img src="${p.image}" alt="${p.caption || 'Soulscribe Instagram post'}" loading="lazy" onerror="this.onerror=null; this.closest('.instagram-post').style.display='none';">
            <div class="instagram-post-overlay">
              <div class="ig-overlay-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>
              </div>
            </div>
          </a>
        `).join('');
      } else {
        grid.innerHTML = '';
      }
    })
    .catch(() => {
      grid.innerHTML = '';
    });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initGlobalUI);
} else {
  initGlobalUI();
}
