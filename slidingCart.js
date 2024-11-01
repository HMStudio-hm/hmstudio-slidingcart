// src/scripts/slidingCart.js v1.1.4
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
          this.interceptCartPageNavigation();
          
          // Initial cart data fetch using Zid's cart template
          this.fetchCartData();
        }
      
        // Add this new method
        interceptCartPageNavigation() {
          // Intercept clicks on cart links
          document.addEventListener('click', (e) => {
            const cartLink = e.target.closest('a[href="/cart"], a[href*="/cart/view"]');
            if (cartLink) {
              e.preventDefault();
              this.openCart();
            }
          });
      
          // Check if we're on the cart page
          if (window.location.pathname.includes('/cart/view')) {
            // Redirect to home page if we're on cart page
            window.history.replaceState({}, '', '/');
          }
        }
      
        // Add new method to fetch cart data
        async fetchCartData() {
          try {
            // Create a temporary hidden div to fetch cart content
            const tempDiv = document.createElement('div');
            tempDiv.style.display = 'none';
            document.body.appendChild(tempDiv);
      
            // Fetch the cart page content
            const response = await fetch('/cart/view');
            const html = await response.text();
            tempDiv.innerHTML = html;
      
            // Extract cart template and totals
            const cartTemplate = tempDiv.querySelector('.template_for_cart_products_list');
            const cartTotals = tempDiv.querySelector('.cart__total-list');
      
            // Update sliding cart content
            if (cartTemplate) {
              const slidingCartTemplate = document.querySelector('#hmstudio-sliding-cart .template_for_cart_products_list');
              if (slidingCartTemplate) {
                slidingCartTemplate.innerHTML = cartTemplate.innerHTML;
                this.bindCartEvents(slidingCartTemplate);
              }
            }
      
            if (cartTotals) {
              const slidingCartTotals = document.querySelector('#hmstudio-sliding-cart .cart__total-list');
              if (slidingCartTotals) {
                slidingCartTotals.innerHTML = cartTotals.innerHTML;
              }
            }
      
            // Check cart state
            const productsCount = tempDiv.querySelectorAll('.cart-product-row').length;
            this.updateEmptyState(productsCount === 0);
      
            // Clean up
            document.body.removeChild(tempDiv);
          } catch (error) {
            console.error('Error fetching cart data:', error);
          }
        }
      
        // Modify updateCartContent method
        updateCartContent(html, cart) {
          const slidingCart = document.getElementById('hmstudio-sliding-cart');
          if (!slidingCart) return;
      
          const productsContainer = slidingCart.querySelector('.template_for_cart_products_list');
          const emptyMessage = slidingCart.querySelector('.sliding-cart-empty');
          const itemsContainer = slidingCart.querySelector('.sliding-cart-items');
      
          if (!cart || cart.products_count <= 0) {
            this.updateEmptyState(true);
          } else {
            this.updateEmptyState(false);
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
      
        // Add new method for empty state
        updateEmptyState(isEmpty) {
          const slidingCart = document.getElementById('hmstudio-sliding-cart');
          if (!slidingCart) return;
      
          const emptyMessage = slidingCart.querySelector('.sliding-cart-empty');
          const itemsContainer = slidingCart.querySelector('.sliding-cart-items');
          const checkoutButton = slidingCart.querySelector('.checkout-button');
      
          if (isEmpty) {
            if (emptyMessage) emptyMessage.style.display = 'flex';
            if (itemsContainer) itemsContainer.style.display = 'none';
            if (checkoutButton) checkoutButton.style.display = 'none';
          } else {
            if (emptyMessage) emptyMessage.style.display = 'none';
            if (itemsContainer) itemsContainer.style.display = 'block';
            if (checkoutButton) checkoutButton.style.display = 'block';
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
            // Fetch fresh cart data when opening
            this.fetchCartData();
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
