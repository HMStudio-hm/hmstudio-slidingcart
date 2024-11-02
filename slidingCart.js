// src/scripts/slidingCart.js v1.1.8
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
  
      async parseOriginalCartContent() {
        console.log('Attempting to parse cart content...');
        
        // Try to get cart content from current page
        const mainCartContent = document.querySelector('.template_for_cart_products_list');
        
        if (mainCartContent) {
          console.log('Found cart content in current page');
          this.parseCartContent({
            productsTemplate: mainCartContent,
            totalsList: document.querySelector('.cart__total-list')
          });
        } else {
          console.log('No cart content found in current page, fetching from cart page...');
          await this.fetchCartPage();
        }
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
        console.log('Successfully fetched cart content');
        this.parseCartContent(cartContent);
      } else {
        console.log('No cart template found in fetched page');
        // If we can't find the template, try to get cart data from Zid's cart badge
        this.checkCartBadge();
      }
    } catch (error) {
      console.error('Error fetching cart page:', error);
      this.checkCartBadge();
    }
  }
      
  checkCartBadge() {
    // Check if there are items in cart based on Zid's cart badge
    const cartBadge = document.querySelector('.cart-icon .badge, .header-cart-icon .badge, a-shopping-cart, .a-shopping-cart');
    const itemCount = cartBadge ? parseInt(cartBadge.textContent) : 0;
    console.log('Cart badge count:', itemCount);
    
    if (itemCount > 0) {
      // If we have items but can't get the template, show a temporary message
      const slidingCartProducts = document.querySelector('#hmstudio-sliding-cart .template_for_cart_products_list');
      if (slidingCartProducts) {
        slidingCartProducts.innerHTML = `<div class="cart-loading" style="text-align: center; padding: 20px;">
          ${this.currentLanguage === 'ar' ? 'جاري تحميل محتويات السلة...' : 'Loading cart contents...'}
        </div>`;
      }
      // Try to fetch cart page again after a short delay
      setTimeout(() => this.fetchCartPage(), 1000);
    } else {
      this.updateEmptyState(false);
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
        // Store original cart functions
        const originalCartProductsHtmlChanged = window.cartProductsHtmlChanged || function() {};
        const originalSetCartBadge = window.setCartBadge || function() {};
    
        // Override cart update function
        window.cartProductsHtmlChanged = (html, cart) => {
          console.log('Cart updated:', { productsCount: cart?.products_count });
          
          // Call original function
          originalCartProductsHtmlChanged(html, cart);
          
          // Update sliding cart
          this.updateSlidingCartContent(html, cart);
    
          // If we're not on the cart page, also update the main cart template
          const mainCartTemplate = document.querySelector('.template_for_cart_products_list');
          if (mainCartTemplate) {
            mainCartTemplate.innerHTML = html;
          }
        };
    
        // Override cart badge function
        window.setCartBadge = (count) => {
          originalSetCartBadge(count);
          console.log('Cart badge updated:', count);
          
          // If count is greater than 0 and we don't have cart content, fetch it
          if (count > 0) {
            const slidingCartProducts = document.querySelector('#hmstudio-sliding-cart .template_for_cart_products_list');
            if (!slidingCartProducts?.children.length) {
              this.fetchCartPage();
            }
          } else {
            this.updateEmptyState(false);
          }
        };
    
        // Listen for add to cart events
        document.addEventListener('click', (e) => {
          if (e.target.matches('.product-card-add-to-cart, .btn-add-to-cart, .quick-view-modal .add-to-cart-btn')) {
            console.log('Add to cart clicked');
            // Wait for Zid to process the add to cart
            setTimeout(() => this.fetchCartPage(), 1000);
          }
        });
    
        // Listen for form submissions
        document.addEventListener('submit', (e) => {
          if (e.target.matches('form[action*="/cart/add"]')) {
            console.log('Cart form submitted');
            // Wait for Zid to process the add to cart
            setTimeout(() => this.fetchCartPage(), 1000);
          }
        });
      }
  
      updateSlidingCartContent(html, cart) {
        console.log('Updating sliding cart content');
        const slidingCart = document.getElementById('hmstudio-sliding-cart');
        if (!slidingCart) return;
    
        // Update products list
        const productsContainer = slidingCart.querySelector('.template_for_cart_products_list');
        if (productsContainer && html) {
          productsContainer.innerHTML = html;
          this.bindProductEvents();
        }
    
        // Update totals if available
        if (cart?.totals) {
          const totalsContainer = slidingCart.querySelector('.cart__total-list');
          if (totalsContainer) {
            let totalsHTML = cart.totals.map(total => `
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
            totalsContainer.innerHTML = totalsHTML;
          }
        }
    
        // Update empty state
        this.updateEmptyState(cart?.products_count > 0);
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
        document.querySelectorAll('.cart-icon, .header-cart-icon, a-shopping-cart, .a-shopping-cart, a-shopping-cart, .a-shopping-cart, [data-cart-icon]').forEach(icon => {
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
