// src/scripts/slidingCart.js v1.1.9
// HMStudio Sliding Cart Feature
// Created by HMStudio

(function() {
    console.log('Sliding Cart script initialized');
  
    class SlidingCart {
      constructor() {
        this.currentLanguage = document.documentElement.lang || 'ar';
        this.isOpen = false;
        this.initialize();
      }
  
      initialize() {
        console.log('Initializing sliding cart...');
        this.injectCartPanel();
        this.bindCartIconClick();
      }
  
      injectCartPanel() {
        const direction = this.currentLanguage === 'ar' ? 'right' : 'left';
        
        // Create the sliding cart container
        const cartPanel = `
          <div id="hmstudio-sliding-cart" style="
            position: fixed;
            top: 0;
            ${direction}: -400px;
            width: 400px;
            height: 100vh;
            background: white;
            box-shadow: 0 0 10px rgba(0,0,0,0.1);
            transition: ${direction} 0.3s ease;
            z-index: 999999;
            display: flex;
            flex-direction: column;
          ">
            <!-- Use Zid's exact cart structure -->
            <div class="cart cart_page">
              <div class="cart__items-container">
                <div class="cart__empty" style="{% if cart.products_count <= 0 %}display: flex;{% endif %}">
                  <div class="cart__empty-icon">
                    <img loading="lazy" src="{{ asset_url ~ 'shopping-bag-empty.gif' }}" alt="empty_cart" width="150" height="150">
                  </div>
                  <h1 class="cart__empty-text my-5">${this.currentLanguage === 'ar' ? 'السلة فارغة' : 'Cart is empty'}</h1>
                  <a href="/" class="no-btn-style common-btn cart__empty-btn mt-5">
                    ${this.currentLanguage === 'ar' ? 'متابعة التسوق' : 'Continue Shopping'}
                  </a>
                </div>
  
                <div class="cart__items">
                  <div class="template_for_cart_products_list">
                    <!-- Cart items will be injected here by Zid -->
                  </div>
                </div>
              </div>
  
              <div class="cart__side-col">
                <div class="cart__total-container">
                  <h3 class="cart__total-title">${this.currentLanguage === 'ar' ? 'ملخص الطلب' : 'Order Summary'}</h3>
                  <ul class="cart__total-list">
                    <!-- Totals will be injected here by Zid -->
                  </ul>
                </div>
              </div>
            </div>
          </div>
  
          <div id="hmstudio-sliding-cart-overlay" style="
            position: fixed;
            top: 0;
            left: 0;
            width: 100vw;
            height: 100vh;
            background: rgba(0,0,0,0.5);
            display: none;
            z-index: 999998;
          "></div>
        `;
  
        // Inject the cart panel
        document.body.insertAdjacentHTML('beforeend', cartPanel);
  
        // Add event listeners
        document.querySelector('.sliding-cart-close')?.addEventListener('click', () => this.closeCart());
        document.getElementById('hmstudio-sliding-cart-overlay')?.addEventListener('click', () => this.closeCart());
  
        // Set up cart update listener
        this.setupCartUpdateListener();
      }
  
      setupCartUpdateListener() {
        // Store original function
        const originalCartProductsHtmlChanged = window.cartProductsHtmlChanged || function() {};
  
        // Override with our version that updates both carts
        window.cartProductsHtmlChanged = (html, cart) => {
          // Call original function
          originalCartProductsHtmlChanged(html, cart);
  
          // Update sliding cart
          const slidingCartTemplate = document.querySelector('#hmstudio-sliding-cart .template_for_cart_products_list');
          const slidingCartTotals = document.querySelector('#hmstudio-sliding-cart .cart__total-list');
          const slidingCartEmpty = document.querySelector('#hmstudio-sliding-cart .cart__empty');
          const slidingCartItems = document.querySelector('#hmstudio-sliding-cart .cart__items');
  
          if (cart.products_count <= 0) {
            if (slidingCartEmpty) slidingCartEmpty.style.display = 'flex';
            if (slidingCartItems) slidingCartItems.style.display = 'none';
          } else {
            if (slidingCartEmpty) slidingCartEmpty.style.display = 'none';
            if (slidingCartItems) slidingCartItems.style.display = 'block';
            if (slidingCartTemplate) slidingCartTemplate.innerHTML = html;
          }
  
          // Update totals
          if (slidingCartTotals && cart.totals) {
            slidingCartTotals.innerHTML = cart.totals.map(total => `
              <li class="${total.code === 'total' ? 'cart__total-item--total' : 'cart__total-item'}">
                <p>${total.title}</p>
                <p>${total.value_string}</p>
              </li>
            `).join('');
          }
        };
      }
  
      bindCartIconClick() {
        // Find all possible cart icons
        const cartIcons = document.querySelectorAll('.cart-icon, .header-cart-icon, a-shopping-cart, .a-shopping-cart, [data-cart-icon]');
        
        cartIcons.forEach(icon => {
          icon.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            this.toggleCart();
          });
        });
      }
  
      openCart() {
        const cart = document.getElementById('hmstudio-sliding-cart');
        const overlay = document.getElementById('hmstudio-sliding-cart-overlay');
        const direction = this.currentLanguage === 'ar' ? 'right' : 'left';
        
        if (cart && overlay) {
          cart.style[direction] = '0';
          overlay.style.display = 'block';
          this.isOpen = true;
        }
      }
  
      closeCart() {
        const cart = document.getElementById('hmstudio-sliding-cart');
        const overlay = document.getElementById('hmstudio-sliding-cart-overlay');
        const direction = this.currentLanguage === 'ar' ? 'right' : 'left';
        
        if (cart && overlay) {
          cart.style[direction] = '-400px';
          overlay.style.display = 'none';
          this.isOpen = false;
        }
      }
  
      toggleCart() {
        if (this.isOpen) {
          this.closeCart();
        } else {
          this.openCart();
        }
      }
    }
  
    // Initialize the sliding cart
    const slidingCart = new SlidingCart();
  })();
