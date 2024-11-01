// src/scripts/slidingCart.js v1.0.6
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
          // Create temporary cart template if it doesn't exist
          if (!document.querySelector('.template_for_cart_products_list')) {
            const tempTemplate = document.createElement('div');
            tempTemplate.className = 'template_for_cart_products_list';
            tempTemplate.style.display = 'none';
            document.body.appendChild(tempTemplate);
          }
  
          // Trigger cart refresh
          if (window.zid && window.zid.store && window.zid.store.cart) {
            await window.zid.store.cart.get();
          }
        } catch (error) {
          console.error('Error fetching cart data:', error);
        }
      }
  
      setupCartUpdateListener() {
        // Create a hidden cart template if it doesn't exist
        if (!document.querySelector('.template_for_cart_products_list')) {
          const tempTemplate = document.createElement('div');
          tempTemplate.className = 'template_for_cart_products_list';
          tempTemplate.style.display = 'none';
          document.body.appendChild(tempTemplate);
        }
  
        // Override Zid's cart update handler
        const originalCartProductsHtmlChanged = window.cartProductsHtmlChanged || function() {};
        
        window.cartProductsHtmlChanged = (html, cart) => {
          // Call original handler
          originalCartProductsHtmlChanged(html, cart);
          
          console.log('Cart update received:', cart);
          
          const cartItemsEl = document.getElementById('hmstudio-cart-items');
          const emptyCartEl = document.getElementById('hmstudio-cart-empty');
          const cartTotalsEl = document.getElementById('hmstudio-cart-totals');
          
          // Handle empty cart state
          if (!cart || !cart.products || cart.products.length === 0) {
            if (emptyCartEl) emptyCartEl.style.display = 'block';
            if (cartItemsEl) cartItemsEl.style.display = 'none';
            if (cartTotalsEl) cartTotalsEl.innerHTML = '';
            return;
          }
  
          // Update cart items
          if (cartItemsEl) {
            let itemsHtml = '';
            cart.products.forEach(product => {
              itemsHtml += `
                <div class="hmstudio-cart-item" data-product-id="${product.id}">
                  <div class="hmstudio-cart-item-image">
                    <img src="${product.image}" alt="${product.name[this.currentLanguage]}">
                  </div>
                  <div class="hmstudio-cart-item-details">
                    <a href="${product.url}" class="hmstudio-cart-item-name">
                      ${product.name[this.currentLanguage]}
                    </a>
                    <div class="hmstudio-cart-item-price">
                      ${product.formatted_price}
                    </div>
                    <div style="display: flex; align-items: center;">
                      <div class="cart-product-quantity-dropdown" style="margin-right: 10px;">
                        <select 
                          class="form-control hmstudio-quantity-select" 
                          data-product-id="${product.id}"
                        >
                          ${[1,2,3,4,5,6,7,8,9,10].map(num => 
                            `<option value="${num}" ${product.quantity === num ? 'selected' : ''}>
                              ${num}
                            </option>`
                          ).join('')}
                        </select>
                      </div>
                      <button 
                        class="hmstudio-remove-item"
                        data-product-id="${product.id}"
                        style="background: none; border: none; color: #ff4444; cursor: pointer; padding: 0;"
                      >
                        ${this.currentLanguage === 'ar' ? 'حذف' : 'Remove'}
                      </button>
                    </div>
                  </div>
                </div>
              `;
            });
            
            if (emptyCartEl) emptyCartEl.style.display = 'none';
            cartItemsEl.style.display = 'block';
            cartItemsEl.innerHTML = itemsHtml;
          }
  
          // Update totals
          if (cartTotalsEl && cart.totals) {
            let totalsHtml = '';
            cart.totals.forEach(total => {
              const isTotal = total.code === 'total';
              totalsHtml += `
                <div class="hmstudio-total-row" style="${isTotal ? 'font-weight: bold;' : ''}">
                  <span>${total.title}</span>
                  <span>${total.value_string}</span>
                </div>
              `;
            });
            cartTotalsEl.innerHTML = totalsHtml;
          }
  
          // Update cart badge if the function exists
          if (typeof setCartBadge === 'function') {
            setCartBadge(cart.products_count || 0);
          }
        };
  
        // Handle quantity changes
        document.addEventListener('change', async (e) => {
          if (e.target.matches('.hmstudio-quantity-select')) {
            const productId = e.target.dataset.productId;
            const quantity = parseInt(e.target.value);
            
            if (window.zid && window.zid.store && window.zid.store.cart) {
              try {
                await window.zid.store.cart.updateProduct({
                  product_id: productId,
                  quantity: quantity
                });
              } catch (error) {
                console.error('Error updating quantity:', error);
              }
            }
          }
        });
  
        // Handle product removal
        document.addEventListener('click', async (e) => {
          if (e.target.matches('.hmstudio-remove-item')) {
            e.preventDefault();
            const productId = e.target.dataset.productId;
            
            if (window.zid && window.zid.store && window.zid.store.cart) {
              try {
                await window.zid.store.cart.removeProduct({
                  product_id: productId
                });
              } catch (error) {
                console.error('Error removing product:', error);
              }
            }
          }
        });
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
