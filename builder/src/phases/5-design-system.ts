import { display } from '../ui/display.js';
import { promptSelect } from '../ui/prompts.js';
import { approvalLoop } from '../ui/approval.js';
import { chat, OpenRouterClient } from '../ai/openrouter.js';
import { getModelInfo } from '../ai/models.js';
import type { SessionState, DesignSystem, ColorScheme, Message } from '../types.js';
import { readFile, writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { PATHS } from '../config.js';

interface TypographyProposal {
  headingFont: string;
  headingFallback: string;
  headingWeight: number;
  bodyFont: string;
  bodyFallback: string;
  bodyWeight: number;
  baseSize: string;
  scale: number;
  lineHeight: {
    heading: number;
    body: number;
  };
}

interface SpacingProposal {
  baseUnit: number;
  scale: number[];
  sectionPadding: {
    mobile: string;
    desktop: string;
  };
  containerWidth: string;
  gridGap: string;
}

interface ButtonProposal {
  borderRadius: string;
  paddingX: string;
  paddingY: string;
  fontWeight: number;
  textTransform: 'none' | 'uppercase' | 'capitalize';
  style: 'filled' | 'outline' | 'ghost';
}

interface FullDesignSystem {
  colorSchemes: ColorScheme[];
  selectedScheme: number;
  typography: TypographyProposal;
  spacing: SpacingProposal;
  buttons: ButtonProposal;
  corners: {
    none: string;
    small: string;
    medium: string;
    large: string;
    full: string;
  };
}

/**
 * Phase 5: Design System
 *
 * Generates a cohesive design system:
 * - 5 color scheme options
 * - Typography pairings (heading + body)
 * - Spacing scale
 * - Corner radius values
 * - Button styles
 * - Generates settings_data.json
 */
export async function runDesignSystemPhase(session: SessionState): Promise<void> {
  if (!session.brief) {
    throw new Error('Brief must be completed before design system');
  }

  const outputDir = join(PATHS.output, session.themeName || session.id, 'theme');
  await mkdir(join(outputDir, 'config'), { recursive: true });

  display.sectionHeader('Design System Generation');
  display.info('Creating a cohesive visual system for your theme...');
  display.info(`Using ${getModelInfo('planning')} for design decisions`);
  display.newline();

  // Step 1: Generate color schemes
  display.sectionHeader('Step 1: Color Schemes');

  const { result: colorSchemes } = await approvalLoop<ColorScheme[]>(
    'design-system',
    'color-schemes',
    {
      generate: async (feedback) => generateColorSchemes(session, feedback),
      display: displayColorSchemes,
    }
  );

  // Let user select preferred scheme
  const schemeChoices = colorSchemes.map((scheme, i) => ({
    name: `${scheme.name} - Primary: ${scheme.primary}`,
    value: String(i),
  }));

  const selectedSchemeStr = await promptSelect<string>(
    'Which color scheme should be the default?',
    schemeChoices
  );
  const selectedScheme = parseInt(selectedSchemeStr, 10);

  display.success(`Selected: ${colorSchemes[selectedScheme].name}`);

  // Step 2: Generate typography
  display.sectionHeader('Step 2: Typography');

  const { result: typography } = await approvalLoop<TypographyProposal>(
    'design-system',
    'typography',
    {
      generate: async (feedback) => generateTypography(session, feedback),
      display: displayTypography,
    }
  );

  // Step 3: Generate spacing and layout
  display.sectionHeader('Step 3: Spacing & Layout');

  const { result: spacing } = await approvalLoop<SpacingProposal>(
    'design-system',
    'spacing',
    {
      generate: async (feedback) => generateSpacing(session, feedback),
      display: displaySpacing,
    }
  );

  // Step 4: Generate button styles
  display.sectionHeader('Step 4: Button Styles');

  const { result: buttons } = await approvalLoop<ButtonProposal>(
    'design-system',
    'buttons',
    {
      generate: async (feedback) => generateButtons(session, feedback),
      display: displayButtons,
    }
  );

  // Compile full design system
  const designSystem: FullDesignSystem = {
    colorSchemes,
    selectedScheme,
    typography,
    spacing,
    buttons,
    corners: {
      none: '0',
      small: '4px',
      medium: '8px',
      large: '16px',
      full: '9999px',
    },
  };

  // Store in session
  session.designSystem = {
    colorSchemes,
    selectedScheme,
    typography: {
      headingFont: typography.headingFont,
      bodyFont: typography.bodyFont,
      headingWeight: typography.headingWeight,
      bodyWeight: typography.bodyWeight,
      baseSize: typography.baseSize,
      scale: typography.scale,
    },
    spacing: {
      base: `${spacing.baseUnit}px`,
      scale: spacing.scale[0],
    },
    corners: {
      radius: spacing.baseUnit + 'px',
      style: 'rounded',
    },
    buttons: {
      style: buttons.style,
      corners: buttons.borderRadius,
      padding: `${buttons.paddingY} ${buttons.paddingX}`,
    },
  };

  // Step 5: Generate settings_data.json
  display.sectionHeader('Step 5: Generate Theme Settings');

  const settingsData = await generateSettingsData(session, designSystem);

  // Save settings_data.json
  const settingsPath = join(outputDir, 'config', 'settings_data.json');
  await writeFile(settingsPath, JSON.stringify(settingsData, null, 2), 'utf-8');

  // Also generate CSS variables file
  const cssVariables = generateCSSVariables(designSystem);
  await writeFile(join(outputDir, 'assets', 'design-system.css'), cssVariables, 'utf-8');

  display.success('Design system generated and saved');
  display.keyValue('Settings', settingsPath);
  display.keyValue('CSS Variables', join(outputDir, 'assets', 'design-system.css'));
}

// ============ AI Generation Functions ============

async function generateColorSchemes(session: SessionState, feedback?: string): Promise<ColorScheme[]> {
  const brief = session.brief!;

  const messages: Message[] = [
    OpenRouterClient.systemMessage(`You are a senior brand designer creating color schemes for a ${brief.industry} e-commerce store.

Style direction: ${brief.styleDirection}
Target market: ${brief.targetMarket}
Brand positioning: ${brief.positioning || 'Premium quality'}

Generate 5 distinct color schemes that:
1. Fit the industry and target market
2. Are accessible (WCAG AA contrast ratios)
3. Work for e-commerce (trust, conversion)
4. Each has a unique personality
5. Include primary, secondary, accent, background, text, and muted colors

Respond with valid JSON array:
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
]`),
    OpenRouterClient.userMessage(feedback ? `Revise based on: ${feedback}` : 'Generate 5 color schemes now.'),
  ];

  const response = await chat(messages, 'planning');
  return parseJSON<ColorScheme[]>(response);
}

async function generateTypography(session: SessionState, feedback?: string): Promise<TypographyProposal> {
  const brief = session.brief!;

  const messages: Message[] = [
    OpenRouterClient.systemMessage(`You are a senior typography designer creating a type system for a ${brief.industry} e-commerce store.

Style direction: ${brief.styleDirection}
Target market: ${brief.targetMarket}

Generate a typography system that:
1. Uses Google Fonts (freely available)
2. Has strong heading/body contrast
3. Is highly readable for e-commerce
4. Fits the brand personality
5. Works across all devices

Respond with valid JSON:
{
  "headingFont": "Font Name",
  "headingFallback": "system fallback stack",
  "headingWeight": 600-800,
  "bodyFont": "Font Name",
  "bodyFallback": "system fallback stack",
  "bodyWeight": 400-500,
  "baseSize": "16px or 18px",
  "scale": 1.2-1.333,
  "lineHeight": {
    "heading": 1.1-1.3,
    "body": 1.5-1.7
  }
}`),
    OpenRouterClient.userMessage(feedback ? `Revise based on: ${feedback}` : 'Generate typography system now.'),
  ];

  const response = await chat(messages, 'planning');
  return parseJSON<TypographyProposal>(response);
}

async function generateSpacing(session: SessionState, feedback?: string): Promise<SpacingProposal> {
  const brief = session.brief!;

  const messages: Message[] = [
    OpenRouterClient.systemMessage(`You are a senior UI designer creating a spacing system for a ${brief.industry} e-commerce store.

Style direction: ${brief.styleDirection}

Generate a spacing system that:
1. Uses a consistent base unit (4px or 8px)
2. Has a harmonious scale
3. Includes section padding for mobile/desktop
4. Defines container width
5. Defines grid gap

Respond with valid JSON:
{
  "baseUnit": 4 or 8,
  "scale": [0.25, 0.5, 1, 1.5, 2, 3, 4, 6, 8, 12, 16],
  "sectionPadding": {
    "mobile": "40px",
    "desktop": "80px"
  },
  "containerWidth": "1200px or 1400px",
  "gridGap": "16px or 24px"
}`),
    OpenRouterClient.userMessage(feedback ? `Revise based on: ${feedback}` : 'Generate spacing system now.'),
  ];

  const response = await chat(messages, 'planning');
  return parseJSON<SpacingProposal>(response);
}

async function generateButtons(session: SessionState, feedback?: string): Promise<ButtonProposal> {
  const brief = session.brief!;

  const messages: Message[] = [
    OpenRouterClient.systemMessage(`You are a senior UI designer creating button styles for a ${brief.industry} e-commerce store.

Style direction: ${brief.styleDirection}

Generate button styles that:
1. Fit the brand personality
2. Have clear hover/focus states
3. Work for primary CTAs
4. Are accessible

Respond with valid JSON:
{
  "borderRadius": "4px to 9999px",
  "paddingX": "24px to 32px",
  "paddingY": "12px to 16px",
  "fontWeight": 500-700,
  "textTransform": "none" | "uppercase" | "capitalize",
  "style": "filled" | "outline" | "ghost"
}`),
    OpenRouterClient.userMessage(feedback ? `Revise based on: ${feedback}` : 'Generate button styles now.'),
  ];

  const response = await chat(messages, 'planning');
  return parseJSON<ButtonProposal>(response);
}

async function generateSettingsData(
  session: SessionState,
  designSystem: FullDesignSystem
): Promise<Record<string, unknown>> {
  const selectedScheme = designSystem.colorSchemes[designSystem.selectedScheme];

  // Build settings_data.json structure
  const settingsData = {
    current: {
      sections: {},
      blocks: {},
      settings: {
        // Colors
        colors_primary: selectedScheme.primary,
        colors_secondary: selectedScheme.secondary,
        colors_accent: selectedScheme.accent,
        colors_background: selectedScheme.background,
        colors_text: selectedScheme.text,

        // Typography
        type_heading_font: designSystem.typography.headingFont,
        type_heading_weight: designSystem.typography.headingWeight,
        type_body_font: designSystem.typography.bodyFont,
        type_body_weight: designSystem.typography.bodyWeight,
        type_base_size: parseInt(designSystem.typography.baseSize),
        type_scale: designSystem.typography.scale,

        // Spacing
        spacing_base: designSystem.spacing.baseUnit,
        spacing_section_mobile: designSystem.spacing.sectionPadding.mobile,
        spacing_section_desktop: designSystem.spacing.sectionPadding.desktop,
        layout_container_width: designSystem.spacing.containerWidth,
        layout_grid_gap: designSystem.spacing.gridGap,

        // Buttons
        button_border_radius: designSystem.buttons.borderRadius,
        button_padding_x: designSystem.buttons.paddingX,
        button_padding_y: designSystem.buttons.paddingY,
        button_font_weight: designSystem.buttons.fontWeight,
        button_text_transform: designSystem.buttons.textTransform,

        // Corner radius
        corner_radius_small: designSystem.corners.small,
        corner_radius_medium: designSystem.corners.medium,
        corner_radius_large: designSystem.corners.large,
      },
    },
    presets: {
      default: {
        settings: {},
        sections: {},
        blocks: {},
      },
    },
  };

  return settingsData;
}

function generateCSSVariables(designSystem: FullDesignSystem): string {
  const scheme = designSystem.colorSchemes[designSystem.selectedScheme];
  const { typography, spacing, buttons, corners } = designSystem;

  return `/**
 * Design System CSS Variables
 * Generated by Theme Builder
 */

:root {
  /* Colors - ${scheme.name} */
  --color-primary: ${scheme.primary};
  --color-secondary: ${scheme.secondary};
  --color-accent: ${scheme.accent};
  --color-background: ${scheme.background};
  --color-text: ${scheme.text};
  --color-muted: ${scheme.muted};

  /* Typography */
  --font-heading: "${typography.headingFont}", ${typography.headingFallback};
  --font-body: "${typography.bodyFont}", ${typography.bodyFallback};
  --font-weight-heading: ${typography.headingWeight};
  --font-weight-body: ${typography.bodyWeight};
  --font-size-base: ${typography.baseSize};
  --type-scale: ${typography.scale};
  --line-height-heading: ${typography.lineHeight.heading};
  --line-height-body: ${typography.lineHeight.body};

  /* Spacing */
  --spacing-unit: ${spacing.baseUnit}px;
  --spacing-xs: calc(var(--spacing-unit) * ${spacing.scale[0]});
  --spacing-sm: calc(var(--spacing-unit) * ${spacing.scale[1]});
  --spacing-md: calc(var(--spacing-unit) * ${spacing.scale[2]});
  --spacing-lg: calc(var(--spacing-unit) * ${spacing.scale[3]});
  --spacing-xl: calc(var(--spacing-unit) * ${spacing.scale[4]});
  --spacing-2xl: calc(var(--spacing-unit) * ${spacing.scale[5]});
  --section-padding-mobile: ${spacing.sectionPadding.mobile};
  --section-padding-desktop: ${spacing.sectionPadding.desktop};
  --container-width: ${spacing.containerWidth};
  --grid-gap: ${spacing.gridGap};

  /* Buttons */
  --button-radius: ${buttons.borderRadius};
  --button-padding-x: ${buttons.paddingX};
  --button-padding-y: ${buttons.paddingY};
  --button-font-weight: ${buttons.fontWeight};
  --button-text-transform: ${buttons.textTransform};

  /* Corner Radius */
  --radius-none: ${corners.none};
  --radius-sm: ${corners.small};
  --radius-md: ${corners.medium};
  --radius-lg: ${corners.large};
  --radius-full: ${corners.full};
}

/* Typography Scale */
:root {
  --font-size-xs: calc(var(--font-size-base) / var(--type-scale) / var(--type-scale));
  --font-size-sm: calc(var(--font-size-base) / var(--type-scale));
  --font-size-md: var(--font-size-base);
  --font-size-lg: calc(var(--font-size-base) * var(--type-scale));
  --font-size-xl: calc(var(--font-size-base) * var(--type-scale) * var(--type-scale));
  --font-size-2xl: calc(var(--font-size-base) * var(--type-scale) * var(--type-scale) * var(--type-scale));
  --font-size-3xl: calc(var(--font-size-base) * var(--type-scale) * var(--type-scale) * var(--type-scale) * var(--type-scale));
}

/* Color Scheme Alternates */
${designSystem.colorSchemes.map((s, i) => `
/* Scheme ${i + 1}: ${s.name} */
.color-scheme-${i + 1} {
  --color-primary: ${s.primary};
  --color-secondary: ${s.secondary};
  --color-accent: ${s.accent};
  --color-background: ${s.background};
  --color-text: ${s.text};
  --color-muted: ${s.muted};
}`).join('\n')}
`;
}

// ============ Display Functions ============

function displayColorSchemes(schemes: ColorScheme[]): void {
  let content = `${schemes.length} Color Schemes:\n\n`;

  for (let i = 0; i < schemes.length; i++) {
    const s = schemes[i];
    content += `${i + 1}. ${s.name}\n`;
    content += `   Primary:    ${s.primary}  ████\n`;
    content += `   Secondary:  ${s.secondary}  ████\n`;
    content += `   Accent:     ${s.accent}  ████\n`;
    content += `   Background: ${s.background}  ████\n`;
    content += `   Text:       ${s.text}  ████\n`;
    content += `   Muted:      ${s.muted}  ████\n\n`;
  }

  display.proposal('Color Schemes', content);
}

function displayTypography(typography: TypographyProposal): void {
  display.proposal('Typography System', `
HEADINGS
  Font: ${typography.headingFont}
  Fallback: ${typography.headingFallback}
  Weight: ${typography.headingWeight}
  Line Height: ${typography.lineHeight.heading}

BODY
  Font: ${typography.bodyFont}
  Fallback: ${typography.bodyFallback}
  Weight: ${typography.bodyWeight}
  Line Height: ${typography.lineHeight.body}

SCALE
  Base Size: ${typography.baseSize}
  Scale Ratio: ${typography.scale} (${getScaleName(typography.scale)})
`);
}

function displaySpacing(spacing: SpacingProposal): void {
  display.proposal('Spacing System', `
BASE UNIT: ${spacing.baseUnit}px

SCALE:
${spacing.scale.map((s, i) => `  ${i}: ${spacing.baseUnit * s}px (${s}x)`).join('\n')}

SECTION PADDING:
  Mobile: ${spacing.sectionPadding.mobile}
  Desktop: ${spacing.sectionPadding.desktop}

LAYOUT:
  Container Width: ${spacing.containerWidth}
  Grid Gap: ${spacing.gridGap}
`);
}

function displayButtons(buttons: ButtonProposal): void {
  display.proposal('Button Styles', `
STYLE: ${buttons.style}

DIMENSIONS:
  Border Radius: ${buttons.borderRadius}
  Padding X: ${buttons.paddingX}
  Padding Y: ${buttons.paddingY}

TEXT:
  Font Weight: ${buttons.fontWeight}
  Text Transform: ${buttons.textTransform}
`);
}

// ============ Utilities ============

function getScaleName(scale: number): string {
  const scales: Record<number, string> = {
    1.067: 'Minor Second',
    1.125: 'Major Second',
    1.2: 'Minor Third',
    1.25: 'Major Third',
    1.333: 'Perfect Fourth',
    1.414: 'Augmented Fourth',
    1.5: 'Perfect Fifth',
    1.618: 'Golden Ratio',
  };
  return scales[scale] || 'Custom';
}

function parseJSON<T>(response: string): T {
  try {
    const jsonMatch = response.match(/```(?:json)?\s*([\s\S]*?)```/);
    const jsonStr = jsonMatch ? jsonMatch[1].trim() : response.trim();
    return JSON.parse(jsonStr) as T;
  } catch {
    const jsonStart = response.indexOf('{') !== -1 ? response.indexOf('{') : response.indexOf('[');
    const jsonEnd = response.lastIndexOf('}') !== -1 ? response.lastIndexOf('}') + 1 : response.lastIndexOf(']') + 1;

    if (jsonStart !== -1 && jsonEnd > jsonStart) {
      return JSON.parse(response.substring(jsonStart, jsonEnd)) as T;
    }

    throw new Error('Could not parse JSON from response');
  }
}

export default runDesignSystemPhase;
