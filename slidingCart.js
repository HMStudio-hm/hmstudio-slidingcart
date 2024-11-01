// src/scripts/slidingCart.js v1.1.1
// HMStudio Sliding Cart Feature
// Created by HMStudio

(function() {
    console.log('Sliding Cart script initialized');
  
    class SlidingCart {
      constructor() {
        this.isOpen = false;
        this.currentLanguage = document.documentElement.lang || 'ar';
        this.cart_products = window.cart_products || [];
        this.initialize();
      }
  
      initialize() {
        this.addStyles();
        this.createCartStructure();
        this.setupCartIconListener();
        this.setupCartUpdateListener();
        this.initializeCartContent();
      }
  
      addStyles() {
        const styles = `
          .hmstudio-sliding-cart {
            font-family: inherit;
          }
          .cart__items-container {
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
          .cart__empty {
            text-align: center;
            padding: 30px 0;
            display: none;
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
        `;
  
        const styleSheet = document.createElement('style');
        styleSheet.textContent = styles;
        document.head.appendChild(styleSheet);
      }
  
      createCartStructure() {
        const direction = this.currentLanguage === 'ar' ? 'right' : 'left';
        
        const cartHTML = `
          <div id="hmstudio-sliding-cart" class="cart cart_page" style="
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
              <button class="sliding-cart-close" style="
                border: none;
                background: none;
                font-size: 24px;
                cursor: pointer;
                padding: 5px;
              ">×</button>
            </div>
            
            <div style="flex-grow: 1; overflow-y: auto;">
              <div class="cart__empty mt-5" style="display: none;">
                <div class="cart__empty-icon">
                  <img loading="lazy" src="/assets/images/shopping-bag-empty.gif" alt="empty_cart" width="150" height="150">
                </div>
                <h1 class="cart__empty-text my-5">
                  ${this.currentLanguage === 'ar' ? 'السلة فارغة' : 'Your cart is empty'}
                </h1>
                <a href="/" class="no-btn-style common-btn cart__empty-btn mt-5">
                  ${this.currentLanguage === 'ar' ? 'تسوق الآن' : 'Shop Now'}
                </a>
              </div>
  
              <div class="cart__items-container">
                <div class="cart__items">
                  <div class="template_for_cart_products_list"></div>
                </div>
              </div>
            </div>
            
            <div class="cart__side-col">
              <div class="cart__total-container">
                <div class="cart__total-list"></div>
                <a href="/checkout" class="no-btn-style common-btn cart__total-checkout mt-4">
                  ${this.currentLanguage === 'ar' ? 'إتمام الطلب' : 'Checkout'}
                </a>
                <a href="/cart" class="no-btn-style cart__total-coutinue">
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
        document.addEventListener('click', (e) => {
          const cartIcon = e.target.closest('.cart-icon, .header-cart-icon, [data-cart-icon], a-shopping-cart, .a-shopping-cart');
          if (cartIcon) {
            e.preventDefault();
            e.stopPropagation();
            this.openCart();
          }
        });
      }
  
      setupCartUpdateListener() {
        // Override updateCartProducts
        const originalUpdateCartProducts = window.updateCartProducts || function() {};
        window.updateCartProducts = (res, shouldUpdateCartBadge = true) => {
          originalUpdateCartProducts(res, shouldUpdateCartBadge);
          this.refreshCartDisplay();
        };
  
        // Override cartProductsHtmlChanged
        const originalCartProductsHtmlChanged = window.cartProductsHtmlChanged || function() {};
        window.cartProductsHtmlChanged = (html, cart) => {
          originalCartProductsHtmlChanged(html, cart);
          
          // Update our sliding cart
          const slidingTemplate = document.querySelector('#hmstudio-sliding-cart .template_for_cart_products_list');
          if (slidingTemplate) {
            slidingTemplate.innerHTML = html || '';
            
            // Update empty cart state
            const emptyCart = document.querySelector('#hmstudio-sliding-cart .cart__empty');
            const itemsContainer = document.querySelector('#hmstudio-sliding-cart .cart__items-container');
            
            if (cart && cart.products_count <= 0) {
              if (emptyCart) emptyCart.style.display = 'flex';
              if (itemsContainer) itemsContainer.style.display = 'none';
            } else {
              if (emptyCart) emptyCart.style.display = 'none';
              if (itemsContainer) itemsContainer.style.display = 'block';
            }
  
            // Update totals
            if (cart && cart.totals) {
              const totalsList = document.querySelector('#hmstudio-sliding-cart .cart__total-list');
              if (totalsList) {
                let totalsHtml = cart.totals.map(total => `
                  <li class="${total.code === 'total' ? 'cart__total-item--total' : 'cart__total-item'}">
                    <p>${total.title}</p>
                    <p>${total.value_string}</p>
                  </li>
                `).join('');
                totalsList.innerHTML = totalsHtml;
              }
            }
          }
        };
      }
  
      refreshCartDisplay() {
        // Using Zid's cart refresh mechanism
        if (window.zid && window.zid.store && window.zid.store.cart) {
          window.zid.store.cart.addProduct({
            formId: 'temp-form',
            data: {
              refresh_only: true
            }
          }).then(response => {
            if (response && response.data && response.data.cart) {
              // This will trigger cartProductsHtmlChanged
              window.cart_products = response.data.cart.products || [];
            }
          }).catch(error => {
            console.error('Error refreshing cart:', error);
          });
        }
      }
  
      initializeCartContent() {
        // Initial refresh
        this.refreshCartDisplay();
      }
  
      openCart() {
        const cart = document.getElementById('hmstudio-sliding-cart');
        const overlay = document.getElementById('hmstudio-sliding-cart-overlay');
        const direction = this.currentLanguage === 'ar' ? 'right' : 'left';
        
        if (cart && overlay) {
          cart.style[direction] = '0';
          overlay.style.display = 'block';
          this.isOpen = true;
          this.refreshCartDisplay();
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
    }
  
    // Make sure Zid is ready before initializing
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => new SlidingCart());
    } else {
      new SlidingCart();
    }
  })();
