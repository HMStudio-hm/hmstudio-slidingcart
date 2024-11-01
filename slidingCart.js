// src/scripts/slidingCart.js v1.0.9
// HMStudio Sliding Cart Feature
// Created by HMStudio

(function() {
    console.log('Sliding Cart script initialized');
  
    class SlidingCart {
      constructor() {
        this.isOpen = false;
        this.currentLanguage = document.documentElement.lang || 'ar';
        this.initialize();
      }
  
      initialize() {
        // Create template container if it doesn't exist
        if (!document.querySelector('.template_for_cart_products_list')) {
          const tempTemplate = document.createElement('div');
          tempTemplate.className = 'template_for_cart_products_list';
          tempTemplate.style.display = 'none';
          document.body.appendChild(tempTemplate);
        }
  
        // Create container for cart scripts
        if (!document.querySelector('#cart-view-scripts')) {
          const scriptsContainer = document.createElement('div');
          scriptsContainer.id = 'cart-view-scripts';
          document.body.appendChild(scriptsContainer);
        }
  
        this.addStyles();
        this.createCartStructure();
        this.setupCartIconListener();
        this.setupCartUpdateListener();
      }
  
      addStyles() {
        const styles = `
          .hmstudio-sliding-cart {
            font-family: inherit;
          }
          .hmstudio-cart-items {
            padding: 15px;
          }
          .cart-product-row {
            display: flex;
            align-items: center;
            padding: 15px;
            border-bottom: 1px solid #eee;
          }
          .cart-product-image {
            width: 80px;
            margin-right: 15px;
          }
          .cart-product-image img {
            width: 100%;
            height: auto;
            border-radius: 4px;
          }
          .cart-product-details {
            flex: 1;
          }
          .cart-product-name {
            font-weight: bold;
            color: #333;
            text-decoration: none;
            margin-bottom: 5px;
            display: block;
          }
          .cart-product-price {
            color: #666;
            margin-bottom: 10px;
          }
          .cart-product-quantity-dropdown select {
            padding: 5px;
            border: 1px solid #ddd;
            border-radius: 4px;
            margin-right: 10px;
          }
          .cart-product-delete a {
            color: #ff4444;
            text-decoration: none;
          }
          .hmstudio-cart-empty {
            text-align: center;
            padding: 30px 0;
          }
          .hmstudio-cart-footer {
            background: #f9f9f9;
            padding: 15px;
            margin-top: auto;
          }
          .cart__total-list {
            margin-bottom: 15px;
          }
          .cart__total-item, .cart__total-item--total {
            display: flex;
            justify-content: space-between;
            padding: 5px 0;
          }
          .cart__total-item--total {
            font-weight: bold;
            border-top: 1px solid #ddd;
            margin-top: 5px;
            padding-top: 10px;
          }
          .hmstudio-checkout-button {
            background: #000;
            color: #fff !important;
            padding: 12px;
            text-align: center;
            border-radius: 4px;
            text-decoration: none;
            display: block;
            margin-top: 15px;
          }
          .hmstudio-view-cart-button {
            background: #f0f0f0;
            color: #333 !important;
            padding: 12px;
            text-align: center;
            border-radius: 4px;
            text-decoration: none;
            display: block;
            margin-top: 10px;
          }
        `;
  
        const styleSheet = document.createElement('style');
        styleSheet.textContent = styles;
        document.head.appendChild(styleSheet);
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
            direction: ${this.currentLanguage === 'ar' ? 'rtl' : 'ltr'};
          ">
            <div style="
              padding: 20px;
              border-bottom: 1px solid #eee;
              display: flex;
              justify-content: space-between;
              align-items: center;
            ">
              <h3 style="margin: 0;">${this.currentLanguage === 'ar' ? 'سلة التسوق' : 'Shopping Cart'}</h3>
              <button onclick="this.closest('#hmstudio-sliding-cart').style.${direction}='-400px';document.getElementById('hmstudio-sliding-cart-overlay').style.display='none'" style="
                border: none;
                background: none;
                font-size: 24px;
                cursor: pointer;
                padding: 5px;
              ">×</button>
            </div>
            
            <div style="flex-grow: 1; overflow-y: auto;" class="hmstudio-cart-items">
              <div class="template_for_cart_products_list"></div>
            </div>
            
            <div class="hmstudio-cart-footer">
              <div class="cart__total-list"></div>
              <div>
                <a href="/checkout" class="hmstudio-checkout-button">
                  ${this.currentLanguage === 'ar' ? 'إتمام الطلب' : 'Checkout'}
                </a>
                <a href="/cart/view" class="hmstudio-view-cart-button">
                  ${this.currentLanguage === 'ar' ? 'عرض السلة' : 'View Cart'}
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
            z-index: 9998;
          "></div>
        `;
  
        document.body.insertAdjacentHTML('beforeend', cartHTML);
      }
  
      setupCartIconListener() {
        document.addEventListener('click', (e) => {
          if (e.target.closest('.cart-icon, .header-cart-icon, [data-cart-icon], a-shopping-cart, .a-shopping-cart')) {
            e.preventDefault();
            this.openCart();
          }
        });
      }
  
      setupCartUpdateListener() {
        // Store original function
        const originalCartProductsHtmlChanged = window.cartProductsHtmlChanged || function() {};
        
        // Override the function
        window.cartProductsHtmlChanged = (html, cart) => {
          // Call original handler
          originalCartProductsHtmlChanged(html, cart);
          
          console.log('Cart updated:', cart);
          
          // Update sliding cart template
          const slidingCartTemplate = document.querySelector('#hmstudio-sliding-cart .template_for_cart_products_list');
          if (slidingCartTemplate) {
            slidingCartTemplate.innerHTML = html || '';
          }
  
          // Update totals
          if (cart && cart.totals) {
            const totalsList = document.querySelector('#hmstudio-sliding-cart .cart__total-list');
            if (totalsList) {
              let totalsHtml = '';
              cart.totals.forEach(total => {
                totalsHtml += `
                  <div class="cart__total-item${total.code === 'total' ? '--total' : ''}">
                    <div>${total.title}</div>
                    <div>${total.value_string}</div>
                  </div>
                `;
              });
              totalsList.innerHTML = totalsHtml;
            }
          }
  
          // Show/hide cart based on products count
          if (cart) {
            const emptyMessage = this.currentLanguage === 'ar' ? 'السلة فارغة' : 'Your cart is empty';
            const cartItems = document.querySelector('#hmstudio-sliding-cart .hmstudio-cart-items');
            
            if (cart.products_count <= 0) {
              cartItems.innerHTML = `
                <div class="hmstudio-cart-empty">
                  <p>${emptyMessage}</p>
                </div>
              `;
            }
          }
        };
      }
  
      openCart() {
        const cart = document.getElementById('hmstudio-sliding-cart');
        const overlay = document.getElementById('hmstudio-sliding-cart-overlay');
        const direction = this.currentLanguage === 'ar' ? 'right' : 'left';
        
        if (cart && overlay) {
          // Show cart and overlay
          cart.style[direction] = '0';
          overlay.style.display = 'block';
          
          // Get current cart HTML from main cart if it exists
          const mainCartTemplate = document.querySelector('.template_for_cart_products_list');
          const slidingCartTemplate = cart.querySelector('.template_for_cart_products_list');
          
          if (mainCartTemplate && slidingCartTemplate) {
            slidingCartTemplate.innerHTML = mainCartTemplate.innerHTML;
          }
        }
      }
    }
  
    // Initialize sliding cart
    const slidingCart = new SlidingCart();
  })();
