// src/scripts/slidingCart.js v1.0.7
// HMStudio Sliding Cart Feature
// Created by HMStudio

(function() {
    console.log('Sliding Cart script initialized');
  
    function getStoreIdFromUrl() {
      const scriptTag = document.currentScript;
      const scriptUrl = new URL(scriptTag.src);
      const storeId = scriptUrl.searchParams.get('storeId');
      return storeId ? storeId.split('?')[0] : null;
    }
  
    function getCurrentLanguage() {
      return document.documentElement.lang || 'ar';
    }
  
    const storeId = getStoreIdFromUrl();
    if (!storeId) {
      console.error('Store ID not found in script URL');
      return;
    }
  
    class SlidingCart {
      constructor() {
        this.isOpen = false;
        this.currentLanguage = getCurrentLanguage();
        this.cartData = null;
        this.initialize();
      }
  
      initialize() {
        this.addStyles();
        this.createCartStructure();
        this.setupCartIconListener();
        this.setupCartUpdateListener();
        // Initial cart fetch
        setTimeout(() => {
          this.fetchCartData();
        }, 1000); // Delay initial fetch to ensure Zid is fully loaded
      }
  
      addStyles() {
        const styles = `
          .hmstudio-sliding-cart {
            font-family: inherit;
          }
          .hmstudio-cart-item {
            display: flex;
            gap: 15px;
            padding: 15px 0;
            border-bottom: 1px solid #eee;
          }
          .hmstudio-cart-item-image {
            width: 80px;
            height: 80px;
            flex-shrink: 0;
          }
          .hmstudio-cart-item-image img {
            width: 100%;
            height: 100%;
            object-fit: cover;
            border-radius: 4px;
          }
          .hmstudio-cart-item-details {
            flex-grow: 1;
          }
          .hmstudio-cart-item-name {
            font-weight: bold;
            color: #333;
            text-decoration: none;
            margin-bottom: 5px;
            display: block;
          }
          .hmstudio-cart-item-price {
            color: #666;
            margin-bottom: 10px;
          }
          .hmstudio-quantity-select {
            padding: 8px;
            border: 1px solid #ddd;
            border-radius: 4px;
            margin-right: 10px;
            background: white;
          }
          .hmstudio-remove-item {
            background: none !important;
            border: none !important;
            color: #ff4444 !important;
            cursor: pointer;
            padding: 5px 10px !important;
            font-size: 14px;
            transition: opacity 0.3s;
          }
          .hmstudio-remove-item:hover {
            opacity: 0.7;
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
          .hmstudio-total-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 10px;
            padding: 5px 0;
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
            transition: opacity 0.3s ease;
          }
          .hmstudio-checkout-button:hover {
            opacity: 0.9;
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
            transition: background-color 0.3s ease;
          }
          .hmstudio-view-cart-button:hover {
            background: #e5e5e5;
          }
          .hmstudio-cart-buttons {
            margin-top: 15px;
          }
          .sliding-cart-header h3 {
            font-size: 18px;
            margin: 0;
          }
          .sliding-cart-close {
            font-size: 24px !important;
            padding: 5px !important;
            cursor: pointer;
          }
        `;
  
        const styleSheet = document.createElement('style');
        styleSheet.textContent = styles;
        document.head.appendChild(styleSheet);
      }
  
      createCartStructure() {
        const direction = this.currentLanguage === 'ar' ? 'right' : 'left';
        
        const cartHTML = `
          <div id="hmstudio-sliding-cart" class="hmstudio-sliding-cart" style="
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
            <div class="sliding-cart-header" style="
              padding: 20px;
              border-bottom: 1px solid #eee;
              display: flex;
              justify-content: space-between;
              align-items: center;
            ">
              <h3>${this.currentLanguage === 'ar' ? 'سلة التسوق' : 'Shopping Cart'}</h3>
              <button class="sliding-cart-close">×</button>
            </div>
            
            <div class="sliding-cart-content" style="
              flex-grow: 1;
              overflow-y: auto;
              padding: 20px;
            ">
              <div id="hmstudio-cart-empty" class="hmstudio-cart-empty" style="display: none;">
                <p style="margin: 10px 0;">
                  ${this.currentLanguage === 'ar' ? 'السلة فارغة' : 'Your cart is empty'}
                </p>
                <a href="/" class="hmstudio-checkout-button">
                  ${this.currentLanguage === 'ar' ? 'تسوق الآن' : 'Shop Now'}
                </a>
              </div>
              
              <div id="hmstudio-cart-items"></div>
            </div>
            
            <div class="sliding-cart-footer">
              <div id="hmstudio-cart-totals"></div>
              <div class="hmstudio-cart-buttons">
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
  
        const closeBtn = document.querySelector('.sliding-cart-close');
        const overlay = document.getElementById('hmstudio-sliding-cart-overlay');
        
        closeBtn.addEventListener('click', () => this.closeCart());
        overlay.addEventListener('click', () => this.closeCart());
      }
  
      setupCartIconListener() {
        const cartIcons = document.querySelectorAll('.cart-icon, .header-cart-icon, a-shopping-cart, .a-shopping-cart, [data-cart-icon], .a-shopping-cart');
        cartIcons.forEach(icon => {
          icon.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            this.toggleCart();
          });
        });
      }
      async fetchCartData() {
        try {
          if (window.zid && window.zid.store && window.zid.store.cart) {
            console.log('Fetching cart data...');
            const response = await window.zid.store.cart.addProduct({
              formId: 'temp-form',
              data: {
                refresh_only: true
              }
            });
            
            if (response && response.status === 'success' && response.data && response.data.cart) {
              console.log('Cart data received:', response.data.cart);
              this.cartData = response.data.cart;
              this.updateCartDisplay();
              if (typeof window.updateCartProducts === 'function') {
                window.updateCartProducts(response);
              }
            } else {
              console.error('Invalid cart response:', response);
            }
          }
        } catch (error) {
          console.error('Error fetching cart data:', error);
        }
      }
  
      updateCartDisplay() {
        const cartItemsEl = document.getElementById('hmstudio-cart-items');
        const emptyCartEl = document.getElementById('hmstudio-cart-empty');
        const cartTotalsEl = document.getElementById('hmstudio-cart-totals');
        
        console.log('Updating cart display with data:', this.cartData);
  
        if (!this.cartData || !this.cartData.products || this.cartData.products.length === 0) {
          console.log('Cart is empty');
          if (emptyCartEl) emptyCartEl.style.display = 'block';
          if (cartItemsEl) cartItemsEl.style.display = 'none';
          if (cartTotalsEl) cartTotalsEl.innerHTML = '';
          return;
        }
  
        console.log('Rendering cart items');
        if (cartItemsEl) {
          emptyCartEl.style.display = 'none';
          cartItemsEl.style.display = 'block';
  
          let itemsHtml = '';
          this.cartData.products.forEach(product => {
            const productName = product.name[this.currentLanguage] || product.name;
            itemsHtml += `
              <div class="hmstudio-cart-item" data-product-id="${product.id}">
                <div class="hmstudio-cart-item-image">
                  <img src="${product.image}" alt="${productName}">
                </div>
                <div class="hmstudio-cart-item-details">
                  <a href="${product.url}" class="hmstudio-cart-item-name">${productName}</a>
                  <div class="hmstudio-cart-item-price">
                    ${product.formatted_price || product.price_string}
                  </div>
                  <div style="display: flex; align-items: center;">
                    <select class="hmstudio-quantity-select" data-product-id="${product.id}">
                      ${[1,2,3,4,5,6,7,8,9,10].map(num => 
                        `<option value="${num}" ${product.quantity === num ? 'selected' : ''}>
                          ${num}
                        </option>`
                      ).join('')}
                    </select>
                    <button class="hmstudio-remove-item" data-product-id="${product.id}">
                      ${this.currentLanguage === 'ar' ? 'حذف' : 'Remove'}
                    </button>
                  </div>
                </div>
              </div>
            `;
          });
  
          cartItemsEl.innerHTML = itemsHtml;
        }
  
        if (cartTotalsEl && this.cartData.totals) {
          console.log('Updating cart totals');
          let totalsHtml = '';
          this.cartData.totals.forEach(total => {
            const isTotal = total.code === 'total';
            totalsHtml += `
              <div class="hmstudio-total-row" ${isTotal ? 'style="font-weight: bold;"' : ''}>
                <span>${total.title}</span>
                <span>${total.value_string}</span>
              </div>
            `;
          });
          cartTotalsEl.innerHTML = totalsHtml;
        }
      }
  
      setupCartUpdateListener() {
        // Handle quantity changes
        document.addEventListener('change', async (e) => {
          if (e.target.matches('.hmstudio-quantity-select')) {
            const productId = e.target.dataset.productId;
            const quantity = parseInt(e.target.value);
            
            try {
              if (window.zid && window.zid.store && window.zid.store.cart) {
                console.log('Updating quantity:', productId, quantity);
                e.target.disabled = true;
                
                const response = await window.zid.store.cart.addProduct({
                  formId: 'temp-form',
                  data: {
                    product_id: productId,
                    quantity: quantity
                  }
                });
  
                if (response.status === 'success') {
                  this.cartData = response.data.cart;
                  this.updateCartDisplay();
                }
                
                e.target.disabled = false;
              }
            } catch (error) {
              console.error('Error updating quantity:', error);
              e.target.disabled = false;
            }
          }
        });
  
        // Handle product removal
        document.addEventListener('click', async (e) => {
          if (e.target.matches('.hmstudio-remove-item')) {
            e.preventDefault();
            const productId = e.target.dataset.productId;
            const originalText = e.target.textContent;
            
            try {
              if (window.zid && window.zid.store && window.zid.store.cart) {
                console.log('Removing product:', productId);
                e.target.textContent = this.currentLanguage === 'ar' ? 'جارٍ الحذف...' : 'Removing...';
                e.target.disabled = true;
                
                const response = await window.zid.store.cart.removeProduct(productId);
                
                if (response.status === 'success') {
                  await this.fetchCartData();
                }
              }
            } catch (error) {
              console.error('Error removing product:', error);
              e.target.textContent = originalText;
              e.target.disabled = false;
            }
          }
        });
  
        // Listen for cart updates from other sources
        if (typeof window.cartProductsHtmlChanged === 'function') {
          const originalCartProductsHtmlChanged = window.cartProductsHtmlChanged;
          window.cartProductsHtmlChanged = (html, cart) => {
            originalCartProductsHtmlChanged(html, cart);
            if (cart) {
              console.log('Cart update detected from external source');
              this.cartData = cart;
              this.updateCartDisplay();
            }
          };
        }
      }
  
      openCart() {
        const cart = document.getElementById('hmstudio-sliding-cart');
        const overlay = document.getElementById('hmstudio-sliding-cart-overlay');
        const direction = this.currentLanguage === 'ar' ? 'right' : 'left';
        
        if (cart && overlay) {
          this.fetchCartData();
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
  
    // Initialize sliding cart
    const slidingCart = new SlidingCart();
  })();
