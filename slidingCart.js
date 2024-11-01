// src/scripts/slidingCart.js v1.0.1
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
        this.initialize();
      }
  
      initialize() {
        this.createCartStructure();
        this.setupCartIconListener();
        this.setupCartUpdateListener();
        // Initial cart content fetch
        this.fetchInitialCartContent();
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
                <a href="/cart" class="no-btn-style common-btn" style="
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
        // Find cart icon and add click handler
        const cartIcons = document.querySelectorAll('.cart-icon, .header-cart-icon, a-shopping-cart, .a-shopping-cart, [data-cart-icon]');
        cartIcons.forEach(icon => {
          icon.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            this.toggleCart();
          });
        });
      }
  
      async fetchInitialCartContent() {
        try {
          // Get the cart template content from the page
          const templateContent = document.querySelector('.template_for_cart_products_list');
          if (templateContent) {
            const slidingCartTemplate = document.querySelector('#hmstudio-sliding-cart .template_for_cart_products_list');
            if (slidingCartTemplate) {
              slidingCartTemplate.innerHTML = templateContent.innerHTML;
            }
          }
  
          // Get totals if available
          const totalsContent = document.querySelector('.cart__total-list');
          if (totalsContent) {
            const slidingCartTotals = document.querySelector('#hmstudio-sliding-cart .cart__total-list');
            if (slidingCartTotals) {
              slidingCartTotals.innerHTML = totalsContent.innerHTML;
            }
          }
        } catch (error) {
          console.error('Error fetching initial cart content:', error);
        }
      }
  
      setupCartUpdateListener() {
        // Store the original function
        const originalCartProductsHtmlChanged = window.cartProductsHtmlChanged || function() {};
        
        // Override the function
        window.cartProductsHtmlChanged = (html, cart) => {
          // Call original function
          originalCartProductsHtmlChanged(html, cart);
          
          // Update our sliding cart
          this.updateCartContent(html, cart);
        };
  
        // Add quantity change handler
        document.addEventListener('click', (e) => {
          if (e.target.matches('#hmstudio-sliding-cart .cart-product-quantity-dropdown select')) {
            const select = e.target;
            select.addEventListener('change', async () => {
              const productRow = select.closest('.cart-product-row');
              if (productRow) {
                productRow.querySelector('.icon-delete').style.display = 'none';
                productRow.querySelector('.prefix').style.display = 'block';
              }
            });
          }
        });
  
        // Add delete product handler
        document.addEventListener('click', (e) => {
          if (e.target.matches('#hmstudio-sliding-cart .cart-product-delete a')) {
            e.preventDefault();
            const deleteBtn = e.target;
            const icon = deleteBtn.querySelector('.icon-delete');
            const prefix = deleteBtn.querySelector('.prefix');
            if (icon && prefix) {
              icon.style.display = 'none';
              prefix.style.display = 'block';
            }
          }
        });
      }
  
      updateCartContent(html, cart) {
        const slidingCart = document.getElementById('hmstudio-sliding-cart');
        if (!slidingCart) return;
  
        // Update products list
        const productsContainer = slidingCart.querySelector('.template_for_cart_products_list');
        const emptyCartMessage = slidingCart.querySelector('.cart__empty');
        const cartItems = slidingCart.querySelector('.cart__items');
  
        if (cart.products_count <= 0) {
          if (emptyCartMessage) emptyCartMessage.style.display = 'flex';
          if (cartItems) cartItems.style.display = 'none';
        } else {
          if (emptyCartMessage) emptyCartMessage.style.display = 'none';
          if (cartItems) cartItems.style.display = 'block';
          if (productsContainer) productsContainer.innerHTML = html;
        }
  
        // Update totals
        if (cart.totals) {
          const totalsContainer = slidingCart.querySelector('.cart__total-list');
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
