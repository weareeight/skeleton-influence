/**
 * Animation Controller - Elle Theme
 * IntersectionObserver-based scroll-triggered animations
 * Respects user preferences and theme settings
 */

class AnimationController {
  constructor(options = {}) {
    this.options = {
      threshold: 0.05,  // Lower threshold for earlier triggering
      rootMargin: '50px 0px -30px 0px',  // Added top margin for elements entering from above
      ...options
    };

    this.observer = null;
    this.initialized = false;

    // Reveal elements need scroll-based detection because clip-path
    // creates 0 visible area, preventing IntersectionObserver from working
    this.revealElements = [];
    this.scrollHandler = null;
    this.ticking = false;
  }

  /**
   * Initialize the animation controller
   * Call this after DOM is ready
   */
  init() {
    // Check if animations are disabled
    if (this.shouldDisableAnimations()) {
      this.showAllElements();
      return;
    }

    // Create IntersectionObserver
    this.observer = new IntersectionObserver(
      this.handleIntersect.bind(this),
      {
        threshold: this.options.threshold,
        rootMargin: this.options.rootMargin
      }
    );

    // Observe all animated elements
    this.observeElements();
    this.initialized = true;

    // Setup scroll-based detection for reveal elements (clip-path workaround)
    this.setupScrollListener();

    // Re-observe on Shopify section events (theme editor)
    this.setupSectionEvents();
  }

  /**
   * Check if element uses clip-path reveal animation
   * These need scroll-based detection instead of IntersectionObserver
   */
  isRevealElement(el) {
    const animType = el.dataset.animate || '';
    return animType.startsWith('reveal');
  }

  /**
   * Setup scroll listener for reveal elements
   * Uses requestAnimationFrame for performance
   */
  setupScrollListener() {
    if (this.revealElements.length === 0) {
      return;
    }

    this.scrollHandler = () => {
      if (!this.ticking) {
        requestAnimationFrame(() => {
          this.checkRevealElements();
          this.ticking = false;
        });
        this.ticking = true;
      }
    };

    window.addEventListener('scroll', this.scrollHandler, { passive: true });

    // Initial check in case elements are already in view
    this.checkRevealElements();
  }

  /**
   * Check reveal elements on scroll and trigger animations
   */
  checkRevealElements() {
    if (this.revealElements.length === 0) {
      // All done, remove scroll listener
      if (this.scrollHandler) {
        window.removeEventListener('scroll', this.scrollHandler);
        this.scrollHandler = null;
      }
      return;
    }

    const windowHeight = window.innerHeight || document.documentElement.clientHeight;
    const triggerPoint = windowHeight * 0.85; // Trigger when element is 85% down the viewport

    // Check each reveal element
    this.revealElements = this.revealElements.filter(el => {
      const rect = el.getBoundingClientRect();

      // Trigger when top of element enters trigger zone
      if (rect.top < triggerPoint && rect.bottom > 0) {
        this.triggerAnimation(el);
        return false; // Remove from array
      }
      return true; // Keep in array
    });
  }

  /**
   * Check if animations should be disabled
   */
  shouldDisableAnimations() {
    // Check prefers-reduced-motion
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return true;
    }

    // Check theme setting
    const body = document.body;
    if (body.classList.contains('animations-disabled')) {
      return true;
    }

    return false;
  }

  /**
   * Show all elements immediately (for when animations disabled)
   */
  showAllElements() {
    document.querySelectorAll('[data-animate]').forEach(el => {
      el.classList.add('is-visible');
    });
  }

  /**
   * Observe all elements with data-animate attribute
   */
  observeElements() {
    const elements = document.querySelectorAll('[data-animate]:not(.is-visible)');

    elements.forEach((el) => {
      const isReveal = this.isRevealElement(el);

      // Check if element is already in viewport (fixes above-the-fold elements)
      if (this.isInViewport(el)) {
        this.triggerAnimation(el);
      } else if (isReveal) {
        // Reveal elements use scroll-based detection (clip-path prevents IntersectionObserver)
        this.revealElements.push(el);
      } else {
        // Standard elements use IntersectionObserver
        this.observer.observe(el);
      }
    });
  }

  /**
   * Check if an element is currently in the viewport
   */
  isInViewport(el) {
    const rect = el.getBoundingClientRect();
    const windowHeight = window.innerHeight || document.documentElement.clientHeight;
    const windowWidth = window.innerWidth || document.documentElement.clientWidth;

    // Element is in viewport if any part of it is visible
    const vertInView = (rect.top <= windowHeight) && ((rect.top + rect.height) >= 0);
    const horInView = (rect.left <= windowWidth) && ((rect.left + rect.width) >= 0);

    return vertInView && horInView;
  }

  /**
   * Trigger animation for an element
   */
  triggerAnimation(el) {
    const delay = this.getDelay(el);

    if (delay > 0) {
      setTimeout(() => {
        el.classList.add('is-visible');
      }, delay);
    } else {
      el.classList.add('is-visible');
    }
  }

  /**
   * Handle intersection changes
   */
  handleIntersect(entries) {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        this.triggerAnimation(entry.target);
        // Stop observing this element
        this.observer.unobserve(entry.target);
      }
    });
  }

  /**
   * Get delay from element attributes or CSS variable
   */
  getDelay(el) {
    // Check data-animate-delay attribute (in ms)
    const dataDelay = el.dataset.animateDelay;
    if (dataDelay) {
      return parseInt(dataDelay, 10);
    }

    // Check --delay CSS custom property
    const style = el.style;
    if (style.getPropertyValue('--delay')) {
      return 0; // CSS handles the delay via transition-delay
    }

    return 0;
  }

  /**
   * Setup Shopify section events for theme editor
   */
  setupSectionEvents() {
    document.addEventListener('shopify:section:load', (e) => {
      // Re-observe elements in the loaded section
      const section = e.target;
      section.querySelectorAll('[data-animate]:not(.is-visible)').forEach(el => {
        // Check if element is already in viewport
        if (this.isInViewport(el)) {
          this.triggerAnimation(el);
        } else if (this.isRevealElement(el)) {
          // Add to reveal elements for scroll detection
          if (!this.revealElements.includes(el)) {
            this.revealElements.push(el);
          }
          // Re-setup scroll listener if needed
          if (!this.scrollHandler) {
            this.setupScrollListener();
          }
        } else {
          this.observer.observe(el);
        }
      });
    });

    document.addEventListener('shopify:section:reorder', () => {
      // Re-observe all elements
      this.revealElements = []; // Reset reveal elements
      this.observeElements();
      // Re-setup scroll listener
      if (!this.scrollHandler && this.revealElements.length > 0) {
        this.setupScrollListener();
      }
    });

    // Also listen for section select (theme editor)
    document.addEventListener('shopify:section:select', (e) => {
      const section = e.target;
      // Trigger animations for visible elements in selected section
      section.querySelectorAll('[data-animate]:not(.is-visible)').forEach(el => {
        if (this.isInViewport(el)) {
          this.triggerAnimation(el);
        }
      });
    });
  }

  /**
   * Manually trigger animation for an element
   */
  animate(element) {
    if (element && !element.classList.contains('is-visible')) {
      this.triggerAnimation(element);
      if (this.observer) {
        this.observer.unobserve(element);
      }
    }
  }

  /**
   * Reset an element to its pre-animated state
   */
  reset(element) {
    if (element) {
      element.classList.remove('is-visible');
      if (this.initialized) {
        if (this.isRevealElement(element)) {
          // Add back to reveal elements for scroll detection
          if (!this.revealElements.includes(element)) {
            this.revealElements.push(element);
          }
          // Re-setup scroll listener if needed
          if (!this.scrollHandler) {
            this.setupScrollListener();
          }
        } else if (this.observer) {
          this.observer.observe(element);
        }
      }
    }
  }

  /**
   * Disconnect the observer (cleanup)
   */
  destroy() {
    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
    }
    if (this.scrollHandler) {
      window.removeEventListener('scroll', this.scrollHandler);
      this.scrollHandler = null;
    }
    this.revealElements = [];
    this.initialized = false;
  }
}

/**
 * Stagger utility - applies incremental delays to a list of elements
 * @param {NodeList|Array} elements - Elements to stagger
 * @param {number} baseDelay - Starting delay in ms (default: 0)
 * @param {number} increment - Delay increment per element in ms (uses --animate-stagger CSS var as default)
 */
function staggerElements(elements, baseDelay = 0, increment = null) {
  const staggerIncrement = increment || parseInt(
    getComputedStyle(document.documentElement).getPropertyValue('--animate-stagger') || '50',
    10
  );

  elements.forEach((el, index) => {
    const delay = baseDelay + (index * staggerIncrement);
    el.style.setProperty('--delay', `${delay}ms`);
    el.dataset.animateDelay = delay;
  });
}

/**
 * Apply stagger to grid items within a container
 * Calculates row-first ordering for natural cascade effect
 * @param {Element} container - Container element
 * @param {string} itemSelector - Selector for grid items
 * @param {number} columns - Number of columns (will auto-detect if not provided)
 */
function staggerGrid(container, itemSelector = '[data-animate]', columns = null) {
  const items = container.querySelectorAll(itemSelector);
  if (!items.length) return;

  // Try to detect columns from CSS grid
  if (!columns) {
    const gridStyle = getComputedStyle(container);
    const templateColumns = gridStyle.gridTemplateColumns;
    if (templateColumns && templateColumns !== 'none') {
      columns = templateColumns.split(' ').filter(s => s !== '').length;
    } else {
      columns = 4; // Default fallback
    }
  }

  const staggerIncrement = parseInt(
    getComputedStyle(document.documentElement).getPropertyValue('--animate-stagger') || '50',
    10
  );

  items.forEach((item, index) => {
    const row = Math.floor(index / columns);
    const col = index % columns;
    // Cascade: row + column creates diagonal effect
    const delay = (row + col) * staggerIncrement;
    item.style.setProperty('--delay', `${delay}ms`);
    item.dataset.animateDelay = delay;
  });
}

// Create global instance
const animationController = new AnimationController();

// Auto-initialize on DOM ready with a small delay to ensure layout is complete
function initAnimations() {
  // Use requestAnimationFrame to ensure rendering is complete
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      animationController.init();
    });
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initAnimations);
} else {
  initAnimations();
}

// Export for module usage and global access
window.animationController = animationController;
window.staggerElements = staggerElements;
window.staggerGrid = staggerGrid;
