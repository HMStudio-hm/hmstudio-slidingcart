// src/scripts/slidingCart.js v1.2.3
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
  
      setupZidCartIntegration() {
        // Store original cart functions
        const originalCartProductsHtmlChanged = window.cartProductsHtmlChanged || function() {};
        const originalUpdateCartProducts = window.updateCartProducts || function() {};
  
        // Override cart update function
        window.cartProductsHtmlChanged = (html, cart) => {
          // Call original function
          originalCartProductsHtmlChanged(html, cart);
  
          console.log('Cart updated:', { html: !!html, productsCount: cart?.products_count });
  
          // Update sliding cart content
          const slidingCartList = document.querySelector('#hmstudio-sliding-cart .template_for_cart_products_list');
          const mainCartList = document.querySelector('.cart_page .template_for_cart_products_list');
  
          if (mainCartList && slidingCartList) {
            slidingCartList.innerHTML = mainCartList.innerHTML;
          }
  
          // Update totals
          if (cart?.totals) {
            const totalsContainer = document.querySelector('#hmstudio-sliding-cart .cart__total-list');
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
  
          // Update cart state
          this.updateCartState(cart?.products_count > 0);
        };
  
        // Listen for add to cart events
        document.addEventListener('click', async (e) => {
          const addToCartBtn = e.target.closest('.add-to-cart-btn, .product-card-add-to-cart');
          if (addToCartBtn) {
            console.log('Product being added to cart');
            setTimeout(() => {
              const mainCartList = document.querySelector('.cart_page .template_for_cart_products_list');
              const slidingCartList = document.querySelector('#hmstudio-sliding-cart .template_for_cart_products_list');
              if (mainCartList && slidingCartList) {
                slidingCartList.innerHTML = mainCartList.innerHTML;
              }
            }, 1000);
          }
        });
  
        // Hook into Zid's cart badge update
        window.updateCartProducts = (...args) => {
          originalUpdateCartProducts.apply(this, args);
          console.log('Cart badge updated');
          this.syncWithMainCart();
        };
  
        // Initial sync
        this.syncWithMainCart();
      }
  
      syncWithMainCart() {
        console.log('Syncing with main cart...');
        const mainCartList = document.querySelector('.cart_page .template_for_cart_products_list');
        const slidingCartList = document.querySelector('#hmstudio-sliding-cart .template_for_cart_products_list');
        
        if (mainCartList && slidingCartList) {
          slidingCartList.innerHTML = mainCartList.innerHTML;
          // Get cart count from badge
          const cartBadge = document.querySelector('.cart-icon .badge, .header-cart-icon .badge');
          const hasProducts = cartBadge && parseInt(cartBadge.textContent) > 0;
          this.updateCartState(hasProducts);
        }
      }
  
      updateCartState(hasProducts) {
        const slidingCart = document.getElementById('hmstudio-sliding-cart');
        if (!slidingCart) return;
  
        const emptyCart = slidingCart.querySelector('.cart__empty');
        const cartContent = slidingCart.querySelector('.cart.cart_page');
  
        if (hasProducts) {
          if (emptyCart) emptyCart.style.display = 'none';
          if (cartContent) cartContent.style.display = 'flex';
        } else {
          if (emptyCart) emptyCart.style.display = 'flex';
          if (cartContent) cartContent.style.display = 'none';
        }
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
            <!-- Empty cart state -->
            <div class="cart__empty mt-5" style="display: none; padding: 20px; text-align: center;">
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
  
            <!-- Cart content -->
            <div class="cart cart_page mt-5">
              <div class="cart__items-container">
                <h1 class="section-title mb-5">
                  ${this.currentLanguage === 'ar' ? 'المنتجات' : 'Products'}
                </h1>
                <div class="cart__items">
                  <div class="template_for_cart_products_list">
                    <!-- Cart content will be injected here -->
                  </div>
                </div>
              </div>
  
              <div class="cart__side-col">
                <div class="cart__total-container">
                  <ul class="cart__total-list">
                    <!-- Totals will be injected here -->
                  </ul>
                  <div class="mt-4">
                    <a href="/cart/view" class="no-btn-style common-btn w-full block text-center">
                      ${this.currentLanguage === 'ar' ? 'عرض السلة' : 'View Cart'}
                    </a>
                  </div>
                </div>
              </div>
            </div>
  
            <!-- Close button -->
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
          // Sync cart content before opening
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
  
    // Initialize after Zid's scripts are loaded
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => new SlidingCart());
    } else {
      new SlidingCart();
    }
  })();
