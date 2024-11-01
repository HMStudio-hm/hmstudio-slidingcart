// src/scripts/slidingCart.js v1.1.3
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
        this.setupCartUpdateListener();
        this.bindCartIconClick();
        this.syncWithMainCart();
      }
  
      injectCartPanel() {
        console.log('Injecting cart panel...');
        const direction = this.currentLanguage === 'ar' ? 'right' : 'left';
        
        const cartPanel = `
          <div id="hmstudio-sliding-cart" class="sliding-cart-panel" style="
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
              <!-- Empty cart message -->
              <div class="sliding-cart-empty" style="
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                padding: 20px;
                text-align: center;
              ">
                <img src="/assets/images/shopping-bag-empty.gif" alt="Empty Cart" style="width: 100px; margin-bottom: 20px;">
                <p>${this.currentLanguage === 'ar' ? 'سلة التسوق فارغة' : 'Your cart is empty'}</p>
                <a href="/" class="continue-shopping" style="
                  margin-top: 20px;
                  padding: 10px 20px;
                  background: #000;
                  color: white;
                  text-decoration: none;
                  border-radius: 4px;
                ">${this.currentLanguage === 'ar' ? 'متابعة التسوق' : 'Continue Shopping'}</a>
              </div>
  
              <!-- Cart items container -->
              <div class="sliding-cart-items">
                <div class="template_for_cart_products_list"></div>
              </div>
            </div>
  
            <div class="sliding-cart-footer" style="
              padding: 20px;
              border-top: 1px solid #eee;
            ">
              <div class="cart__total-list" style="margin-bottom: 15px;"></div>
              <div class="sliding-cart-buttons" style="
                display: flex;
                flex-direction: column;
                gap: 10px;
              ">
                <a href="/cart/view" class="view-cart-button" style="
                  text-align: center;
                  padding: 10px;
                  background: #f0f0f0;
                  color: #333;
                  text-decoration: none;
                  border-radius: 4px;
                ">${this.currentLanguage === 'ar' ? 'عرض السلة' : 'View Cart'}</a>
                <a href="/checkout" class="checkout-button" style="
                  text-align: center;
                  padding: 10px;
                  background: #000;
                  color: white;
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
  
        // Inject the cart panel
        document.body.insertAdjacentHTML('beforeend', cartPanel);
  
        // Add event listeners
        const closeBtn = document.querySelector('.sliding-cart-close');
        const overlay = document.getElementById('hmstudio-sliding-cart-overlay');
        
        closeBtn?.addEventListener('click', () => this.closeCart());
        overlay?.addEventListener('click', () => this.closeCart());
      }
  
      syncWithMainCart() {
        // Find the main cart template on the page
        const mainCartTemplate = document.querySelector('.template_for_cart_products_list');
        if (mainCartTemplate) {
          const slidingCartTemplate = document.querySelector('#hmstudio-sliding-cart .template_for_cart_products_list');
          if (slidingCartTemplate) {
            slidingCartTemplate.innerHTML = mainCartTemplate.innerHTML;
          }
        }
  
        // Sync totals if available
        const mainTotals = document.querySelector('.cart__total-list');
        if (mainTotals) {
          const slidingCartTotals = document.querySelector('#hmstudio-sliding-cart .cart__total-list');
          if (slidingCartTotals) {
            slidingCartTotals.innerHTML = mainTotals.innerHTML;
          }
        }
  
        // Check if cart is empty
        this.updateEmptyState();
      }
  
      setupCartUpdateListener() {
        console.log('Setting up cart update listener...');
        
        // Store the original function
        const originalCartProductsHtmlChanged = window.cartProductsHtmlChanged || function() {};
  
        // Override with our enhanced version
        window.cartProductsHtmlChanged = (html, cart) => {
          // Call original function first
          originalCartProductsHtmlChanged(html, cart);
          
          console.log('Cart updated:', { productsCount: cart.products_count });
          
          // Update our sliding cart
          this.updateCartContent(html, cart);
        };
      }
  
      bindCartIconClick() {
        console.log('Binding cart icon click events...');
        
        // Find all possible cart icons
        const cartIcons = document.querySelectorAll('.cart-icon, .header-cart-icon, a-shopping-cart, .a-shopping-cart, [data-cart-icon]');
        
        cartIcons.forEach(icon => {
          icon.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            this.toggleCart();
          });
        });
      }
  
      updateCartContent(html, cart) {
        const slidingCart = document.getElementById('hmstudio-sliding-cart');
        if (!slidingCart) return;
  
        const productsContainer = slidingCart.querySelector('.template_for_cart_products_list');
        const emptyMessage = slidingCart.querySelector('.sliding-cart-empty');
        const itemsContainer = slidingCart.querySelector('.sliding-cart-items');
  
        if (!cart || cart.products_count <= 0) {
          if (emptyMessage) emptyMessage.style.display = 'flex';
          if (itemsContainer) itemsContainer.style.display = 'none';
        } else {
          if (emptyMessage) emptyMessage.style.display = 'none';
          if (itemsContainer) itemsContainer.style.display = 'block';
          if (productsContainer && html) {
            productsContainer.innerHTML = html;
            this.bindCartEvents(productsContainer);
          }
        }
  
        // Update totals
        if (cart && cart.totals) {
          const totalsContainer = slidingCart.querySelector('.cart__total-list');
          if (totalsContainer) {
            let totalsHTML = '';
            cart.totals.forEach(total => {
              totalsHTML += `
                <div class="${total.code === 'total' ? 'cart__total-item--total' : 'cart__total-item'}" style="
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
  
      bindCartEvents(container) {
        // Bind events to quantity selectors
        container.querySelectorAll('.cart-product-quantity-dropdown select').forEach(select => {
          select.addEventListener('change', (e) => {
            const row = e.target.closest('.cart-product-row');
            if (row) {
              const deleteIcon = row.querySelector('.icon-delete');
              const prefix = row.querySelector('.prefix');
              if (deleteIcon) deleteIcon.style.display = 'none';
              if (prefix) prefix.style.display = 'block';
            }
          });
        });
  
        // Bind events to delete buttons
        container.querySelectorAll('.cart-product-delete a').forEach(button => {
          button.addEventListener('click', (e) => {
            const deleteIcon = button.querySelector('.icon-delete');
            const prefix = button.querySelector('.prefix');
            if (deleteIcon) deleteIcon.style.display = 'none';
            if (prefix) prefix.style.display = 'block';
          });
        });
      }
  
      updateEmptyState() {
        const slidingCart = document.getElementById('hmstudio-sliding-cart');
        if (!slidingCart) return;
  
        const emptyMessage = slidingCart.querySelector('.sliding-cart-empty');
        const itemsContainer = slidingCart.querySelector('.sliding-cart-items');
        const productsContainer = slidingCart.querySelector('.template_for_cart_products_list');
  
        if (!productsContainer || !productsContainer.children.length) {
          if (emptyMessage) emptyMessage.style.display = 'flex';
          if (itemsContainer) itemsContainer.style.display = 'none';
        } else {
          if (emptyMessage) emptyMessage.style.display = 'none';
          if (itemsContainer) itemsContainer.style.display = 'block';
        }
      }
  
      toggleCart() {
        if (this.isOpen) {
          this.closeCart();
        } else {
          this.openCart();
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
          this.syncWithMainCart();
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
  
    // Initialize the sliding cart
    const slidingCart = new SlidingCart();
  })();
