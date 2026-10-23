const menuToggle = document.querySelector('.menu-toggle');
const siteNav = document.querySelector('.site-nav');

if (menuToggle && siteNav) {
  menuToggle.addEventListener('click', () => {
    const isOpen = menuToggle.getAttribute('aria-expanded') === 'true';
    menuToggle.setAttribute('aria-expanded', String(!isOpen));
    menuToggle.setAttribute('aria-label', isOpen ? 'Abrir menú' : 'Cerrar menú');
    siteNav.classList.toggle('is-open', !isOpen);
  });

  siteNav.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      menuToggle.setAttribute('aria-expanded', 'false');
      menuToggle.setAttribute('aria-label', 'Abrir menú');
      siteNav.classList.remove('is-open');
    });
  });
}

const contactForm = document.querySelector('#contact-form');
const formFeedback = document.querySelector('#form-feedback');

if (contactForm && formFeedback) {
  contactForm.addEventListener('submit', (event) => {
    event.preventDefault();
    if (!contactForm.reportValidity()) {
      formFeedback.textContent = 'Revisá los campos para poder enviar tu consulta.';
      return;
    }

    const formData = new FormData(contactForm);
    const message = encodeURIComponent(
      `Hola, soy ${formData.get('nombre')} (${formData.get('email')}).\n\n${formData.get('mensaje')}`,
    );
    formFeedback.textContent = 'Se abrirá WhatsApp con tu consulta lista para enviar.';
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${message}`, '_blank', 'noopener,noreferrer');
  });
}

const year = document.querySelector('#year');
if (year) year.textContent = new Date().getFullYear();

const catalog = {
  'torta-frutos': { name: 'Torta de frutos rojos', price: 28500 },
  cheesecake: { name: 'Cheesecake de vainilla', price: 26000 },
  'box-mini': { name: 'Box mini pastelería', price: 18500 },
  brownies: { name: 'Brownies de chocolate', price: 9500 },
  'lemon-pie': { name: 'Lemon pie', price: 22000 },
  cookies: { name: 'Cookies de chocolate', price: 8500 },
};
// Reemplazar por el número real con código de país, sin +, espacios ni guiones.
const WHATSAPP_NUMBER = '5491155911571';
const whatsappContact = document.querySelector('.whatsapp-contact');
if (whatsappContact) whatsappContact.href = `https://wa.me/${WHATSAPP_NUMBER}`;
const money = new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 });
const cartTrigger = document.querySelector('.cart-trigger');
const cartDrawer = document.querySelector('#cart-drawer');
const cartBackdrop = document.querySelector('#cart-backdrop');
const cartClose = document.querySelector('#cart-close');
const cartItems = document.querySelector('#cart-items');
const cartEmpty = document.querySelector('#cart-empty');
const cartFooter = document.querySelector('#cart-footer');
const cartCount = document.querySelector('#cart-count');
const cartTitleCount = document.querySelector('#cart-title-count');
const cartSubtotal = document.querySelector('#cart-subtotal');
const checkoutButton = document.querySelector('#checkout-button');
const continueShopping = document.querySelector('#continue-shopping');
let cart = {};

try {
  cart = JSON.parse(localStorage.getItem('dulce-atelier-cart') || '{}');
  if (!cart || typeof cart !== 'object' || Array.isArray(cart)) cart = {};
} catch {
  cart = {};
}

function renderCart() {
  const entries = Object.entries(cart).filter(([id, quantity]) => catalog[id] && Number.isInteger(quantity) && quantity > 0);
  cartItems.replaceChildren();
  const totalItems = entries.reduce((sum, [, quantity]) => sum + quantity, 0);
  const total = entries.reduce((sum, [id, quantity]) => sum + catalog[id].price * quantity, 0);
  cartCount.textContent = totalItems;
  cartTitleCount.textContent = `(${totalItems})`;
  cartTrigger.setAttribute('aria-label', `Abrir carrito, ${totalItems} productos`);
  cartEmpty.hidden = totalItems > 0;
  cartFooter.hidden = totalItems === 0;

  entries.forEach(([id, quantity]) => {
    const item = catalog[id];
    const row = document.createElement('article');
    row.className = 'cart-item';
    const details = document.createElement('div');
    details.className = 'cart-item-details';
    const title = document.createElement('h3');
    title.textContent = item.name;
    const price = document.createElement('p');
    price.textContent = money.format(item.price * quantity);
    details.append(title, price);
    const controls = document.createElement('div');
    controls.className = 'quantity-controls';
    controls.setAttribute('aria-label', `Cantidad de ${item.name}`);
    controls.innerHTML = `<button type="button" data-cart-action="decrease" data-id="${id}" aria-label="Quitar una unidad">−</button><span>${quantity}</span><button type="button" data-cart-action="increase" data-id="${id}" aria-label="Agregar una unidad">＋</button>`;
    const remove = document.createElement('button');
    remove.type = 'button';
    remove.className = 'remove-item';
    remove.dataset.cartAction = 'remove';
    remove.dataset.id = id;
    remove.textContent = 'Quitar';
    remove.setAttribute('aria-label', `Quitar ${item.name} del carrito`);
    row.append(details, controls, remove);
    cartItems.append(row);
  });

  cartSubtotal.textContent = money.format(total);
  const orderLines = entries.map(([id, quantity]) => `${quantity} × ${catalog[id].name} — ${money.format(catalog[id].price * quantity)}`);
  const message = encodeURIComponent(`Hola, quiero hacer este pedido en Dulce Atelier:\n\n${orderLines.join('\n')}\n\nSubtotal: ${money.format(total)}\n\nNombre y dirección de entrega:`);
  checkoutButton.href = `https://wa.me/${WHATSAPP_NUMBER}?text=${message}`;
}

function saveCart() {
  localStorage.setItem('dulce-atelier-cart', JSON.stringify(cart));
  renderCart();
}

function openCart() {
  cartDrawer.inert = false;
  cartDrawer.setAttribute('aria-hidden', 'false');
  cartDrawer.classList.add('is-open');
  cartBackdrop.hidden = false;
  document.body.classList.add('cart-open');
  cartClose.focus();
}

function closeCart() {
  cartDrawer.classList.remove('is-open');
  cartDrawer.setAttribute('aria-hidden', 'true');
  cartDrawer.inert = true;
  cartBackdrop.hidden = true;
  document.body.classList.remove('cart-open');
  cartTrigger.focus();
}

document.querySelectorAll('[data-add]').forEach((button) => {
  button.addEventListener('click', () => {
    const id = button.dataset.add;
    cart[id] = (cart[id] || 0) + 1;
    saveCart();
    const original = button.innerHTML;
    button.innerHTML = 'Agregado <span aria-hidden="true">✓</span>';
    window.setTimeout(() => { button.innerHTML = original; }, 1100);
  });
});

cartItems.addEventListener('click', (event) => {
  const button = event.target.closest('[data-cart-action]');
  if (!button) return;
  const { id, cartAction } = button.dataset;
  if (cartAction === 'increase') cart[id] = (cart[id] || 0) + 1;
  if (cartAction === 'decrease') cart[id] = (cart[id] || 0) - 1;
  if (cartAction === 'remove' || cart[id] <= 0) delete cart[id];
  saveCart();
});

cartTrigger.addEventListener('click', openCart);
cartClose.addEventListener('click', closeCart);
cartBackdrop.addEventListener('click', closeCart);
continueShopping.addEventListener('click', closeCart);
checkoutButton.addEventListener('click', () => {
  const confirmation = document.createElement('p');
  confirmation.className = 'checkout-feedback';
  confirmation.setAttribute('role', 'status');
  confirmation.textContent = 'Se abrirá WhatsApp con el detalle del pedido listo para enviar.';
  cartFooter.querySelector('.checkout-feedback')?.remove();
  cartFooter.append(confirmation);
});
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && cartDrawer.classList.contains('is-open')) closeCart();
});

renderCart();
