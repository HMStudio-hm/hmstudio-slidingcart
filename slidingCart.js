// src/scripts/slidingCart.js v1.2.0
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
        this.setupCartUpdateListener();
      }
  
      injectCartPanel() {
        const direction = this.currentLanguage === 'ar' ? 'right' : 'left';
        
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
            <div class="cart-view">
              <div class="row cart-products-with-totals">
                <div class="col-12 col-lg-8">
                  <div class="section-cart-products">
                    <h2 class="section-title">المنتجات</h2>
                    <div class="header-wrapper">
                      <div class="section-cart-products-row d-flex">
                        <!-- Header content will be populated by Zid -->
                      </div>
                    </div>
                    <div class="template_for_cart_products_list">
                      <div class="cart-product-row-wrapper">
                        <!-- Cart products will be populated by Zid -->
                      </div>
                    </div>
                  </div>
                </div>
                
                <div class="col-12 col-lg-4">
                  <h2 class="section-title">تفاصيل الفاتورة</h2>
                  <div class="header-wrapper"></div>
                  <div class="cart-totals-div">
                    <!-- Totals will be populated by Zid -->
                  </div>
                  <div class="coupon-form mt-5">
                    <!-- Coupon form will be populated by Zid -->
                  </div>
                  <div class="cart-discount-rule-wrapper free-shipping-rule-section mt-5 d-none">
                    <!-- Shipping rules will be populated by Zid -->
                  </div>
                </div>
              </div>
  
              <div class="cart-empty pt-5 pbb-5 d-none">
                <!-- Empty cart message will be populated by Zid -->
              </div>
            </div>
  
            <button class="sliding-cart-close" style="
              position: absolute;
              top: 10px;
              ${this.currentLanguage === 'ar' ? 'left' : 'right'}: 10px;
              border: none;
              background: none;
              font-size: 24px;
              cursor: pointer;
              padding: 5px;
              z-index: 999999;
            ">×</button>
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
        const closeBtn = document.querySelector('.sliding-cart-close');
        const overlay = document.getElementById('hmstudio-sliding-cart-overlay');
        
        closeBtn?.addEventListener('click', () => this.closeCart());
        overlay?.addEventListener('click', () => this.closeCart());
      }
  
      setupCartUpdateListener() {
        // Store original function
        const originalCartProductsHtmlChanged = window.cartProductsHtmlChanged || function() {};
  
        // Override with our version
        window.cartProductsHtmlChanged = (html, cart) => {
          console.log('Cart updated:', { html, cart });
          
          // Call original function
          originalCartProductsHtmlChanged(html, cart);
  
          // Update our sliding cart
          const slidingCartTemplate = document.querySelector('#hmstudio-sliding-cart .template_for_cart_products_list');
          const slidingCartEmpty = document.querySelector('#hmstudio-sliding-cart .cart-empty');
          const slidingCartProducts = document.querySelector('#hmstudio-sliding-cart .cart-products-with-totals');
          const slidingCartTotals = document.querySelector('#hmstudio-sliding-cart .cart-totals-div');
  
          if (slidingCartTemplate && html) {
            slidingCartTemplate.innerHTML = html;
          }
  
          // Update empty state
          if (cart.products_count <= 0) {
            if (slidingCartEmpty) slidingCartEmpty.classList.remove('d-none');
            if (slidingCartProducts) slidingCartProducts.classList.add('d-none');
          } else {
            if (slidingCartEmpty) slidingCartEmpty.classList.add('d-none');
            if (slidingCartProducts) slidingCartProducts.classList.remove('d-none');
          }
  
          // Update totals
          if (slidingCartTotals && cart.totals) {
            const totalsHtml = cart.totals.map(total => `
              <li class="${total.code === 'total' ? 'cart__total-item--total' : 'cart__total-item'}">
                <p>${total.title}</p>
                <p>${total.value_string}</p>
              </li>
            `).join('');
            slidingCartTotals.innerHTML = totalsHtml;
          }
        };
  
        // Also sync cart on initialization if there are products
        const mainCartTemplate = document.querySelector('.template_for_cart_products_list');
        if (mainCartTemplate) {
          const slidingCartTemplate = document.querySelector('#hmstudio-sliding-cart .template_for_cart_products_list');
          if (slidingCartTemplate) {
            slidingCartTemplate.innerHTML = mainCartTemplate.innerHTML;
          }
        }
      }
  
      bindCartIconClick() {
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
