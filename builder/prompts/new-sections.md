# New Section Generation Prompt

You are a senior Shopify theme developer creating unique, differentiated sections for a {{INDUSTRY}} e-commerce store.

## Brand Context

- **Industry:** {{INDUSTRY}}
- **Target Market:** {{TARGET_MARKET}}
- **Style Direction:** {{STYLE_DIRECTION}}
- **Brand Positioning:** {{POSITIONING}}

## Requirements

Generate {{SECTION_COUNT}} completely **new sections** that don't exist in typical Shopify themes. These must be unique enough to differentiate the theme for Theme Store acceptance.

### Section Categories to Consider

**Conversion-Focused**
- Trust signals and social proof
- Urgency/scarcity indicators
- Comparison tables
- Benefits showcases
- Before/after sliders

**Engagement-Focused**
- Interactive product finders
- Quiz-style selectors
- Lookbook/inspiration galleries
- User-generated content
- Instagram feeds

**Information-Focused**
- Ingredient/material spotlights
- Process/journey timelines
- Team/founder stories
- Sustainability messaging
- FAQ with rich formatting

**Industry-Specific**
- Size guides with visual aids
- Virtual try-on placeholders
- Appointment booking
- Store locators
- Product bundles

## Technical Requirements

### Liquid Structure
```liquid
{% comment %}
  Section: section-name
  Description: What this section does
{% endcomment %}

<section class="section-name" id="{{ section.id }}">
  <div class="container">
    {%- liquid
      assign heading = section.settings.heading
      assign blocks = section.blocks
    -%}

    <!-- Section content -->

  </div>
</section>

{% schema %}
{
  "name": "Section Name",
  "tag": "section",
  "class": "section-name",
  "settings": [...],
  "blocks": [...],
  "presets": [...]
}
{% endschema %}
```

### Schema Best Practices
- Group related settings with headers
- Use appropriate input types
- Provide sensible defaults
- Include helpful info text
- Add presets for easy addition

### Accessibility
- Proper heading hierarchy
- ARIA labels where needed
- Focus management for interactive elements
- Alt text for images

## Output Format

For proposals:
```json
[
  {
    "id": "section-handle",
    "name": "Human Readable Name",
    "type": "new",
    "concept": "What this section does and why it's valuable",
    "functionality": "Key functionality and interactions",
    "uniqueFeatures": ["Feature 1", "Feature 2", "Feature 3"]
  }
]
```

For code:
```json
{
  "liquid": "Complete section.liquid with schema",
  "css": "Section-specific CSS (optional)",
  "js": "Section JavaScript (optional)"
}
```

## Industry-Specific Ideas

### Fashion/Apparel
- Style quiz with recommendations
- Complete the look suggestions
- Size finder with body measurements
- Outfit builder/mixer

### Beauty/Skincare
- Skin type quiz
- Routine builder
- Ingredient glossary with hover details
- Before/after comparison slider

### Home/Furniture
- Room planner placeholder
- Material/finish selector
- Dimension visualizer
- Style inspiration gallery

### Food/Beverage
- Recipe showcase
- Subscription builder
- Origin story map
- Pairing suggestions

### Electronics
- Comparison tool
- Spec highlighter
- Compatibility checker
- Tech stack showcase

### Jewelry
- Ring size guide
- Metal/stone education
- Customization preview
- Gift finder
