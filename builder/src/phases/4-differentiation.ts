import { display } from '../ui/display.js';
import { promptConfirm, promptSelect, promptText } from '../ui/prompts.js';
import { approvalLoop, batchApproval } from '../ui/approval.js';
import { chat, OpenRouterClient } from '../ai/openrouter.js';
import { getModelInfo } from '../ai/models.js';
import type { SessionState, SectionProposal, Message } from '../types.js';
import { readFile, writeFile, mkdir, readdir } from 'fs/promises';
import { join } from 'path';
import { PATHS, GENERATION_CONFIG } from '../config.js';

interface HeaderProposal {
  concept: string;
  layout: string;
  features: string[];
  megaMenu: boolean;
  sticky: boolean;
  searchStyle: 'overlay' | 'inline' | 'drawer';
}

interface FooterProposal {
  concept: string;
  layout: string;
  columns: number;
  features: string[];
  newsletter: boolean;
  socialStyle: 'icons' | 'text' | 'branded';
}

interface JSEnhancement {
  name: string;
  description: string;
  type: 'animation' | 'interaction' | 'utility';
  affectedElements: string[];
}

interface GeneratedCode {
  liquid: string;
  css?: string;
  js?: string;
  schema?: string;
}

/**
 * Phase 4: Theme Differentiation
 *
 * Generates substantial changes to differentiate the theme:
 * - Complete header rewrite
 * - Complete footer rewrite
 * - Meaningful JavaScript rewrites (60%+ new)
 * - 4 new sections
 * - 4 substantially modified sections
 */
export async function runDifferentiationPhase(session: SessionState): Promise<void> {
  if (!session.brief) {
    throw new Error('Brief must be completed before differentiation');
  }

  const outputDir = join(PATHS.output, session.themeName || session.id, 'theme');
  await mkdir(outputDir, { recursive: true });
  await mkdir(join(outputDir, 'sections'), { recursive: true });
  await mkdir(join(outputDir, 'assets'), { recursive: true });
  await mkdir(join(outputDir, 'snippets'), { recursive: true });

  display.sectionHeader('Differentiation Requirements');
  display.info('To be accepted into the Shopify Theme Store, themes must be substantially different.');
  display.newline();
  display.text('This phase will generate:');
  display.list([
    'Complete header rewrite (new layout, features, code)',
    'Complete footer rewrite (new layout, features, code)',
    'Meaningful JavaScript rewrites (60%+ new code)',
    `${GENERATION_CONFIG.newSectionsCount} brand new sections`,
    `${GENERATION_CONFIG.modifiedSectionsCount} substantially modified sections`,
  ]);
  display.newline();

  // Step 1: Header Rewrite
  await generateHeader(session, outputDir);

  // Step 2: Footer Rewrite
  await generateFooter(session, outputDir);

  // Step 3: JavaScript Enhancements
  await generateJavaScript(session, outputDir);

  // Step 4: New Sections
  await generateNewSections(session, outputDir);

  // Step 5: Modified Sections
  await generateModifiedSections(session, outputDir);

  display.divider();
  display.success('Theme differentiation complete');
  display.keyValue('Output directory', outputDir);
}

/**
 * Generate new header
 */
async function generateHeader(session: SessionState, outputDir: string): Promise<void> {
  display.sectionHeader('Step 1: Header Rewrite');
  display.info(`Using ${getModelInfo('planning')} for header concept...`);

  const { result: proposal } = await approvalLoop<HeaderProposal>(
    'differentiation',
    'header-proposal',
    {
      generate: async (feedback) => generateHeaderProposal(session, feedback),
      display: displayHeaderProposal,
    }
  );

  display.info(`Using ${getModelInfo('coding')} to generate header code...`);

  const { result: code } = await approvalLoop<GeneratedCode>(
    'differentiation',
    'header-code',
    {
      generate: async (feedback) => generateHeaderCode(session, proposal, feedback),
      display: (code) => displayGeneratedCode('Header', code),
    }
  );

  // Save header files
  await writeFile(join(outputDir, 'sections', 'header.liquid'), code.liquid, 'utf-8');
  if (code.css) {
    await writeFile(join(outputDir, 'assets', 'header.css'), code.css, 'utf-8');
  }
  if (code.js) {
    await writeFile(join(outputDir, 'assets', 'header.js'), code.js, 'utf-8');
  }

  display.success('Header generated and saved');
}

/**
 * Generate new footer
 */
async function generateFooter(session: SessionState, outputDir: string): Promise<void> {
  display.sectionHeader('Step 2: Footer Rewrite');
  display.info(`Using ${getModelInfo('planning')} for footer concept...`);

  const { result: proposal } = await approvalLoop<FooterProposal>(
    'differentiation',
    'footer-proposal',
    {
      generate: async (feedback) => generateFooterProposal(session, feedback),
      display: displayFooterProposal,
    }
  );

  display.info(`Using ${getModelInfo('coding')} to generate footer code...`);

  const { result: code } = await approvalLoop<GeneratedCode>(
    'differentiation',
    'footer-code',
    {
      generate: async (feedback) => generateFooterCode(session, proposal, feedback),
      display: (code) => displayGeneratedCode('Footer', code),
    }
  );

  // Save footer files
  await writeFile(join(outputDir, 'sections', 'footer.liquid'), code.liquid, 'utf-8');
  if (code.css) {
    await writeFile(join(outputDir, 'assets', 'footer.css'), code.css, 'utf-8');
  }

  display.success('Footer generated and saved');
}

/**
 * Generate JavaScript enhancements
 */
async function generateJavaScript(session: SessionState, outputDir: string): Promise<void> {
  display.sectionHeader('Step 3: JavaScript Enhancements');
  display.info('JavaScript must be 60%+ new code for theme store acceptance.');
  display.info(`Using ${getModelInfo('planning')} to plan JS enhancements...`);

  const { result: enhancements } = await approvalLoop<JSEnhancement[]>(
    'differentiation',
    'js-enhancements',
    {
      generate: async (feedback) => generateJSProposals(session, feedback),
      display: displayJSEnhancements,
    }
  );

  display.info(`Using ${getModelInfo('coding')} to generate JavaScript...`);

  const { result: jsCode } = await approvalLoop<string>(
    'differentiation',
    'js-code',
    {
      generate: async (feedback) => generateJSCode(session, enhancements, feedback),
      display: (code) => {
        display.proposal('Generated JavaScript', code.substring(0, 2000) + (code.length > 2000 ? '\n\n... (truncated)' : ''));
      },
    }
  );

  // Save JavaScript
  await writeFile(join(outputDir, 'assets', 'theme.js'), jsCode, 'utf-8');
  display.success('JavaScript enhancements generated and saved');
}

/**
 * Generate new sections
 */
async function generateNewSections(session: SessionState, outputDir: string): Promise<void> {
  display.sectionHeader(`Step 4: Generate ${GENERATION_CONFIG.newSectionsCount} New Sections`);
  display.info(`Using ${getModelInfo('planning')} to propose new sections...`);

  const { result: proposals } = await approvalLoop<SectionProposal[]>(
    'differentiation',
    'new-section-proposals',
    {
      generate: async (feedback) => generateSectionProposals(session, 'new', feedback),
      display: displaySectionProposals,
    }
  );

  // Store proposals in session
  session.sections = session.sections.filter(s => s.type !== 'new');
  session.sections.push(...proposals);

  // Generate code for each approved section
  for (let i = 0; i < proposals.length; i++) {
    const proposal = proposals[i];
    display.sectionHeader(`Generating Section ${i + 1}/${proposals.length}: ${proposal.name}`);

    const { result: code } = await approvalLoop<GeneratedCode>(
      'differentiation',
      `new-section-${proposal.id}`,
      {
        generate: async (feedback) => generateSectionCode(session, proposal, feedback),
        display: (code) => displayGeneratedCode(proposal.name, code),
      }
    );

    // Save section
    const sectionPath = join(outputDir, 'sections', `${proposal.id}.liquid`);
    await writeFile(sectionPath, code.liquid, 'utf-8');

    if (code.css) {
      await writeFile(join(outputDir, 'assets', `section-${proposal.id}.css`), code.css, 'utf-8');
    }

    display.success(`Section "${proposal.name}" saved`);
  }
}

/**
 * Generate modified sections
 */
async function generateModifiedSections(session: SessionState, outputDir: string): Promise<void> {
  display.sectionHeader(`Step 5: Modify ${GENERATION_CONFIG.modifiedSectionsCount} Existing Sections`);

  // List available sections from Elle
  const elleSections = await readdir(join(PATHS.elle, 'sections'));
  const modifiableSections = elleSections
    .filter(f => f.endsWith('.liquid'))
    .filter(f => !['header.liquid', 'footer.liquid', 'header-group.json', 'footer-group.json'].includes(f))
    .map(f => f.replace('.liquid', ''));

  display.info('Available sections to modify:');
  display.list(modifiableSections.slice(0, 15));
  if (modifiableSections.length > 15) {
    display.info(`... and ${modifiableSections.length - 15} more`);
  }

  display.info(`Using ${getModelInfo('planning')} to propose modifications...`);

  const { result: proposals } = await approvalLoop<SectionProposal[]>(
    'differentiation',
    'modified-section-proposals',
    {
      generate: async (feedback) => generateSectionProposals(session, 'modified', feedback, modifiableSections),
      display: displaySectionProposals,
    }
  );

  // Store proposals in session
  session.sections = session.sections.filter(s => s.type !== 'modified');
  session.sections.push(...proposals);

  // Generate code for each modified section
  for (let i = 0; i < proposals.length; i++) {
    const proposal = proposals[i];
    display.sectionHeader(`Modifying Section ${i + 1}/${proposals.length}: ${proposal.name}`);

    // Read original section
    const originalPath = join(PATHS.elle, 'sections', `${proposal.id}.liquid`);
    let originalCode = '';
    try {
      originalCode = await readFile(originalPath, 'utf-8');
    } catch {
      display.warning(`Could not read original section: ${proposal.id}`);
    }

    const { result: code } = await approvalLoop<GeneratedCode>(
      'differentiation',
      `modified-section-${proposal.id}`,
      {
        generate: async (feedback) => generateModifiedSectionCode(session, proposal, originalCode, feedback),
        display: (code) => displayGeneratedCode(proposal.name, code),
      }
    );

    // Save modified section
    const sectionPath = join(outputDir, 'sections', `${proposal.id}.liquid`);
    await writeFile(sectionPath, code.liquid, 'utf-8');

    if (code.css) {
      await writeFile(join(outputDir, 'assets', `section-${proposal.id}.css`), code.css, 'utf-8');
    }

    display.success(`Section "${proposal.name}" modified and saved`);
  }
}

// ============ AI Generation Functions ============

async function generateHeaderProposal(session: SessionState, feedback?: string): Promise<HeaderProposal> {
  const brief = session.brief!;

  const messages: Message[] = [
    OpenRouterClient.systemMessage(`You are a senior Shopify theme developer. Generate a header design proposal for a ${brief.industry} store targeting ${brief.targetMarket}.

Style direction: ${brief.styleDirection}
Brand positioning: ${brief.positioning || 'Premium quality'}

Generate a unique header concept that:
1. Is substantially different from typical Shopify themes
2. Fits the industry and target market
3. Includes modern e-commerce features
4. Has excellent UX on mobile and desktop

Respond with valid JSON only:
{
  "concept": "Brief description of the header concept",
  "layout": "Description of the layout structure",
  "features": ["Feature 1", "Feature 2", "Feature 3"],
  "megaMenu": true/false,
  "sticky": true/false,
  "searchStyle": "overlay" | "inline" | "drawer"
}`),
    OpenRouterClient.userMessage(feedback ? `Revise based on: ${feedback}` : 'Generate the header proposal now.'),
  ];

  const response = await chat(messages, 'planning');
  return parseJSON<HeaderProposal>(response);
}

async function generateHeaderCode(session: SessionState, proposal: HeaderProposal, feedback?: string): Promise<GeneratedCode> {
  const brief = session.brief!;

  const messages: Message[] = [
    OpenRouterClient.systemMessage(`You are an expert Shopify Liquid developer. Generate a complete header section based on this proposal:

${JSON.stringify(proposal, null, 2)}

Industry: ${brief.industry}
Style: ${brief.styleDirection}

Requirements:
1. Complete Liquid section with schema
2. Mobile-responsive design
3. Accessibility compliant (WCAG 2.1)
4. Clean, semantic HTML
5. CSS variables for theming
6. Optional JavaScript for interactions

Respond with JSON:
{
  "liquid": "Complete header.liquid content with schema",
  "css": "Header-specific CSS (optional)",
  "js": "Header JavaScript if needed (optional)"
}`),
    OpenRouterClient.userMessage(feedback ? `Revise based on: ${feedback}` : 'Generate the header code now.'),
  ];

  const response = await chat(messages, 'coding');
  return parseJSON<GeneratedCode>(response);
}

async function generateFooterProposal(session: SessionState, feedback?: string): Promise<FooterProposal> {
  const brief = session.brief!;

  const messages: Message[] = [
    OpenRouterClient.systemMessage(`You are a senior Shopify theme developer. Generate a footer design proposal for a ${brief.industry} store.

Style: ${brief.styleDirection}
Target: ${brief.targetMarket}

Generate a unique footer concept that:
1. Is substantially different from typical footers
2. Includes trust signals and social proof
3. Has excellent information architecture
4. Works well on mobile

Respond with valid JSON only:
{
  "concept": "Brief description of the footer concept",
  "layout": "Description of the layout structure",
  "columns": 3-5,
  "features": ["Feature 1", "Feature 2", "Feature 3"],
  "newsletter": true/false,
  "socialStyle": "icons" | "text" | "branded"
}`),
    OpenRouterClient.userMessage(feedback ? `Revise based on: ${feedback}` : 'Generate the footer proposal now.'),
  ];

  const response = await chat(messages, 'planning');
  return parseJSON<FooterProposal>(response);
}

async function generateFooterCode(session: SessionState, proposal: FooterProposal, feedback?: string): Promise<GeneratedCode> {
  const brief = session.brief!;

  const messages: Message[] = [
    OpenRouterClient.systemMessage(`You are an expert Shopify Liquid developer. Generate a complete footer section based on this proposal:

${JSON.stringify(proposal, null, 2)}

Industry: ${brief.industry}
Style: ${brief.styleDirection}

Requirements:
1. Complete Liquid section with schema
2. Mobile-responsive design
3. Accessibility compliant
4. Rich schema settings for customization
5. Payment icons and trust badges

Respond with JSON:
{
  "liquid": "Complete footer.liquid content with schema",
  "css": "Footer-specific CSS (optional)"
}`),
    OpenRouterClient.userMessage(feedback ? `Revise based on: ${feedback}` : 'Generate the footer code now.'),
  ];

  const response = await chat(messages, 'coding');
  return parseJSON<GeneratedCode>(response);
}

async function generateJSProposals(session: SessionState, feedback?: string): Promise<JSEnhancement[]> {
  const brief = session.brief!;

  const messages: Message[] = [
    OpenRouterClient.systemMessage(`You are a senior JavaScript developer specializing in e-commerce. Plan JavaScript enhancements for a ${brief.industry} Shopify theme.

Style: ${brief.styleDirection}
Target: ${brief.targetMarket}

Generate 6-8 JavaScript enhancements that:
1. Are 60%+ new code (not just modifications)
2. Enhance user experience
3. Fit the industry and brand
4. Include animations, interactions, and utilities

Respond with valid JSON array:
[
  {
    "name": "Enhancement name",
    "description": "What it does and why it's valuable",
    "type": "animation" | "interaction" | "utility",
    "affectedElements": ["element selectors"]
  }
]`),
    OpenRouterClient.userMessage(feedback ? `Revise based on: ${feedback}` : 'Generate JS enhancement proposals now.'),
  ];

  const response = await chat(messages, 'planning');
  return parseJSON<JSEnhancement[]>(response);
}

async function generateJSCode(session: SessionState, enhancements: JSEnhancement[], feedback?: string): Promise<string> {
  const brief = session.brief!;

  const messages: Message[] = [
    OpenRouterClient.systemMessage(`You are an expert JavaScript developer. Generate complete, production-ready JavaScript based on these enhancements:

${JSON.stringify(enhancements, null, 2)}

Industry: ${brief.industry}
Style: ${brief.styleDirection}

Requirements:
1. Modern ES6+ syntax
2. No jQuery dependencies
3. Performance optimized
4. Accessibility compliant
5. Well-commented code
6. Event delegation where appropriate
7. Intersection Observer for scroll effects
8. RequestAnimationFrame for animations

Generate a single JavaScript file with all enhancements. Respond with the code only, no JSON wrapper.`),
    OpenRouterClient.userMessage(feedback ? `Revise based on: ${feedback}` : 'Generate the JavaScript now.'),
  ];

  const response = await chat(messages, 'coding');

  // Strip markdown code blocks if present
  return response.replace(/```(?:javascript|js)?\n?/g, '').replace(/```$/g, '').trim();
}

async function generateSectionProposals(
  session: SessionState,
  type: 'new' | 'modified',
  feedback?: string,
  availableSections?: string[]
): Promise<SectionProposal[]> {
  const brief = session.brief!;
  const count = type === 'new' ? GENERATION_CONFIG.newSectionsCount : GENERATION_CONFIG.modifiedSectionsCount;

  const contextInfo = type === 'modified' && availableSections
    ? `\n\nAvailable sections to modify: ${availableSections.join(', ')}`
    : '';

  const messages: Message[] = [
    OpenRouterClient.systemMessage(`You are a senior Shopify theme developer. Generate ${count} ${type} section proposals for a ${brief.industry} store.

Style: ${brief.styleDirection}
Target: ${brief.targetMarket}
${contextInfo}

${type === 'new' ? `
Generate unique section concepts that:
1. Don't exist in typical Shopify themes
2. Solve real problems for ${brief.industry}
3. Enhance conversion and engagement
4. Have unique visual presentation
` : `
Generate modification proposals that:
1. Substantially change the original section
2. Add new features and functionality
3. Improve UX for ${brief.targetMarket}
4. Are more than just styling changes
`}

Respond with valid JSON array:
[
  {
    "id": "section-handle",
    "name": "Section Name",
    "type": "${type}",
    "concept": "What this section does and why it's valuable",
    "functionality": "Key functionality and interactions",
    "uniqueFeatures": ["Feature 1", "Feature 2", "Feature 3"]
  }
]`),
    OpenRouterClient.userMessage(feedback ? `Revise based on: ${feedback}` : `Generate ${count} ${type} section proposals now.`),
  ];

  const response = await chat(messages, 'planning');
  return parseJSON<SectionProposal[]>(response);
}

async function generateSectionCode(session: SessionState, proposal: SectionProposal, feedback?: string): Promise<GeneratedCode> {
  const brief = session.brief!;

  const messages: Message[] = [
    OpenRouterClient.systemMessage(`You are an expert Shopify Liquid developer. Generate a complete section based on this proposal:

${JSON.stringify(proposal, null, 2)}

Industry: ${brief.industry}
Style: ${brief.styleDirection}

Requirements:
1. Complete Liquid section with full schema
2. Mobile-responsive design
3. Rich customization options in schema
4. Semantic HTML and accessibility
5. CSS variables integration
6. Optional JavaScript if needed

Respond with JSON:
{
  "liquid": "Complete section.liquid content with {% schema %} block",
  "css": "Section-specific CSS (optional)",
  "js": "Section JavaScript if needed (optional)"
}`),
    OpenRouterClient.userMessage(feedback ? `Revise based on: ${feedback}` : 'Generate the section code now.'),
  ];

  const response = await chat(messages, 'coding');
  return parseJSON<GeneratedCode>(response);
}

async function generateModifiedSectionCode(
  session: SessionState,
  proposal: SectionProposal,
  originalCode: string,
  feedback?: string
): Promise<GeneratedCode> {
  const brief = session.brief!;

  const messages: Message[] = [
    OpenRouterClient.systemMessage(`You are an expert Shopify Liquid developer. Substantially modify this section based on the proposal:

PROPOSAL:
${JSON.stringify(proposal, null, 2)}

ORIGINAL SECTION:
${originalCode.substring(0, 3000)}${originalCode.length > 3000 ? '\n... (truncated)' : ''}

Industry: ${brief.industry}
Style: ${brief.styleDirection}

Requirements:
1. Substantial changes (not just styling)
2. Add new features from the proposal
3. Maintain backwards compatibility where possible
4. Update schema with new settings
5. Improve accessibility

Respond with JSON:
{
  "liquid": "Complete modified section.liquid with updated {% schema %}",
  "css": "Additional CSS for new features (optional)"
}`),
    OpenRouterClient.userMessage(feedback ? `Revise based on: ${feedback}` : 'Generate the modified section code now.'),
  ];

  const response = await chat(messages, 'coding');
  return parseJSON<GeneratedCode>(response);
}

// ============ Display Functions ============

function displayHeaderProposal(proposal: HeaderProposal): void {
  display.proposal('Header Proposal', `
CONCEPT: ${proposal.concept}

LAYOUT: ${proposal.layout}

FEATURES:
${proposal.features.map(f => `  • ${f}`).join('\n')}

OPTIONS:
  • Mega Menu: ${proposal.megaMenu ? 'Yes' : 'No'}
  • Sticky Header: ${proposal.sticky ? 'Yes' : 'No'}
  • Search Style: ${proposal.searchStyle}
`);
}

function displayFooterProposal(proposal: FooterProposal): void {
  display.proposal('Footer Proposal', `
CONCEPT: ${proposal.concept}

LAYOUT: ${proposal.layout}
COLUMNS: ${proposal.columns}

FEATURES:
${proposal.features.map(f => `  • ${f}`).join('\n')}

OPTIONS:
  • Newsletter Signup: ${proposal.newsletter ? 'Yes' : 'No'}
  • Social Style: ${proposal.socialStyle}
`);
}

function displayJSEnhancements(enhancements: JSEnhancement[]): void {
  let content = `${enhancements.length} JavaScript Enhancements:\n\n`;

  for (const e of enhancements) {
    content += `▶ ${e.name} [${e.type}]\n`;
    content += `  ${e.description}\n`;
    content += `  Affects: ${e.affectedElements.join(', ')}\n\n`;
  }

  display.proposal('JavaScript Enhancements', content);
}

function displaySectionProposals(proposals: SectionProposal[]): void {
  let content = `${proposals.length} Section Proposals:\n\n`;

  for (const p of proposals) {
    content += `▶ ${p.name} (${p.id}) [${p.type}]\n`;
    content += `  ${p.concept}\n`;
    content += `  Functionality: ${p.functionality}\n`;
    content += `  Features: ${p.uniqueFeatures.join(', ')}\n\n`;
  }

  display.proposal('Section Proposals', content);
}

function displayGeneratedCode(name: string, code: GeneratedCode): void {
  const liquidPreview = code.liquid.substring(0, 1500);
  const truncated = code.liquid.length > 1500;

  let content = `LIQUID (${code.liquid.length} chars):\n`;
  content += '─'.repeat(40) + '\n';
  content += liquidPreview + (truncated ? '\n... (truncated)' : '') + '\n\n';

  if (code.css) {
    content += `CSS (${code.css.length} chars): Included\n`;
  }
  if (code.js) {
    content += `JS (${code.js.length} chars): Included\n`;
  }

  display.proposal(`Generated Code: ${name}`, content);
}

// ============ Utilities ============

function parseJSON<T>(response: string): T {
  try {
    // Try to extract JSON from markdown code blocks
    const jsonMatch = response.match(/```(?:json)?\s*([\s\S]*?)```/);
    const jsonStr = jsonMatch ? jsonMatch[1].trim() : response.trim();
    return JSON.parse(jsonStr) as T;
  } catch {
    // If that fails, try to find JSON-like content
    const jsonStart = response.indexOf('{') !== -1 ? response.indexOf('{') : response.indexOf('[');
    const jsonEnd = response.lastIndexOf('}') !== -1 ? response.lastIndexOf('}') + 1 : response.lastIndexOf(']') + 1;

    if (jsonStart !== -1 && jsonEnd > jsonStart) {
      const extracted = response.substring(jsonStart, jsonEnd);
      return JSON.parse(extracted) as T;
    }

    throw new Error('Could not parse JSON from response');
  }
}

export default runDifferentiationPhase;
