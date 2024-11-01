// src/scripts/slidingCart.js v1.0.0
// HMStudio Sliding Cart Feature
// Created by HMStudio

(function() {
    console.log('Sliding Cart script initialized');
  
    // Get store ID from script URL (same method as other features)
    function getStoreIdFromUrl() {
      const scriptTag = document.currentScript;
      const scriptUrl = new URL(scriptTag.src);
      const storeId = scriptUrl.searchParams.get('storeId');
      return storeId ? storeId.split('?')[0] : null;
    }
  
    // Get current language
    function getCurrentLanguage() {
      return document.documentElement.lang || 'ar'; // Default to Arabic if not found
    }
  
    const storeId = getStoreIdFromUrl();
    if (!storeId) {
      console.error('Store ID not found in script URL');
      return;
    }
  
    // Main sliding cart class
    class SlidingCart {
      constructor() {
        this.isOpen = false;
        this.currentLanguage = getCurrentLanguage();
        this.initialize();
      }
  
      initialize() {
        // Create the sliding cart HTML structure
        this.createCartStructure();
        // Add click handler to store's cart icon
        this.setupCartIconListener();
        // Listen for cart updates from Zid
        this.setupCartUpdateListener();
      }
  
      createCartStructure() {
        const direction = this.currentLanguage === 'ar' ? 'right' : 'left';
        
        const cartHTML = `
          <div id="hmstudio-sliding-cart" style="
            position: fixed;
            top: 0;
            ${direction}: -400px;
            width: 400px;
            height: 100vh;
            background: white;
            box-shadow: 0 0 10px rgba(0,0,0,0.1);
            transition: ${direction} 0.3s ease;
            z-index: 9999;
            display: flex;
            flex-direction: column;
          ">
            <div class="sliding-cart-header" style="
              padding: 20px;
              border-bottom: 1px solid #eee;
              display: flex;
              justify-content: space-between;
              align-items: center;
            ">
              <h3 style="margin: 0;">${this.currentLanguage === 'ar' ? 'سلة التسوق' : 'Shopping Cart'}</h3>
              <button class="sliding-cart-close" style="
                border: none;
                background: none;
                font-size: 20px;
                cursor: pointer;
                padding: 5px;
              ">×</button>
            </div>
            
            <div class="sliding-cart-content" style="
              flex-grow: 1;
              overflow-y: auto;
              padding: 20px;
            ">
              <div class="template_for_cart_products_list"></div>
            </div>
            
            <div class="sliding-cart-footer" style="
              padding: 20px;
              border-top: 1px solid #eee;
            ">
              <div class="cart__total-list"></div>
              <a href="/cart" class="no-btn-style common-btn" style="
                display: block;
                text-align: center;
                margin-top: 15px;
                padding: 10px;
                background: #000;
                color: #fff;
                text-decoration: none;
                border-radius: 4px;
              ">${this.currentLanguage === 'ar' ? 'إتمام الطلب' : 'Checkout'}</a>
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
            z-index: 9998;
          "></div>
        `;
  
        // Add the cart HTML to the page
        document.body.insertAdjacentHTML('beforeend', cartHTML);
  
        // Add event listeners
        const closeBtn = document.querySelector('.sliding-cart-close');
        const overlay = document.getElementById('hmstudio-sliding-cart-overlay');
        
        closeBtn.addEventListener('click', () => this.closeCart());
        overlay.addEventListener('click', () => this.closeCart());
      }
  
      setupCartIconListener() {
        // Find the store's cart icon
        const cartIcon = document.querySelector('.cart-icon, .header-cart-icon, a-shopping-cart, .a-shopping-cart'); // Adjust selectors based on store theme
        if (cartIcon) {
          cartIcon.addEventListener('click', (e) => {
            e.preventDefault();
            this.toggleCart();
          });
        }
      }
  
      setupCartUpdateListener() {
        // Override Zid's cartProductsHtmlChanged function while preserving original functionality
        const originalCartProductsHtmlChanged = window.cartProductsHtmlChanged || function() {};
        
        window.cartProductsHtmlChanged = (html, cart) => {
          // Call original function first
          originalCartProductsHtmlChanged(html, cart);
          
          // Update our sliding cart
          this.updateCartContent(html, cart);
        };
      }
  
      updateCartContent(html, cart) {
        // Update products list
        const productsContainer = document.querySelector('#hmstudio-sliding-cart .template_for_cart_products_list');
        if (productsContainer) {
          productsContainer.innerHTML = html;
        }
  
        // Update totals
        if (cart && cart.totals) {
          const totalsContainer = document.querySelector('#hmstudio-sliding-cart .cart__total-list');
          if (totalsContainer) {
            let totalsHTML = '';
            cart.totals.forEach(total => {
              const totalClass = total.code === 'total' ? 'cart__total-item--total' : 'cart__total-item';
              totalsHTML += `
                <div class="${totalClass}" style="
                  display: flex;
                  justify-content: space-between;
                  margin-bottom: 10px;
                  ${total.code === 'total' ? 'font-weight: bold;' : ''}
                ">
                  <span>${total.title}</span>
                  <span>${total.value_string}</span>
                </div>
              `;
            });
            totalsContainer.innerHTML = totalsHTML;
          }
        }
      }
  
      openCart() {
        const cart = document.getElementById('hmstudio-sliding-cart');
        const overlay = document.getElementById('hmstudio-sliding-cart-overlay');
        const direction = this.currentLanguage === 'ar' ? 'right' : 'left';
        
        cart.style[direction] = '0';
        overlay.style.display = 'block';
        this.isOpen = true;
      }
  
      closeCart() {
        const cart = document.getElementById('hmstudio-sliding-cart');
        const overlay = document.getElementById('hmstudio-sliding-cart-overlay');
        const direction = this.currentLanguage === 'ar' ? 'right' : 'left';
        
        cart.style[direction] = '-400px';
        overlay.style.display = 'none';
        this.isOpen = false;
      }
  
      toggleCart() {
        if (this.isOpen) {
          this.closeCart();
        } else {
          this.openCart();
        }
      }
    }
  
    // Initialize sliding cart
    const slidingCart = new SlidingCart();
  })();
