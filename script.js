
// Helpers
const formatEUR = (n) => n.toFixed(2).replace('.', ',') + " €";

// Cart state (persist to localStorage)
const CART_KEY = "sevi_lenni_cart_v1";
let cart = JSON.parse(localStorage.getItem(CART_KEY) || "[]");

function saveCart() { localStorage.setItem(CART_KEY, JSON.stringify(cart)); updateCartBadge(); }
function updateCartBadge() {
  const count = cart.reduce((a, i) => a + i.qty, 0);
  const el = document.getElementById("cart-count");
  if (el) el.textContent = count;
}

// Add item
function addToCart({id, name, price, image, size}) {
  const existing = cart.find(i => i.id === id && i.size === size);
  if (existing) existing.qty += 1;
  else cart.push({id, name, price, image, size, qty: 1});
  saveCart();
  openCart();
  renderCart();
}

// Remove / change qty
function changeQty(id, size, delta) {
  const item = cart.find(i => i.id === id && i.size === size);
  if (!item) return;
  item.qty += delta;
  if (item.qty <= 0) cart = cart.filter(i => !(i.id === id && i.size === size));
  saveCart();
  renderCart();
}

// Render cart
function renderCart() {
  const wrap = document.getElementById("cart-items");
  wrap.innerHTML = "";
  let total = 0;
  cart.forEach(i => {
    total += i.price * i.qty;
    const div = document.createElement("div");
    div.className = "cart-item";
    div.innerHTML = `
      <img src="${i.image}" alt="${i.name}">
      <div>
        <h4>${i.name}</h4>
        <div class="meta">Größe/Variante: ${i.size}</div>
        <div class="meta">${formatEUR(i.price)}</div>
      </div>
      <div class="qty">
        <button aria-label="Menge verringern">-</button>
        <div>${i.qty}</div>
        <button aria-label="Menge erhöhen">+</button>
      </div>
    `;
    const [minus, plus] = div.querySelectorAll("button");
    minus.addEventListener("click", () => changeQty(i.id, i.size, -1));
    plus.addEventListener("click", () => changeQty(i.id, i.size, +1));
    wrap.appendChild(div);
  });
  document.getElementById("cart-total").textContent = formatEUR(total);
}

// Drawer open/close
const drawer = document.getElementById("cart-drawer");
const overlay = document.getElementById("overlay");
function openCart(){ drawer.classList.add("open"); overlay.classList.add("open"); drawer.setAttribute("aria-hidden","false"); }
function closeCart(){ drawer.classList.remove("open"); overlay.classList.remove("open"); drawer.setAttribute("aria-hidden","true"); }
document.querySelector(".cart-button").addEventListener("click", openCart);
document.getElementById("close-cart").addEventListener("click", closeCart);
overlay.addEventListener("click", closeCart);
document.getElementById("clear-cart").addEventListener("click", ()=>{
  cart = []; saveCart(); renderCart();
});

// Bind product cards
document.querySelectorAll(".product-card").forEach(card => {
  const btn = card.querySelector(".add-to-cart");
  btn.addEventListener("click", () => {
    const id = card.dataset.id;
    const name = card.dataset.name;
    const price = parseFloat(card.dataset.price);
    const image = card.dataset.image;
    const sizeEl = card.querySelector(".size-select");
    const size = sizeEl ? sizeEl.value : "Standard";
    addToCart({id, name, price, image, size});
  });
});

// Checkout via mailto (simple for GitHub Pages)
document.getElementById("checkout-button").addEventListener("click", () => {
  if (cart.length === 0) { alert("Dein Warenkorb ist leer."); return; }
  const lines = cart.map(i => `${i.qty}x ${i.name} (${i.size}) – ${formatEUR(i.price)} = ${formatEUR(i.price*i.qty)}`);
  const total = cart.reduce((a,i)=>a+i.price*i.qty,0);
  const body = encodeURIComponent(`Bestellung:\n\n${lines.join("\n")}\n\nSumme: ${formatEUR(total)}\n\nLieferadresse:\n`);
  const mail = `mailto:?subject=${encodeURIComponent("Sevi & Lenni Merch Bestellung")}&body=${body}`;
  window.location.href = mail;
});

// Swipe/tap gallery for bottle
document.querySelectorAll(".swipe-gallery").forEach(g => {
  const imgs = Array.from(g.querySelectorAll("img"));
  let index = 0;
  function show(i){ imgs.forEach(im=>im.classList.remove("active")); imgs[i].classList.add("active"); }
  const next = () => { index = (index + 1) % imgs.length; show(index); };
  const prev = () => { index = (index - 1 + imgs.length) % imgs.length; show(index); };

  let startX = 0; let touching = false;
  g.addEventListener("pointerdown", (e)=>{ touching=true; startX=e.clientX; });
  g.addEventListener("pointerup", (e)=>{ 
    if(!touching) return; 
    const dx=e.clientX-startX; 
    if (Math.abs(dx) > 30) { dx<0?next():prev(); } else { next(); } 
    touching=false; 
  });
  g.addEventListener("pointerleave", ()=> touching=false);
});

// Generate Product structured data
(function(){
  const products = Array.from(document.querySelectorAll(".product-card"));
  const data = products.map(p => ({
    "@context":"https://schema.org",
    "@type":"Product",
    "name": p.dataset.name,
    "image": p.dataset.image,
    "offers": {
      "@type":"Offer",
      "priceCurrency":"EUR",
      "price": p.dataset.price,
      "availability": "https://schema.org/InStock"
    }
  }));
  const script = document.createElement("script");
  script.type = "application/ld+json";
  script.textContent = JSON.stringify(data);
  document.head.appendChild(script);
})();

// Init
updateCartBadge();
renderCart();
