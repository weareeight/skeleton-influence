# Elle Theme QA Checklist

This checklist covers all pages and homepage sections that need testing before theme submission. Test each item on desktop (Chrome, Safari, Firefox) and mobile (iOS Safari, Chrome).

---

## Global Elements

### Header
- [ ] Logo displays correctly and links to homepage
- [ ] Navigation menu renders all menu items
- [ ] Mega menu opens on hover/click with correct content
- [ ] Mega menu promotional blocks display correctly
- [ ] Search icon opens predictive search
- [ ] Predictive search returns results as user types
- [ ] Predictive search shows "no results" state appropriately
- [ ] Cart icon shows item count badge
- [ ] Cart icon opens cart drawer
- [ ] Mobile hamburger menu opens/closes smoothly
- [ ] Mobile menu supports nested navigation levels
- [ ] Header becomes sticky on scroll (if enabled)
- [ ] Header is keyboard navigable with visible focus states

### Footer
- [ ] All footer columns render correctly
- [ ] Footer menu links work
- [ ] Social media icons link to correct URLs
- [ ] Newsletter signup form submits successfully
- [ ] Newsletter shows success/error messages
- [ ] Payment icons display
- [ ] Country/region selector works
- [ ] Language selector works (if multi-language enabled)
- [ ] Copyright and legal links present

### Announcement Bar
- [ ] Text displays correctly
- [ ] Link works (if configured)
- [ ] Dismissible functionality works
- [ ] Stays dismissed on page navigation

### Cart Drawer
- [ ] Opens when adding product to cart
- [ ] Shows all cart items with images, titles, prices
- [ ] Quantity +/- buttons work
- [ ] Remove item works
- [ ] Shows cart subtotal
- [ ] Checkout button links to checkout
- [ ] Empty cart state displays correctly
- [ ] Close button/overlay click closes drawer

### Quick Shop Modal
- [ ] Opens from product cards
- [ ] Shows product images, title, price
- [ ] Variant selectors work
- [ ] Add to cart works from modal
- [ ] Close button works

---

## Homepage Sections

### Hero
- [ ] Background image/video loads
- [ ] Video autoplays (muted) if configured
- [ ] Content overlay text is readable
- [ ] Scroll indicator animates and works
- [ ] CTA button links correctly
- [ ] Gradient/overlay opacity renders correctly
- [ ] Full-height layout works on various screen sizes
- [ ] Content position settings work (bottom left, center, etc.)

### Product Carousel 3D
- [ ] 3D carousel renders and rotates
- [ ] Products display with images
- [ ] Prices show correctly
- [ ] Hover states work
- [ ] CTA buttons link to product pages
- [ ] Touch/swipe navigation works on mobile
- [ ] Keyboard navigation works
- [ ] Carousel doesn't break with fewer products than configured

### Featured Collection
- [ ] Products from selected collection display
- [ ] Product cards show image, title, price
- [ ] Quick shop works from product cards
- [ ] Hover effects work
- [ ] "View all" link goes to collection page
- [ ] Correct number of columns on desktop/mobile
- [ ] Handles collection with fewer products than configured

### Image with Text
- [ ] Image displays correctly
- [ ] Image position setting works (left/right)
- [ ] Text content renders (subheading, heading, body, button)
- [ ] Button links correctly
- [ ] Layout stacks properly on mobile
- [ ] Image focal point is respected

### Lookbook
- [ ] Main image displays
- [ ] Hotspots appear at correct positions
- [ ] Hotspot click/tap reveals product info
- [ ] Product links from hotspots work
- [ ] Multiple hotspots can be added
- [ ] Hotspots work on mobile (touch)
- [ ] Handles no products assigned to hotspots

### Scrolling Marquee
- [ ] Text scrolls continuously
- [ ] Animation is smooth (no jank)
- [ ] Pause on hover works (if enabled)
- [ ] Text wraps seamlessly

### Rich Text
- [ ] Heading renders at correct size
- [ ] Text alignment setting works
- [ ] Narrow container option works
- [ ] Links within rich text work

### Newsletter
- [ ] Form displays correctly
- [ ] Email validation works
- [ ] Submit shows loading state
- [ ] Success message displays after signup
- [ ] Error message displays for invalid/duplicate emails
- [ ] GDPR checkbox works (if enabled)

---

## Template Pages

### Product Page
- [ ] Product images display in gallery
- [ ] Image zoom/lightbox works
- [ ] Variant images switch on selection
- [ ] Product title and price display
- [ ] Variant selectors work (dropdowns, swatches)
- [ ] Color swatches show correct colors/images
- [ ] Size selector works
- [ ] Add to cart button works
- [ ] Quantity selector works
- [ ] Out of stock variants show as unavailable
- [ ] Price updates when variant changes
- [ ] Compare-at price shows with sale styling
- [ ] Product description renders HTML correctly
- [ ] Pickup availability displays (if enabled)
- [ ] Shop Pay Installments banner shows
- [ ] Social sharing buttons work
- [ ] Product recommendations load
- [ ] Complementary products display (if configured)
- [ ] Unit pricing displays correctly
- [ ] Selling plans/subscriptions work (if configured)

### Collection Page
- [ ] Collection title and description display
- [ ] Collection image displays (if set)
- [ ] Products display in grid
- [ ] Pagination works
- [ ] Sorting dropdown works
- [ ] Filter sidebar displays available filters
- [ ] Filters apply correctly
- [ ] Active filters show and can be removed
- [ ] "Clear all" filters works
- [ ] Product count updates with filters
- [ ] Empty collection state displays correctly
- [ ] URL updates with filter/sort parameters
- [ ] Back/forward browser navigation preserves filters

### Cart Page
- [ ] All cart items display
- [ ] Item images, titles, variants show
- [ ] Quantity can be updated
- [ ] Items can be removed
- [ ] Subtotal calculates correctly
- [ ] Discount codes can be applied
- [ ] Discount shows applied amount
- [ ] Invalid discount shows error
- [ ] Cart notes field works (if enabled)
- [ ] Checkout button works
- [ ] Empty cart state displays
- [ ] Continue shopping link works
- [ ] Shipping estimator works (if enabled)

### Search Page
- [ ] Search input displays with query
- [ ] Results display for valid searches
- [ ] "No results" state displays appropriately
- [ ] Search filters work
- [ ] Pagination works for many results
- [ ] Products, articles, pages all searchable
- [ ] Search handles special characters

### Blog Page
- [ ] Blog title displays
- [ ] Article cards display with featured images
- [ ] Article titles and excerpts show
- [ ] Pagination works
- [ ] Tags filter works (if enabled)
- [ ] Empty blog state handles gracefully

### Article Page
- [ ] Article title and featured image display
- [ ] Author and date display
- [ ] Article content renders HTML correctly
- [ ] Images within article display
- [ ] Social sharing works
- [ ] Comments display (if enabled)
- [ ] Comment form works (if enabled)
- [ ] Related articles display
- [ ] Back to blog link works

### Page (Standard)
- [ ] Page title displays
- [ ] Page content renders correctly
- [ ] Sections can be added via editor

### Contact Page
- [ ] Contact form displays
- [ ] All form fields work
- [ ] Form validation works
- [ ] Success message on submit
- [ ] Error handling for failed submissions
- [ ] CAPTCHA works (if enabled)

### List Collections Page
- [ ] All collections display
- [ ] Collection images show
- [ ] Collection titles link correctly
- [ ] Handles collections without images

### 404 Page
- [ ] Custom 404 content displays
- [ ] Search bar or navigation helps user recover
- [ ] Continue shopping link works

### Password Page
- [ ] Password form displays when store is locked
- [ ] Password input works
- [ ] Error message for wrong password
- [ ] Newsletter signup works (if added)
- [ ] Social links display

---

## Customer Account Pages

### Login Page
- [ ] Email and password fields work
- [ ] Login button authenticates
- [ ] Error message for wrong credentials
- [ ] "Forgot password" link works
- [ ] "Create account" link works
- [ ] Guest checkout option (if applicable)

### Register Page
- [ ] All registration fields display
- [ ] Form validation works
- [ ] Account creation succeeds
- [ ] Error handling for duplicate emails
- [ ] Password requirements communicated

### Account Dashboard
- [ ] Customer name/email displays
- [ ] Order history lists correctly
- [ ] "View order" links work
- [ ] Addresses section accessible
- [ ] Logout works

### Order Detail Page
- [ ] Order number and date display
- [ ] Line items show correctly
- [ ] Prices and totals accurate
- [ ] Shipping address displays
- [ ] Order status shows
- [ ] Reorder functionality (if enabled)

### Addresses Page
- [ ] Existing addresses display
- [ ] Add new address form works
- [ ] Edit address works
- [ ] Delete address works
- [ ] Set default address works

### Password Reset
- [ ] Reset password email sends
- [ ] Reset link works
- [ ] New password can be set
- [ ] Confirmation message displays

---

## Cross-Cutting Concerns

### Mobile Responsiveness
- [ ] All pages render correctly on mobile
- [ ] Touch targets are minimum 44x44px
- [ ] Text is readable without zooming
- [ ] Images scale appropriately
- [ ] No horizontal scroll on any page
- [ ] Forms are usable on mobile

### Performance
- [ ] Lighthouse Performance score 60+ (desktop)
- [ ] Lighthouse Performance score 60+ (mobile)
- [ ] Images lazy load below the fold
- [ ] No layout shift during page load
- [ ] Pages feel fast and responsive

### Accessibility
- [ ] Lighthouse Accessibility score 90+
- [ ] All images have alt text
- [ ] Color contrast meets WCAG AA (4.5:1 body, 3:1 large)
- [ ] Focus states visible on all interactive elements
- [ ] Skip to content link works
- [ ] Screen reader announces page changes
- [ ] Forms have proper labels
- [ ] Error messages are announced

### Theme Editor
- [ ] All sections appear in theme editor
- [ ] Section settings update live preview
- [ ] Block reordering works
- [ ] Adding/removing blocks works
- [ ] Color scheme changes preview correctly
- [ ] Typography settings apply correctly

### Edge Cases
- [ ] Long product titles don't break layout
- [ ] Long collection names handled
- [ ] Products with many variants work
- [ ] Products with no images show placeholder
- [ ] Empty states display appropriately
- [ ] Very long customer names handled
- [ ] RTL language support (if applicable)
- [ ] Currency formatting for different currencies

---

## Browser Testing Matrix

| Browser | Desktop | Mobile |
|---------|---------|--------|
| Chrome (latest 3) | [ ] | [ ] |
| Safari (latest 2) | [ ] | [ ] |
| Firefox (latest 3) | [ ] | N/A |
| Edge (latest 2) | [ ] | N/A |
| Samsung Internet | N/A | [ ] |
| Instagram WebView | N/A | [ ] |
| Facebook WebView | N/A | [ ] |

---

## Notes

_Use this space to document any issues found during QA:_

| Issue | Page/Section | Severity | Status |
|-------|--------------|----------|--------|
| | | | |
| | | | |
| | | | |
