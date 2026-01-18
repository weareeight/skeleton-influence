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
| **Iterative refinement** | "Accept or comment?" at each step - comments feed back into regeneration |
| **Substantial differentiation** | Generated themes must be meaningfully unique for theme store |
| **Local-only** | Runs on your machine, no hosting, no auth |
| **Time-realistic** | ~2-3 hours total (image generation is the bottleneck) |

---

## 3. The Approval Loop

Every major checkpoint uses the same cyclical pattern:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           APPROVAL LOOP PATTERN                              │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│                        ┌──────────────────┐                                 │
│                        │  AI GENERATES    │                                 │
│                        │  PROPOSAL/OUTPUT │                                 │
│                        └────────┬─────────┘                                 │
│                                 │                                            │
│                                 ▼                                            │
│                        ┌──────────────────┐                                 │
│                        │  DISPLAY TO      │                                 │
│                        │  HUMAN           │                                 │
│                        └────────┬─────────┘                                 │
│                                 │                                            │
│                                 ▼                                            │
│                   ┌─────────────────────────────┐                           │
│                   │  "Accept or provide         │                           │
│                   │   comments to refine?"      │                           │
│                   └─────────────┬───────────────┘                           │
│                                 │                                            │
│                    ┌────────────┴────────────┐                              │
│                    │                         │                              │
│                    ▼                         ▼                              │
│           ┌──────────────┐          ┌──────────────┐                       │
│           │   ACCEPT     │          │   COMMENTS   │                       │
│           └──────┬───────┘          └──────┬───────┘                       │
│                  │                         │                                │
│                  │                         ▼                                │
│                  │                ┌──────────────────┐                      │
│                  │                │  AI INCORPORATES │                      │
│                  │                │  FEEDBACK        │◄─────────┐          │
│                  │                └────────┬─────────┘          │          │
│                  │                         │                     │          │
│                  │                         ▼                     │          │
│                  │                ┌──────────────────┐          │          │
│                  │                │  REGENERATE      │          │          │
│                  │                └────────┬─────────┘          │          │
│                  │                         │                     │          │
│                  │                         └─────────────────────┘          │
│                  │                         (loops until accepted)           │
│                  │                                                          │
│                  ▼                                                          │
│         ┌──────────────────┐                                               │
│         │  PROCEED TO      │                                               │
│         │  NEXT PHASE      │                                               │
│         └──────────────────┘                                               │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

**Terminal UX:**
```
───────────────────────────────────────────────────────────────────────────────
? Accept this proposal, or provide comments to refine?
  › Accept - proceed to next step
    Comments - I'll regenerate based on your feedback
───────────────────────────────────────────────────────────────────────────────
```

If "Comments" selected:
```
───────────────────────────────────────────────────────────────────────────────
Enter your feedback (what should change?):
► [user types feedback here]

Incorporating feedback and regenerating...
───────────────────────────────────────────────────────────────────────────────
```

This loop continues **indefinitely** until you select "Accept".

---

## 4. The Generation Flow

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
│  PHASE 8: THEME STORE SUBMISSION ASSETS (~20 min)                           │
│  ═════════════════════════════════════════════════                          │
│  │                                                                          │
│  ├─► Generate: 3 Key Feature Images (1200x900) ─────────► YOU APPROVE      │
│  │   - Each showcasing a unique theme feature                               │
│  │   - Annotated screenshots with callouts                                  │
│  ├─► Generate: Theme Thumbnail (1200x900)                                   │
│  ├─► Generate: Desktop Preview (1920x1080)                                  │
│  ├─► Generate: Mobile Preview (750x1334)                                    │
│  ├─► Generate: Theme documentation (features, settings guide)               │
│  ├─► Generate: products-import.csv (no images, manual hosting)              │
│  ├─► Package: theme.zip (ready for submission)                              │
│  ├─► Save: All product images in organized folders                          │
│  └─► Generate: Submission checklist + summary report                        │
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
│  MANDATORY REWRITES (every build)                                           │
│  ═════════════════════════════════                                          │
│                                                                              │
│  □ HEADER - Complete rewrite                                                │
│    - New layout structure                                                   │
│    - Different navigation pattern (mega menu style, drawer, etc.)          │
│    - Unique mobile behavior                                                 │
│    - Industry-appropriate features                                          │
│                                                                              │
│  □ FOOTER - Complete rewrite                                                │
│    - New layout structure                                                   │
│    - Different column organization                                          │
│    - Unique features (back-to-top, newsletter placement, etc.)             │
│    - Industry-appropriate content blocks                                    │
│                                                                              │
│  □ JAVASCRIPT - Meaningful rewrites                                         │
│    - New animation patterns (not just parameter changes)                   │
│    - Different interaction behaviors                                        │
│    - Industry-specific functionality                                        │
│    - Unique micro-interactions                                              │
│                                                                              │
│  SECTION REQUIREMENTS                                                        │
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
│  DESIGN SYSTEM REQUIREMENTS                                                  │
│  ══════════════════════════                                                  │
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
│  │  Header                │ original    │ REWRITTEN        │ 100%       │  │
│  │  Footer                │ original    │ REWRITTEN        │ 100%       │  │
│  │  JavaScript            │ original    │ REWRITTEN        │ 60%+       │  │
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
├── theme/                              # Full Shopify theme
│   ├── assets/
│   ├── config/
│   │   ├── settings_schema.json        # May have new settings
│   │   └── settings_data.json          # Configured for this theme
│   ├── layout/
│   ├── locales/
│   ├── sections/
│   │   ├── [base sections...]
│   │   ├── pet-profile.liquid          # NEW
│   │   ├── size-guide-overlay.liquid   # NEW
│   │   ├── shop-by-size.liquid         # NEW
│   │   └── community-gallery.liquid    # NEW
│   ├── snippets/
│   └── templates/
│
├── theme.zip                           # Ready for upload/submission
│
├── submission/                         # THEME STORE SUBMISSION ASSETS
│   ├── key-feature-1.png               # 1200x900 - Feature showcase
│   ├── key-feature-2.png               # 1200x900 - Feature showcase
│   ├── key-feature-3.png               # 1200x900 - Feature showcase
│   ├── theme-thumbnail.png             # 1200x900 - Theme card image
│   ├── preview-desktop.png             # 1920x1080 - Desktop preview
│   ├── preview-mobile.png              # 750x1334 - Mobile preview
│   ├── documentation.md                # Theme features & settings guide
│   └── submission-checklist.md         # Pre-submission verification
│
├── images/                             # All product images
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
├── products-import.csv                 # Shopify CSV (no images)
│
├── screenshots/                        # Test screenshots
│   ├── desktop/
│   └── mobile/
│
├── session.json                        # Session state
│
└── generation-report.md                # Summary
```

### 8.3 Theme Store Submission Assets

Shopify requires specific assets for theme store submission:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                      THEME STORE SUBMISSION REQUIREMENTS                     │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  REQUIRED IMAGES                                                             │
│  ═══════════════                                                             │
│                                                                              │
│  1. KEY FEATURE IMAGES (3 required) - 1200x900px                            │
│     ┌─────────────────────────────────────────────────────────────────┐    │
│     │  Purpose: Showcase unique theme features                         │    │
│     │  Format: Annotated screenshots with callouts                     │    │
│     │  Example features to highlight:                                  │    │
│     │  - "Pet Profile Builder" - show the interactive UI               │    │
│     │  - "Size Guide Overlay" - show it in action on product page     │    │
│     │  - "Community Gallery" - show UGC integration                    │    │
│     └─────────────────────────────────────────────────────────────────┘    │
│                                                                              │
│  2. THEME THUMBNAIL - 1200x900px                                            │
│     - Shows in theme store listing                                          │
│     - Clean homepage screenshot with logo                                   │
│                                                                              │
│  3. DESKTOP PREVIEW - 1920x1080px                                           │
│     - Full homepage screenshot                                              │
│                                                                              │
│  4. MOBILE PREVIEW - 750x1334px                                             │
│     - Mobile homepage screenshot                                            │
│                                                                              │
│  REQUIRED DOCUMENTATION                                                      │
│  ══════════════════════                                                      │
│                                                                              │
│  1. THEME DOCUMENTATION (documentation.md)                                  │
│     - Theme overview and target merchant                                    │
│     - List of all sections with descriptions                                │
│     - Settings guide (how to customize)                                     │
│     - Unique features explanation                                           │
│     - Demo store content requirements                                       │
│                                                                              │
│  2. SUBMISSION CHECKLIST (submission-checklist.md)                          │
│     □ Theme passes shopify theme check with 0 errors                       │
│     □ All 3 key feature images created and approved                        │
│     □ Thumbnail and previews generated                                      │
│     □ Documentation complete                                                │
│     □ Demo store populated with products                                   │
│     □ All sections tested on demo store                                    │
│     □ Accessibility audit passed                                           │
│     □ Performance score meets requirements                                 │
│     □ 4+ new sections documented                                           │
│     □ 4+ modified sections documented                                      │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

**Key Feature Image Generation Process:**

```
For each of the 3 key features:
│
├─► Capture screenshot of feature in action (from preview URL)
├─► AI suggests annotation callouts and highlights
├─► Generate annotated version with:
│   - Feature name heading
│   - Arrow/circle callouts pointing to key UI elements
│   - Brief benefit statement
├─► Present to human for approval
└─► Loop until accepted
```

---

## 9. Development Plan

### Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         DEVELOPMENT ROADMAP                                  │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  PHASE A: FOUNDATION                                                         │
│  ═══════════════════                                                         │
│  A1. Project Setup & Directory Structure                                    │
│  A2. Terminal UI Framework                                                  │
│  A3. Claude API Integration                                                 │
│  A4. Approval Loop System                                                   │
│  A5. Session State Management                                               │
│                                                                              │
│  PHASE B: BRIEF & CATALOG                                                   │
│  ═════════════════════════                                                  │
│  B1. Brief Input Phase                                                      │
│  B2. Market Analysis                                                        │
│  B3. Product Catalog Generation                                             │
│  B4. CSV Export                                                             │
│                                                                              │
│  PHASE C: IMAGE GENERATION                                                  │
│  ═════════════════════════                                                  │
│  C1. Replicate API Integration                                              │
│  C2. Core Product Image Pipeline                                            │
│  C3. Angle Variation Generation                                             │
│  C4. Lifestyle Image Generation                                             │
│  C5. Image Organization & Display                                           │
│                                                                              │
│  PHASE D: THEME DIFFERENTIATION                                             │
│  ══════════════════════════════                                             │
│  D1. Header Rewrite System                                                  │
│  D2. Footer Rewrite System                                                  │
│  D3. JavaScript Rewrite System                                              │
│  D4. New Section Generation                                                 │
│  D5. Existing Section Modification                                          │
│  D6. Design System Generation                                               │
│                                                                              │
│  PHASE E: TESTING FRAMEWORK                                                 │
│  ══════════════════════════                                                 │
│  E1. Test Theme Generation                                                  │
│  E2. Shopify CLI Integration                                                │
│  E3. Screenshot Capture System                                              │
│  E4. AI Visual Review                                                       │
│  E5. Accessibility Testing                                                  │
│                                                                              │
│  PHASE F: OUTPUT & SUBMISSION                                               │
│  ════════════════════════════                                               │
│  F1. Theme Packaging                                                        │
│  F2. Submission Asset Generation                                            │
│  F3. Documentation Generation                                               │
│  F4. Final Verification                                                     │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

### Phase A: Foundation

#### A1. Project Setup & Directory Structure

```
skeleton-influence/
├── elle/                           # BASE THEME - DO NOT MODIFY
│   ├── assets/
│   ├── config/
│   ├── layout/
│   ├── locales/
│   ├── sections/
│   ├── snippets/
│   └── templates/
│
├── builder/                        # THEME BUILDER APPLICATION
│   ├── package.json
│   ├── tsconfig.json
│   ├── .env                        # API keys (gitignored)
│   │
│   ├── src/
│   │   ├── index.ts                # Entry point
│   │   ├── config.ts               # Configuration
│   │   │
│   │   ├── ui/                     # Terminal interface
│   │   ├── phases/                 # Generation phases
│   │   ├── ai/                     # AI integrations
│   │   ├── generators/             # Code generators
│   │   ├── testing/                # Testing framework
│   │   └── session/                # State management
│   │
│   └── prompts/                    # AI prompt templates
│
├── output/                         # GENERATED THEMES
│   └── [theme-name]/
│       ├── theme/                  # Production theme
│       ├── test-theme/             # Test theme (sections only)
│       ├── submission/             # Store submission assets
│       └── images/                 # Product images
│
└── docs/
    └── THEME_BUILDER_MASTER_PLAN.md
```

**Tasks:**
- [ ] A1.1: Create `builder/` directory structure
- [ ] A1.2: Initialize package.json with dependencies:
  ```json
  {
    "dependencies": {
      "@anthropic-ai/sdk": "latest",
      "replicate": "latest",
      "inquirer": "latest",
      "chalk": "latest",
      "ora": "latest",
      "cli-progress": "latest",
      "puppeteer": "latest",
      "archiver": "latest"
    }
  }
  ```
- [ ] A1.3: Set up TypeScript configuration
- [ ] A1.4: Create .env template and .gitignore
- [ ] A1.5: Create entry point with phase orchestration

#### A2. Terminal UI Framework

**Tasks:**
- [ ] A2.1: Create `ui/display.ts` - formatted output with Chalk
- [ ] A2.2: Create `ui/prompts.ts` - Inquirer prompt wrappers
- [ ] A2.3: Create `ui/progress.ts` - progress bars for long operations
- [ ] A2.4: Create `ui/image-viewer.ts` - open images in system viewer
- [ ] A2.5: Create phase header/footer display functions

#### A3. Claude API Integration

**Tasks:**
- [ ] A3.1: Create `ai/claude.ts` - API client wrapper
- [ ] A3.2: Implement conversation memory (message history)
- [ ] A3.3: Create prompt template loader
- [ ] A3.4: Add retry logic with exponential backoff
- [ ] A3.5: Create structured output parsing (JSON extraction)

#### A4. Approval Loop System

**Tasks:**
- [ ] A4.1: Create `ui/approval.ts` - reusable approval loop
- [ ] A4.2: Implement Accept → Proceed flow
- [ ] A4.3: Implement Comments → Regenerate → Re-prompt flow
- [ ] A4.4: Add iteration counter and history tracking
- [ ] A4.5: Create approval state persistence

#### A5. Session State Management

**Tasks:**
- [ ] A5.1: Create `session/state.ts` - session data structure
- [ ] A5.2: Implement auto-save on each approval
- [ ] A5.3: Create `session/resume.ts` - resume interrupted sessions
- [ ] A5.4: Add session listing and selection UI
- [ ] A5.5: Implement session archiving

---

### Phase B: Brief & Catalog

#### B1. Brief Input Phase

**Tasks:**
- [ ] B1.1: Create `phases/1-brief.ts`
- [ ] B1.2: Implement industry/niche input prompt
- [ ] B1.3: Implement target customer description
- [ ] B1.4: Implement competitor URL collection
- [ ] B1.5: Implement style direction input

#### B2. Market Analysis

**Tasks:**
- [ ] B2.1: Create `prompts/market-analysis.md` prompt template
- [ ] B2.2: Generate brand positioning proposal
- [ ] B2.3: Generate market differentiation analysis
- [ ] B2.4: Generate theme feature recommendations
- [ ] B2.5: Present analysis with approval loop

#### B3. Product Catalog Generation

**Tasks:**
- [ ] B3.1: Create `phases/2-products.ts`
- [ ] B3.2: Create `prompts/product-catalog.md` prompt template
- [ ] B3.3: Generate 20 products with names, descriptions, prices
- [ ] B3.4: Generate product categories and collections
- [ ] B3.5: Present catalog with approval loop

#### B4. CSV Export

**Tasks:**
- [ ] B4.1: Create `generators/csv.ts`
- [ ] B4.2: Generate Shopify-compatible CSV structure
- [ ] B4.3: Handle product variants (sizes, colors)
- [ ] B4.4: Generate SEO fields (title, description)
- [ ] B4.5: Output CSV without image columns

---

### Phase C: Image Generation

#### C1. Replicate API Integration

**Tasks:**
- [ ] C1.1: Create `ai/replicate.ts` - API client wrapper
- [ ] C1.2: Configure Nano Banana Pro model
- [ ] C1.3: Implement async prediction polling
- [ ] C1.4: Add image download and saving
- [ ] C1.5: Create retry logic for failed generations

#### C2. Core Product Image Pipeline

**Tasks:**
- [ ] C2.1: Create `phases/3-images.ts`
- [ ] C2.2: Create `prompts/image-prompts.md` for studio shots
- [ ] C2.3: Generate core studio shot per product
- [ ] C2.4: Display image and request approval
- [ ] C2.5: Implement regeneration with feedback

#### C3. Angle Variation Generation

**Tasks:**
- [ ] C3.1: Create angle variation prompts (front, detail, side, flat lay)
- [ ] C3.2: Generate 4 angle variations from approved core
- [ ] C3.3: Run variations in parallel
- [ ] C3.4: Save with consistent naming convention
- [ ] C3.5: Display grid for review

#### C4. Lifestyle Image Generation

**Tasks:**
- [ ] C4.1: Create lifestyle prompts (in-use, environment, detail)
- [ ] C4.2: Generate 3 lifestyle images from approved core
- [ ] C4.3: Run in parallel with angle variations
- [ ] C4.4: Present complete set for final approval
- [ ] C4.5: Allow individual image regeneration

#### C5. Image Organization & Display

**Tasks:**
- [ ] C5.1: Create `output/[theme]/images/[product]/` structure
- [ ] C5.2: Implement consistent naming: `studio-main.png`, `angle-*.png`, `lifestyle-*.png`
- [ ] C5.3: Create image manifest JSON
- [ ] C5.4: Implement batch display (grid view)
- [ ] C5.5: Track generation progress across all products

---

### Phase D: Theme Differentiation

#### D1. Header Rewrite System

**Tasks:**
- [ ] D1.1: Create `prompts/header-rewrite.md` template
- [ ] D1.2: Analyze industry requirements for header
- [ ] D1.3: Generate new header layout proposals
- [ ] D1.4: Generate complete header.liquid
- [ ] D1.5: Generate header-specific CSS
- [ ] D1.6: Generate header JavaScript functionality
- [ ] D1.7: Present with approval loop

#### D2. Footer Rewrite System

**Tasks:**
- [ ] D2.1: Create `prompts/footer-rewrite.md` template
- [ ] D2.2: Analyze industry requirements for footer
- [ ] D2.3: Generate new footer layout proposals
- [ ] D2.4: Generate complete footer.liquid
- [ ] D2.5: Generate footer-specific CSS
- [ ] D2.6: Present with approval loop

#### D3. JavaScript Rewrite System

**Tasks:**
- [ ] D3.1: Create `prompts/javascript-rewrite.md` template
- [ ] D3.2: Analyze base theme JS patterns
- [ ] D3.3: Generate new animation patterns
- [ ] D3.4: Generate industry-specific interactions
- [ ] D3.5: Generate new micro-interactions
- [ ] D3.6: Validate JS syntax and functionality
- [ ] D3.7: Present with approval loop

#### D4. New Section Generation

**Tasks:**
- [ ] D4.1: Create `phases/4-differentiation.ts`
- [ ] D4.2: Create `prompts/new-sections.md` template
- [ ] D4.3: Generate 4 new section proposals
- [ ] D4.4: Present proposals with approval loop
- [ ] D4.5: Generate Liquid code for each approved section
- [ ] D4.6: Generate section schema
- [ ] D4.7: Validate with Theme Check

#### D5. Existing Section Modification

**Tasks:**
- [ ] D5.1: Create `prompts/modify-sections.md` template
- [ ] D5.2: Identify 4 sections for modification
- [ ] D5.3: Generate modification proposals
- [ ] D5.4: Present proposals with approval loop
- [ ] D5.5: Generate modified Liquid code
- [ ] D5.6: Generate updated schema
- [ ] D5.7: Validate changes

#### D6. Design System Generation

**Tasks:**
- [ ] D6.1: Create `phases/5-design-system.ts`
- [ ] D6.2: Create `prompts/design-system.md` template
- [ ] D6.3: Generate 5 color schemes
- [ ] D6.4: Generate typography pairings
- [ ] D6.5: Generate spacing and corner radius values
- [ ] D6.6: Present with approval loop
- [ ] D6.7: Generate settings_data.json

---

### Phase E: Testing Framework

#### E1. Test Theme Generation

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           TEST THEME CONCEPT                                 │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  The TEST THEME is a FULL COPY of the production theme, but with the        │
│  HOMEPAGE TEMPLATE configured to display ONLY the new/modified sections.    │
│                                                                              │
│  WHY FULL THEME:                                                             │
│  ════════════════                                                            │
│  - Shopify requires complete theme structure to upload                      │
│  - CSS/JS depends on all sections being present                             │
│  - Snippets may be shared across sections                                   │
│  - Settings schema must be complete                                         │
│                                                                              │
│  WHAT'S DIFFERENT (homepage only):                                          │
│  ══════════════════════════════════                                          │
│  - index.json configured with ONLY:                                         │
│    ✓ Rewritten header                                                        │
│    ✓ 4 new sections                                                          │
│    ✓ 4 modified sections                                                     │
│    ✓ Rewritten footer                                                        │
│                                                                              │
│  PURPOSE:                                                                    │
│  ════════                                                                    │
│  - Test new/modified code in isolation on homepage                          │
│  - All other pages work normally (product, collection, etc.)               │
│  - Clear visibility of what's changed                                       │
│  - Easier to spot issues with new code                                      │
│  - Full theme validates and uploads correctly                               │
│                                                                              │
│  OUTPUT: ./output/[theme]/test-theme/                                       │
│  (Complete theme, only index.json is different from production)             │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

**Tasks:**
- [ ] E1.1: Create `testing/test-theme.ts`
- [ ] E1.2: Copy FULL theme structure from production
- [ ] E1.3: Create test-specific index.json with only new/modified sections
- [ ] E1.4: Include header and footer in homepage template
- [ ] E1.5: Keep all other templates unchanged (product, collection, etc.)
- [ ] E1.6: Ensure all CSS/JS included for all sections
- [ ] E1.7: Generate test product data for other pages

#### E2. Shopify CLI Integration

**Tasks:**
- [ ] E2.1: Create `testing/shopify-cli.ts`
- [ ] E2.2: Implement `shopify theme push --unpublished`
- [ ] E2.3: Parse preview URL from output
- [ ] E2.4: Store theme ID for cleanup
- [ ] E2.5: Implement `shopify theme delete` for cleanup

#### E3. Screenshot Capture System

**Tasks:**
- [ ] E3.1: Create `testing/screenshots.ts`
- [ ] E3.2: Set up Puppeteer with preview URL
- [ ] E3.3: Capture pages: homepage, product, collection, cart, search
- [ ] E3.4: Capture at desktop (1440px) and mobile (375px)
- [ ] E3.5: Save to `output/[theme]/screenshots/`
- [ ] E3.6: Generate screenshot manifest

#### E4. AI Visual Review

**Tasks:**
- [ ] E4.1: Create `testing/visual-review.ts`
- [ ] E4.2: Create `prompts/screenshot-review.md` template
- [ ] E4.3: Send screenshots to Claude for analysis
- [ ] E4.4: Parse issues (critical, warning, info)
- [ ] E4.5: Present issues with fix suggestions
- [ ] E4.6: Implement approval/fix loop

#### E5. Accessibility Testing

**Tasks:**
- [ ] E5.1: Create `testing/accessibility.ts`
- [ ] E5.2: Integrate axe-core via Puppeteer
- [ ] E5.3: Run accessibility audit on all pages
- [ ] E5.4: Generate accessibility report
- [ ] E5.5: Block on critical issues
- [ ] E5.6: Warn on serious issues

---

### Phase F: Output & Submission

#### F1. Theme Packaging

**Tasks:**
- [ ] F1.1: Create `generators/theme-package.ts`
- [ ] F1.2: Assemble complete theme from base + modifications
- [ ] F1.3: Run final Theme Check validation
- [ ] F1.4: Create theme.zip with archiver
- [ ] F1.5: Verify zip contents

#### F2. Submission Asset Generation

**Tasks:**
- [ ] F2.1: Create `phases/8-submission.ts`
- [ ] F2.2: Capture key feature screenshots
- [ ] F2.3: Generate annotated feature images
- [ ] F2.4: Present each for approval
- [ ] F2.5: Generate theme thumbnail
- [ ] F2.6: Generate desktop/mobile previews
- [ ] F2.7: Save to `output/[theme]/submission/`

#### F3. Documentation Generation

**Tasks:**
- [ ] F3.1: Create `generators/documentation.ts`
- [ ] F3.2: Generate theme documentation.md
- [ ] F3.3: List all sections with descriptions
- [ ] F3.4: Document unique features
- [ ] F3.5: Generate settings guide
- [ ] F3.6: Generate submission-checklist.md

#### F4. Final Verification

**Tasks:**
- [ ] F4.1: Run complete Theme Check
- [ ] F4.2: Verify all submission assets present
- [ ] F4.3: Calculate differentiation metrics
- [ ] F4.4: Generate final generation-report.md
- [ ] F4.5: Present summary for final approval

---

## 10. Complete File Structure

```
skeleton-influence/
│
├── elle/                               # BASE THEME - DO NOT MODIFY
│   ├── assets/
│   │   ├── critical.css
│   │   ├── theme.css
│   │   ├── blog.css
│   │   ├── search-overlay.css
│   │   ├── animations.js
│   │   └── blog.js
│   ├── config/
│   │   ├── settings_schema.json
│   │   └── settings_data.json
│   ├── layout/
│   │   ├── theme.liquid
│   │   └── password.liquid
│   ├── locales/
│   │   └── en.default.json
│   ├── sections/                       # 53 sections
│   ├── snippets/                       # 26 snippets
│   └── templates/                      # 13 templates
│
├── builder/                            # THEME BUILDER APPLICATION
│   ├── package.json
│   ├── tsconfig.json
│   ├── .env                            # API keys (gitignored)
│   ├── .env.example                    # Template for .env
│   │
│   ├── src/
│   │   ├── index.ts                    # Entry point & orchestrator
│   │   ├── config.ts                   # Configuration loader
│   │   │
│   │   ├── ui/                         # Terminal Interface
│   │   │   ├── display.ts              # Chalk formatting, boxes
│   │   │   ├── prompts.ts              # Inquirer wrappers
│   │   │   ├── progress.ts             # Progress bars
│   │   │   ├── approval.ts             # Accept/Comment loop
│   │   │   └── image-viewer.ts         # Open images in system
│   │   │
│   │   ├── phases/                     # Generation Phases
│   │   │   ├── 1-brief.ts              # Brief & market analysis
│   │   │   ├── 2-products.ts           # Product catalog
│   │   │   ├── 3-images.ts             # Image generation
│   │   │   ├── 4-differentiation.ts    # Sections & features
│   │   │   ├── 5-design-system.ts      # Colors, typography
│   │   │   ├── 6-code-generation.ts    # Header, footer, JS
│   │   │   ├── 7-testing.ts            # Preview & testing
│   │   │   └── 8-submission.ts         # Output & assets
│   │   │
│   │   ├── ai/                         # AI Integrations
│   │   │   ├── openrouter.ts           # OpenRouter client (Opus + GPT 5.2)
│   │   │   ├── models.ts               # Model routing configuration
│   │   │   └── replicate.ts            # Replicate (Nano Banana Pro)
│   │   │
│   │   ├── generators/                 # Code Generators
│   │   │   ├── header.ts               # Header rewrite
│   │   │   ├── footer.ts               # Footer rewrite
│   │   │   ├── javascript.ts           # JS rewrite
│   │   │   ├── sections.ts             # New section generation
│   │   │   ├── modifications.ts        # Section modifications
│   │   │   ├── settings.ts             # settings_data.json
│   │   │   ├── css.ts                  # CSS generation
│   │   │   ├── csv.ts                  # Products CSV
│   │   │   ├── documentation.ts        # Theme documentation
│   │   │   └── theme-package.ts        # ZIP packaging
│   │   │
│   │   ├── testing/                    # Testing Framework
│   │   │   ├── test-theme.ts           # Generate test theme
│   │   │   ├── shopify-cli.ts          # CLI integration
│   │   │   ├── screenshots.ts          # Puppeteer capture
│   │   │   ├── visual-review.ts        # AI screenshot review
│   │   │   ├── accessibility.ts        # axe-core scanning
│   │   │   └── theme-check.ts          # Liquid validation
│   │   │
│   │   ├── session/                    # Session Management
│   │   │   ├── state.ts                # State data structure
│   │   │   └── resume.ts               # Resume sessions
│   │   │
│   │   └── utils/                      # Utilities
│   │       ├── files.ts                # File operations
│   │       ├── images.ts               # Image processing
│   │       └── diff.ts                 # Code diff utilities
│   │
│   └── prompts/                        # AI Prompt Templates
│       ├── market-analysis.md
│       ├── product-catalog.md
│       ├── image-prompts.md
│       ├── header-rewrite.md
│       ├── footer-rewrite.md
│       ├── javascript-rewrite.md
│       ├── new-sections.md
│       ├── modify-sections.md
│       ├── design-system.md
│       └── screenshot-review.md
│
├── output/                             # GENERATED THEMES
│   └── [theme-name]/
│       │
│       ├── theme/                      # Production Theme
│       │   ├── assets/
│       │   │   ├── critical.css
│       │   │   ├── theme.css
│       │   │   ├── [theme-name].css    # Theme-specific CSS
│       │   │   ├── animations.js       # REWRITTEN
│       │   │   └── [theme-name].js     # Theme-specific JS
│       │   ├── config/
│       │   ├── layout/
│       │   ├── locales/
│       │   ├── sections/
│       │   │   ├── header.liquid       # REWRITTEN
│       │   │   ├── footer.liquid       # REWRITTEN
│       │   │   ├── [new-section-1].liquid
│       │   │   ├── [new-section-2].liquid
│       │   │   ├── [new-section-3].liquid
│       │   │   ├── [new-section-4].liquid
│       │   │   └── [modified sections...]
│       │   ├── snippets/
│       │   └── templates/
│       │
│       ├── test-theme/                 # Test Theme (FULL COPY)
│       │   ├── assets/                 # ALL assets (same as production)
│       │   ├── config/                 # ALL config (same as production)
│       │   ├── layout/                 # ALL layouts (same as production)
│       │   ├── locales/                # ALL locales (same as production)
│       │   ├── sections/               # ALL sections (same as production)
│       │   ├── snippets/               # ALL snippets (same as production)
│       │   └── templates/
│       │       ├── index.json          # MODIFIED: Only new/modified sections
│       │       └── [other templates]   # Same as production
│       │
│       ├── theme.zip                   # Ready for submission
│       │
│       ├── submission/                 # Theme Store Assets
│       │   ├── key-feature-1.png
│       │   ├── key-feature-2.png
│       │   ├── key-feature-3.png
│       │   ├── theme-thumbnail.png
│       │   ├── preview-desktop.png
│       │   ├── preview-mobile.png
│       │   ├── documentation.md
│       │   └── submission-checklist.md
│       │
│       ├── images/                     # Product Images
│       │   ├── [product-1]/
│       │   │   ├── studio-main.png
│       │   │   ├── angle-front.png
│       │   │   ├── angle-detail.png
│       │   │   ├── angle-side.png
│       │   │   ├── angle-flatlay.png
│       │   │   ├── lifestyle-1.png
│       │   │   ├── lifestyle-2.png
│       │   │   └── lifestyle-3.png
│       │   └── [product-2]/
│       │       └── ...
│       │
│       ├── screenshots/                # Test Screenshots
│       │   ├── desktop/
│       │   │   ├── homepage.png
│       │   │   ├── product.png
│       │   │   ├── collection.png
│       │   │   └── cart.png
│       │   └── mobile/
│       │       └── ...
│       │
│       ├── products-import.csv         # Shopify CSV (no images)
│       ├── session.json                # Session state
│       ├── generation-report.md        # Summary report
│       └── differentiation-report.md   # Diff metrics
│
└── docs/
    └── THEME_BUILDER_MASTER_PLAN.md
```

---

## 11. Testing Framework Detail

### Test Theme Concept

The **test theme** is a FULL COPY of the production theme, with the homepage configured to show only new/modified sections:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           TEST THEME STRUCTURE                               │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  FULL THEME (required for Shopify upload):                                  │
│  ══════════════════════════════════════════                                 │
│                                                                              │
│  ✓ All 53+ sections (including new and modified)                            │
│  ✓ All snippets                                                              │
│  ✓ All CSS/JS (new code depends on existing utilities)                      │
│  ✓ Complete settings_schema.json                                            │
│  ✓ All templates (product, collection, cart, etc.)                          │
│                                                                              │
│  ONLY DIFFERENCE - Homepage template (index.json):                          │
│  ══════════════════════════════════════════════════                         │
│                                                                              │
│  Shows ONLY new/modified sections for focused testing:                      │
│                                                                              │
│  {                                                                           │
│    "sections": {                                                            │
│      "header": { "type": "header" },         // REWRITTEN                  │
│      "new-1": { "type": "[new-section-1]" },                               │
│      "new-2": { "type": "[new-section-2]" },                               │
│      "new-3": { "type": "[new-section-3]" },                               │
│      "new-4": { "type": "[new-section-4]" },                               │
│      "mod-1": { "type": "[modified-section-1]" },                          │
│      "mod-2": { "type": "[modified-section-2]" },                          │
│      "mod-3": { "type": "[modified-section-3]" },                          │
│      "mod-4": { "type": "[modified-section-4]" },                          │
│      "footer": { "type": "footer" }          // REWRITTEN                  │
│    },                                                                        │
│    "order": [                                                               │
│      "header",                                                              │
│      "new-1", "new-2", "new-3", "new-4",                                   │
│      "mod-1", "mod-2", "mod-3", "mod-4",                                   │
│      "footer"                                                               │
│    ]                                                                         │
│  }                                                                           │
│                                                                              │
│  TESTING WORKFLOW:                                                           │
│  ══════════════════                                                          │
│                                                                              │
│  1. Generate test-theme/ (full copy, modified index.json)                  │
│  2. Run: shopify theme check --path ./test-theme                           │
│  3. Run: shopify theme push --unpublished --path ./test-theme              │
│  4. Capture screenshots of homepage (new sections)                         │
│  5. Also capture product/collection pages (verify no breaks)               │
│  6. AI reviews all screenshots                                              │
│  7. Human reviews preview URL                                               │
│  8. If issues → fix → regenerate → repeat                                  │
│  9. If approved → production theme is ready (same code)                    │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Testing Pipeline

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           TESTING PIPELINE                                   │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  STAGE 1: STATIC VALIDATION                                                 │
│  ══════════════════════════                                                 │
│  │                                                                          │
│  ├─► shopify theme check --path ./test-theme                               │
│  ├─► Must pass with 0 errors                                               │
│  └─► Warnings logged but allowed                                           │
│                                                                              │
│  STAGE 2: DEPLOY TEST THEME                                                 │
│  ══════════════════════════                                                 │
│  │                                                                          │
│  ├─► shopify theme push --unpublished --path ./test-theme                  │
│  ├─► Capture theme ID and preview URL                                      │
│  └─► Store for cleanup                                                      │
│                                                                              │
│  STAGE 3: SCREENSHOT CAPTURE (Puppeteer)                                    │
│  ═══════════════════════════════════════                                    │
│  │                                                                          │
│  ├─► Navigate to preview URL                                               │
│  ├─► Capture desktop (1440px) and mobile (375px)                          │
│  ├─► Full page screenshots                                                 │
│  └─► Save to screenshots/                                                  │
│                                                                              │
│  STAGE 4: AI VISUAL REVIEW                                                  │
│  ═════════════════════════                                                  │
│  │                                                                          │
│  ├─► Send screenshots to Claude                                            │
│  ├─► Check for:                                                            │
│  │   - Layout issues                                                       │
│  │   - Broken elements                                                     │
│  │   - Text overflow/truncation                                            │
│  │   - Image loading issues                                                │
│  │   - Mobile responsiveness                                               │
│  │   - Design consistency                                                  │
│  └─► Return issues list with severity                                      │
│                                                                              │
│  STAGE 5: ACCESSIBILITY AUDIT                                               │
│  ════════════════════════════                                               │
│  │                                                                          │
│  ├─► Run axe-core via Puppeteer                                            │
│  ├─► Check contrast, ARIA, keyboard nav                                    │
│  └─► Critical issues block progress                                        │
│                                                                              │
│  STAGE 6: HUMAN REVIEW                                                      │
│  ══════════════════════                                                     │
│  │                                                                          │
│  ├─► Display preview URL                                                   │
│  ├─► Display screenshot grid                                               │
│  ├─► Display AI-identified issues                                          │
│  ├─► Display accessibility report                                          │
│  └─► Accept or provide fix comments                                        │
│                                                                              │
│  STAGE 7: CLEANUP                                                           │
│  ════════════════                                                           │
│  │                                                                          │
│  └─► shopify theme delete [theme-id]                                       │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 12. AI Model Routing (OpenRouter)

### Model Selection Strategy

We use **different AI models for different tasks** based on their strengths:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         AI MODEL ROUTING                                     │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  All AI calls routed through OPENROUTER for unified API access              │
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                                                                       │   │
│  │  PLANNING & ANALYSIS TASKS → Claude Opus 4.5                         │   │
│  │  ══════════════════════════════════════════                          │   │
│  │                                                                       │   │
│  │  Best for:                                                            │   │
│  │  - Market analysis and positioning                                   │   │
│  │  - Brand strategy and naming                                         │   │
│  │  - Section concept proposals                                         │   │
│  │  - Design system decisions                                           │   │
│  │  - Screenshot visual review                                          │   │
│  │  - Architecture and planning                                         │   │
│  │                                                                       │   │
│  │  Model: anthropic/claude-opus-4.5                                    │   │
│  │  Strengths: Reasoning, creativity, nuanced analysis                  │   │
│  │                                                                       │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                                                                       │   │
│  │  CODE GENERATION TASKS → GPT 5.2 Codex (Extra High Thinking)        │   │
│  │  ═══════════════════════════════════════════════════════════        │   │
│  │                                                                       │   │
│  │  Best for:                                                            │   │
│  │  - Liquid template generation                                        │   │
│  │  - JavaScript code generation                                        │   │
│  │  - CSS generation                                                    │   │
│  │  - Section schema generation                                         │   │
│  │  - Header/footer rewrites                                            │   │
│  │  - Code modifications                                                │   │
│  │                                                                       │   │
│  │  Model: openai/gpt-5.2-codex-extra-high-thinking                    │   │
│  │  Strengths: Code quality, syntax accuracy, structured output        │   │
│  │                                                                       │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                                                                       │   │
│  │  IMAGE GENERATION → Nano Banana Pro (via Replicate)                 │   │
│  │  ══════════════════════════════════════════════════                  │   │
│  │                                                                       │   │
│  │  - Product studio shots                                              │   │
│  │  - Angle variations                                                  │   │
│  │  - Lifestyle images                                                  │   │
│  │                                                                       │   │
│  │  API: Replicate (not OpenRouter)                                    │   │
│  │                                                                       │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Task-to-Model Mapping

| Task Category | Specific Tasks | Model |
|--------------|----------------|-------|
| **Planning** | Market analysis, brand positioning | Claude Opus 4.5 |
| **Planning** | Section concepts, feature proposals | Claude Opus 4.5 |
| **Planning** | Design system (colors, typography) | Claude Opus 4.5 |
| **Review** | Screenshot analysis, issue detection | Claude Opus 4.5 |
| **Review** | Code review, suggestions | Claude Opus 4.5 |
| **Content** | Product names, descriptions | Claude Opus 4.5 |
| **Code** | Liquid section generation | GPT 5.2 Codex |
| **Code** | Header/footer rewrite | GPT 5.2 Codex |
| **Code** | JavaScript generation | GPT 5.2 Codex |
| **Code** | CSS generation | GPT 5.2 Codex |
| **Code** | Schema generation | GPT 5.2 Codex |
| **Code** | Section modifications | GPT 5.2 Codex |
| **Images** | Product images | Nano Banana Pro |

### OpenRouter Integration

```typescript
// ai/openrouter.ts

interface ModelConfig {
  planning: string;
  coding: string;
}

const MODELS: ModelConfig = {
  planning: 'anthropic/claude-opus-4.5',
  coding: 'openai/gpt-5.2-codex-extra-high-thinking'
};

export async function chat(
  messages: Message[],
  taskType: 'planning' | 'coding'
): Promise<string> {
  const model = MODELS[taskType];

  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': 'https://theme-builder.local',
      'X-Title': 'Theme Builder'
    },
    body: JSON.stringify({
      model,
      messages,
      temperature: taskType === 'coding' ? 0.2 : 0.7,
      max_tokens: taskType === 'coding' ? 8192 : 4096
    })
  });

  const data = await response.json();
  return data.choices[0].message.content;
}
```

### File Structure Update

```
builder/
├── src/
│   ├── ai/
│   │   ├── openrouter.ts       # OpenRouter client (unified API)
│   │   ├── models.ts           # Model configuration & routing
│   │   └── replicate.ts        # Replicate client (images only)
```

---

## 13. Environment Configuration

```bash
# .env (local only, never committed)

# OpenRouter API (routes to Claude Opus 4.5 and GPT 5.2 Codex)
OPENROUTER_API_KEY=sk-or-...

# Replicate (Nano Banana Pro - images only)
REPLICATE_API_TOKEN=r8_...

# Shopify CLI
SHOPIFY_CLI_THEME_TOKEN=shptka_...
SHOPIFY_DEV_STORE=your-dev-store.myshopify.com

# Optional: Image storage (if auto-hosting later)
# CLOUDFLARE_R2_ACCESS_KEY=...
# CLOUDFLARE_R2_SECRET_KEY=...
```

### .env.example

```bash
# Copy this to .env and fill in your values

# Required: OpenRouter API for AI (routes to Opus and GPT 5.2 Codex)
OPENROUTER_API_KEY=

# Required: Replicate for Nano Banana Pro image generation
REPLICATE_API_TOKEN=

# Required: Shopify CLI for theme preview deployment
SHOPIFY_CLI_THEME_TOKEN=
SHOPIFY_DEV_STORE=
```

---

## 14. Getting Started

### Prerequisites

- Node.js 20+
- Shopify CLI installed and authenticated
- Replicate account with Nano Banana Pro access
- Anthropic API key

### Quick Start

```bash
# 1. Navigate to builder directory
cd builder/

# 2. Install dependencies
npm install

# 3. Copy environment template
cp .env.example .env

# 4. Fill in API keys in .env

# 5. Run the builder
npm start

# 6. Follow interactive prompts...
```

---

## 15. Summary

This document specifies an **interactive terminal application** for generating substantially differentiated Shopify themes.

**Key Features:**
- Human-in-the-loop approval at every major step
- Accept/Comment cyclical loop until satisfied
- AI model routing via OpenRouter:
  - Claude Opus 4.5 for planning, analysis, and review
  - GPT 5.2 Codex (extra high thinking) for code generation
- AI-generated product images via Nano Banana Pro (Replicate)
- Complete header/footer/JS rewrites for differentiation
- 4 new sections + 4 modified sections minimum
- Test theme (full copy) with focused homepage for validation
- Automated testing via Shopify preview + screenshots
- Complete theme store submission assets

**Outputs:**
- Production-ready theme.zip
- Test theme (full copy, homepage shows only new sections)
- 160 product images (8 per product × 20 products)
- Products CSV (no image URLs)
- 3 key feature images
- Theme documentation
- Submission checklist

**Timeline:** ~2-3 hours per theme generation (image generation is bottleneck)

---

*Document Version: 5.0*
*Type: Internal Tool - Interactive Terminal Application*
*Base Theme: Elle (skeleton-influence/elle/)*
*AI: OpenRouter (Claude Opus 4.5 + GPT 5.2 Codex) + Replicate (Nano Banana Pro)*
*Created: January 2026*
*Last Updated: January 2026*
