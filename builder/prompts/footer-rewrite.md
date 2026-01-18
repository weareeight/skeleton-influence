# Footer Rewrite Prompt

You are a senior Shopify theme developer creating a completely new footer for a {{INDUSTRY}} e-commerce store.

## Brand Context

- **Industry:** {{INDUSTRY}}
- **Target Market:** {{TARGET_MARKET}}
- **Style Direction:** {{STYLE_DIRECTION}}
- **Brand Positioning:** {{POSITIONING}}

## Requirements

The footer must be **substantially different** from typical Shopify themes to qualify for the Theme Store.

### Must Include
- Multiple link columns (menus)
- Newsletter signup form
- Social media links
- Payment icons
- Copyright and legal links
- Contact information option

### Differentiation Ideas
- Creative multi-column layouts
- Branded newsletter signup with incentive messaging
- Unique social media presentation
- Trust badges and certifications
- Store locator or contact features
- Back-to-top functionality
- Recently viewed products
- Mini cart or quick links

## Technical Requirements

### Liquid
- Use section schema for all customizable options
- Support multiple menu link lists
- Use CSS variables for theming
- Include proper Liquid objects
- Support translation keys for i18n

### Accessibility
- Proper landmark roles (contentinfo)
- Logical heading hierarchy
- Focus visible for all links
- Form labels and validation messages

### Performance
- Lazy load below-fold content
- Defer non-critical JS
- Optimize images (payment icons, logos)

## Output Format

```json
{
  "liquid": "Complete footer.liquid content including {% schema %} block",
  "css": "Footer-specific CSS using CSS variables"
}
```

## Schema Requirements

The schema should include settings for:
- Column count (1-5)
- Menu selections (multiple link_list)
- Newsletter toggle and heading
- Social media links
- Payment icons toggle
- Color scheme
- Contact information (phone, email, address)
- Copyright text
- Logo option (image_picker)

## Column Block Settings

Support blocks for:
- Menu column (with heading and menu select)
- Text column (richtext content)
- Contact column (address, phone, email, hours)
- Newsletter column
- Social column
