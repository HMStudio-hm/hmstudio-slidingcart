// src/scripts/slidingCart.js v1.1.5
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
        this.setupCartListeners();
        this.bindCartIconClick();
        this.fetchInitialCartContent();
      }
  
      async fetchInitialCartContent() {
        try {
          console.log('Fetching initial cart content...');
          // Fetch the cart page content
          const response = await fetch('/cart/view');
          const html = await response.text();
          
          // Create a temporary element to parse the HTML
          const parser = new DOMParser();
          const doc = parser.parseFromString(html, 'text/html');
  
          // Extract cart content
          this.updateFromCartPage(doc);
        } catch (error) {
          console.error('Error fetching cart content:', error);
        }
      }
  
      updateFromCartPage(doc) {
        const slidingCart = document.getElementById('hmstudio-sliding-cart');
        if (!slidingCart) return;
  
        // Get cart products list
        const cartProducts = doc.querySelector('.template_for_cart_products_list');
        if (cartProducts) {
          const slidingCartProducts = slidingCart.querySelector('.template_for_cart_products_list');
          if (slidingCartProducts) {
            slidingCartProducts.innerHTML = cartProducts.innerHTML;
          }
        }
  
        // Get cart totals
        const cartTotals = doc.querySelector('.cart__total-list');
        if (cartTotals) {
          const slidingCartTotals = slidingCart.querySelector('.cart__total-list');
          if (slidingCartTotals) {
            slidingCartTotals.innerHTML = cartTotals.innerHTML;
          }
        }
  
        // Update empty state
        const productsCount = doc.querySelector('.cart__items')?.children.length || 0;
        this.updateEmptyState(productsCount > 0);
  
        // Bind events to the new content
        this.bindCartEvents(slidingCart);
      }
  
      setupCartListeners() {
        // Listen for Zid's cart update event
        const originalCartProductsHtmlChanged = window.cartProductsHtmlChanged || function() {};
        window.cartProductsHtmlChanged = (html, cart) => {
          originalCartProductsHtmlChanged(html, cart);
          this.updateCartContent(html, cart);
        };
  
        // Listen for add to cart button clicks
        document.addEventListener('click', async (e) => {
          if (e.target.matches('.product-card-add-to-cart, .btn-add-to-cart')) {
            // Wait for Zid to process the add to cart
            setTimeout(() => this.fetchInitialCartContent(), 1000);
          }
        });
  
        // Listen for Quick View add to cart
        document.addEventListener('click', async (e) => {
          if (e.target.matches('.quick-view-modal .add-to-cart-btn')) {
            // Wait for Zid to process the add to cart
            setTimeout(() => this.fetchInitialCartContent(), 1000);
          }
        });
  
        // Listen for form submissions (for products with variants)
        document.addEventListener('submit', async (e) => {
          if (e.target.matches('form[action*="/cart/add"]')) {
            // Wait for Zid to process the add to cart
            setTimeout(() => this.fetchInitialCartContent(), 1000);
          }
        });
      }
  
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
  
        // Inject the cart panel
        document.body.insertAdjacentHTML('beforeend', cartPanel);
  
        // Add event listeners
        const closeBtn = document.querySelector('.sliding-cart-close');
        const overlay = document.getElementById('hmstudio-sliding-cart-overlay');
        
        closeBtn?.addEventListener('click', () => this.closeCart());
        overlay?.addEventListener('click', () => this.closeCart());
      }
  
      updateCartContent(html, cart) {
        const slidingCart = document.getElementById('hmstudio-sliding-cart');
        if (!slidingCart) return;
  
        // Update products list
        const productsContainer = slidingCart.querySelector('.template_for_cart_products_list');
        if (productsContainer && html) {
          productsContainer.innerHTML = html;
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
  
        // Update empty state
        this.updateEmptyState(cart && cart.products_count > 0);
  
        // Bind events to the new content
        this.bindCartEvents(slidingCart);
      }
  
      updateEmptyState(hasProducts) {
        const slidingCart = document.getElementById('hmstudio-sliding-cart');
        if (!slidingCart) return;
  
        const emptyMessage = slidingCart.querySelector('.sliding-cart-empty');
        const itemsContainer = slidingCart.querySelector('.sliding-cart-items');
  
        if (hasProducts) {
          if (emptyMessage) emptyMessage.style.display = 'none';
          if (itemsContainer) itemsContainer.style.display = 'block';
        } else {
          if (emptyMessage) emptyMessage.style.display = 'flex';
          if (itemsContainer) itemsContainer.style.display = 'none';
        }
      }
  
      bindCartEvents(container) {
        // Bind quantity change events
        container.querySelectorAll('.cart-product-quantity-dropdown select').forEach(select => {
          select.addEventListener('change', async (e) => {
            const row = e.target.closest('.cart-product-row');
            if (row) {
              const deleteIcon = row.querySelector('.icon-delete');
              const prefix = row.querySelector('.prefix');
              if (deleteIcon) deleteIcon.style.display = 'none';
              if (prefix) prefix.style.display = 'block';
            }
          });
        });
  
        // Bind delete button events
        container.querySelectorAll('.cart-product-delete a').forEach(button => {
          button.addEventListener('click', (e) => {
            const deleteIcon = button.querySelector('.icon-delete');
            const prefix = button.querySelector('.prefix');
            if (deleteIcon) deleteIcon.style.display = 'none';
            if (prefix) prefix.style.display = 'block';
          });
        });
      }
  
      bindCartIconClick() {
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
          // Refresh cart content when opening
          this.fetchInitialCartContent();
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
