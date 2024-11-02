// src/scripts/slidingCart.js v1.2.4
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
        this.setupZidCartIntegration();
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
  
            <!-- Using exact Zid cart structure -->
            <div class="cart-view">
              <div class="row cart-products-with-totals">
                <div class="col-12 col-lg-8">
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
                        <!-- Cart products will be injected here -->
                      </div>
                    </div>
                  </div>
                </div>
                <div class="col-12 col-lg-4">
                  <div class="cart__total-container">
                    <h3 class="cart__total-title">
                      ${this.currentLanguage === 'ar' ? 'ملخص الطلب' : 'Order Summary'}
                    </h3>
                    <ul class="cart__total-list">
                      <!-- Totals will be injected here -->
                    </ul>
                    <div class="cart-discount-rule-wrapper free-shipping-rule-section mt-5 d-none">
                      <div class="d-flex align-items-center justify-content-between">
                        <div class="message flex-grow-1 free-shipping-rule-message"></div>
                        <div class="cart-discount-icon free-shipping-rule-done flex-shrink-0 d-none"></div>
                      </div>
                    </div>
                    <a href="/cart/view" class="no-btn-style common-btn mt-4">
                      ${this.currentLanguage === 'ar' ? 'عرض السلة' : 'View Cart'}
                    </a>
                  </div>
                </div>
              </div>
              <div class="cart-empty pt-5 pbb-5 d-none">
                <div class="cart__empty-icon">
                  <img loading="lazy" src="/assets/images/shopping-bag-empty.gif" alt="empty_cart" width="150" height="150">
                </div>
                <h1 class="cart__empty-text my-5">
                  ${this.currentLanguage === 'ar' ? 'السلة فارغة' : 'Cart is empty'}
                </h1>
                <a href="/" class="no-btn-style common-btn cart__empty-btn mt-5">
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
  
      setupZidCartIntegration() {
        // Store original cart update function
        const originalCartProductsHtmlChanged = window.cartProductsHtmlChanged || function() {};
  
        // Override with our version
        window.cartProductsHtmlChanged = (html, cart) => {
          console.log('Cart updated:', { html: !!html, productsCount: cart?.products_count });
          
          // Call original function first
          originalCartProductsHtmlChanged(html, cart);
  
          // Update sliding cart content
          const slidingCart = document.querySelector('#hmstudio-sliding-cart');
          if (!slidingCart) return;
  
          // Update products list
          const cartProductsList = slidingCart.querySelector('.template_for_cart_products_list');
          if (cartProductsList) {
            cartProductsList.innerHTML = html;
          }
  
          // Update empty state visibility
          const emptyCart = slidingCart.querySelector('.cart-empty');
          const productsContainer = slidingCart.querySelector('.cart-products-with-totals');
  
          if (cart.products_count <= 0) {
            if (emptyCart) emptyCart.classList.remove('d-none');
            if (productsContainer) productsContainer.classList.add('d-none');
          } else {
            if (emptyCart) emptyCart.classList.add('d-none');
            if (productsContainer) productsContainer.classList.remove('d-none');
          }
  
          // Update totals
          if (cart?.totals) {
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
          if (cart.fee_shipping_discount_rules) {
            const ruleSection = slidingCart.querySelector('.free-shipping-rule-section');
            const ruleMessage = slidingCart.querySelector('.free-shipping-rule-message');
            const ruleDone = slidingCart.querySelector('.free-shipping-rule-done');
  
            if (ruleSection) ruleSection.classList.remove('d-none');
            if (ruleMessage) {
              ruleMessage.innerHTML = cart.fee_shipping_discount_rules.conditions_subtotal.status.message;
            }
            if (ruleDone) {
              if (cart.fee_shipping_discount_rules.conditions_subtotal.status.code === 'applied') {
                ruleDone.classList.remove('d-none');
              } else {
                ruleDone.classList.add('d-none');
              }
            }
          }
  
          // Bind events to new content
          this.bindCartEvents(slidingCart);
        };
  
        // Initial sync if on cart page
        this.syncWithMainCart();
  
        // Listen for cart badge updates
        const originalUpdateCartProducts = window.updateCartProducts || function() {};
        window.updateCartProducts = (...args) => {
          originalUpdateCartProducts.apply(this, args);
          this.syncWithMainCart();
        };
      }
  
      syncWithMainCart() {
        const mainCartView = document.querySelector('.cart-view');
        const slidingCart = document.querySelector('#hmstudio-sliding-cart');
        
        if (mainCartView && slidingCart) {
          // Get cart products
          const mainProducts = mainCartView.querySelector('.template_for_cart_products_list');
          const slidingProducts = slidingCart.querySelector('.template_for_cart_products_list');
          if (mainProducts && slidingProducts) {
            slidingProducts.innerHTML = mainProducts.innerHTML;
          }
  
          // Get cart totals
          const mainTotals = mainCartView.querySelector('.cart__total-list');
          const slidingTotals = slidingCart.querySelector('.cart__total-list');
          if (mainTotals && slidingTotals) {
            slidingTotals.innerHTML = mainTotals.innerHTML;
          }
  
          // Update empty state
          const cartBadge = document.querySelector('.cart-icon .badge, .header-cart-icon .badge');
          const hasProducts = cartBadge && parseInt(cartBadge.textContent) > 0;
          
          const emptyCart = slidingCart.querySelector('.cart-empty');
          const productsContainer = slidingCart.querySelector('.cart-products-with-totals');
  
          if (hasProducts) {
            if (emptyCart) emptyCart.classList.add('d-none');
            if (productsContainer) productsContainer.classList.remove('d-none');
          } else {
            if (emptyCart) emptyCart.classList.remove('d-none');
            if (productsContainer) productsContainer.classList.add('d-none');
          }
        }
      }
  
      bindCartEvents(cart) {
        // Handle quantity changes
        cart.querySelectorAll('.cart-product-quantity-dropdown select').forEach(select => {
          select.addEventListener('change', (e) => {
            const row = e.target.closest('.cart-product-row');
            if (row) {
              row.querySelector('.icon-delete').style.display = 'none';
              row.querySelector('.prefix').style.display = 'block';
            }
          });
        });
  
        // Handle delete buttons
        cart.querySelectorAll('.cart-product-delete a').forEach(button => {
          button.addEventListener('click', (e) => {
            const deleteIcon = button.querySelector('.icon-delete');
            const prefix = button.querySelector('.prefix');
            if (deleteIcon) deleteIcon.style.display = 'none';
            if (prefix) prefix.style.display = 'block';
          });
        });
      }
  
      bindCartIconClick() {
        const cartIcons = document.querySelectorAll('.cart-icon, .header-cart-icon, [data-cart-icon], .a-shopping-cart, .a-shopping-cart');
        
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
          this.syncWithMainCart();
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
  
    // Initialize once DOM is fully loaded
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => new SlidingCart());
    } else {
      new SlidingCart();
    }
  })();
