/**
 * Blog Module - Elle Theme
 * Handles reading progress, estimated read time, and other blog enhancements
 */

(function() {
  'use strict';

  /**
   * Reading Progress Bar
   * Tracks scroll position relative to article content
   */
  class ReadingProgress {
    constructor() {
      this.progressBar = document.querySelector('.reading-progress');
      this.progressFill = document.querySelector('.reading-progress__bar');
      this.articleContent = document.querySelector('[data-article-content]');

      if (!this.progressBar || !this.progressFill || !this.articleContent) {
        return;
      }

      this.init();
    }

    init() {
      // Use passive scroll listener for performance
      window.addEventListener('scroll', this.handleScroll.bind(this), { passive: true });

      // Initial calculation
      this.handleScroll();

      // Recalculate on resize
      window.addEventListener('resize', this.debounce(this.handleScroll.bind(this), 100), { passive: true });
    }

    handleScroll() {
      const contentRect = this.articleContent.getBoundingClientRect();
      const contentTop = contentRect.top + window.scrollY;
      const contentHeight = this.articleContent.offsetHeight;
      const viewportHeight = window.innerHeight;

      // Start tracking when article comes into view
      const scrollStart = contentTop - viewportHeight * 0.2;
      // End when bottom of article is at middle of viewport
      const scrollEnd = contentTop + contentHeight - viewportHeight * 0.5;
      const scrollRange = scrollEnd - scrollStart;

      const currentScroll = window.scrollY;
      let progress = 0;

      if (currentScroll >= scrollStart && scrollRange > 0) {
        progress = Math.min(((currentScroll - scrollStart) / scrollRange) * 100, 100);
      }

      // Show/hide progress bar
      if (currentScroll > scrollStart - 100) {
        this.progressBar.classList.add('is-visible');
      } else {
        this.progressBar.classList.remove('is-visible');
      }

      // Update progress
      this.progressFill.style.width = `${progress}%`;
      this.progressBar.setAttribute('aria-valuenow', Math.round(progress));
    }

    debounce(func, wait) {
      let timeout;
      return function executedFunction(...args) {
        const later = () => {
          clearTimeout(timeout);
          func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
      };
    }
  }

  /**
   * Estimated Read Time Calculator
   * Calculates and displays estimated reading time based on word count
   */
  class ReadTimeCalculator {
    constructor() {
      this.WORDS_PER_MINUTE = 250; // Average reading speed
      this.articleContent = document.querySelector('[data-article-content]');
      this.readTimeDisplay = document.querySelector('[data-read-time]');

      if (!this.articleContent || !this.readTimeDisplay) {
        return;
      }

      this.init();
    }

    init() {
      const wordCount = this.countWords(this.articleContent.textContent);
      const readTime = Math.max(1, Math.ceil(wordCount / this.WORDS_PER_MINUTE));

      // Update display
      this.readTimeDisplay.textContent = this.formatReadTime(readTime);
      this.readTimeDisplay.setAttribute('data-word-count', wordCount);
    }

    countWords(text) {
      // Remove extra whitespace and count words
      return text
        .trim()
        .replace(/\s+/g, ' ')
        .split(' ')
        .filter(word => word.length > 0).length;
    }

    formatReadTime(minutes) {
      // Check for translation key, fallback to English
      const template = window.theme?.strings?.readTime || '{minutes} min read';
      return template.replace('{minutes}', minutes);
    }
  }

  /**
   * Drop Caps Enhancement
   * Adds drop cap class to first paragraph if enabled
   */
  class DropCaps {
    constructor() {
      this.articleContent = document.querySelector('[data-article-content]');
      this.isEnabled = document.body.hasAttribute('data-drop-caps');

      if (!this.articleContent || !this.isEnabled) {
        return;
      }

      this.init();
    }

    init() {
      // Find the first paragraph that has meaningful text
      const paragraphs = this.articleContent.querySelectorAll('p');

      for (const p of paragraphs) {
        const text = p.textContent.trim();

        // Skip empty paragraphs or those that start with special characters
        if (text.length > 50 && /^[A-Za-z]/.test(text)) {
          p.classList.add('has-drop-cap');
          break;
        }
      }
    }
  }

  // Initialize modules when DOM is ready
  function init() {
    new ReadingProgress();
    new ReadTimeCalculator();
    new DropCaps();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
