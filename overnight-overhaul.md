# Overnight Overhaul: Page Audit & Enhancement Plan

## Executive Summary

Comprehensive audit of Blog, Blog Post (Article), Page, Search, and Cart pages reveals systemic issues across all sections:

1. **Missing Animations** - Sections don't use the `data-animate` system despite it being fully implemented
2. **Missing Scoped CSS** - Several sections lack `{% stylesheet %}` blocks, relying on non-existent global classes
3. **Incomplete Settings** - Sparse configuration compared to completed sections (featured-collection, main-product)
4. **Grid/Column Failures** - CSS variables defined but no underlying grid CSS exists
5. **Theme Store Feature Gaps** - Gift card recipient form, dynamic checkout in drawer missing

---

## Critical Files to Modify

### Sections
| File | Priority | Status |
|------|----------|--------|
| `sections/main-blog.liquid` | HIGH | Missing scoped CSS, no animations |
| `sections/main-article.liquid` | HIGH | Missing scoped CSS, no animations |
| `sections/main-page.liquid` | MEDIUM | Bare-bones, only 4 settings |
| `sections/main-search.liquid` | HIGH | Translation bug, missing CSS |
| `sections/main-cart.liquid` | MEDIUM | Sparse settings, no animations |
| `sections/cart-drawer.liquid` | HIGH | Missing dynamic checkout buttons |

### Snippets
| File | Priority | Issue |
|------|----------|-------|
| `snippets/article-card.liquid` | LOW | Needs focal point support |
| `snippets/predictive-search.liquid` | HIGH | Translation bug in JS |

### Assets
| File | Priority | Issue |
|------|----------|-------|
| `assets/theme.css` | HIGH | Missing grid/section styles |

### Locales
| File | Priority | Issue |
|------|----------|-------|
| `locales/en.default.json` | LOW | Add missing translations |
| `locales/en.default.schema.json` | LOW | Add settings translations |

---

## Phase 1: Critical Bug Fixes & Theme Store Requirements

**Priority: BLOCKING - Must fix before Theme Store submission**

### 1.1 Fix Predictive Search Translation Bug

**File:** `sections/main-search.liquid`

**Issue:** Liquid translation tags inside JavaScript template literals won't process. The translations render literally as `{{ 'search.products' | t }}` instead of the actual translated text.

**Current Code (Broken):**
```javascript
html += `<h3 class="predictive-search__section-title">{{ 'search.products' | t }}</h3>`;
```

**Solution:** Pre-render translations into data attributes or a hidden element:
```liquid
<predictive-search
  data-label-products="{{ 'search.products' | t }}"
  data-label-articles="{{ 'search.articles' | t }}"
  data-label-pages="{{ 'search.pages' | t }}"
  data-label-no-results="{{ 'search.no_results' | t }}"
>
```

Then reference in JavaScript:
```javascript
const labels = {
  products: this.dataset.labelProducts,
  articles: this.dataset.labelArticles,
  pages: this.dataset.labelPages,
  noResults: this.dataset.labelNoResults
};
html += `<h3 class="predictive-search__section-title">${labels.products}</h3>`;
```

---

### 1.2 Add Dynamic Checkout to Cart Drawer

**File:** `sections/cart-drawer.liquid`

**Issue:** Missing Shop Pay, Apple Pay, Google Pay buttons - only has standard checkout link.

**Required For:** Theme Store compliance - "Accelerated checkout buttons" must be available.

**Current Footer (Missing Dynamic Buttons):**
```liquid
<div class="cart-drawer__buttons">
  <a href="{{ routes.cart_url }}" class="btn btn--secondary">
    {{ 'cart.view_cart' | t }}
  </a>
  <a href="/checkout" class="btn btn--primary">
    {{ 'cart.checkout' | t }}
  </a>
</div>
```

**Solution:** Add dynamic checkout buttons:
```liquid
<div class="cart-drawer__buttons">
  <a href="{{ routes.cart_url }}" class="btn btn--secondary">
    {{ 'cart.view_cart' | t }}
  </a>

  {%- if additional_checkout_buttons -%}
    <div class="cart-drawer__dynamic-checkout">
      {{ content_for_additional_checkout_buttons }}
    </div>
  {%- endif -%}

  <a href="/checkout" class="btn btn--primary">
    {{ 'cart.checkout' | t }}
  </a>
</div>
```

**Add Setting:**
```json
{
  "type": "checkbox",
  "id": "show_dynamic_checkout",
  "label": "t:sections.cart_drawer.settings.show_dynamic_checkout.label",
  "default": true
}
```

---

### 1.3 Gift Card Recipient Form

**Files:** `sections/main-cart.liquid`, `sections/cart-drawer.liquid`

**Issue:** Cannot gift products from cart. Theme Store requires support for gift card recipient forms with `form.email`, `form.name`, `form.message`, and `send_on` fields.

**Reference Implementation (from main-product.liquid):**
```liquid
{%- if product.gift_card? -%}
  <div class="gift-card-recipient">
    <label class="gift-card-recipient__checkbox">
      <input type="checkbox" name="properties[__shopify_send_gift_card_to_recipient]" value="true">
      <span>{{ 'products.gift_card.send_as_gift' | t }}</span>
    </label>

    <div class="gift-card-recipient__fields" hidden>
      <div class="form-group">
        <label for="gift-card-recipient-email">{{ 'products.gift_card.recipient_email' | t }}</label>
        <input type="email" id="gift-card-recipient-email" name="properties[Recipient email]" required>
      </div>

      <div class="form-group">
        <label for="gift-card-recipient-name">{{ 'products.gift_card.recipient_name' | t }}</label>
        <input type="text" id="gift-card-recipient-name" name="properties[Recipient name]">
      </div>

      <div class="form-group">
        <label for="gift-card-message">{{ 'products.gift_card.message' | t }}</label>
        <textarea id="gift-card-message" name="properties[Message]" maxlength="200"></textarea>
      </div>

      <div class="form-group">
        <label for="gift-card-send-on">{{ 'products.gift_card.send_on' | t }}</label>
        <input type="date" id="gift-card-send-on" name="properties[Send on]">
      </div>
    </div>
  </div>
{%- endif -%}
```

**Cart Implementation:** For each cart item that is a gift card, display these fields if not already filled, or show the saved values.

---

## Phase 2: Grid & Layout Fixes

**Priority: HIGH - Visual breakage**

### 2.1 Main Blog Grid CSS

**File:** `sections/main-blog.liquid`

**Issue:** Uses `.blog-grid.grid` class but NO CSS exists for it. Grid columns don't work.

**Current Markup:**
```liquid
<div class="blog-grid grid"
     style="--grid-columns-desktop: {{ section.settings.columns_desktop }};
            --grid-columns-mobile: {{ section.settings.columns_mobile }};">
```

**Problem:** No `.blog-grid` or `.grid` CSS class defined in theme.css.

**Solution:** Add scoped `{% stylesheet %}` block:

```liquid
{% stylesheet %}
.main-blog {
  padding: var(--section-padding-top) 0 var(--section-padding-bottom);
}

.main-blog__header {
  margin-bottom: var(--space-8);
}

.main-blog__title {
  margin: 0;
}

.main-blog__filters {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
  margin-top: var(--space-4);
}

.main-blog__filter-link {
  padding: var(--space-2) var(--space-4);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  text-decoration: none;
  transition: background-color var(--duration-fast), border-color var(--duration-fast);
}

.main-blog__filter-link:hover,
.main-blog__filter-link.active {
  background-color: var(--color-foreground);
  color: var(--color-background);
  border-color: var(--color-foreground);
}

.blog-grid {
  display: grid;
  gap: var(--grid-gap, var(--space-6));
  grid-template-columns: repeat(var(--grid-columns-mobile, 1), 1fr);
}

@media (min-width: 750px) {
  .blog-grid {
    grid-template-columns: repeat(var(--grid-columns-desktop, 3), 1fr);
  }
}

.blog-grid__item {
  display: flex;
}

.main-blog__pagination {
  margin-top: var(--space-12);
}
{% endstylesheet %}
```

**Also Add:** Gap CSS variable to inline style:
```liquid
style="--grid-columns-desktop: {{ columns_desktop }}; --grid-columns-mobile: {{ columns_mobile }}; --grid-gap: var(--space-6);"
```

---

### 2.2 Search Results Grid CSS

**File:** `sections/main-search.liquid`

**Issue:** Multiple CSS classes used but not defined:
- `.search-results__grid` - No styles
- `.search-filters` - No styles
- `.search-filter` - No styles
- `.search-toolbar__tabs` - No styles
- `.page-card` - No styles
- `.search-empty` - No styles

**Solution:** Add comprehensive scoped `{% stylesheet %}` block:

```liquid
{% stylesheet %}
.main-search {
  padding: var(--section-padding-top) 0 var(--section-padding-bottom);
}

/* Search Header */
.search-header {
  text-align: center;
  margin-bottom: var(--space-8);
}

.search-header__title {
  margin: 0 0 var(--space-4);
}

.search-header__form {
  max-width: 600px;
  margin: 0 auto;
}

.search-header__results-count {
  margin-top: var(--space-4);
  color: var(--color-muted);
}

/* Search Toolbar */
.search-toolbar {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: center;
  gap: var(--space-4);
  margin-bottom: var(--space-6);
  padding-bottom: var(--space-4);
  border-bottom: 1px solid var(--color-border);
}

.search-toolbar__tabs {
  display: flex;
  gap: var(--space-1);
}

.search-toolbar__tab {
  padding: var(--space-2) var(--space-4);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  background: transparent;
  text-decoration: none;
  font-size: var(--font-size-sm);
  transition: all var(--duration-fast);
}

.search-toolbar__tab:hover,
.search-toolbar__tab.active {
  background: var(--color-foreground);
  color: var(--color-background);
  border-color: var(--color-foreground);
}

.search-toolbar__sort {
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

.search-toolbar__sort select {
  padding: var(--space-2) var(--space-4);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  background: transparent;
}

/* Search Layout */
.search-layout {
  display: grid;
  gap: var(--space-8);
}

@media (min-width: 990px) {
  .search-layout--with-filters {
    grid-template-columns: 280px 1fr;
  }
}

/* Search Filters */
.search-filters {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.search-filter {
  border-bottom: 1px solid var(--color-border);
}

.search-filter summary {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--space-3) 0;
  cursor: pointer;
  font-weight: var(--font-weight-medium);
  list-style: none;
}

.search-filter summary::-webkit-details-marker {
  display: none;
}

.search-filter summary::after {
  content: '+';
  font-size: 1.25em;
  transition: transform var(--duration-fast);
}

.search-filter[open] summary::after {
  transform: rotate(45deg);
}

.search-filter__options {
  padding: var(--space-2) 0 var(--space-4);
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.search-filter__checkbox {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  cursor: pointer;
}

.search-filter__checkbox input {
  width: 1rem;
  height: 1rem;
  accent-color: var(--color-foreground);
}

.search-filter__count {
  color: var(--color-muted);
  font-size: var(--font-size-sm);
}

.search-filter__price-range {
  display: flex;
  gap: var(--space-2);
  align-items: center;
}

.search-filter__price-input {
  flex: 1;
  padding: var(--space-2);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
}

/* Search Results Grid */
.search-results__grid {
  display: grid;
  gap: var(--grid-gap, var(--space-6));
  grid-template-columns: repeat(var(--grid-columns-mobile, 1), 1fr);
}

@media (min-width: 750px) {
  .search-results__grid {
    grid-template-columns: repeat(var(--grid-columns-desktop, 4), 1fr);
  }
}

/* Page Card (for page results) */
.page-card {
  display: flex;
  flex-direction: column;
  padding: var(--space-6);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  text-decoration: none;
  transition: border-color var(--duration-fast), box-shadow var(--duration-fast);
}

.page-card:hover {
  border-color: var(--color-foreground);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.page-card__title {
  margin: 0 0 var(--space-2);
  font-size: var(--font-size-lg);
}

.page-card__excerpt {
  color: var(--color-muted);
  font-size: var(--font-size-sm);
  line-height: 1.6;
}

/* Empty State */
.search-empty {
  text-align: center;
  padding: var(--space-16) var(--space-4);
}

.search-empty__title {
  margin: 0 0 var(--space-4);
}

.search-empty__message {
  color: var(--color-muted);
  margin-bottom: var(--space-6);
}

.search-empty__suggestions {
  list-style: none;
  padding: 0;
  margin: 0;
}

.search-empty__suggestions li {
  margin-bottom: var(--space-2);
}

/* Pagination */
.search-pagination {
  margin-top: var(--space-12);
}
{% endstylesheet %}
```

---

### 2.3 Main Page Layout Enhancement

**File:** `sections/main-page.liquid`

**Issue:** Bare-bones implementation with no container styling, no visual hierarchy.

**Current State:**
```liquid
<div class="container{% if section.settings.narrow_container %} container--narrow{% endif %}">
  {%- if section.settings.show_title -%}
    <h1 class="{{ section.settings.heading_size }}">{{ page.title }}</h1>
  {%- endif -%}
  <div class="rte">{{ page.content }}</div>
</div>
```

**Solution:** Add scoped CSS:

```liquid
{% stylesheet %}
.main-page {
  padding: var(--section-padding-top) 0 var(--section-padding-bottom);
}

.main-page__header {
  margin-bottom: var(--space-8);
}

.main-page__header--center {
  text-align: center;
}

.main-page__subheading {
  display: block;
  margin-bottom: var(--space-2);
  font-size: var(--font-size-sm);
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: var(--color-muted);
}

.main-page__title {
  margin: 0;
}

.main-page__content {
  max-width: var(--content-max-width, 100%);
}

.main-page__content--narrow {
  --content-max-width: 65ch;
  margin-left: auto;
  margin-right: auto;
}

.main-page__content--medium {
  --content-max-width: 85ch;
  margin-left: auto;
  margin-right: auto;
}
{% endstylesheet %}
```

---

## Phase 3: Animation Integration

**Priority: HIGH - Editorial feel is core to theme vision**

The theme has a comprehensive `AnimationController` in `animations.js` supporting:
- `data-animate="fade"` - Opacity fade
- `data-animate="up-lg"` - Large vertical slide
- `data-animate="scale"` - Scale from 0.97
- `data-animate="reveal"` - Clip-path from left
- `data-animate="reveal-up"` - Clip-path from bottom
- `data-animate="left"` / `data-animate="right"` - Horizontal slides
- `data-animate="pop"` - Scale + fade combo
- `data-animate="lift"` - Subtle lift with hover
- `--delay` CSS variable for staggering

**Reference (blog-posts.liquid - HAS animations):**
```liquid
<p class="blog-posts__subheading subheading" data-animate="fade">{{ subheading }}</p>
<h2 class="blog-posts__heading h2" data-animate style="--delay: 50ms">{{ heading }}</h2>
{% for article in blog.articles limit: posts_to_show %}
  <article class="blog-posts__item" data-animate="fade" style="--delay: {{ 150 | plus: forloop.index0 | times: 50 }}ms">
{% endfor %}
```

---

### 3.1 Main Blog Animations

**File:** `sections/main-blog.liquid`

**Add to Header:**
```liquid
<header class="main-blog__header" data-animate="fade">
  <h1 class="main-blog__title h1" data-animate style="--delay: 50ms">{{ blog.title }}</h1>
  {%- if section.settings.show_tag_filter and blog.all_tags.size > 0 -%}
    <nav class="main-blog__filters" data-animate="fade" style="--delay: 100ms">
```

**Add to Grid Items:**
```liquid
{%- for article in blog.articles -%}
  {%- assign card_delay = 150 | plus: forloop.index0 | times: 50 -%}
  <article class="blog-grid__item" data-animate="fade" style="--delay: {{ card_delay }}ms">
    {% render 'article-card', article: article, ... %}
  </article>
{%- endfor -%}
```

**Add to Pagination:**
```liquid
{%- if paginate.pages > 1 -%}
  <nav class="main-blog__pagination" data-animate="fade" style="--delay: 300ms">
```

---

### 3.2 Main Article Animations

**File:** `sections/main-article.liquid`

**Add to Header:**
```liquid
<header class="article-header" data-animate="fade">
  {%- if section.settings.show_breadcrumb -%}
    <nav class="article-breadcrumb" data-animate="fade">
```

**Add to Title & Meta:**
```liquid
<h1 class="article-title h1" data-animate style="--delay: 50ms">{{ article.title }}</h1>
<div class="article-meta" data-animate="fade" style="--delay: 100ms">
```

**Add to Featured Image:**
```liquid
{%- if article.image and section.settings.show_featured_image -%}
  <figure class="article-featured-image" data-animate="reveal-up" style="--delay: 150ms">
```

**Add to Content:**
```liquid
<div class="article-content rte" data-animate="fade" style="--delay: 200ms">
  {{ article.content }}
</div>
```

**Add to Share & Navigation:**
```liquid
<div class="article-share" data-animate="fade" style="--delay: 250ms">
<nav class="article-navigation" data-animate="fade" style="--delay: 300ms">
```

---

### 3.3 Main Page Animations

**File:** `sections/main-page.liquid`

**Add to Header:**
```liquid
{%- if section.settings.show_title -%}
  <header class="main-page__header" data-animate="fade">
    <h1 class="main-page__title {{ section.settings.heading_size }}" data-animate style="--delay: 50ms">
      {{ page.title }}
    </h1>
  </header>
{%- endif -%}
```

**Add to Content:**
```liquid
<div class="main-page__content rte" data-animate="fade" style="--delay: 100ms">
  {{ page.content }}
</div>
```

---

### 3.4 Main Search Animations

**File:** `sections/main-search.liquid`

**Add to Header:**
```liquid
<header class="search-header" data-animate="fade">
  <h1 class="search-header__title h1" data-animate style="--delay: 50ms">
```

**Add to Toolbar:**
```liquid
<div class="search-toolbar" data-animate="fade" style="--delay: 100ms">
```

**Add to Filters:**
```liquid
<aside class="search-filters" data-animate="fade" style="--delay: 150ms">
```

**Add to Results Grid Items:**
```liquid
{%- for item in search.results -%}
  {%- assign card_delay = 200 | plus: forloop.index0 | times: 50 -%}
  <div class="search-results__item" data-animate="fade" style="--delay: {{ card_delay }}ms">
{%- endfor -%}
```

---

### 3.5 Main Cart Animations

**File:** `sections/main-cart.liquid`

**Add to Header:**
```liquid
<header class="cart__header" data-animate="fade">
  <h1 class="cart__title h1" data-animate style="--delay: 50ms">{{ 'cart.title' | t }}</h1>
</header>
```

**Add to Cart Items:**
```liquid
{%- for item in cart.items -%}
  {%- assign item_delay = 100 | plus: forloop.index0 | times: 50 -%}
  <div class="cart__item" data-animate="fade" style="--delay: {{ item_delay }}ms">
{%- endfor -%}
```

**Add to Summary:**
```liquid
<div class="cart__summary" data-animate="fade" style="--delay: 200ms">
```

**Add to Empty State:**
```liquid
<div class="cart__empty" data-animate="fade">
  <p>{{ 'cart.empty' | t }}</p>
  <a href="{{ routes.all_products_collection_url }}" class="btn btn--primary" data-animate style="--delay: 100ms">
    {{ 'cart.continue_shopping' | t }}
  </a>
</div>
```

---

## Phase 4: Settings Enhancement

**Priority: MEDIUM - Merchant customization**

### 4.1 Main Page Settings (Currently 4 settings - most sparse)

**Current Settings:**
```json
{
  "settings": [
    { "type": "checkbox", "id": "show_title", "default": true },
    { "type": "select", "id": "heading_size", "options": ["h3", "h2", "h1"], "default": "h1" },
    { "type": "checkbox", "id": "narrow_container", "default": true },
    { "type": "color_scheme", "id": "color_scheme", "default": "scheme_1" }
  ]
}
```

**Add Settings:**
```json
{
  "settings": [
    {
      "type": "header",
      "content": "t:sections.main_page.settings.header_content.content"
    },
    {
      "type": "checkbox",
      "id": "show_title",
      "label": "t:sections.main_page.settings.show_title.label",
      "default": true
    },
    {
      "type": "text",
      "id": "subheading",
      "label": "t:sections.main_page.settings.subheading.label"
    },
    {
      "type": "select",
      "id": "heading_size",
      "label": "t:sections.main_page.settings.heading_size.label",
      "options": [
        { "value": "h3", "label": "t:sections.main_page.settings.heading_size.options.small" },
        { "value": "h2", "label": "t:sections.main_page.settings.heading_size.options.medium" },
        { "value": "h1", "label": "t:sections.main_page.settings.heading_size.options.large" }
      ],
      "default": "h1"
    },
    {
      "type": "select",
      "id": "text_alignment",
      "label": "t:sections.main_page.settings.text_alignment.label",
      "options": [
        { "value": "left", "label": "t:sections.main_page.settings.text_alignment.options.left" },
        { "value": "center", "label": "t:sections.main_page.settings.text_alignment.options.center" }
      ],
      "default": "left"
    },
    {
      "type": "header",
      "content": "t:sections.main_page.settings.header_layout.content"
    },
    {
      "type": "select",
      "id": "content_width",
      "label": "t:sections.main_page.settings.content_width.label",
      "options": [
        { "value": "narrow", "label": "t:sections.main_page.settings.content_width.options.narrow" },
        { "value": "medium", "label": "t:sections.main_page.settings.content_width.options.medium" },
        { "value": "wide", "label": "t:sections.main_page.settings.content_width.options.wide" }
      ],
      "default": "narrow"
    },
    {
      "type": "select",
      "id": "padding",
      "label": "t:sections.main_page.settings.padding.label",
      "options": [
        { "value": "none", "label": "t:sections.main_page.settings.padding.options.none" },
        { "value": "small", "label": "t:sections.main_page.settings.padding.options.small" },
        { "value": "medium", "label": "t:sections.main_page.settings.padding.options.medium" },
        { "value": "large", "label": "t:sections.main_page.settings.padding.options.large" }
      ],
      "default": "medium"
    },
    {
      "type": "header",
      "content": "t:sections.main_page.settings.header_display.content"
    },
    {
      "type": "color_scheme",
      "id": "color_scheme",
      "label": "t:sections.main_page.settings.color_scheme.label",
      "default": "scheme_1"
    }
  ]
}
```

---

### 4.2 Main Cart Settings (Currently 3 settings)

**Current Settings:**
```json
{
  "settings": [
    { "type": "checkbox", "id": "show_cart_note", "default": true },
    { "type": "checkbox", "id": "show_dynamic_checkout", "default": true },
    { "type": "color_scheme", "id": "color_scheme", "default": "scheme_1" }
  ]
}
```

**Add Settings:**
```json
{
  "settings": [
    {
      "type": "header",
      "content": "t:sections.main_cart.settings.header_content.content"
    },
    {
      "type": "text",
      "id": "heading",
      "label": "t:sections.main_cart.settings.heading.label",
      "default": "Your cart"
    },
    {
      "type": "header",
      "content": "t:sections.main_cart.settings.header_cart_items.content"
    },
    {
      "type": "checkbox",
      "id": "show_vendor",
      "label": "t:sections.main_cart.settings.show_vendor.label",
      "default": false
    },
    {
      "type": "checkbox",
      "id": "show_variant_image",
      "label": "t:sections.main_cart.settings.show_variant_image.label",
      "info": "t:sections.main_cart.settings.show_variant_image.info",
      "default": true
    },
    {
      "type": "header",
      "content": "t:sections.main_cart.settings.header_summary.content"
    },
    {
      "type": "checkbox",
      "id": "show_cart_note",
      "label": "t:sections.main_cart.settings.show_cart_note.label",
      "default": true
    },
    {
      "type": "checkbox",
      "id": "show_dynamic_checkout",
      "label": "t:sections.main_cart.settings.show_dynamic_checkout.label",
      "default": true
    },
    {
      "type": "header",
      "content": "t:sections.main_cart.settings.header_layout.content"
    },
    {
      "type": "select",
      "id": "padding",
      "label": "t:sections.main_cart.settings.padding.label",
      "options": [
        { "value": "none", "label": "t:sections.main_cart.settings.padding.options.none" },
        { "value": "small", "label": "t:sections.main_cart.settings.padding.options.small" },
        { "value": "medium", "label": "t:sections.main_cart.settings.padding.options.medium" },
        { "value": "large", "label": "t:sections.main_cart.settings.padding.options.large" }
      ],
      "default": "medium"
    },
    {
      "type": "header",
      "content": "t:sections.main_cart.settings.header_display.content"
    },
    {
      "type": "color_scheme",
      "id": "color_scheme",
      "label": "t:sections.main_cart.settings.color_scheme.label",
      "default": "scheme_1"
    }
  ]
}
```

---

### 4.3 Main Blog Settings (Currently 9 settings)

**Add Settings:**
```json
{
  "settings": [
    {
      "type": "header",
      "content": "t:sections.main_blog.settings.header_content.content"
    },
    {
      "type": "text",
      "id": "subheading",
      "label": "t:sections.main_blog.settings.subheading.label"
    },
    {
      "type": "select",
      "id": "heading_alignment",
      "label": "t:sections.main_blog.settings.heading_alignment.label",
      "options": [
        { "value": "left", "label": "t:sections.main_blog.settings.heading_alignment.options.left" },
        { "value": "center", "label": "t:sections.main_blog.settings.heading_alignment.options.center" }
      ],
      "default": "left"
    },
    {
      "type": "checkbox",
      "id": "show_article_count",
      "label": "t:sections.main_blog.settings.show_article_count.label",
      "default": false
    },
    {
      "type": "header",
      "content": "t:sections.main_blog.settings.header_layout.content"
    },
    {
      "type": "select",
      "id": "padding",
      "label": "t:sections.main_blog.settings.padding.label",
      "options": [
        { "value": "none", "label": "..." },
        { "value": "small", "label": "..." },
        { "value": "medium", "label": "..." },
        { "value": "large", "label": "..." }
      ],
      "default": "medium"
    }
  ]
}
```

---

### 4.4 Main Article Settings (Currently 8 settings)

**Add Settings:**
```json
{
  "settings": [
    {
      "type": "header",
      "content": "t:sections.main_article.settings.header_layout.content"
    },
    {
      "type": "select",
      "id": "content_width",
      "label": "t:sections.main_article.settings.content_width.label",
      "options": [
        { "value": "narrow", "label": "..." },
        { "value": "medium", "label": "..." },
        { "value": "wide", "label": "..." }
      ],
      "default": "narrow"
    },
    {
      "type": "select",
      "id": "image_ratio",
      "label": "t:sections.main_article.settings.image_ratio.label",
      "options": [
        { "value": "landscape", "label": "..." },
        { "value": "portrait", "label": "..." },
        { "value": "square", "label": "..." },
        { "value": "original", "label": "..." }
      ],
      "default": "landscape"
    },
    {
      "type": "select",
      "id": "padding",
      "label": "t:sections.main_article.settings.padding.label",
      "options": [
        { "value": "none", "label": "..." },
        { "value": "small", "label": "..." },
        { "value": "medium", "label": "..." },
        { "value": "large", "label": "..." }
      ],
      "default": "medium"
    },
    {
      "type": "checkbox",
      "id": "show_related_articles",
      "label": "t:sections.main_article.settings.show_related_articles.label",
      "info": "t:sections.main_article.settings.show_related_articles.info",
      "default": true
    }
  ]
}
```

---

### 4.5 Main Search Settings (Currently 6 settings)

**Add Settings:**
```json
{
  "settings": [
    {
      "type": "header",
      "content": "t:sections.main_search.settings.header_layout.content"
    },
    {
      "type": "select",
      "id": "padding",
      "label": "t:sections.main_search.settings.padding.label",
      "options": [
        { "value": "none", "label": "..." },
        { "value": "small", "label": "..." },
        { "value": "medium", "label": "..." },
        { "value": "large", "label": "..." }
      ],
      "default": "medium"
    },
    {
      "type": "checkbox",
      "id": "show_search_suggestions",
      "label": "t:sections.main_search.settings.show_search_suggestions.label",
      "info": "t:sections.main_search.settings.show_search_suggestions.info",
      "default": true
    },
    {
      "type": "select",
      "id": "filter_display",
      "label": "t:sections.main_search.settings.filter_display.label",
      "options": [
        { "value": "sidebar", "label": "..." },
        { "value": "drawer", "label": "..." }
      ],
      "default": "sidebar"
    },
    {
      "type": "checkbox",
      "id": "show_clear_filters",
      "label": "t:sections.main_search.settings.show_clear_filters.label",
      "default": true
    }
  ]
}
```

---

## Phase 5: Accessibility Improvements

**Priority: MEDIUM**

### 5.1 Search Accessibility

**File:** `sections/main-search.liquid`

**Add:**
1. ARIA live region for result updates:
```liquid
<div aria-live="polite" aria-atomic="true" class="visually-hidden" id="search-status">
  {{ search.results_count }} {{ 'search.results_count' | t }}
</div>
```

2. Improve filter accessibility:
```liquid
<details class="search-filter"
         id="filter-{{ filter.param_name }}"
         aria-controls="filter-options-{{ filter.param_name }}">
  <summary aria-expanded="false">{{ filter.label }}</summary>
  <div id="filter-options-{{ filter.param_name }}" class="search-filter__options">
```

3. Add "skip to results" link:
```liquid
<a href="#search-results" class="visually-hidden-focusable">
  {{ 'accessibility.skip_to_results' | t }}
</a>
```

4. Improve pagination:
```liquid
<nav class="search-pagination" aria-label="{{ 'accessibility.pagination' | t }}">
  <a href="{{ paginate.previous.url }}"
     aria-label="{{ 'accessibility.previous_page' | t }}"
     {% if paginate.previous == blank %}aria-disabled="true"{% endif %}>
```

---

### 5.2 Blog Accessibility

**File:** `sections/main-blog.liquid`

**Add:**
1. Article count announcement:
```liquid
<p class="visually-hidden" aria-live="polite">
  {{ 'blog.showing_articles' | t: count: blog.articles_count }}
</p>
```

2. Pagination aria-labels:
```liquid
<nav class="main-blog__pagination" aria-label="{{ 'accessibility.pagination' | t }}">
```

---

### 5.3 Cart Accessibility

**File:** `sections/main-cart.liquid`

**Add:**
1. Skip to checkout link:
```liquid
<a href="#cart-summary" class="visually-hidden-focusable">
  {{ 'accessibility.skip_to_checkout' | t }}
</a>
```

2. Improve quantity button touch targets (currently 2rem, should be at least 44px):
```css
.cart__quantity-button {
  min-width: 2.75rem;
  min-height: 2.75rem;
}
```

---

## Phase 6: Polish & Consistency

**Priority: LOW**

### 6.1 CSS Organization

- Move inline styles to scoped `{% stylesheet %}` blocks in all sections
- Ensure BEM naming consistency across all sections
- Add CSS custom properties for section-specific values
- Remove unused CSS classes from theme.css

### 6.2 Article Card Enhancement

**File:** `snippets/article-card.liquid`

**Add:**
1. Author avatar support
2. Estimated read time calculation
3. Focal point support for images:
```liquid
{{ article.image | image_url: width: 800, height: 450, crop: 'center' }}
```

### 6.3 Cart Enhancements

**Files:** `sections/main-cart.liquid`, `sections/cart-drawer.liquid`

**Add:**
1. Cart upsell/recommendations section option
2. Vendor display toggle implementation
3. Modularize inline JavaScript into separate .js files

### 6.4 Localization Audit

**Files:** `locales/en.default.json`, `locales/en.default.schema.json`

**Tasks:**
1. Ensure all hardcoded strings use translation keys
2. Add missing schema translations for new settings
3. Verify all accessibility strings are present

---

## Summary by Section

| Section | Phase 1 | Phase 2 | Phase 3 | Phase 4 | Phase 5 | Phase 6 |
|---------|---------|---------|---------|---------|---------|---------|
| main-blog | - | Grid CSS | Animations | Settings | A11y | Card polish |
| main-article | - | - | Animations | Settings | - | Card polish |
| main-page | - | Layout CSS | Animations | Settings | - | - |
| main-search | Bug fix | Grid + Filter CSS | Animations | Settings | A11y | UX |
| main-cart | Gift cards | - | Animations | Settings | A11y | Modularize |
| cart-drawer | Dynamic checkout | - | - | - | - | - |
| predictive-search | Translation bug | - | - | - | - | - |

---

## Confirmed Execution Order

**Approach:** Phase-by-phase (all sections at once per phase for consistency)

### Phase 1 Execution
1. Fix predictive search translation bug in `main-search.liquid`
2. Add dynamic checkout buttons to `cart-drawer.liquid`
3. Add gift card recipient form to `main-cart.liquid` and `cart-drawer.liquid`

### Phase 2 Execution
1. Add scoped CSS to `main-blog.liquid` (grid, gaps, responsive)
2. Add scoped CSS to `main-search.liquid` (grid, filters, tabs, page-card)
3. Add scoped CSS to `main-page.liquid` (layout, containers)

### Phase 3 Execution
1. Add `data-animate` attributes to `main-blog.liquid`
2. Add `data-animate` attributes to `main-article.liquid`
3. Add `data-animate` attributes to `main-page.liquid`
4. Add `data-animate` attributes to `main-search.liquid`
5. Add `data-animate` attributes to `main-cart.liquid`

### Phase 4 Execution
1. Enhance `main-page.liquid` settings (most sparse - 4 settings)
2. Enhance `main-cart.liquid` settings (3 settings)
3. Enhance `main-blog.liquid` settings
4. Enhance `main-article.liquid` settings
5. Enhance `main-search.liquid` settings

### Phase 5 & 6 Execution
- Accessibility improvements across all sections
- Polish and consistency refinements
- Can run in parallel as time permits

---

## Verification Checklist

After each phase, verify:

### Phase 1
- [ ] Predictive search shows translated text (not Liquid tags)
- [ ] Cart drawer shows Shop Pay / Apple Pay / Google Pay buttons
- [ ] Gift card items in cart show recipient form

### Phase 2
- [ ] Blog grid displays correctly with proper columns
- [ ] Search results grid works with filters visible
- [ ] Page content has proper width and spacing

### Phase 3
- [ ] Elements fade in on scroll across all sections
- [ ] Stagger delays create cascading effect
- [ ] Animations respect `prefers-reduced-motion`

### Phase 4
- [ ] New settings appear in theme editor
- [ ] Settings work correctly when changed
- [ ] Schema translations display properly

### Phase 5
- [ ] Screen readers announce search results
- [ ] Keyboard navigation works throughout
- [ ] Touch targets meet 44px minimum

### Phase 6
- [ ] CSS is properly scoped
- [ ] No console errors
- [ ] Performance maintained (Lighthouse 60+)
