// src/scripts/slidingCart.js v1.2.1
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
        this.setupZidCartIntegration();
        this.bindCartIconClick();
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
            <div class="sliding-cart-header" style="
              padding: 15px 20px;
              border-bottom: 1px solid #eee;
              display: flex;
              justify-content: space-between;
              align-items: center;
            ">
              <h3 style="margin: 0;">${this.currentLanguage === 'ar' ? 'سلة التسوق' : 'Shopping Cart'}</h3>
              <button class="sliding-cart-close" style="
                border: none;
                background: none;
                font-size: 24px;
                cursor: pointer;
                padding: 5px;
              ">×</button>
            </div>
  
            <div class="cart__items" style="
              flex-grow: 1;
              overflow-y: auto;
              padding: 20px;
            ">
              <div class="template_for_cart_products_list">
                <!-- Cart content will be updated by Zid -->
              </div>
            </div>
  
            <div class="sliding-cart-footer" style="
              padding: 15px 20px;
              border-top: 1px solid #eee;
            ">
              <div class="cart__total-list" style="margin-bottom: 15px;"></div>
              <div class="sliding-cart-actions" style="
                display: flex;
                gap: 10px;
              ">
                <a href="/cart/view" class="view-cart-btn" style="
                  flex: 1;
                  padding: 10px;
                  text-align: center;
                  background: #f5f5f5;
                  color: #333;
                  text-decoration: none;
                  border-radius: 4px;
                ">${this.currentLanguage === 'ar' ? 'عرض السلة' : 'View Cart'}</a>
                <a href="/checkout" class="checkout-btn" style="
                  flex: 1;
                  padding: 10px;
                  text-align: center;
                  background: #000;
                  color: #fff;
                  text-decoration: none;
                  border-radius: 4px;
                ">${this.currentLanguage === 'ar' ? 'إتمام الطلب' : 'Checkout'}</a>
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
          console.log('Cart updated:', { productsCount: cart?.products_count });
  
          // Call original function
          originalCartProductsHtmlChanged(html, cart);
  
          // Update sliding cart content
          const slidingCartTemplate = document.querySelector('#hmstudio-sliding-cart .template_for_cart_products_list');
          if (slidingCartTemplate) {
            slidingCartTemplate.innerHTML = html;
          }
  
          // Update totals
          if (cart?.totals) {
            const totalsContainer = document.querySelector('#hmstudio-sliding-cart .cart__total-list');
            if (totalsContainer) {
              totalsContainer.innerHTML = cart.totals.map(total => `
                <div class="cart__total-item ${total.code === 'total' ? '--total' : ''}" style="
                  display: flex;
                  justify-content: space-between;
                  padding: 5px 0;
                ">
                  <span>${total.title}</span>
                  <span>${total.value_string}</span>
                </div>
              `).join('');
            }
          }
  
          // Update visibility of checkout button based on cart state
          const checkoutBtn = document.querySelector('#hmstudio-sliding-cart .checkout-btn');
          if (checkoutBtn) {
            checkoutBtn.style.display = cart.products_count > 0 ? 'block' : 'none';
          }
        };
  
        // Sync with main cart on initialization
        const mainCartTemplate = document.querySelector('.template_for_cart_products_list');
        const slidingCartTemplate = document.querySelector('#hmstudio-sliding-cart .template_for_cart_products_list');
        if (mainCartTemplate && slidingCartTemplate) {
          slidingCartTemplate.innerHTML = mainCartTemplate.innerHTML;
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
