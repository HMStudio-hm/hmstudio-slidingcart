// src/scripts/slidingCart.js v1.0.5
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
        this.fetchCartData();
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
            padding: 5px;
            border: 1px solid #ddd;
            border-radius: 4px;
            margin-right: 10px;
          }
          .hmstudio-remove-item {
            color: #ff4444;
            text-decoration: none;
            font-size: 14px;
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
              <h3 style="margin: 0;">${this.currentLanguage === 'ar' ? 'سلة التسوق' : 'Shopping Cart'}</h3>
              <button class="sliding-cart-close" style="
                border: none;
                background: none;
                font-size: 24px;
                cursor: pointer;
                padding: 5px;
                line-height: 1;
              ">×</button>
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
            
            <div class="sliding-cart-footer" style="
              padding: 20px;
              border-top: 1px solid #eee;
            ">
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
        const cartIcons = document.querySelectorAll('.cart-icon, .header-cart-icon, a-shopping-cart, .a-shopping-cart, [data-cart-icon]');
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
            const cartResponse = await window.zid.store.cart.addProduct({ 
              formId: 'temp-form',
              data: {
                refresh_only: true
              }
            });
  
            if (cartResponse && cartResponse.status === 'success') {
              this.cartData = cartResponse.data.cart;
              this.updateCartDisplay();
            } else {
              console.error('Failed to fetch cart data:', cartResponse);
            }
          } else {
            console.error('Zid cart API not available');
          }
        } catch (error) {
          console.error('Error fetching cart data:', error);
        }
      }
  
      setupCartUpdateListener() {
        // Listen for cart HTML changes from Zid
        const originalCartProductsHtmlChanged = window.cartProductsHtmlChanged || function() {};
        window.cartProductsHtmlChanged = (html, cart) => {
          originalCartProductsHtmlChanged(html, cart);
          if (cart) {
            this.cartData = cart;
            this.updateCartDisplay();
          }
        };
  
        // Setup product quantity change handler
        document.addEventListener('change', async (e) => {
          if (e.target.matches('.hmstudio-quantity-select')) {
            const productId = e.target.dataset.productId;
            const quantity = parseInt(e.target.value);
            
            try {
              await window.zid.store.cart.addProduct({ 
                formId: 'temp-form',
                data: {
                  product_id: productId,
                  quantity: quantity
                }
              });
              await this.fetchCartData();
            } catch (error) {
              console.error('Error updating quantity:', error);
            }
          }
        });
  
        // Setup product removal handler
        document.addEventListener('click', async (e) => {
          if (e.target.matches('.hmstudio-remove-item')) {
            e.preventDefault();
            const productId = e.target.dataset.productId;
            
            try {
              await window.zid.store.cart.removeProduct({ 
                data: {
                  product_id: productId
                }
              });
              await this.fetchCartData();
            } catch (error) {
              console.error('Error removing product:', error);
            }
          }
        });
      }
  
      updateCartDisplay() {
        const emptyCartEl = document.getElementById('hmstudio-cart-empty');
        const cartItemsEl = document.getElementById('hmstudio-cart-items');
        const cartTotalsEl = document.getElementById('hmstudio-cart-totals');
  
        if (!emptyCartEl || !cartItemsEl || !cartTotalsEl) {
          console.error('Required cart elements not found');
          return;
        }
  
        if (!this.cartData || !this.cartData.products || this.cartData.products.length === 0) {
          emptyCartEl.style.display = 'block';
          cartItemsEl.style.display = 'none';
          cartTotalsEl.innerHTML = '';
          return;
        }
  
        emptyCartEl.style.display = 'none';
        cartItemsEl.style.display = 'block';
  
        // Update cart items
        let itemsHTML = '';
        this.cartData.products.forEach(product => {
          itemsHTML += `
            <div class="hmstudio-cart-item">
              <div class="hmstudio-cart-item-image">
                <img src="${product.image}" alt="${product.name[this.currentLanguage]}">
              </div>
              <div class="hmstudio-cart-item-details">
                <a href="${product.url}" class="hmstudio-cart-item-name">
                  ${product.name[this.currentLanguage]}
                </a>
                <div class="hmstudio-cart-item-price">${product.formatted_price}</div>
                <div style="display: flex; align-items: center;">
                  <select class="hmstudio-quantity-select" data-product-id="${product.id}">
                    ${[1,2,3,4,5,6,7,8,9,10].map(num => 
                      `<option value="${num}" ${product.quantity === num ? 'selected' : ''}>
                        ${num}
                      </option>`
                    ).join('')}
                  </select>
                  <a href="#" class="hmstudio-remove-item" data-product-id="${product.id}">
                    ${this.currentLanguage === 'ar' ? 'حذف' : 'Remove'}
                  </a>
                </div>
              </div>
            </div>
          `;
        });
        cartItemsEl.innerHTML = itemsHTML;
  
        // Update totals
        if (this.cartData.totals) {
          let totalsHTML = '';
          this.cartData.totals.forEach(total => {
            const isTotal = total.code === 'total';
            totalsHTML += `
              <div class="hmstudio-total-row" style="${isTotal ? 'font-weight: bold;' : ''}">
                <span>${total.title}</span>
                <span>${total.value_string}</span>
              </div>
            `;
          });
          cartTotalsEl.innerHTML = totalsHTML;
        }
  
        // Update cart badge if function exists
        if (typeof setCartBadge === 'function') {
          setCartBadge(this.cartData.products.length);
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
