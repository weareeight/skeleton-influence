# Theme Builder Master Plan
## Internal Tool for Rapid Theme Generation

---

## Executive Summary

Transform the "Elle" Shopify theme into an **internal theme generation engine** that enables our team to rapidly create customized, high-quality Shopify themes for clients and new projects. The tool leverages AI for design generation, code creation, market analysis, and automated testing - all optimized for our internal workflow.

---

## Vision Statement

**"Spin up a production-ready, market-optimized theme in under an hour."**

An internal tool where our team can:
1. Input a client brief or target market
2. Get AI-generated theme variations with custom imagery
3. Review, refine, and test automatically
4. Deploy to client stores or theme submissions

---

## Part 1: Strategic Overview

### 1.1 Use Cases

| Use Case | Description | Output |
|----------|-------------|--------|
| **Client Projects** | Generate base theme for client work | Customized theme ready for refinement |
| **Theme Portfolio** | Create themes for Shopify marketplace | Production-ready themes for submission |
| **Rapid Prototyping** | Quick concepts for pitches | Preview URLs for client review |
| **Market Expansion** | Target new verticals | Industry-specific theme variants |

### 1.2 Value Proposition

| Current State | With Theme Builder |
|--------------|-------------------|
| 2-4 weeks per theme | 1-2 days per theme |
| Manual design decisions | AI-informed, data-driven |
| Stock imagery or client-provided | Generated on-demand |
| Manual QA process | Automated testing pipeline |
| Starting from scratch each time | Building on proven foundation |

### 1.3 Success Metrics

| Metric | Target |
|--------|--------|
| Theme generation time (draft) | < 1 hour |
| Theme to production-ready | < 1 day |
| Lighthouse score (generated) | > 80 |
| Manual intervention needed | < 20% of sections |
| Themes generated per month | 4-8 |

---

## Part 2: System Architecture

### 2.1 Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         INTERNAL THEME BUILDER                               │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌──────────────────────────────────────────────────────────────────────┐   │
│  │                         CLI / WEB INTERFACE                           │   │
│  │  $ theme-builder generate --brief "luxury skincare brand"            │   │
│  │  $ theme-builder analyze --competitor "https://example.com"          │   │
│  │  $ theme-builder test --theme ./generated/skincare-v1                │   │
│  └──────────────────────────────────────────────────────────────────────┘   │
│                                      │                                       │
│                                      ▼                                       │
│  ┌──────────────────────────────────────────────────────────────────────┐   │
│  │                       ORCHESTRATION ENGINE                            │   │
│  │                                                                        │   │
│  │   ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌────────────┐  │   │
│  │   │   Market    │  │   Design    │  │   Code      │  │   Image    │  │   │
│  │   │  Analysis   │  │  Generator  │  │  Generator  │  │ Generator  │  │   │
│  │   │  (Claude)   │  │  (Claude)   │  │  (Claude)   │  │(NanoBanana)│  │   │
│  │   └─────────────┘  └─────────────┘  └─────────────┘  └────────────┘  │   │
│  │                                                                        │   │
│  └──────────────────────────────────────────────────────────────────────┘   │
│                                      │                                       │
│                                      ▼                                       │
│  ┌──────────────────────────────────────────────────────────────────────┐   │
│  │                         THEME ASSEMBLY                                │   │
│  │                                                                        │   │
│  │   Base Theme ──► Section Selection ──► Customization ──► Output      │   │
│  │   (Elle)         (53 sections)         (colors/fonts)    (new theme) │   │
│  │                                                                        │   │
│  └──────────────────────────────────────────────────────────────────────┘   │
│                                      │                                       │
│                                      ▼                                       │
│  ┌──────────────────────────────────────────────────────────────────────┐   │
│  │                      TESTING & DEPLOYMENT                             │   │
│  │                                                                        │   │
│  │   Theme Check ──► Lighthouse ──► Preview Deploy ──► Git Branch       │   │
│  │                                                                        │   │
│  └──────────────────────────────────────────────────────────────────────┘   │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 2.2 Directory Structure

```
skeleton-influence/
├── elle/                          # Base theme (current codebase)
│   ├── sections/
│   ├── snippets/
│   ├── templates/
│   └── ...
│
├── builder/                       # Theme builder tool
│   ├── cli/                       # Command-line interface
│   │   ├── commands/
│   │   │   ├── generate.ts        # Generate new theme
│   │   │   ├── analyze.ts         # Market/competitor analysis
│   │   │   ├── section.ts         # Create new sections
│   │   │   └── test.ts            # Run test suite
│   │   └── index.ts
│   │
│   ├── core/                      # Core engine
│   │   ├── orchestrator.ts        # Main workflow coordinator
│   │   ├── theme-assembler.ts     # Assembles theme from parts
│   │   └── config-generator.ts    # Generates settings_data.json
│   │
│   ├── ai/                        # AI integrations
│   │   ├── claude/
│   │   │   ├── client.ts          # Claude API wrapper
│   │   │   ├── prompts/           # Versioned prompts
│   │   │   │   ├── market-analysis.md
│   │   │   │   ├── design-system.md
│   │   │   │   ├── section-generator.md
│   │   │   │   └── content-writer.md
│   │   │   └── index.ts
│   │   │
│   │   └── nano-banana/
│   │       ├── client.ts          # Nano Banana Pro API
│   │       ├── prompts/           # Image generation prompts
│   │       └── index.ts
│   │
│   ├── analysis/                  # Market analysis module
│   │   ├── competitor.ts          # Competitor scraping/analysis
│   │   ├── industry.ts            # Industry trends database
│   │   └── recommendations.ts     # Design recommendations
│   │
│   ├── testing/                   # Automated testing
│   │   ├── theme-check.ts
│   │   ├── lighthouse.ts
│   │   ├── visual-regression.ts
│   │   └── report-generator.ts
│   │
│   └── templates/                 # Generation templates
│       ├── briefs/                # Client brief templates
│       ├── industries/            # Industry-specific configs
│       └── presets/               # Quick-start presets
│
├── generated/                     # Output directory
│   ├── skincare-brand-v1/
│   ├── fitness-store-v2/
│   └── ...
│
└── docs/                          # Documentation
    ├── MASTER_PLAN.md
    └── USAGE.md
```

### 2.3 Technology Stack

| Component | Technology | Rationale |
|-----------|------------|-----------|
| **CLI Framework** | Commander.js + Inquirer | Interactive prompts, familiar UX |
| **Runtime** | Node.js 20+ / Bun | Fast, modern JS runtime |
| **AI - Code/Analysis** | Claude API (Anthropic) | Best reasoning and code generation |
| **AI - Images** | Nano Banana Pro | Custom imagery on demand |
| **Testing** | Shopify Theme Check, Lighthouse CI | Already integrated |
| **Preview Deployment** | Shopify CLI | Direct theme uploads |
| **Version Control** | Git (auto-branching) | Track each generation |
| **Configuration** | YAML/JSON | Human-readable configs |

---

## Part 3: Core Workflows

### 3.1 Theme Generation Workflow

```
INPUT: Client Brief / Market Description
─────────────────────────────────────────

$ theme-builder generate

? Enter project name: luxe-skincare
? Describe the brand: Premium Korean skincare brand targeting millennial women,
  focus on clean ingredients and minimalist aesthetic
? Primary industry: Beauty & Skincare
? Style preference: Minimal, Clean, Luxury
? Competitor URLs (optional): https://tatcha.com, https://drunk-elephant.com
? Generate images? Yes

PROCESS:
─────────────────────────────────────────

Step 1: Market Analysis (Claude)
├── Analyze provided competitors
├── Research industry trends
├── Identify target audience preferences
└── Output: MarketAnalysisReport

Step 2: Design System Generation (Claude)
├── Generate color palette (5 schemes)
├── Select typography pairing
├── Define spacing/layout rules
├── Recommend section selection
└── Output: DesignSystemConfig

Step 3: Section Configuration (Claude)
├── Select relevant sections from library
├── Configure section settings
├── Arrange section order
├── Generate placeholder content
└── Output: TemplateConfigs

Step 4: Image Generation (Nano Banana Pro)
├── Generate hero images (3 variations)
├── Generate lifestyle images
├── Generate texture/backgrounds
├── Optimize and resize
└── Output: AssetBundle

Step 5: Theme Assembly
├── Copy base theme
├── Apply design system
├── Configure sections
├── Insert generated images
├── Update settings_data.json
└── Output: CompleteTheme

Step 6: Automated Testing
├── Run Theme Check
├── Run Lighthouse (desktop + mobile)
├── Generate quality report
└── Output: TestReport

Step 7: Preview Deployment
├── Create git branch
├── Deploy preview theme
├── Generate preview URL
└── Output: PreviewLink

OUTPUT:
─────────────────────────────────────────

✓ Theme generated: ./generated/luxe-skincare-v1/
✓ Lighthouse Score: 84 (desktop) / 76 (mobile)
✓ Theme Check: 0 errors, 3 warnings
✓ Preview URL: https://your-store.myshopify.com/?preview_theme_id=123456
✓ Git branch: generated/luxe-skincare-v1

Generated assets:
├── 5 color schemes configured
├── 12 sections enabled
├── 8 images generated
└── All content placeholders filled
```

### 3.2 Section Generation Workflow

```
$ theme-builder section create

? Describe the section you need:
  "A before/after image comparison slider for skincare transformations"

PROCESS:
─────────────────────────────────────────

1. Claude analyzes request
2. Searches existing sections for similar functionality
3. Generates Liquid template
4. Generates section schema
5. Generates CSS (inline)
6. Generates JavaScript (if needed)
7. Validates with Theme Check
8. Creates preview

OUTPUT:
─────────────────────────────────────────

✓ Section created: sections/before-after-slider.liquid
✓ Theme Check: Passed
✓ Preview available in theme editor

Section includes:
├── Draggable comparison slider
├── Mobile touch support
├── Lazy-loaded images
├── Configurable labels
└── Animation options
```

### 3.3 Market Analysis Workflow

```
$ theme-builder analyze --competitors "https://tatcha.com,https://glossier.com"

PROCESS:
─────────────────────────────────────────

1. Capture screenshots (desktop + mobile)
2. Claude analyzes:
   ├── Color palettes used
   ├── Typography choices
   ├── Layout patterns
   ├── Navigation structure
   ├── Product presentation
   ├── Trust signals
   └── Unique features
3. Run Lighthouse on competitors
4. Generate comparison report

OUTPUT: analysis-report.md
─────────────────────────────────────────

## Competitor Analysis Report

### Visual Design
- Tatcha: Traditional Japanese aesthetic, gold accents, serif headings
- Glossier: Millennial pink, playful, lots of whitespace

### Common Patterns
- Minimalist navigation
- Video in hero sections
- Strong social proof (reviews prominent)
- Subscription options highlighted

### Opportunities
- Neither has 3D product views
- Limited personalization features
- No AR try-on capability

### Recommended Approach
Based on analysis, recommend:
- Color: Clean whites with subtle warm accents
- Typography: Modern serif headers, clean sans body
- Sections: Hero video, ingredients showcase, transformation gallery
```

---

## Part 4: AI Integration Details

### 4.1 Claude Integration

**Prompt Library Structure:**

```
builder/ai/claude/prompts/
├── market-analysis.md       # Analyze competitors and market
├── design-system.md         # Generate colors, typography, spacing
├── section-selector.md      # Choose and configure sections
├── section-generator.md     # Create new Liquid sections
├── content-writer.md        # Generate placeholder content
└── code-reviewer.md         # Review and improve generated code
```

**Example: Design System Prompt**

```markdown
# Design System Generator

You are a senior UI designer creating a design system for a Shopify theme.

## Input
- Brand description: {{brand_description}}
- Industry: {{industry}}
- Target audience: {{target_audience}}
- Style preferences: {{style_preferences}}
- Competitor insights: {{competitor_analysis}}

## Output Format
Generate a complete design system in JSON:

{
  "color_schemes": [
    {
      "name": "Primary",
      "background": "#FFFFFF",
      "background_gradient": "",
      "text": "#1a1a1a",
      "button": "#1a1a1a",
      "button_label": "#FFFFFF",
      "secondary_button_label": "#1a1a1a",
      "shadow": "#1a1a1a"
    }
    // ... 4 more schemes
  ],
  "typography": {
    "heading_font": "Playfair Display",
    "body_font": "Inter",
    "base_size": 16
  },
  "spacing": {
    "page_width": "1200px",
    "section_spacing": "standard",
    "card_corner_radius": 8
  },
  "rationale": "Explanation of design choices..."
}

## Guidelines
- Ensure AA contrast compliance
- Consider the target demographic
- Reference competitor patterns where appropriate
- Provide clear rationale for each decision
```

### 4.2 Nano Banana Pro Integration

**Image Generation Categories:**

| Category | Use Case | Prompt Template | Specs |
|----------|----------|-----------------|-------|
| Hero | Main banner | `{industry} lifestyle, {mood}, professional photography, wide shot` | 1920x1080 |
| Product Lifestyle | Product context | `{product} in {setting}, {lighting}, editorial style` | 1200x1200 |
| Collection | Category headers | `{theme} aesthetic flat lay, minimal, {colors}` | 1200x600 |
| About/Team | Brand story | `modern {industry} workspace, diverse team, candid` | 800x600 |
| Texture | Backgrounds | `subtle {material} texture, seamless, {color}` | 512x512 |

**Image Pipeline:**

```
Brief → Prompt Generation (Claude) → Nano Banana Pro → Post-Processing → Assets
                                            │
                                            ├── Generate 3 variations
                                            ├── Select best match
                                            ├── Resize for responsive
                                            ├── Convert to WebP
                                            └── Generate srcset
```

**Prompt Enhancement Example:**

```typescript
// Input: "hero image for luxury skincare brand"

// Claude enhances to:
const enhancedPrompt = `
  Elegant flat lay of premium skincare products on white marble surface,
  soft natural lighting from left, subtle shadows, minimalist composition,
  rose gold accents, fresh botanical elements, editorial beauty photography,
  high-end magazine aesthetic, clean and sophisticated
`;

// Nano Banana generates image
// Post-processing applies brand color overlay if needed
```

---

## Part 5: Testing & Quality Assurance

### 5.1 Automated Test Suite

```
$ theme-builder test --theme ./generated/luxe-skincare-v1/

Running test suite...

[1/5] Theme Check
     ✓ Liquid syntax valid
     ✓ No deprecated features
     ⚠ 2 warnings (minor)
     Result: PASS

[2/5] Lighthouse Desktop
     Performance:   87
     Accessibility: 94
     Best Practices: 92
     SEO:           89
     Result: PASS (target: 80)

[3/5] Lighthouse Mobile
     Performance:   74
     Accessibility: 94
     Best Practices: 92
     SEO:           89
     Result: PASS (target: 70)

[4/5] Asset Validation
     ✓ All images optimized (<500KB)
     ✓ No broken references
     ✓ Fonts preloaded
     Result: PASS

[5/5] Accessibility Scan
     ✓ Color contrast AA compliant
     ✓ All images have alt text
     ✓ Keyboard navigation works
     ⚠ 1 minor issue (skip link focus)
     Result: PASS

═══════════════════════════════════════
OVERALL: PASS (4 warnings)
Ready for review
═══════════════════════════════════════

Report saved: ./generated/luxe-skincare-v1/test-report.html
```

### 5.2 Quality Gates

```yaml
# builder/config/quality-gates.yml

quality_gates:
  theme_check:
    errors: 0              # Must have zero errors
    warnings_max: 10       # Warnings allowed but logged

  lighthouse:
    desktop:
      performance: 75
      accessibility: 90
      best_practices: 80
      seo: 80
    mobile:
      performance: 65
      accessibility: 90
      best_practices: 80
      seo: 80

  assets:
    max_image_size: 500KB
    required_formats: [webp]

  accessibility:
    wcag_level: AA
    critical_issues: 0
```

---

## Part 6: Industry Presets

### 6.1 Pre-configured Industry Templates

```yaml
# builder/templates/industries/beauty-skincare.yml

industry: beauty-skincare
display_name: "Beauty & Skincare"

sections:
  recommended:
    - hero              # Full-bleed hero with video option
    - featured-collection
    - image-with-text   # Ingredients/philosophy story
    - testimonials      # Before/after results
    - video             # How-to content
    - instagram-feed    # Social proof
    - newsletter        # List building

  optional:
    - lookbook          # Product styling
    - faq               # Ingredient questions
    - blog-posts        # Skincare tips

design:
  style: "minimal, clean, luxurious"
  color_mood: "soft, natural, calming"
  typography: "elegant serif headings, clean sans body"

imagery:
  hero: "lifestyle flat lay, soft lighting, botanical elements"
  product: "clean white background, soft shadows"
  lifestyle: "self-care moments, natural light, diverse models"

content:
  trust_signals:
    - "Clean ingredients"
    - "Cruelty-free"
    - "Dermatologist tested"
  cta_style: "soft, inviting"
```

### 6.2 Available Industry Presets

| Industry | Key Sections | Design Notes |
|----------|-------------|--------------|
| **Beauty/Skincare** | Testimonials, Video tutorials, Before/After | Soft, luxurious, clean |
| **Fashion** | Lookbook, 3D Carousel, Instagram | Editorial, aspirational |
| **Electronics** | Spec comparison, FAQ, Reviews | Dark mode, technical |
| **Food & Beverage** | Recipe cards, Subscriptions | Warm, appetizing |
| **Fitness** | Programs, Transformations, Community | Bold, energetic |
| **Home & Living** | Collections, Lifestyle galleries | Calm, inspirational |
| **Jewelry** | 3D views, Gifting guides | Elegant, detailed |
| **Pet Supplies** | Subscriptions, Community | Playful, trustworthy |

---

## Part 7: Development Phases

### Phase 1: Foundation (Week 1-2)

**Goal:** Basic CLI that can generate a customized theme

```
Tasks:
├── Set up builder/ directory structure
├── Create CLI scaffolding (Commander.js)
├── Implement theme copying/assembly
├── Create settings_data.json generator
├── Add basic color/typography customization
└── Connect to existing preview deployment

Deliverable:
$ theme-builder generate --name "test" --colors "minimal" --typography "modern"
→ Outputs working theme with customized settings
```

### Phase 2: Claude Integration (Week 3-4)

**Goal:** AI-powered design decisions and content generation

```
Tasks:
├── Set up Claude API client
├── Create prompt templates for:
│   ├── Design system generation
│   ├── Section selection
│   └── Content writing
├── Implement design system generator
├── Add section configuration logic
└── Generate placeholder content

Deliverable:
$ theme-builder generate --brief "luxury skincare brand"
→ AI selects colors, fonts, sections based on brief
```

### Phase 3: Nano Banana Pro Integration (Week 5-6)

**Goal:** On-demand image generation

```
Tasks:
├── Set up Nano Banana Pro API client
├── Create image prompt templates
├── Implement image generation pipeline
├── Add post-processing (resize, optimize)
├── Integrate into theme assembly
└── Add variation generation

Deliverable:
$ theme-builder generate --brief "..." --images
→ Generates hero, lifestyle, and texture images
```

### Phase 4: Market Analysis (Week 7-8)

**Goal:** Competitor analysis and recommendations

```
Tasks:
├── Implement URL screenshot capture
├── Create competitor analysis prompts
├── Build comparison report generator
├── Add industry trends database
└── Integrate insights into generation

Deliverable:
$ theme-builder analyze --competitors "url1,url2"
→ Outputs detailed analysis report
$ theme-builder generate --competitors "url1" --brief "..."
→ Generation informed by competitor analysis
```

### Phase 5: Section Generator (Week 9-10)

**Goal:** Create new sections via natural language

```
Tasks:
├── Create section generation prompts
├── Implement Liquid code generation
├── Add schema generation
├── Build validation pipeline
├── Create section preview system
└── Add to section library

Deliverable:
$ theme-builder section create "before/after slider"
→ Generates working section with schema
```

### Phase 6: Testing & Polish (Week 11-12)

**Goal:** Comprehensive automated testing

```
Tasks:
├── Integrate Theme Check into CLI
├── Add Lighthouse CI automation
├── Create quality gate system
├── Build test report generator
├── Add visual regression testing
└── Documentation and refinement

Deliverable:
$ theme-builder test --theme ./generated/xyz
→ Full test suite with HTML report
```

---

## Part 8: CLI Command Reference

```bash
# Theme Generation
theme-builder generate [options]
  --name <name>           Project name (required)
  --brief <description>   Brand/project description
  --industry <industry>   Industry preset to use
  --competitors <urls>    Comma-separated competitor URLs
  --images                Generate images with Nano Banana Pro
  --no-test               Skip automated testing
  --deploy                Deploy preview after generation

# Market Analysis
theme-builder analyze [options]
  --competitors <urls>    URLs to analyze (required)
  --output <file>         Output file path
  --format <format>       Output format (md, html, json)

# Section Management
theme-builder section create <description>
  --name <name>           Section file name
  --category <category>   Section category

theme-builder section list
  --category <category>   Filter by category

# Testing
theme-builder test [options]
  --theme <path>          Theme directory to test
  --fix                   Auto-fix issues where possible
  --report <file>         Output report path

# Utilities
theme-builder preview <theme-path>
  --store <store>         Target Shopify store

theme-builder config
  --set <key=value>       Set configuration value
  --get <key>             Get configuration value
```

---

## Part 9: Configuration

### 9.1 Environment Setup

```bash
# .env (local, not committed)
ANTHROPIC_API_KEY=sk-ant-...
NANO_BANANA_API_KEY=nb-...
SHOPIFY_CLI_STORE=your-dev-store.myshopify.com
```

### 9.2 Builder Configuration

```yaml
# builder/config/builder.yml

defaults:
  output_directory: "./generated"
  base_theme: "./elle"

generation:
  default_industry: "general"
  generate_images: true
  image_variations: 3
  run_tests: true
  auto_deploy_preview: true

testing:
  lighthouse_runs: 3  # Average of 3 runs
  fail_on_warnings: false

ai:
  claude:
    model: "claude-sonnet-4-20250514"
    max_tokens: 4096
  nano_banana:
    default_quality: "high"
    default_style: "photography"
```

---

## Part 10: Immediate Next Steps

### This Week

1. **Validate Nano Banana Pro**
   - [ ] Test API access and capabilities
   - [ ] Generate sample e-commerce images
   - [ ] Determine rate limits and costs
   - [ ] Create initial prompt templates

2. **Set up builder directory**
   - [ ] Create folder structure
   - [ ] Initialize package.json
   - [ ] Set up TypeScript config
   - [ ] Create basic CLI entry point

3. **First working command**
   - [ ] Implement `theme-builder generate --name`
   - [ ] Copy base theme to generated/
   - [ ] Update theme name in settings

### Next Week

1. **Claude integration**
   - [ ] Set up API client
   - [ ] Create design system prompt
   - [ ] Generate first AI-powered theme

2. **Testing integration**
   - [ ] Connect Theme Check to CLI
   - [ ] Add Lighthouse automation
   - [ ] Create basic test report

---

## Appendix A: Client Brief Template

```yaml
# briefs/client-template.yml

project:
  name: ""
  client: ""
  deadline: ""

brand:
  name: ""
  tagline: ""
  description: ""
  values: []
  voice: ""  # professional, casual, playful, luxury, minimal

target_market:
  industry: ""
  audience:
    age_range: ""
    gender: ""
    income_level: ""
    interests: []
  geography: ""

competitors:
  - url: ""
    notes: ""

style:
  mood: ""  # modern, classic, bold, minimal, playful, elegant
  colors:
    preferred: []
    avoid: []
  inspiration: []

requirements:
  must_have_sections: []
  must_have_features: []
  content_ready: true/false
  images_ready: true/false

notes: ""
```

---

## Appendix B: Generated Theme Structure

```
generated/luxe-skincare-v1/
├── assets/
│   ├── generated-hero-1.webp
│   ├── generated-hero-2.webp
│   ├── generated-lifestyle-1.webp
│   └── ... (all generated images)
├── config/
│   ├── settings_schema.json    # Unchanged from base
│   └── settings_data.json      # AI-configured
├── layout/
├── locales/
├── sections/                    # Base + any new sections
├── snippets/
├── templates/
│   └── index.json              # AI-configured section order
├── generation-report.json      # Metadata about generation
├── test-report.html            # Automated test results
└── README.md                   # Generation notes
```

---

*Document Version: 2.0*
*Type: Internal Tool*
*Created: January 2026*
*Last Updated: January 2026*
