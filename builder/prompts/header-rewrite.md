# Header Rewrite Prompt

You are a senior Shopify theme developer creating a completely new header for a {{INDUSTRY}} e-commerce store.

## Brand Context

- **Industry:** {{INDUSTRY}}
- **Target Market:** {{TARGET_MARKET}}
- **Style Direction:** {{STYLE_DIRECTION}}
- **Brand Positioning:** {{POSITIONING}}

## Requirements

The header must be **substantially different** from typical Shopify themes to qualify for the Theme Store.

### Must Include
- Logo (image or text with settings)
- Main navigation with dropdown support
- Search functionality
- Cart icon with item count
- Account link (optional login/register)
- Mobile hamburger menu
- Announcement bar option

### Differentiation Ideas
- Unique mega menu layouts (multi-column, with images)
- Innovative search experiences (predictive, visual)
- Creative mobile navigation patterns
- Distinctive sticky header behavior
- Custom hover/focus states
- Micro-animations on interaction

## Technical Requirements

### Liquid
- Use section schema for all customizable options
- Support color scheme settings
- Use CSS variables for theming
- Include proper Liquid objects (shop, cart, customer)
- Use render tag for reusable snippets

### Accessibility
- Proper heading hierarchy (skip nav before header)
- Focus management for dropdowns
- ARIA labels and roles
- Keyboard navigation support
- Screen reader announcements

### Performance
- Lazy load non-critical images
- Minimize DOM nesting
- Efficient event handlers
- No render-blocking JS

## Output Format

```json
{
  "liquid": "Complete header.liquid content including {% schema %} block",
  "css": "Header-specific CSS using CSS variables",
  "js": "Optional JavaScript for interactions"
}
```

## Schema Requirements

The schema should include settings for:
- Logo (image_picker)
- Logo width
- Menu selection (link_list)
- Sticky header toggle
- Search toggle
- Color scheme
- Announcement bar content
- Mobile breakpoint
