import { display } from '../ui/display.js';
import { promptText, promptList, promptSelect } from '../ui/prompts.js';
import { approvalLoop } from '../ui/approval.js';
import { chat, OpenRouterClient } from '../ai/openrouter.js';
import { getModelInfo } from '../ai/models.js';
import type { SessionState, ThemeBrief, Message } from '../types.js';
import { readFile } from 'fs/promises';
import { join } from 'path';
import { PATHS } from '../config.js';

/**
 * Phase 1: Brief & Market Analysis
 *
 * Collects theme brief from user, then uses AI to generate:
 * - Brand positioning proposal
 * - Market differentiation analysis
 * - Theme feature recommendations
 */
export async function runBriefPhase(session: SessionState): Promise<void> {
  display.sectionHeader('Step 1: Theme Brief Input');

  // Collect basic brief information
  const brief = await collectBrief();
  session.brief = brief;

  display.success('Brief collected');
  display.divider();

  // Run market analysis with approval loop
  display.sectionHeader('Step 2: AI Market Analysis');
  display.info(`Using ${getModelInfo('planning')} for analysis...`);

  const { result: analysis, record } = await approvalLoop<MarketAnalysis>(
    'brief',
    'market-analysis',
    {
      generate: async (feedback) => generateMarketAnalysis(brief, feedback),
      display: displayMarketAnalysis,
    }
  );

  session.approvalHistory.push(record);

  // Update brief with AI-generated positioning
  if (analysis.brandName) {
    session.brief.brandName = analysis.brandName;
  }
  if (analysis.positioning) {
    session.brief.positioning = analysis.positioning;
  }

  // Store theme name for session
  session.themeName = analysis.brandName || brief.industry.toLowerCase().replace(/\s+/g, '-');

  display.success('Market analysis complete');
}

/**
 * Collect theme brief from user
 */
async function collectBrief(): Promise<ThemeBrief> {
  display.info('Please provide information about your target theme:\n');

  // Industry/Niche
  const industry = await promptText(
    'What industry or niche is this theme for?',
    'e.g., Sustainable fashion, Artisan jewelry, Home decor'
  );

  // Target market description
  const targetMarket = await promptText(
    'Describe your target customer:',
    'e.g., Eco-conscious millennials, Luxury seekers, Budget-conscious families'
  );

  // Style direction
  const styleDirection = await promptSelect<string>(
    'What overall style direction?',
    [
      { name: 'Minimalist & Clean', value: 'minimalist' },
      { name: 'Bold & Vibrant', value: 'bold' },
      { name: 'Luxury & Elegant', value: 'luxury' },
      { name: 'Warm & Organic', value: 'organic' },
      { name: 'Modern & Technical', value: 'modern' },
      { name: 'Playful & Creative', value: 'playful' },
    ]
  );

  // Competitor URLs (optional)
  display.info('\nEnter competitor store URLs for analysis (one per line, or leave empty):');
  const competitors = await promptList(
    'Competitor URLs',
    []
  );

  return {
    industry,
    targetMarket,
    styleDirection,
    competitors,
  };
}

interface MarketAnalysis {
  brandName: string;
  positioning: string;
  targetAudience: {
    demographics: string;
    psychographics: string;
    painPoints: string[];
  };
  differentiation: {
    uniqueValue: string;
    competitorGaps: string[];
    opportunities: string[];
  };
  themeFeatures: {
    mustHave: string[];
    niceToHave: string[];
    unique: string[];
  };
  colorMood: {
    primary: string;
    mood: string;
    reasoning: string;
  };
}

/**
 * Generate market analysis using AI
 */
async function generateMarketAnalysis(
  brief: ThemeBrief,
  feedback?: string
): Promise<MarketAnalysis> {
  const promptTemplate = await loadPromptTemplate('market-analysis.md');

  const systemPrompt = promptTemplate
    .replace('{{INDUSTRY}}', brief.industry)
    .replace('{{TARGET_MARKET}}', brief.targetMarket)
    .replace('{{STYLE_DIRECTION}}', brief.styleDirection)
    .replace('{{COMPETITORS}}', brief.competitors.join('\n') || 'None provided');

  const messages: Message[] = [
    OpenRouterClient.systemMessage(systemPrompt),
  ];

  if (feedback) {
    messages.push(
      OpenRouterClient.userMessage(`Please revise the analysis based on this feedback: ${feedback}`)
    );
  } else {
    messages.push(
      OpenRouterClient.userMessage('Generate the market analysis now. Respond with valid JSON only.')
    );
  }

  const response = await chat(messages, 'planning');

  // Parse JSON from response
  try {
    // Extract JSON from response (handle markdown code blocks)
    const jsonMatch = response.match(/```(?:json)?\s*([\s\S]*?)```/) || [null, response];
    const jsonStr = jsonMatch[1]?.trim() || response.trim();
    return JSON.parse(jsonStr) as MarketAnalysis;
  } catch (error) {
    // If parsing fails, create a structured response from the text
    display.warning('AI response was not valid JSON, attempting to extract data...');
    return createFallbackAnalysis(brief, response);
  }
}

/**
 * Create fallback analysis if JSON parsing fails
 */
function createFallbackAnalysis(brief: ThemeBrief, response: string): MarketAnalysis {
  return {
    brandName: brief.industry.split(' ')[0] + ' Store',
    positioning: `Premium ${brief.industry.toLowerCase()} for ${brief.targetMarket}`,
    targetAudience: {
      demographics: brief.targetMarket,
      psychographics: 'Quality-focused, design-conscious consumers',
      painPoints: ['Finding quality products', 'Trusting online stores', 'Getting good value'],
    },
    differentiation: {
      uniqueValue: `Curated ${brief.industry.toLowerCase()} with exceptional design`,
      competitorGaps: ['Better user experience', 'Stronger visual identity', 'More engaging content'],
      opportunities: ['Niche positioning', 'Premium branding', 'Community building'],
    },
    themeFeatures: {
      mustHave: ['Quick shop', 'Product filtering', 'Mobile-first design'],
      niceToHave: ['Wishlist', 'Size guide', 'Product comparisons'],
      unique: ['3D product viewer', 'AR try-on', 'Style quiz'],
    },
    colorMood: {
      primary: brief.styleDirection === 'luxury' ? 'Deep navy or black' : 'Warm neutral',
      mood: brief.styleDirection,
      reasoning: `Aligns with ${brief.styleDirection} aesthetic and target market expectations`,
    },
  };
}

/**
 * Display market analysis for approval
 */
function displayMarketAnalysis(analysis: MarketAnalysis): void {
  display.proposal('Market Analysis Proposal', `
BRAND NAME: ${analysis.brandName}

POSITIONING
${analysis.positioning}

TARGET AUDIENCE
• Demographics: ${analysis.targetAudience.demographics}
• Psychographics: ${analysis.targetAudience.psychographics}
• Pain Points:
${analysis.targetAudience.painPoints.map(p => `  - ${p}`).join('\n')}

MARKET DIFFERENTIATION
• Unique Value: ${analysis.differentiation.uniqueValue}
• Competitor Gaps:
${analysis.differentiation.competitorGaps.map(g => `  - ${g}`).join('\n')}
• Opportunities:
${analysis.differentiation.opportunities.map(o => `  - ${o}`).join('\n')}

RECOMMENDED THEME FEATURES
Must Have:
${analysis.themeFeatures.mustHave.map(f => `  ✓ ${f}`).join('\n')}

Nice to Have:
${analysis.themeFeatures.niceToHave.map(f => `  ○ ${f}`).join('\n')}

Unique/Differentiating:
${analysis.themeFeatures.unique.map(f => `  ★ ${f}`).join('\n')}

COLOR & MOOD
• Primary Direction: ${analysis.colorMood.primary}
• Overall Mood: ${analysis.colorMood.mood}
• Reasoning: ${analysis.colorMood.reasoning}
`);
}

/**
 * Load a prompt template from the prompts directory
 */
async function loadPromptTemplate(filename: string): Promise<string> {
  const templatePath = join(PATHS.prompts, filename);
  try {
    return await readFile(templatePath, 'utf-8');
  } catch {
    // Return a default template if file doesn't exist
    return getDefaultMarketAnalysisPrompt();
  }
}

/**
 * Default market analysis prompt if template file doesn't exist
 */
function getDefaultMarketAnalysisPrompt(): string {
  return `You are a senior e-commerce strategist and brand consultant. Analyze the following brief and generate a comprehensive market analysis.

BRIEF:
- Industry/Niche: {{INDUSTRY}}
- Target Market: {{TARGET_MARKET}}
- Style Direction: {{STYLE_DIRECTION}}
- Competitors: {{COMPETITORS}}

Generate a detailed market analysis in the following JSON format:

{
  "brandName": "Suggested brand/store name",
  "positioning": "One-paragraph positioning statement",
  "targetAudience": {
    "demographics": "Age, income, location details",
    "psychographics": "Values, lifestyle, interests",
    "painPoints": ["Pain point 1", "Pain point 2", "Pain point 3"]
  },
  "differentiation": {
    "uniqueValue": "Core unique value proposition",
    "competitorGaps": ["Gap 1", "Gap 2", "Gap 3"],
    "opportunities": ["Opportunity 1", "Opportunity 2", "Opportunity 3"]
  },
  "themeFeatures": {
    "mustHave": ["Feature 1", "Feature 2", "Feature 3"],
    "niceToHave": ["Feature 1", "Feature 2", "Feature 3"],
    "unique": ["Unique feature 1", "Unique feature 2"]
  },
  "colorMood": {
    "primary": "Primary color direction",
    "mood": "Overall mood/feeling",
    "reasoning": "Why this fits the brand"
  }
}

Respond with valid JSON only, no additional text.`;
}

export default runBriefPhase;
