// src/scripts/slidingCart.js v1.2.2
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
        this.setupCartListeners();
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
            <button class="sliding-cart-close" style="
              position: absolute;
              top: 10px;
              ${this.currentLanguage === 'ar' ? 'left' : 'right'}: 10px;
              border: none;
              background: none;
              font-size: 24px;
              cursor: pointer;
              padding: 5px;
              z-index: 1;
            ">×</button>
  
            <div class="cart__empty mt-5" style="display: none;">
              <div class="cart__empty-icon">
                <img loading="lazy" src="/assets/images/shopping-bag-empty.gif" alt="empty_cart" width="150" height="150">
              </div>
              <h1 class="cart__empty-text my-5">
                ${this.currentLanguage === 'ar' ? 'السلة فارغة' : 'Cart is empty'}
              </h1>
              <a href="/" class="no-btn-style common-btn cart__empty-btn mt-5">
                ${this.currentLanguage === 'ar' ? 'العودة للتسوق' : 'Continue Shopping'}
              </a>
            </div>
  
            <div class="cart cart_page mt-5">
              <div class="cart__items-container">
                <h1 class="section-title mb-5">
                  ${this.currentLanguage === 'ar' ? 'المنتجات' : 'Products'}
                </h1>
                <div class="header-wrapper">
                  <div class="section-cart-products-row d-flex mb-3">
                    <div class="section-cart-products-col-1"></div>
                    <div class="section-cart-products-col-2 flex-grow-1">
                      ${this.currentLanguage === 'ar' ? 'المنتج' : 'Product'}
                    </div>
                    <div class="section-cart-products-col-3">
                      ${this.currentLanguage === 'ar' ? 'الكمية' : 'Quantity'}
                    </div>
                    <div class="section-cart-products-col-4">
                      ${this.currentLanguage === 'ar' ? 'السعر' : 'Price'}
                    </div>
                  </div>
                </div>
                <div class="cart__items">
                  <div class="template_for_cart_products_list">
                    <!-- Cart content will be injected here by Zid -->
                  </div>
                </div>
              </div>
              <div class="cart__side-col">
                <div class="cart__total-container">
                  <h3 class="cart__total-title">
                    ${this.currentLanguage === 'ar' ? 'ملخص الطلب' : 'Order Summary'}
                  </h3>
                  <ul class="cart__total-list">
                    <!-- Totals will be injected here -->
                  </ul>
                  <div class="cart-discount-rule-wrapper free-shipping-rule-section mt-5 d-none">
                    <!-- Shipping rules will be populated by Zid -->
                  </div>
                  <a href="/cart/view" class="no-btn-style common-btn cart__total-checkout mt-4">
                    ${this.currentLanguage === 'ar' ? 'عرض السلة' : 'View Cart'}
                  </a>
                </div>
                <a href="/" class="no-btn-style cart__total-coutinue">
                  ${this.currentLanguage === 'ar' ? 'متابعة التسوق' : 'Continue Shopping'}
                </a>
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
  
        document.body.insertAdjacentHTML('beforeend', cartPanel);
  
        const closeBtn = document.querySelector('.sliding-cart-close');
        const overlay = document.getElementById('hmstudio-sliding-cart-overlay');
        
        closeBtn?.addEventListener('click', () => this.closeCart());
        overlay?.addEventListener('click', () => this.closeCart());
      }
  
      setupCartListeners() {
        // Store the original function
        const originalCartProductsHtmlChanged = window.cartProductsHtmlChanged;
  
        // Override with our version
        window.cartProductsHtmlChanged = (html, cart) => {
          console.log('Cart updated:', cart);
  
          // Call original function if it exists
          if (typeof originalCartProductsHtmlChanged === 'function') {
            originalCartProductsHtmlChanged(html, cart);
          }
  
          // Update our sliding cart
          const slidingCart = document.querySelector('#hmstudio-sliding-cart');
          if (!slidingCart) return;
  
          if (cart.products_count <= 0) {
            slidingCart.querySelector('.cart__empty').style.display = 'flex';
            slidingCart.querySelector('.cart.cart_page').style.display = 'none';
          } else {
            slidingCart.querySelector('.cart__empty').style.display = 'none';
            slidingCart.querySelector('.cart.cart_page').style.display = 'flex';
          }
  
          // Update products list
          const productsContainer = slidingCart.querySelector('.template_for_cart_products_list');
          if (productsContainer) {
            productsContainer.innerHTML = html;
          }
  
          // Update totals
          if (cart && cart.totals) {
            const totalsContainer = slidingCart.querySelector('.cart__total-list');
            if (totalsContainer) {
              let strCartTotals = '';
              cart.totals.forEach(cartTotal => {
                const totalClass = cartTotal.code === 'total' ? 'cart__total-item--total' : 'cart__total-item';
                strCartTotals += `
                  <li class="${totalClass}">
                    <p>${cartTotal.title}</p>
                    <p>${cartTotal.value_string}</p>
                  </li>
                `;
              });
              totalsContainer.innerHTML = strCartTotals;
            }
          }
  
          // Update shipping rules
          const shippingRuleSection = slidingCart.querySelector('.free-shipping-rule-section');
          if (shippingRuleSection) {
            if (cart.fee_shipping_discount_rules) {
              shippingRuleSection.classList.remove('d-none');
              const messageEl = shippingRuleSection.querySelector('.free-shipping-rule-message');
              if (messageEl) {
                messageEl.innerHTML = cart.fee_shipping_discount_rules.conditions_subtotal.status.message;
              }
              const doneIcon = shippingRuleSection.querySelector('.free-shipping-rule-done');
              if (doneIcon) {
                if (cart.fee_shipping_discount_rules.conditions_subtotal.status.code === 'applied') {
                  doneIcon.classList.remove('d-none');
                } else {
                  doneIcon.classList.add('d-none');
                }
              }
            } else {
              shippingRuleSection.classList.add('d-none');
            }
          }
  
          // Bind delete and quantity change events
          this.bindCartEvents();
        };
  
        // Get initial cart state
        this.syncWithMainCart();
      }
  
      syncWithMainCart() {
        // Get content from main cart if available
        const mainCart = document.querySelector('.template_for_cart_products_list');
        if (mainCart) {
          const slidingCartTemplate = document.querySelector('#hmstudio-sliding-cart .template_for_cart_products_list');
          if (slidingCartTemplate) {
            slidingCartTemplate.innerHTML = mainCart.innerHTML;
          }
        }
      }
  
      bindCartEvents() {
        const slidingCart = document.querySelector('#hmstudio-sliding-cart');
        if (!slidingCart) return;
  
        // Bind delete buttons
        $(slidingCart).on('click', '.cart-product-delete a', function(event) {
          event.currentTarget.querySelector('.icon-delete').style.display = 'none';
          event.currentTarget.querySelector('.prefix').style.display = 'block';
        });
  
        // Bind quantity dropdowns
        $(slidingCart).on('change', '.cart-product-quantity-dropdown select', function(event) {
          const pElm = event.currentTarget.closest('.cart-product-row');
          pElm.querySelector('.icon-delete').style.display = 'none';
          pElm.querySelector('.prefix').style.display = 'block';
        });
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
