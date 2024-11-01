// src/scripts/slidingCart.js v1.0.3
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
  
    // Add styles to the document
    const styles = `
      .cart-product-row {
        display: flex;
        padding: 15px 0;
        border-bottom: 1px solid #eee;
      }
  
      .cart-product-image {
        width: 80px;
        height: 80px;
        margin-right: 15px;
      }
  
      .cart-product-image img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        border-radius: 4px;
      }
  
      .cart-product-info {
        flex: 1;
        display: flex;
        flex-direction: column;
      }
  
      .cart-product-name {
        font-weight: bold;
        margin-bottom: 5px;
      }
  
      .cart-product-price {
        color: #666;
        margin-bottom: 10px;
      }
  
      .cart-product-quantity-dropdown {
        margin-bottom: 10px;
      }
  
      .cart-product-quantity-dropdown select {
        padding: 5px;
        border: 1px solid #ddd;
        border-radius: 4px;
        width: 70px;
      }
  
      .cart-product-delete a {
        color: #ff4444;
        text-decoration: none;
        font-size: 20px;
      }
  
      [dir="rtl"] .cart-product-image {
        margin-right: 0;
        margin-left: 15px;
      }
    `;
  
    const styleSheet = document.createElement('style');
    styleSheet.textContent = styles;
    document.head.appendChild(styleSheet);
  
    class SlidingCart {
      constructor() {
        this.isOpen = false;
        this.currentLanguage = getCurrentLanguage();
        this.initialize();
      }
  
      async initialize() {
        this.createCartStructure();
        this.setupCartIconListener();
        this.setupCartUpdateListener();
        await this.fetchCartData();
      }
  
      async fetchCartData() {
        try {
          const cartData = await zid.store.cart.get();
          console.log('Fetched cart data:', cartData);
  
          if (cartData && cartData.data) {
            this.updateCartFromResponse(cartData.data);
          }
        } catch (error) {
          console.error('Error fetching cart data:', error);
        }
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
                font-size: 24px;
                cursor: pointer;
                padding: 5px;
              ">×</button>
            </div>
            
            <div class="sliding-cart-content" style="
              flex-grow: 1;
              overflow-y: auto;
              padding: 20px;
            ">
              <div class="cart__empty mt-5" style="display: none; flex-direction: column; align-items: center;">
                <div class="cart__empty-icon">
                  <img loading="lazy" src="/assets/images/shopping-bag-empty.gif" alt="empty_cart" width="150" height="150">
                </div>
                <h1 class="cart__empty-text my-5">${this.currentLanguage === 'ar' ? 'السلة فارغة' : 'Cart is empty'}</h1>
                <a href="/" class="no-btn-style common-btn cart__empty-btn mt-5">
                  ${this.currentLanguage === 'ar' ? 'العودة للتسوق' : 'Continue Shopping'}
                </a>
              </div>
              
              <div class="cart__items">
                <div class="template_for_cart_products_list"></div>
              </div>
            </div>
            
            <div class="sliding-cart-footer" style="
              padding: 20px;
              border-top: 1px solid #eee;
            ">
              <div class="cart__total-list" style="margin-bottom: 15px;"></div>
              <div class="sliding-cart-actions" style="display: flex; flex-direction: column; gap: 10px;">
                <a href="/cart/view" class="no-btn-style common-btn" style="
                  text-align: center;
                  padding: 10px;
                  background: #f0f0f0;
                  color: #333;
                  text-decoration: none;
                  border-radius: 4px;
                ">${this.currentLanguage === 'ar' ? 'عرض السلة' : 'View Cart'}</a>
                
                <a href="/checkout" class="no-btn-style common-btn" style="
                  text-align: center;
                  padding: 10px;
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
  
      updateCartFromResponse(cartData) {
        const slidingCart = document.getElementById('hmstudio-sliding-cart');
        if (!slidingCart) return;
  
        const productsContainer = slidingCart.querySelector('.template_for_cart_products_list');
        const emptyCartMessage = slidingCart.querySelector('.cart__empty');
        const cartItems = slidingCart.querySelector('.cart__items');
  
        if (!cartData.cart || cartData.cart.products_count <= 0) {
          if (emptyCartMessage) emptyCartMessage.style.display = 'flex';
          if (cartItems) cartItems.style.display = 'none';
          return;
        }
  
        if (emptyCartMessage) emptyCartMessage.style.display = 'none';
        if (cartItems) cartItems.style.display = 'block';
  
        if (productsContainer && cartData.cart.products) {
          let productsHTML = '';
          cartData.cart.products.forEach(product => {
            productsHTML += `
              <div class="cart-product-row" data-product-id="${product.id}">
                <div class="cart-product-image">
                  <img src="${product.image}" alt="${product.name[this.currentLanguage]}" />
                </div>
                <div class="cart-product-info">
                  <div class="cart-product-name">
                    ${product.name[this.currentLanguage]}
                  </div>
                  <div class="cart-product-price">
                    ${product.formatted_price}
                  </div>
                  <div class="cart-product-quantity-dropdown">
                    <select class="form-control" onchange="zid.store.cart.updateProduct(${product.id}, this.value)">
                      ${this.generateQuantityOptions(product.quantity)}
                    </select>
                  </div>
                  <div class="cart-product-delete">
                    <a href="#" onclick="zid.store.cart.deleteProduct(${product.id}); return false;">
                      <span class="icon-delete">×</span>
                      <span class="prefix" style="display: none;">...</span>
                    </a>
                  </div>
                </div>
              </div>
            `;
          });
          productsContainer.innerHTML = productsHTML;
        }
  
        if (cartData.cart.totals) {
          const totalsContainer = slidingCart.querySelector('.cart__total-list');
          if (totalsContainer) {
            let totalsHTML = '';
            cartData.cart.totals.forEach(total => {
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
  
      generateQuantityOptions(currentQuantity) {
        let options = '';
        for (let i = 1; i <= 20; i++) {
          options += `<option value="${i}" ${i === currentQuantity ? 'selected' : ''}>${i}</option>`;
        }
        return options;
      }
  
      setupCartUpdateListener() {
        const originalCartProductsHtmlChanged = window.cartProductsHtmlChanged || function() {};
        
        window.cartProductsHtmlChanged = (html, cart) => {
          originalCartProductsHtmlChanged(html, cart);
          this.fetchCartData();
        };
  
        if (typeof zid !== 'undefined' && zid.store && zid.store.cart) {
          document.addEventListener('zid-cart-update', () => {
            this.fetchCartData();
          });
        }
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
  
    // Initialize sliding cart
    const slidingCart = new SlidingCart();
  })();
