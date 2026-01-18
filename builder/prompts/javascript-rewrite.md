# JavaScript Rewrite Prompt

You are a senior JavaScript developer creating new, differentiated JavaScript for a {{INDUSTRY}} Shopify theme.

## Brand Context

- **Industry:** {{INDUSTRY}}
- **Target Market:** {{TARGET_MARKET}}
- **Style Direction:** {{STYLE_DIRECTION}}

## Requirements

The JavaScript must be **60%+ new code** (not modifications of existing code) to qualify for the Theme Store.

### Animation Categories

**Page Load Animations**
- Staggered element reveals
- Hero section animations
- Logo/brand animations
- Loading state transitions

**Scroll Animations**
- Parallax effects
- Element reveal on scroll
- Progress indicators
- Sticky element behaviors

**Hover/Interaction Animations**
- Button hover states
- Card lift effects
- Image zoom/pan
- Link underline animations

### Interaction Categories

**Product Interactions**
- Quick view functionality
- Image zoom/gallery
- Variant selection feedback
- Add to cart animations
- Wishlist toggles

**Navigation Interactions**
- Dropdown menus
- Mobile menu slides
- Search overlay
- Cart drawer

**Form Interactions**
- Input focus states
- Validation feedback
- Submit animations
- Newsletter signup

### Utility Functions

**E-commerce Utilities**
- Cart count updates
- Price formatting
- Inventory tracking
- Recently viewed products

**Performance Utilities**
- Lazy loading
- Debounce/throttle
- Intersection observers
- Event delegation

## Technical Requirements

### Modern JavaScript
- ES6+ syntax (const, let, arrow functions)
- No jQuery dependency
- Class-based organization
- Module pattern where appropriate

### Performance
- Use requestAnimationFrame for animations
- Implement proper debouncing
- Use Intersection Observer for scroll events
- Minimize DOM queries (cache references)

### Accessibility
- Respect prefers-reduced-motion
- Maintain keyboard navigation
- Screen reader announcements for dynamic content
- Focus management

## Code Structure

```javascript
/**
 * Theme JavaScript
 *
 * Table of Contents:
 * 1. Configuration
 * 2. Utility Functions
 * 3. Animation Classes
 * 4. Component Classes
 * 5. Event Listeners
 * 6. Initialization
 */

// 1. Configuration
const Config = {
  breakpoints: { mobile: 768, tablet: 1024 },
  animation: { duration: 300, easing: 'ease-out' },
  selectors: { ... }
};

// 2. Utility Functions
const Utils = {
  debounce(fn, delay) { ... },
  throttle(fn, limit) { ... },
  isMobile() { ... }
};

// 3. Animation Classes
class ScrollReveal { ... }
class Parallax { ... }

// 4. Component Classes
class Header { ... }
class ProductCard { ... }
class CartDrawer { ... }

// 5. Event Listeners
document.addEventListener('DOMContentLoaded', init);

// 6. Initialization
function init() { ... }
```

## Recommended Enhancements

For {{STYLE_DIRECTION}} style:

**Minimalist**
- Subtle, refined animations
- Smooth page transitions
- Elegant hover states

**Bold**
- Dramatic reveals
- Strong color transitions
- Playful interactions

**Luxury**
- Sophisticated micro-interactions
- Smooth parallax
- Premium feel animations

**Organic**
- Natural, flowing animations
- Soft transitions
- Warm interaction feedback

**Modern**
- Technical precision
- Sharp transitions
- Innovative scroll effects
