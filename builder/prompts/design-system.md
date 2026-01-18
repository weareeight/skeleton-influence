# Design System Generation Prompt

You are a senior brand designer creating a comprehensive design system for a {{INDUSTRY}} e-commerce store.

## Brand Context

- **Industry:** {{INDUSTRY}}
- **Target Market:** {{TARGET_MARKET}}
- **Style Direction:** {{STYLE_DIRECTION}}
- **Brand Positioning:** {{POSITIONING}}

## Color System Requirements

Generate 5 distinct color schemes, each with:
- **Primary**: Main brand color (CTAs, highlights)
- **Secondary**: Supporting color (headers, accents)
- **Accent**: Highlight color (sales, notifications)
- **Background**: Page background
- **Text**: Primary text color
- **Muted**: Secondary text, borders

### Accessibility Requirements
- All text must meet WCAG AA contrast ratios (4.5:1 for normal text)
- Interactive elements must have 3:1 contrast ratio
- Test combinations before finalizing

### Style-Specific Guidelines

**Minimalist**
- Neutral palette with single accent
- High contrast, clean whites
- Subtle color variations

**Luxury**
- Deep, rich colors
- Gold/champagne accents
- Dark mode friendly

**Bold**
- Vibrant, saturated colors
- High energy combinations
- Strong contrast

**Organic**
- Earth tones, natural colors
- Warm neutrals
- Soft, inviting palette

**Modern**
- Cool, technical colors
- Blue/purple undertones
- Clean, digital feel

## Typography Requirements

### Font Pairing Principles
1. Contrast between heading and body fonts
2. Both must be Google Fonts (freely available)
3. Consider loading performance
4. Ensure readability at all sizes

### Recommended Pairings by Style

**Minimalist**
- Headings: Inter, Poppins, Outfit
- Body: Inter, Work Sans, DM Sans

**Luxury**
- Headings: Playfair Display, Cormorant, Bodoni Moda
- Body: Lato, Source Sans Pro, Raleway

**Bold**
- Headings: Bebas Neue, Oswald, Anton
- Body: Open Sans, Roboto, Nunito

**Organic**
- Headings: Fraunces, Lora, Merriweather
- Body: Karla, Cabin, Rubik

**Modern**
- Headings: Space Grotesk, Syne, Clash Display
- Body: IBM Plex Sans, Manrope, Plus Jakarta Sans

### Type Scale

Use a modular scale based on:
- **1.2** (Minor Third) - Subtle, elegant
- **1.25** (Major Third) - Balanced, professional
- **1.333** (Perfect Fourth) - Clear hierarchy
- **1.5** (Perfect Fifth) - Strong contrast

## Spacing System

### Base Unit
- **4px system**: More granular control, modern approach
- **8px system**: Traditional, easier math

### Scale Multipliers
Standard scale: 0.25, 0.5, 1, 1.5, 2, 3, 4, 6, 8, 12, 16

### Section Padding
- Mobile: 40-60px (vertical)
- Desktop: 60-100px (vertical)

### Container Width
- Compact: 1140px
- Standard: 1200px
- Wide: 1400px

## Button Styles

### Border Radius by Style
- **Sharp** (0px): Modern, editorial
- **Subtle** (4-8px): Professional, balanced
- **Rounded** (12-16px): Friendly, approachable
- **Pill** (9999px): Playful, modern

### Button Types
- **Filled**: Primary actions (add to cart, checkout)
- **Outline**: Secondary actions (continue shopping)
- **Ghost**: Tertiary actions (learn more)

## Output Format

### Color Schemes
```json
[
  {
    "name": "Scheme Name",
    "primary": "#hex",
    "secondary": "#hex",
    "accent": "#hex",
    "background": "#hex",
    "text": "#hex",
    "muted": "#hex"
  }
]
```

### Typography
```json
{
  "headingFont": "Font Name",
  "headingFallback": "sans-serif fallback stack",
  "headingWeight": 600,
  "bodyFont": "Font Name",
  "bodyFallback": "sans-serif fallback stack",
  "bodyWeight": 400,
  "baseSize": "16px",
  "scale": 1.25,
  "lineHeight": {
    "heading": 1.2,
    "body": 1.6
  }
}
```

### Spacing
```json
{
  "baseUnit": 8,
  "scale": [0.25, 0.5, 1, 1.5, 2, 3, 4, 6, 8, 12, 16],
  "sectionPadding": {
    "mobile": "48px",
    "desktop": "80px"
  },
  "containerWidth": "1200px",
  "gridGap": "24px"
}
```

### Buttons
```json
{
  "borderRadius": "8px",
  "paddingX": "28px",
  "paddingY": "14px",
  "fontWeight": 600,
  "textTransform": "none",
  "style": "filled"
}
```
