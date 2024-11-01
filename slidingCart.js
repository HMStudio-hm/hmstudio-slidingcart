// src/scripts/slidingCart.js v1.1.7
// HMStudio Sliding Cart Feature
// Created by HMStudio

(function() {
    console.log('Sliding Cart script initialized');
  
    class SlidingCart {
      constructor() {
        this.currentLanguage = document.documentElement.lang || 'ar';
        this.isOpen = false;
        this.cartState = {
          products: [],
          totals: [],
          isEmpty: true
        };
        this.initializeSlidingCart();
      }
  
      // ============ Cart State Management ============
      initializeSlidingCart() {
        console.log('Initializing sliding cart...');
        this.injectCartPanel();
        this.setupStateSync();
        this.bindEventListeners();
        this.parseOriginalCartContent();
      }
  
      parseOriginalCartContent() {
        // First try to get cart content from existing elements
        const cartTemplateContent = document.querySelector('.template_for_cart_products_list');
        const cartTotalsList = document.querySelector('.cart__total-list');
      
        if (!cartTemplateContent) {
          console.log('No cart template found, fetching from cart page...');
          this.fetchCartPage();
          return;
        }
      
        const cartContent = {
          productsTemplate: cartTemplateContent,
          totalsList: cartTotalsList
        };
      
        this.parseCartContent(cartContent);
      }
      
      async fetchCartPage() {
        try {
          const response = await fetch('/cart/view');
          const text = await response.text();
          const parser = new DOMParser();
          const doc = parser.parseFromString(text, 'text/html');
          
          const cartContent = {
            productsTemplate: doc.querySelector('.template_for_cart_products_list'),
            totalsList: doc.querySelector('.cart__total-list')
          };
      
          if (cartContent.productsTemplate) {
            this.parseCartContent(cartContent);
          } else {
            console.error('Could not find cart template in fetched page');
          }
        } catch (error) {
          console.error('Error fetching cart page:', error);
        }
      }
      
      parseCartContent(content) {
        // Parse products
        if (content.productsTemplate) {
          const slidingCartProducts = document.querySelector('#hmstudio-sliding-cart .template_for_cart_products_list');
          if (slidingCartProducts) {
            slidingCartProducts.innerHTML = content.productsTemplate.innerHTML;
          }
        }
      
        // Parse totals
        if (content.totalsList) {
          const slidingCartTotals = document.querySelector('#hmstudio-sliding-cart .cart__total-list');
          if (slidingCartTotals) {
            slidingCartTotals.innerHTML = content.totalsList.innerHTML;
          }
        }
      
        // Update empty state
        const hasProducts = Boolean(content.productsTemplate?.children.length);
        this.updateEmptyState(hasProducts);
        
        // Bind events to the newly added content
        this.bindProductEvents();
      }
  
      setupStateSync() {
        // Override Zid's cart update function
        const originalCartProductsHtmlChanged = window.cartProductsHtmlChanged || function() {};
        
        window.cartProductsHtmlChanged = (html, cart) => {
          // Call original function
          originalCartProductsHtmlChanged(html, cart);
          
          // Update our sliding cart
          this.updateSlidingCartContent(html, cart);
      
          // Also update the main cart if we're not on the cart page
          const mainCartTemplate = document.querySelector('.template_for_cart_products_list');
          if (mainCartTemplate) {
            mainCartTemplate.innerHTML = html;
          }
        };

        // Also watch for Zid's cart badge updates
  const originalSetCartBadge = window.setCartBadge || function() {};
  window.setCartBadge = (count) => {
    originalSetCartBadge(count);
    // Refresh our cart content when the badge updates
    this.parseOriginalCartContent();
  };
}
  
      updateSlidingCartContent(html, cart) {
        const slidingCart = document.getElementById('hmstudio-sliding-cart');
        if (!slidingCart) return;
  
        // Update products
        const productsContainer = slidingCart.querySelector('.template_for_cart_products_list');
        if (productsContainer) {
          productsContainer.innerHTML = html;
        }
  
        // Update totals
        if (cart?.totals) {
          const totalsContainer = slidingCart.querySelector('.cart__total-list');
          if (totalsContainer) {
            totalsContainer.innerHTML = cart.totals.map(total => `
              <div class="${total.code === 'total' ? 'cart__total-item--total' : 'cart__total-item'}" style="
                display: flex;
                justify-content: space-between;
                margin-bottom: 10px;
                ${total.code === 'total' ? 'font-weight: bold;' : ''}
              ">
                <span>${total.title}</span>
                <span>${total.value_string}</span>
              </div>
            `).join('');
          }
        }
  
        // Update state
        this.updateEmptyState(cart?.products_count > 0);
  
        // Rebind events
        this.bindProductEvents();
      }
  
      // ============ Interaction Handlers ============
      handleQuantityChange(select) {
        const row = select.closest('.cart-product-row');
        if (!row) return;
  
        // Show loading state
        const deleteIcon = row.querySelector('.icon-delete');
        const prefix = row.querySelector('.prefix');
        if (deleteIcon) deleteIcon.style.display = 'none';
        if (prefix) prefix.style.display = 'block';
      }
  
      handleProductRemoval(button) {
        const row = button.closest('.cart-product-row');
        if (!row) return;
  
        // Show loading state
        const deleteIcon = button.querySelector('.icon-delete');
        const prefix = button.querySelector('.prefix');
        if (deleteIcon) deleteIcon.style.display = 'none';
        if (prefix) prefix.style.display = 'block';
      }
  
      // ============ Animation Management ============
      slideIn() {
        const cart = document.getElementById('hmstudio-sliding-cart');
        const overlay = document.getElementById('hmstudio-sliding-cart-overlay');
        const direction = this.currentLanguage === 'ar' ? 'right' : 'left';
        
        if (cart && overlay) {
          cart.style[direction] = '0';
          overlay.style.display = 'block';
          this.isOpen = true;
          // Refresh content
          this.parseOriginalCartContent();
        }
      }
  
      slideOut() {
        const cart = document.getElementById('hmstudio-sliding-cart');
        const overlay = document.getElementById('hmstudio-sliding-cart-overlay');
        const direction = this.currentLanguage === 'ar' ? 'right' : 'left';
        
        if (cart && overlay) {
          cart.style[direction] = '-400px';
          overlay.style.display = 'none';
          this.isOpen = false;
        }
      }
  
      toggleSlidingCart() {
        if (this.isOpen) {
          this.slideOut();
        } else {
          this.slideIn();
        }
      }
  
      // ============ UI Updates ============
      updateEmptyState(hasProducts) {
        const slidingCart = document.getElementById('hmstudio-sliding-cart');
        if (!slidingCart) return;
      
        const emptyMessage = slidingCart.querySelector('.sliding-cart-empty');
        const itemsContainer = slidingCart.querySelector('.sliding-cart-items');
        
        // Also check if there are actual products in the template
        const productsContainer = slidingCart.querySelector('.template_for_cart_products_list');
        const hasActualProducts = productsContainer && productsContainer.children.length > 0;
      
        if (hasProducts && hasActualProducts) {
          if (emptyMessage) emptyMessage.style.display = 'none';
          if (itemsContainer) itemsContainer.style.display = 'block';
        } else {
          if (emptyMessage) emptyMessage.style.display = 'flex';
          if (itemsContainer) itemsContainer.style.display = 'none';
        }
      }
  
      // ============ Event Binding ============
      bindEventListeners() {
        // Cart icon click
        document.querySelectorAll('.cart-icon, .header-cart-icon, a-shopping-cart, .a-shopping-cart, [data-cart-icon]').forEach(icon => {
          icon.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            this.toggleSlidingCart();
          });
        });
  
        // Close button and overlay
        const closeBtn = document.querySelector('.sliding-cart-close');
        const overlay = document.getElementById('hmstudio-sliding-cart-overlay');
        
        closeBtn?.addEventListener('click', () => this.slideOut());
        overlay?.addEventListener('click', () => this.slideOut());
  
        // Listen for product additions
        document.addEventListener('click', (e) => {
          if (e.target.matches('.product-card-add-to-cart, .btn-add-to-cart, .quick-view-modal .add-to-cart-btn')) {
            setTimeout(() => this.parseOriginalCartContent(), 1000);
          }
        });
      }
  
      bindProductEvents() {
        const slidingCart = document.getElementById('hmstudio-sliding-cart');
        if (!slidingCart) return;
  
        // Quantity change events
        slidingCart.querySelectorAll('.cart-product-quantity-dropdown select').forEach(select => {
          select.addEventListener('change', () => this.handleQuantityChange(select));
        });
  
        // Delete button events
        slidingCart.querySelectorAll('.cart-product-delete a').forEach(button => {
          button.addEventListener('click', () => this.handleProductRemoval(button));
        });
      }
  
      // ============ Cart Panel Injection ============
      injectCartPanel() {
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
                display: none;
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
  
        document.body.insertAdjacentHTML('beforeend', cartPanel);
      }
    }
  
    // Initialize the sliding cart
    const slidingCart = new SlidingCart();
  })();
