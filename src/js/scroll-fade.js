/**
 * Scroll Fade System
 * A modular, customizable system for adding fade effects to elements on scroll
 */

class ScrollFade {
  /**
   * Initialize the ScrollFade system
   * @param {Object} options - Configuration options
   */
  constructor(options = {}) {
    // Handle scroll restoration before any other initialization
    if (options.resetScrollOnPageLoad === false) {
      // Allow browser's default scroll restoration
      if (typeof history.scrollRestoration !== 'undefined') {
        history.scrollRestoration = 'auto';
      }
    } else if (typeof history.scrollRestoration !== 'undefined') {
      // Prevent browser from restoring scroll
      history.scrollRestoration = 'manual';
      // Immediately reset scroll position
      window.scrollTo(0, 0);
    }

    // Default configuration
    this.config = {
      // Core features
      enableFadeEffects: true,          // Enable/disable fade effects
      enableScrollToTop: true,          // Enable/disable scroll-to-top button
      resetScrollOnPageLoad: true,      // Reset scroll position on page load
      
      // Classes
      fadeBaseClass: 'fade',            // Base class for all fade effects
      fadeVisibleClass: 'visible',      // Class added when element is visible
      // Legacy support for fade-in class (xurst.github.io uses this)
      legacyFadeClass: 'fade-in',       // Legacy fade-in class
      
      // Selectors
      fadeElementsSelector: '.fade, .fade-in', // Selector for fade elements
      
      // Scroll-to-top button
      scrollTopBtnId: 'scrollTopBtn',   // ID for scroll-to-top button
      scrollTopBtnHTML: '<i class="fas fa-arrow-up"></i>', // Button HTML
      scrollTopThreshold: 300,          // Show button after scrolling this many pixels
      
      // Observer options
      observerThreshold: 0.05,          // Intersection threshold (0-1)
      observerMargin: '0px 0px -10% 0px', // Root margin
      
      // Auto-fade elements (array of selectors to automatically add fade class)
      elementsToFade: [
        '.profile-section',
        '.projects-section h2',
        '.projects-controls',
        // Removed .project-card to stop auto-adding fade
        '.about-me-section',
        '.featured-section',
        '.about-content',
        '.topbar',
        '.topbar-item'
      ],
      
      // Staggered animations
      enableStaggering: false,          // Enable staggered animations for child elements
      staggerSelector: null,            // Selector for elements to stagger within parent
      staggerDelay: 0.1,                // Delay between each staggered element (seconds)
      
      // Debug mode
      debug: false                      // Enable debug logging
    };
    
    // Override defaults with provided options
    Object.assign(this.config, options);
    
    // Store state
    this.state = {
      initialized: false,
      observer: null,
      elements: [],
      buttonVisible: false
    };
    
    // Initialize on DOM content loaded
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.init());
    } else {
      this.init();
    }
    
    // Re-check on window load (for images, etc.)
    window.addEventListener('load', () => {
      setTimeout(() => this.refreshElements(), 100);
    });
  }
  
  /**
   * Initialize the ScrollFade system
   */
  init() {
    if (this.state.initialized) return;
    this.state.initialized = true;
    
    this.log('Initializing ScrollFade');
    
    // We handle resetScrollOnPageLoad in the constructor now
    
    // Initialize fade effects
    if (this.config.enableFadeEffects) {
      this.setupFadeEffects();
    }
    
    // Initialize scroll-to-top button
    if (this.config.enableScrollToTop) {
      this.setupScrollToTop();
    }
  }
  
  /**
   * Log message if debug mode is enabled
   * @param {string} message - Message to log
   */
  log(message) {
    if (this.config.debug) {
      console.log(`[ScrollFade] ${message}`);
    }
  }
  
  /**
   * Setup fade effects
   */
  setupFadeEffects() {
    // Add fade class to specified elements
    this.addFadeClassesToElements();
    
    // Setup intersection observer
    this.setupIntersectionObserver();
    
    // Setup backup scroll-based detection
    this.setupScrollBasedDetection();
    
    this.log('Fade effects initialized');
  }
  
  /**
   * Add fade classes to specified elements
   */
  addFadeClassesToElements() {
    if (!this.config.elementsToFade || !this.config.elementsToFade.length) return;
    
    this.config.elementsToFade.forEach(selector => {
      document.querySelectorAll(selector).forEach(el => {
        // Don't add the class if it already has either the new or legacy class
        if (!el.classList.contains(this.config.fadeBaseClass) && 
            !el.classList.contains(this.config.legacyFadeClass)) {
          el.classList.add(this.config.legacyFadeClass); // Use legacy class for backward compatibility
          this.log(`Added fade class to ${selector}`);
        }
      });
    });
  }
  
  /**
   * Setup intersection observer for fade elements
   */
  setupIntersectionObserver() {
    // Get all fade elements (both new .fade and legacy .fade-in)
    const fadeElements = document.querySelectorAll(this.config.fadeElementsSelector);
    this.state.elements = fadeElements;
    
    if (!fadeElements.length) {
      this.log('No fade elements found');
      return;
    }
    
    this.log(`Found ${fadeElements.length} fade elements`);
    
    // Create intersection observer
    this.state.observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          this.makeElementVisible(entry.target);
          
          // If staggering is enabled, handle child elements
          if (this.config.enableStaggering && this.config.staggerSelector) {
            this.handleStaggeredChildren(entry.target);
          }
        }
      });
    }, {
      threshold: this.config.observerThreshold,
      rootMargin: this.config.observerMargin
    });
    
    // Observe all fade elements
    fadeElements.forEach(element => {
      this.state.observer.observe(element);
    });
  }
  
  /**
   * Handle staggered animations for child elements
   * @param {Element} parent - Parent element
   */
  handleStaggeredChildren(parent) {
    if (!this.config.staggerSelector) return;
    
    const children = parent.querySelectorAll(this.config.staggerSelector);
    
    children.forEach((child, index) => {
      // Skip if already visible
      if (child.classList.contains(this.config.fadeVisibleClass)) return;
      
      // Add base fade class if not present
      if (!child.classList.contains(this.config.fadeBaseClass) && 
          !child.classList.contains(this.config.legacyFadeClass)) {
        child.classList.add(this.config.legacyFadeClass);
      }
      
      // Set delay based on index
      child.style.transitionDelay = `${index * this.config.staggerDelay}s`;
      
      // Make visible after a small delay to ensure transition works
      setTimeout(() => {
        child.classList.add(this.config.fadeVisibleClass);
      }, 10);
    });
  }
  
  /**
   * Setup scroll-based detection (backup for intersection observer)
   */
  setupScrollBasedDetection() {
    // Function to check if element is in viewport
    const isInViewport = element => {
      const rect = element.getBoundingClientRect();
      return (
        rect.top <= (window.innerHeight * 0.9) && 
        rect.bottom >= 0
      );
    };
    
    // Function to check elements on scroll
    const checkElements = () => {
      document.querySelectorAll(this.config.fadeElementsSelector).forEach(element => {
        if (!element.classList.contains(this.config.fadeVisibleClass) && isInViewport(element)) {
          this.makeElementVisible(element);
        }
      });
    };
    
    // Listen for scroll events (throttled)
    let scrollTimeout;
    window.addEventListener('scroll', () => {
      if (scrollTimeout) return;
      scrollTimeout = setTimeout(() => {
        checkElements();
        scrollTimeout = null;
      }, 100);
    });
    
    // Check once on initialization
    setTimeout(checkElements, 100);
  }
  
  /**
   * Make an element visible
   * @param {Element} element - Element to make visible
   */
  makeElementVisible(element) {
    if (!element.classList.contains(this.config.fadeVisibleClass)) {
      element.classList.add(this.config.fadeVisibleClass);
      this.log(`Made element visible: ${element.tagName}${element.id ? '#' + element.id : ''}`);
      
      // If observer exists, stop observing this element
      if (this.state.observer) {
        this.state.observer.unobserve(element);
      }
    }
  }
  
  /**
   * Setup scroll-to-top button
   */
  setupScrollToTop() {
    // Create/get button
    let btn = document.getElementById(this.config.scrollTopBtnId);
    
    if (!btn) {
      btn = document.createElement('button');
      btn.id = this.config.scrollTopBtnId;
      btn.innerHTML = this.config.scrollTopBtnHTML;
      document.body.appendChild(btn);
      this.log('Created scroll-to-top button');
    }
    
    // Show/hide button on scroll
    window.addEventListener('scroll', () => {
      if (window.scrollY > this.config.scrollTopThreshold) {
        if (!this.state.buttonVisible) {
          btn.classList.add(this.config.fadeVisibleClass);
          this.state.buttonVisible = true;
        }
      } else {
        if (this.state.buttonVisible) {
          btn.classList.remove(this.config.fadeVisibleClass);
          this.state.buttonVisible = false;
        }
      }
    });
    
    // Scroll to top on click
    btn.addEventListener('click', () => {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    });
  }
  
  /**
   * Refresh elements (useful after dynamic content is added)
   */
  refreshElements() {
    if (!this.config.enableFadeEffects) return;
    
    this.log('Refreshing elements');
    
    // Add fade class to specified elements
    this.addFadeClassesToElements();
    
    // Re-observe new elements
    const fadeElements = document.querySelectorAll(this.config.fadeElementsSelector);
    
    if (this.state.observer) {
      fadeElements.forEach(element => {
        if (!element.classList.contains(this.config.fadeVisibleClass)) {
          this.state.observer.observe(element);
        }
      });
    }
  }
  
  /**
   * Add fade to a specific element
   * @param {string|Element} element - Element selector or DOM element
   * @param {string} effect - Fade effect to apply (e.g., 'fade-up', 'fade-left')
   */
  addFadeTo(element, effect = '') {
    const el = typeof element === 'string' ? document.querySelector(element) : element;
    
    if (!el) {
      this.log(`Element not found: ${element}`);
      return;
    }
    
    // Add base fade class - use legacy class for backward compatibility
    if (!el.classList.contains(this.config.fadeBaseClass) && 
        !el.classList.contains(this.config.legacyFadeClass)) {
      el.classList.add(this.config.legacyFadeClass);
    }
    
    // Add effect class if specified
    if (effect && !el.classList.contains(effect)) {
      el.classList.add(effect);
    }
    
    // Observe element if observer exists
    if (this.state.observer && !el.classList.contains(this.config.fadeVisibleClass)) {
      this.state.observer.observe(el);
    }
    
    this.log(`Added fade to element: ${element} with effect: ${effect || 'default'}`);
    
    // Check if element is already in viewport
    const rect = el.getBoundingClientRect();
    if (rect.top <= window.innerHeight && rect.bottom >= 0) {
      setTimeout(() => this.makeElementVisible(el), 100);
    }
  }
  
  /**
   * Show the scroll-to-top button
   */
  showScrollTopButton() {
    if (!this.config.enableScrollToTop) return;
    
    const btn = document.getElementById(this.config.scrollTopBtnId);
    if (btn) {
      btn.classList.add(this.config.fadeVisibleClass);
      this.state.buttonVisible = true;
    }
  }
  
  /**
   * Hide the scroll-to-top button
   */
  hideScrollTopButton() {
    if (!this.config.enableScrollToTop) return;
    
    const btn = document.getElementById(this.config.scrollTopBtnId);
    if (btn) {
      btn.classList.remove(this.config.fadeVisibleClass);
      this.state.buttonVisible = false;
    }
  }
  
  /**
   * Scroll to top
   * @param {boolean} smooth - Whether to use smooth scrolling
   */
  scrollToTop(smooth = true) {
    window.scrollTo({
      top: 0,
      behavior: smooth ? 'smooth' : 'auto'
    });
  }
  
  /**
   * Update configuration
   * @param {Object} newOptions - New configuration options
   */
  updateConfig(newOptions) {
    Object.assign(this.config, newOptions);
    this.log('Updated configuration');
    
    // Refresh elements with new configuration
    this.refreshElements();
  }
  
  /**
   * Make all elements visible (useful for print view)
   */
  showAllElements() {
    document.querySelectorAll(this.config.fadeElementsSelector).forEach(element => {
      element.classList.add(this.config.fadeVisibleClass);
    });
  }
  
  /**
   * Destroy the ScrollFade instance
   */
  destroy() {
    this.log('Destroying ScrollFade instance');
    
    // Disconnect observer
    if (this.state.observer) {
      this.state.observer.disconnect();
    }
    
    // Make all elements visible
    this.showAllElements();
    
    // Remove scroll-to-top button
    if (this.config.enableScrollToTop) {
      const btn = document.getElementById(this.config.scrollTopBtnId);
      if (btn) {
        btn.remove();
      }
    }
  }
}

// Initialize the ScrollFade system
document.addEventListener('DOMContentLoaded', () => {
  // Create an instance with custom options
  window.scrollFade = new ScrollFade({
    resetScrollOnPageLoad: true,          // Reset scroll position on page load
    enableStaggering: true,               // Enable staggered animations
    staggerSelector: '.stagger-item',     // Selector for staggered elements
    observerThreshold: 0.05,              // Lower threshold for better visibility
    debug: false                          // Set to true for debug logging
  });
});

// Make available globally
window.ScrollFade = ScrollFade;
