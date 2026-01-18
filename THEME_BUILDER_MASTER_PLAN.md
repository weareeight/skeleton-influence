# Theme Builder: Technical Specification
## Interactive Theme Generation System

---

## 1. What We're Building

An **interactive terminal application** that guides a human operator through generating:

1. **A substantially differentiated Shopify theme** (ready for theme store submission)
2. **Product catalog** with AI-generated images (studio shots + angles + lifestyle)
3. **Import-ready CSV** for Shopify product import

The process is **conversational** - every major decision gets human approval before proceeding.

---

## 2. Core Principles

| Principle | Implementation |
|-----------|----------------|
| **Human-in-the-loop** | Every major output requires approval before continuing |
| **Iterative refinement** | "Agree or comment?" at each step - comments feed back into regeneration |
| **Substantial differentiation** | Generated themes must be meaningfully unique for theme store |
| **Local-only** | Runs on your machine, no hosting, no auth |
| **Time-realistic** | ~2-3 hours total (image generation is the bottleneck) |

---

## 3. The Generation Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        INTERACTIVE GENERATION FLOW                           │
│                           (~2-3 hours total)                                 │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  PHASE 1: BRIEF & MARKET ANALYSIS (~10 min)                                 │
│  ════════════════════════════════════════════                               │
│  │                                                                          │
│  ├─► You provide: Industry, target market, style direction                  │
│  ├─► AI analyzes: Market positioning, competitor patterns                   │
│  ├─► AI proposes: Brand direction, naming, positioning                      │
│  └─► YOU APPROVE OR COMMENT ────────────────────────────────► Loop back    │
│                                                                              │
│  PHASE 2: PRODUCT CATALOG DEFINITION (~15 min)                              │
│  ═════════════════════════════════════════════                              │
│  │                                                                          │
│  ├─► AI generates: 20 product names, descriptions, prices                   │
│  ├─► AI proposes: Product categories, collections structure                 │
│  ├─► AI drafts: SEO titles, meta descriptions                               │
│  └─► YOU APPROVE OR COMMENT ────────────────────────────────► Loop back    │
│                                                                              │
│  PHASE 3: CORE PRODUCT IMAGE (~20 min per product = ~2+ hours)              │
│  ═══════════════════════════════════════════════════════════                │
│  │                                                                          │
│  │  For each product:                                                       │
│  │  ┌────────────────────────────────────────────────────────┐             │
│  │  │ 1. Generate studio shot (Nano Banana via Replicate)    │             │
│  │  │ 2. Present: "Here is the core product image"           │             │
│  │  │ 3. YOU APPROVE OR COMMENT ──────────► Regenerate       │             │
│  │  │ 4. Generate 3-4 angle variations from approved image   │             │
│  │  │ 5. Generate 3 lifestyle images from approved image     │             │
│  │  │ 6. Present all images for final approval               │             │
│  │  └────────────────────────────────────────────────────────┘             │
│  │                                                                          │
│  └─► Output: Full image set per product (saved locally)                     │
│                                                                              │
│  PHASE 4: THEME DIFFERENTIATION (~30 min)                                   │
│  ═════════════════════════════════════════                                  │
│  │                                                                          │
│  ├─► AI proposes: 4 NEW sections (unique to this theme)                     │
│  │   - Concept, functionality, why it's unique                              │
│  ├─► AI proposes: 4 MODIFIED existing sections                              │
│  │   - What changes, why it differentiates                                  │
│  ├─► AI proposes: Unique interaction patterns, animations                   │
│  ├─► AI proposes: Novel settings/customization options                      │
│  └─► YOU APPROVE OR COMMENT ────────────────────────────────► Loop back    │
│                                                                              │
│  PHASE 5: DESIGN SYSTEM (~15 min)                                           │
│  ════════════════════════════════                                           │
│  │                                                                          │
│  ├─► AI generates: 5 color schemes (based on product imagery)               │
│  ├─► AI selects: Typography pairings                                        │
│  ├─► AI defines: Spacing, corner radius, button styles                      │
│  └─► YOU APPROVE OR COMMENT ────────────────────────────────► Loop back    │
│                                                                              │
│  PHASE 6: CODE GENERATION (~20 min)                                         │
│  ══════════════════════════════════                                         │
│  │                                                                          │
│  ├─► AI generates: 4 new section Liquid files                               │
│  ├─► AI modifies: 4 existing sections                                       │
│  ├─► AI configures: settings_data.json, templates                           │
│  ├─► AI generates: CSS customizations                                       │
│  └─► Theme Check validation (automatic)                                     │
│                                                                              │
│  PHASE 7: PREVIEW & TESTING (~15 min)                                       │
│  ════════════════════════════════════                                       │
│  │                                                                          │
│  ├─► Deploy preview theme to dev store                                      │
│  ├─► Capture screenshots (homepage, product, collection, cart)              │
│  ├─► AI reviews screenshots for issues                                      │
│  ├─► Run accessibility checks                                               │
│  └─► YOU REVIEW PREVIEW URL ────────────────────────────────► Fix issues   │
│                                                                              │
│  PHASE 8: OUTPUT ASSEMBLY                                                   │
│  ════════════════════════════                                               │
│  │                                                                          │
│  ├─► Generate: products-import.csv (no images, manual hosting)              │
│  ├─► Package: theme.zip (ready for submission)                              │
│  ├─► Save: All product images in organized folders                          │
│  └─► Generate: Summary report of what was created                           │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 4. Interactive Conversation Examples

### 4.1 Phase 1: Brief Input

```
═══════════════════════════════════════════════════════════════════════════════
 THEME BUILDER - Phase 1: Brief & Market Analysis
═══════════════════════════════════════════════════════════════════════════════

What industry/niche is this theme for?
► Premium pet accessories (luxury dog collars, beds, carriers)

Describe the target customer:
► Affluent millennial/gen-x dog owners who treat pets as family members.
  Urban professionals, $100k+ income, value quality over price.

Any specific competitors or inspiration?
► Wild One, Fable Pets, Max Bone

Style direction?
► Modern minimalist, warm neutrals, photography-forward, trustworthy

───────────────────────────────────────────────────────────────────────────────
Analyzing market positioning...

Based on your brief, here's my proposed direction:

BRAND POSITIONING
━━━━━━━━━━━━━━━━━
  Theme Name: "Borough" (urban sophistication for modern pet parents)
  Tagline: "Elevated essentials for your everyday companion"
  Voice: Warm but refined, confident without being pretentious

MARKET DIFFERENTIATION
━━━━━━━━━━━━━━━━━━━━━━
  - Wild One: Playful, colorful, younger skewing
  - Fable: Very minimal, almost sterile
  - Max Bone: Traditional luxury, formal

  OUR ANGLE: Warm minimalism - approachable luxury that feels like home,
  not a museum. Photography of real moments, not just styled shots.

KEY THEME FEATURES TO EMPHASIZE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  - Pet profile/registry feature
  - Subscription-friendly layout
  - Size guide integration
  - User-generated content sections

───────────────────────────────────────────────────────────────────────────────
Agree, or provide comments to refine?
► [Your response here]
```

### 4.2 Phase 2: Product Catalog

```
═══════════════════════════════════════════════════════════════════════════════
 THEME BUILDER - Phase 2: Product Catalog
═══════════════════════════════════════════════════════════════════════════════

Based on the premium pet accessories positioning, here are 20 proposed products:

COLLARS & LEASHES (6 products)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 1. The Daily Collar - Everyday leather collar         $68
 2. The Weekend Leash - 6ft leather leash              $85
 3. The City Set - Matching collar + leash bundle      $145
 4. The After Dark Collar - Reflective accent          $78
 5. The Hands-Free Lead - Crossbody leash              $95
 6. The Puppy Set - Adjustable starter kit             $55

BEDS & COMFORT (5 products)
━━━━━━━━━━━━━━━━━━━━━━━━━━━
 7. The Nest Bed - Round bolster bed, S/M/L           $185-265
 8. The Travel Mat - Portable roll-up bed              $95
 9. The Couch Cover - Furniture protector              $125
10. The Crate Pad - Machine washable insert            $75
11. The Outdoor Blanket - Water-resistant              $85

CARRIERS & TRAVEL (4 products)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
12. The Weekender Carrier - Airline approved          $225
13. The Car Seat - Safety-tested booster              $175
14. The Day Bag - Small dog carrier tote              $195
15. The Adventure Pack - Hiking backpack carrier      $245

FEEDING & WELLNESS (5 products)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
16. The Bowl Set - Ceramic food + water               $85
17. The Slow Feeder - Puzzle bowl                     $65
18. The Travel Kit - Collapsible bowls + carrier      $55
19. The Supplement Chews - Joint health, 30ct         $45
20. The Grooming Kit - Brush + nail clipper           $75

───────────────────────────────────────────────────────────────────────────────
Agree with these products, or provide comments?
► I like it, but swap out the supplement chews - we're not doing consumables.
  Add a bandana or bow tie instead. Also bump all prices up 10-15%.
```

### 4.3 Phase 3: Product Image Generation

```
═══════════════════════════════════════════════════════════════════════════════
 THEME BUILDER - Phase 3: Product Images
═══════════════════════════════════════════════════════════════════════════════

Starting image generation for Product 1 of 20: The Daily Collar

Generating core studio shot via Nano Banana Pro (Replicate)...
[████████████████████████████████████████] 100%

CORE PRODUCT IMAGE GENERATED
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Saved: ./output/borough-theme/images/daily-collar/studio-main.png

Displaying image...
[Image displayed in terminal or opens in Preview]

This is a leather dog collar on a clean white/cream backdrop with soft
shadows. The leather appears rich cognac brown with brass hardware.
Minimalist studio lighting, slight reflection on surface.

───────────────────────────────────────────────────────────────────────────────
Approve this core image, or provide feedback to regenerate?
► The leather looks good but make the hardware silver/nickel instead of brass.
  Also, can we see it from a slightly higher angle?
```

```
Regenerating with feedback...
[████████████████████████████████████████] 100%

NEW CORE IMAGE GENERATED
━━━━━━━━━━━━━━━━━━━━━━━━
[Image displayed]

Updated: Silver/nickel hardware, higher camera angle

───────────────────────────────────────────────────────────────────────────────
Approve this core image?
► Yes, approved

Generating angle variations from approved core image...
[████████████░░░░░░░░░░░░░░░░░░░░░░░░░░░░] 30%  Angle 1: Front detail
[████████████████████████░░░░░░░░░░░░░░░░] 60%  Angle 2: Buckle close-up
[████████████████████████████████████░░░░] 90%  Angle 3: Side profile
[████████████████████████████████████████] 100% Angle 4: Flat lay

Generating lifestyle images from approved core image...
[████████████████░░░░░░░░░░░░░░░░░░░░░░░░] 40%  Lifestyle 1: On golden retriever
[████████████████████████████░░░░░░░░░░░░] 70%  Lifestyle 2: In home setting
[████████████████████████████████████████] 100% Lifestyle 3: Outdoor walk

ALL IMAGES FOR "THE DAILY COLLAR" COMPLETE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Saved to: ./output/borough-theme/images/daily-collar/
  ├── studio-main.png (approved core)
  ├── angle-front.png
  ├── angle-buckle.png
  ├── angle-side.png
  ├── angle-flatlay.png
  ├── lifestyle-dog.png
  ├── lifestyle-home.png
  └── lifestyle-outdoor.png

───────────────────────────────────────────────────────────────────────────────
Review complete image set? [Y/n]
► y

[All 8 images displayed in grid]

Approve image set for The Daily Collar?
► Lifestyle 2 (home setting) looks off - regenerate that one with a more
  modern apartment setting, less traditional

Regenerating lifestyle-home.png...
```

### 4.4 Phase 4: Theme Differentiation

```
═══════════════════════════════════════════════════════════════════════════════
 THEME BUILDER - Phase 4: Theme Differentiation
═══════════════════════════════════════════════════════════════════════════════

For theme store acceptance, we need SUBSTANTIAL differentiation.
Here's my proposal for making "Borough" unique:

4 NEW SECTIONS (not in base theme)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. PET PROFILE BUILDER
   ┌─────────────────────────────────────────────────────────────────┐
   │ Interactive section where customers create a pet profile.       │
   │ - Upload pet photo                                              │
   │ - Enter pet name, breed, size, age                              │
   │ - Get personalized product recommendations                      │
   │ - Profile persists across sessions (localStorage)               │
   │ WHY UNIQUE: No existing theme has this. Drives engagement.      │
   └─────────────────────────────────────────────────────────────────┘

2. SIZE GUIDE OVERLAY
   ┌─────────────────────────────────────────────────────────────────┐
   │ Interactive sizing tool that appears on product pages.          │
   │ - Visual diagram of measuring points                            │
   │ - Enter measurements → get size recommendation                  │
   │ - "Unsure? We'll exchange free" trust builder                   │
   │ WHY UNIQUE: Most themes link to static size chart page.         │
   └─────────────────────────────────────────────────────────────────┘

3. SUBSCRIPTION BUILDER
   ┌─────────────────────────────────────────────────────────────────┐
   │ Visual subscription customization (works with Recharge etc).    │
   │ - Pick products for your "box"                                  │
   │ - Select frequency with visual calendar                         │
   │ - Show savings vs one-time purchase                             │
   │ WHY UNIQUE: Subscription-specific UX, not just a checkbox.      │
   └─────────────────────────────────────────────────────────────────┘

4. COMMUNITY GALLERY
   ┌─────────────────────────────────────────────────────────────────┐
   │ UGC section pulling from Instagram hashtag or uploaded photos.  │
   │ - Masonry grid of customer pet photos                           │
   │ - Click to see which products are featured                      │
   │ - Submit your own photo flow                                    │
   │ WHY UNIQUE: Integrated UGC with product tagging, not just feed. │
   └─────────────────────────────────────────────────────────────────┘

4 MODIFIED EXISTING SECTIONS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. HERO → "LIFESTYLE HERO"
   - Add parallax pet image layer that moves with scroll
   - "Meet [Pet Name]" personalization if profile exists
   - Video background option with pet-specific ambient sounds toggle

2. PRODUCT CARD → "PRODUCT CARD WITH PET PREVIEW"
   - On hover, show product on a generic pet silhouette
   - Size indicator badges (S/M/L/XL) more prominent
   - "Perfect for [breed]" tag if breed data available

3. TESTIMONIALS → "PET PARENT STORIES"
   - Include pet photo alongside customer photo
   - Pet name and breed shown
   - "Verified purchase" with specific product

4. FAQ → "SMART FAQ"
   - Expandable with search/filter
   - Related products shown per FAQ answer
   - "Still have questions? Chat" integration point

───────────────────────────────────────────────────────────────────────────────
Agree with these differentiators, or provide comments?
► Love the pet profile concept. Subscription builder might be overkill for
  this demo - replace with something simpler. Maybe a "Shop by Pet Size"
  visual navigator? Big dog vs small dog imagery that filters products.
```

---

## 5. Technical Architecture

### 5.1 System Components

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           SYSTEM ARCHITECTURE                                │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌────────────────────────────────────────────────────────────────────────┐ │
│  │                     TERMINAL INTERFACE (Node.js)                        │ │
│  │                                                                          │ │
│  │  - Inquirer.js for prompts and input                                    │ │
│  │  - Chalk for colored output                                             │ │
│  │  - Terminal-image for displaying generated images                       │ │
│  │  - Progress bars for long operations                                    │ │
│  │  - State persistence (resume interrupted sessions)                      │ │
│  │                                                                          │ │
│  └────────────────────────────────────────────────────────────────────────┘ │
│                                    │                                         │
│                                    ▼                                         │
│  ┌────────────────────────────────────────────────────────────────────────┐ │
│  │                      ORCHESTRATION ENGINE                               │ │
│  │                                                                          │ │
│  │  session-manager.ts    - Track progress, allow resume                   │ │
│  │  phase-controller.ts   - Manage phase transitions                       │ │
│  │  approval-loop.ts      - Handle approve/comment/regenerate flow         │ │
│  │  output-manager.ts     - Save files, organize outputs                   │ │
│  │                                                                          │ │
│  └────────────────────────────────────────────────────────────────────────┘ │
│                                    │                                         │
│            ┌───────────────────────┼───────────────────────┐                │
│            ▼                       ▼                       ▼                │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐          │
│  │  CLAUDE CLIENT   │  │  REPLICATE       │  │  SHOPIFY CLI     │          │
│  │                  │  │  (Nano Banana)   │  │  INTEGRATION     │          │
│  │  - Market        │  │                  │  │                  │          │
│  │    analysis      │  │  - Studio shots  │  │  - Theme upload  │          │
│  │  - Product       │  │  - Angle         │  │  - Preview URL   │          │
│  │    generation    │  │    variations    │  │  - Theme Check   │          │
│  │  - Section       │  │  - Lifestyle     │  │                  │          │
│  │    design        │  │    images        │  │                  │          │
│  │  - Code          │  │                  │  │                  │          │
│  │    generation    │  │                  │  │                  │          │
│  │  - Review/QA     │  │                  │  │                  │          │
│  └──────────────────┘  └──────────────────┘  └──────────────────┘          │
│                                    │                                         │
│                                    ▼                                         │
│  ┌────────────────────────────────────────────────────────────────────────┐ │
│  │                         OUTPUT GENERATION                               │ │
│  │                                                                          │ │
│  │  ./output/{theme-name}/                                                 │ │
│  │  ├── theme/                    # Complete Shopify theme                 │ │
│  │  │   ├── sections/                                                      │ │
│  │  │   ├── snippets/                                                      │ │
│  │  │   └── ...                                                            │ │
│  │  ├── theme.zip                 # Packaged for upload                    │ │
│  │  ├── images/                   # All product images                     │ │
│  │  │   ├── product-1/                                                     │ │
│  │  │   │   ├── studio-main.png                                            │ │
│  │  │   │   ├── angle-*.png                                                │ │
│  │  │   │   └── lifestyle-*.png                                            │ │
│  │  │   └── product-2/...                                                  │ │
│  │  ├── products-import.csv       # Shopify product CSV (no image URLs)   │ │
│  │  ├── session.json              # Session state for resume              │ │
│  │  └── generation-report.md      # Summary of what was created           │ │
│  │                                                                          │ │
│  └────────────────────────────────────────────────────────────────────────┘ │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 5.2 Image Generation Pipeline (Nano Banana Pro via Replicate)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                      IMAGE GENERATION PIPELINE                               │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  INPUT: Product definition (name, description, category)                    │
│                                                                              │
│  STEP 1: CORE STUDIO SHOT                                                   │
│  ════════════════════════                                                   │
│  │                                                                          │
│  │  Claude generates prompt:                                                │
│  │  "Premium leather dog collar, cognac brown, silver hardware,            │
│  │   professional studio photography, soft shadows, clean white            │
│  │   backdrop, commercial product shot, high-end aesthetic"                │
│  │                                                                          │
│  │  Replicate API (Nano Banana Pro model):                                 │
│  │  ┌────────────────────────────────────────────────────────────┐        │
│  │  │  POST https://api.replicate.com/v1/predictions             │        │
│  │  │  {                                                          │        │
│  │  │    "model": "nanobanano/...",                               │        │
│  │  │    "input": {                                               │        │
│  │  │      "prompt": "<generated prompt>",                        │        │
│  │  │      "aspect_ratio": "1:1",                                 │        │
│  │  │      "output_format": "png"                                 │        │
│  │  │    }                                                        │        │
│  │  │  }                                                          │        │
│  │  └────────────────────────────────────────────────────────────┘        │
│  │                                                                          │
│  └─► HUMAN APPROVAL CHECKPOINT ─────────────────────────────────────────── │
│      │                                                                      │
│      ├─► Approved → Continue to Step 2                                     │
│      └─► Comments → Regenerate with feedback                               │
│                                                                              │
│  STEP 2: ANGLE VARIATIONS (from approved core)                              │
│  ═════════════════════════════════════════════                              │
│  │                                                                          │
│  │  Use img2img or prompt variations referencing core image style:         │
│  │                                                                          │
│  │  Angle 1: "Same product, front detail view, focus on stitching"        │
│  │  Angle 2: "Same product, close-up of buckle/hardware"                  │
│  │  Angle 3: "Same product, side profile view"                            │
│  │  Angle 4: "Same product, flat lay from above"                          │
│  │                                                                          │
│  │  (These can run in parallel - ~4 API calls)                            │
│  │                                                                          │
│  └─► Save all angles                                                       │
│                                                                              │
│  STEP 3: LIFESTYLE IMAGES (from approved core)                              │
│  ═════════════════════════════════════════════                              │
│  │                                                                          │
│  │  Lifestyle 1: "Golden retriever wearing [product], modern apartment,   │
│  │               natural window light, lifestyle photography"              │
│  │                                                                          │
│  │  Lifestyle 2: "Dog with [product], outdoor park setting, golden hour,  │
│  │               candid moment, professional pet photography"              │
│  │                                                                          │
│  │  Lifestyle 3: "Close-up of happy dog, [product] visible, warm tones,   │
│  │               editorial style, shallow depth of field"                  │
│  │                                                                          │
│  │  (These can run in parallel - ~3 API calls)                            │
│  │                                                                          │
│  └─► HUMAN APPROVAL CHECKPOINT (bulk review)                               │
│                                                                              │
│  OUTPUT: 8 images per product                                               │
│  ════════════════════════════                                               │
│  - 1 core studio shot (approved)                                           │
│  - 4 angle variations                                                       │
│  - 3 lifestyle images                                                       │
│                                                                              │
│  TIME ESTIMATE: ~15-20 minutes per product                                  │
│  (Replicate cold start + generation time + approval loops)                 │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 5.3 Testing Strategy

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           TESTING STRATEGY                                   │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  STAGE 1: STATIC VALIDATION (automatic, no preview needed)                  │
│  ══════════════════════════════════════════════════════════                 │
│                                                                              │
│  $ shopify theme check --path ./output/borough-theme/theme/                 │
│                                                                              │
│  - Liquid syntax validation                                                 │
│  - Schema validation                                                         │
│  - Best practices                                                            │
│  - Performance rules                                                         │
│                                                                              │
│  Gate: Must pass with 0 errors before proceeding                            │
│                                                                              │
│  ─────────────────────────────────────────────────────────────────────────  │
│                                                                              │
│  STAGE 2: PREVIEW DEPLOYMENT                                                │
│  ═══════════════════════════                                                │
│                                                                              │
│  $ shopify theme push --unpublished --store=dev-store                       │
│                                                                              │
│  Captures:                                                                   │
│  - Theme ID                                                                  │
│  - Preview URL: https://dev-store.myshopify.com/?preview_theme_id=XXXXX    │
│                                                                              │
│  ─────────────────────────────────────────────────────────────────────────  │
│                                                                              │
│  STAGE 3: SCREENSHOT CAPTURE (Puppeteer)                                    │
│  ═══════════════════════════════════════                                    │
│                                                                              │
│  Pages to capture:                                                           │
│  ┌────────────────────────────────────────────────────────────────────────┐│
│  │  Page              │ Desktop (1440px) │ Mobile (375px)                 ││
│  │────────────────────│──────────────────│────────────────────────────────││
│  │  Homepage          │ ✓                │ ✓                              ││
│  │  Collection        │ ✓                │ ✓                              ││
│  │  Product           │ ✓                │ ✓                              ││
│  │  Cart              │ ✓                │ ✓                              ││
│  │  Search results    │ ✓                │ ✓                              ││
│  └────────────────────────────────────────────────────────────────────────┘│
│                                                                              │
│  Saved to: ./output/borough-theme/screenshots/                              │
│                                                                              │
│  ─────────────────────────────────────────────────────────────────────────  │
│                                                                              │
│  STAGE 4: AI REVIEW (Claude analyzes screenshots)                           │
│  ════════════════════════════════════════════════                           │
│                                                                              │
│  Claude reviews each screenshot for:                                        │
│  - Layout issues (overlapping elements, broken layouts)                     │
│  - Missing images or broken image references                                │
│  - Text readability and contrast                                            │
│  - Mobile responsiveness issues                                             │
│  - Consistency with design system                                           │
│                                                                              │
│  Output: List of issues with severity (critical/warning/info)               │
│                                                                              │
│  ─────────────────────────────────────────────────────────────────────────  │
│                                                                              │
│  STAGE 5: ACCESSIBILITY CHECK                                               │
│  ════════════════════════════                                               │
│                                                                              │
│  Using axe-core via Puppeteer:                                              │
│  - Color contrast violations                                                │
│  - Missing alt text                                                          │
│  - Keyboard navigation issues                                               │
│  - ARIA violations                                                           │
│                                                                              │
│  Gate: No critical accessibility issues                                     │
│                                                                              │
│  ─────────────────────────────────────────────────────────────────────────  │
│                                                                              │
│  STAGE 6: HUMAN REVIEW                                                      │
│  ════════════════════                                                       │
│                                                                              │
│  Present:                                                                    │
│  - Preview URL for manual testing                                           │
│  - Screenshot grid for quick visual review                                  │
│  - AI-identified issues                                                      │
│  - Accessibility report                                                      │
│                                                                              │
│  Human decides: Approve / Request fixes                                     │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 6. Differentiation Requirements

### For Shopify Theme Store Acceptance

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    THEME STORE DIFFERENTIATION CHECKLIST                     │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  Shopify requires themes to be "substantially different" from existing      │
│  themes. Here's how we ensure each generated theme qualifies:               │
│                                                                              │
│  MINIMUM REQUIREMENTS                                                        │
│  ════════════════════                                                        │
│                                                                              │
│  □ At least 4 NEW sections not present in base theme                        │
│    - Must be functional, not just visual variants                           │
│    - Must solve real merchant problems                                      │
│    - Must be well-documented with use cases                                 │
│                                                                              │
│  □ At least 4 SUBSTANTIALLY MODIFIED existing sections                      │
│    - New functionality added, not just CSS changes                          │
│    - New settings/customization options                                     │
│    - Different interaction patterns                                         │
│                                                                              │
│  □ Unique design system                                                      │
│    - Custom typography pairings                                             │
│    - Distinct color scheme philosophy                                       │
│    - Recognizable visual identity                                           │
│                                                                              │
│  □ Industry-specific features                                                │
│    - Features that make sense for target vertical                           │
│    - Not generic "works for everyone" approach                              │
│                                                                              │
│  □ Novel interaction patterns                                                │
│    - At least 2 unique animations or micro-interactions                     │
│    - Something users will notice and remember                               │
│                                                                              │
│  DIFFERENTIATION MATRIX (tracked per generation)                             │
│  ═══════════════════════════════════════════════                             │
│                                                                              │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │  Category              │ Base (Elle) │ Generated Theme  │ Diff %     │  │
│  │────────────────────────│─────────────│──────────────────│────────────│  │
│  │  Total sections        │ 53          │ 57 (+4 new)      │ +7.5%      │  │
│  │  Modified sections     │ -           │ 4 substantially  │ -          │  │
│  │  New settings          │ 535 lines   │ 620+ lines       │ +16%       │  │
│  │  Custom CSS            │ baseline    │ +400 lines       │ -          │  │
│  │  Unique features       │ 0           │ 4+               │ -          │  │
│  │  Industry-specific     │ No          │ Yes              │ -          │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
│                                                                              │
│  AI will track and report differentiation metrics throughout generation.    │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 7. Session Management

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          SESSION MANAGEMENT                                  │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  Sessions are LONG (~2-3 hours). We need robust state management.           │
│                                                                              │
│  SESSION STATE FILE: ./output/{theme}/session.json                          │
│  ══════════════════════════════════════════════════                         │
│                                                                              │
│  {                                                                           │
│    "id": "borough-2024-01-18-001",                                          │
│    "created": "2024-01-18T10:30:00Z",                                       │
│    "lastUpdated": "2024-01-18T12:45:00Z",                                   │
│    "currentPhase": "product-images",                                        │
│    "currentStep": {                                                         │
│      "phase": 3,                                                            │
│      "productIndex": 7,                                                     │
│      "substep": "lifestyle-generation"                                      │
│    },                                                                        │
│    "approvals": {                                                            │
│      "brief": { "approved": true, "timestamp": "...", "comments": [] },    │
│      "products": { "approved": true, "iterations": 2 },                     │
│      "productImages": {                                                     │
│        "product-1": { "core": "approved", "angles": "approved", ... },     │
│        "product-2": { "core": "approved", "angles": "pending", ... },      │
│        ...                                                                  │
│      },                                                                      │
│      "differentiation": { "approved": false, "iterations": 1 },            │
│      "designSystem": { "approved": false },                                 │
│      "preview": { "approved": false }                                       │
│    },                                                                        │
│    "generatedAssets": {                                                     │
│      "images": ["./images/product-1/studio-main.png", ...],                │
│      "sections": ["sections/pet-profile.liquid", ...],                      │
│      "configs": ["settings_data.json"]                                      │
│    }                                                                         │
│  }                                                                           │
│                                                                              │
│  RESUME CAPABILITY                                                           │
│  ═════════════════                                                           │
│                                                                              │
│  $ theme-builder                                                            │
│                                                                              │
│  ┌────────────────────────────────────────────────────────────────────────┐│
│  │  Found incomplete session: "borough" (started 2 hours ago)             ││
│  │  Progress: Phase 3 - Product Images (7/20 complete)                    ││
│  │                                                                          ││
│  │  ? What would you like to do?                                           ││
│  │    › Resume this session                                                ││
│  │      Start fresh (archive existing)                                     ││
│  │      View session details                                               ││
│  └────────────────────────────────────────────────────────────────────────┘│
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 8. Output Specification

### 8.1 Products Import CSV

```csv
Handle,Title,Body (HTML),Vendor,Type,Tags,Published,Option1 Name,Option1 Value,Variant SKU,Variant Price,Variant Compare At Price,Variant Requires Shipping,Variant Taxable,Variant Inventory Policy,Status
daily-collar,"The Daily Collar","<p>Our everyday leather collar combines...</p>",Borough,Collars,"leather, everyday, bestseller",TRUE,Size,Small,DC-SM,78.00,,TRUE,TRUE,deny,active
daily-collar,,,,,,,Size,Medium,DC-MD,78.00,,TRUE,TRUE,deny,active
daily-collar,,,,,,,Size,Large,DC-LG,78.00,,TRUE,TRUE,deny,active
weekend-leash,"The Weekend Leash","<p>A 6-foot leather leash designed for...</p>",Borough,Leashes,"leather, leash, walk",TRUE,,,WL-001,95.00,,TRUE,TRUE,deny,active
```

**Note**: Image columns intentionally omitted. Images saved to `./output/{theme}/images/` for manual upload after hosting.

### 8.2 Theme Package

```
./output/borough-theme/
├── theme/                          # Full Shopify theme
│   ├── assets/
│   ├── config/
│   │   ├── settings_schema.json    # May have new settings
│   │   └── settings_data.json      # Configured for this theme
│   ├── layout/
│   ├── locales/
│   ├── sections/
│   │   ├── [base sections...]
│   │   ├── pet-profile.liquid      # NEW
│   │   ├── size-guide-overlay.liquid # NEW
│   │   ├── shop-by-size.liquid     # NEW
│   │   └── community-gallery.liquid # NEW
│   ├── snippets/
│   └── templates/
│
├── theme.zip                       # Ready for upload/submission
│
├── images/                         # All product images
│   ├── daily-collar/
│   │   ├── studio-main.png
│   │   ├── angle-front.png
│   │   ├── angle-buckle.png
│   │   ├── angle-side.png
│   │   ├── angle-flatlay.png
│   │   ├── lifestyle-dog.png
│   │   ├── lifestyle-home.png
│   │   └── lifestyle-outdoor.png
│   ├── weekend-leash/
│   │   └── [8 images...]
│   └── [18 more products...]
│
├── products-import.csv             # Shopify CSV (no images)
│
├── screenshots/                    # Test screenshots
│   ├── desktop/
│   └── mobile/
│
├── session.json                    # Session state
│
└── generation-report.md            # Summary
```

---

## 9. Development Phases

### Phase 1: Core Interaction Loop (Week 1-2)

```
GOAL: Working interactive terminal with Claude integration

Tasks:
├── Project setup (Node.js, TypeScript, package.json)
├── Terminal UI framework (Inquirer, Chalk, progress bars)
├── Claude API client with conversation memory
├── Basic phase flow (Brief → Approval loop)
├── Session state management (save/resume)
└── Output directory structure

Deliverable:
Can run through Phase 1-2 (brief + product catalog) interactively
with approve/comment loops working
```

### Phase 2: Image Generation Pipeline (Week 3-4)

```
GOAL: Full Nano Banana Pro integration via Replicate

Tasks:
├── Replicate API client
├── Prompt generation for product images
├── Core image → Approval → Angles → Lifestyle pipeline
├── Image display in terminal (or auto-open in Preview)
├── Parallel generation for variations
├── Image organization and naming
└── Regeneration on feedback

Deliverable:
Can generate full image set for one product with approval loop
```

### Phase 3: Theme Differentiation Engine (Week 5-6)

```
GOAL: AI proposes and generates unique theme features

Tasks:
├── Section proposal prompts (new + modified)
├── Design system generation
├── Liquid code generation for new sections
├── Section modification (diff-based changes to existing)
├── Schema generation for new settings
├── Integration testing (Theme Check)
└── Differentiation tracking/reporting

Deliverable:
Can generate 4 new sections + 4 modified sections with human approval
```

### Phase 4: Testing & Output (Week 7-8)

```
GOAL: Preview deployment, screenshot testing, final output

Tasks:
├── Shopify CLI integration (theme push, preview URL)
├── Puppeteer screenshot capture
├── AI screenshot review for issues
├── Accessibility scanning (axe-core)
├── CSV generation
├── Theme packaging (zip)
├── Generation report
└── End-to-end testing

Deliverable:
Complete pipeline from brief to packaged theme + products
```

---

## 10. File Structure

```
skeleton-influence/
├── elle/                           # Base theme (existing)
│
├── builder/                        # Theme builder tool
│   ├── package.json
│   ├── tsconfig.json
│   │
│   ├── src/
│   │   ├── index.ts                # Entry point
│   │   │
│   │   ├── ui/                     # Terminal interface
│   │   │   ├── prompts.ts          # Inquirer prompts
│   │   │   ├── display.ts          # Output formatting
│   │   │   ├── progress.ts         # Progress bars
│   │   │   └── image-viewer.ts     # Display images in terminal
│   │   │
│   │   ├── phases/                 # Phase implementations
│   │   │   ├── 1-brief.ts
│   │   │   ├── 2-products.ts
│   │   │   ├── 3-images.ts
│   │   │   ├── 4-differentiation.ts
│   │   │   ├── 5-design-system.ts
│   │   │   ├── 6-code-generation.ts
│   │   │   ├── 7-testing.ts
│   │   │   └── 8-output.ts
│   │   │
│   │   ├── ai/
│   │   │   ├── claude.ts           # Claude API client
│   │   │   ├── replicate.ts        # Replicate (Nano Banana) client
│   │   │   └── prompts/            # Prompt templates
│   │   │       ├── market-analysis.ts
│   │   │       ├── product-catalog.ts
│   │   │       ├── image-prompts.ts
│   │   │       ├── section-design.ts
│   │   │       ├── code-generation.ts
│   │   │       └── screenshot-review.ts
│   │   │
│   │   ├── generators/
│   │   │   ├── sections.ts         # Generate Liquid sections
│   │   │   ├── settings.ts         # Generate settings_data.json
│   │   │   ├── csv.ts              # Generate products CSV
│   │   │   └── theme-package.ts    # Create theme.zip
│   │   │
│   │   ├── testing/
│   │   │   ├── theme-check.ts      # Run shopify theme check
│   │   │   ├── screenshots.ts      # Puppeteer capture
│   │   │   ├── accessibility.ts    # axe-core scanning
│   │   │   └── preview.ts          # Deploy preview theme
│   │   │
│   │   ├── session/
│   │   │   ├── state.ts            # Session state management
│   │   │   └── resume.ts           # Resume interrupted sessions
│   │   │
│   │   └── utils/
│   │       ├── files.ts            # File operations
│   │       └── images.ts           # Image processing
│   │
│   └── templates/
│       └── base-prompts/           # Base prompt templates
│
├── output/                         # Generated themes go here
│   └── [theme-name]/
│
└── THEME_BUILDER_MASTER_PLAN.md    # This document
```

---

## 11. Immediate Next Steps

### This Week

1. **Set up builder project**
   - [ ] Create `builder/` directory
   - [ ] Initialize package.json with dependencies
   - [ ] Set up TypeScript
   - [ ] Create basic entry point

2. **Build core interaction loop**
   - [ ] Implement terminal UI (Inquirer + Chalk)
   - [ ] Create Claude client
   - [ ] Build Phase 1 (Brief) with approval loop
   - [ ] Test approve/comment/regenerate flow

3. **Test Replicate integration**
   - [ ] Verify Nano Banana Pro API access
   - [ ] Generate test product image
   - [ ] Test img2img for variations

### Next Week

1. **Complete Phase 1-2 implementation**
2. **Start image generation pipeline**
3. **Build session state management**

---

## 12. Environment Configuration

```bash
# .env (local only, never committed)

# Claude API
ANTHROPIC_API_KEY=sk-ant-...

# Replicate (Nano Banana Pro)
REPLICATE_API_TOKEN=r8_...

# Shopify
SHOPIFY_CLI_THEME_TOKEN=shptka_...
SHOPIFY_DEV_STORE=your-dev-store.myshopify.com
```

---

*Document Version: 3.0*
*Type: Internal Tool - Interactive Terminal Application*
*Created: January 2026*
*Last Updated: January 2026*
