import { display } from '../ui/display.js';
import { promptSelect } from '../ui/prompts.js';
import type { SessionState, Phase } from '../types.js';

const PHASE_ORDER: Phase[] = [
  'brief',
  'products',
  'images',
  'differentiation',
  'design-system',
  'code-generation',
  'testing',
  'submission',
];

/**
 * Display session resume information
 */
export function displaySessionInfo(session: SessionState): void {
  display.sectionHeader('Session Information');

  display.keyValue('Session ID', session.id);
  display.keyValue('Theme Name', session.themeName || '(not set)');
  display.keyValue('Started', formatDate(session.startedAt));
  display.keyValue('Last Updated', formatDate(session.lastUpdatedAt));
  display.keyValue('Current Phase', formatPhase(session.currentPhase));
  display.newline();

  // Show progress
  const currentIndex = PHASE_ORDER.indexOf(session.currentPhase);
  const completedPhases = PHASE_ORDER.slice(0, currentIndex);
  const remainingPhases = PHASE_ORDER.slice(currentIndex);

  if (completedPhases.length > 0) {
    display.text('Completed phases:');
    display.list(completedPhases.map(formatPhase));
    display.newline();
  }

  display.text('Remaining phases:');
  display.list(remainingPhases.map(formatPhase));
  display.newline();

  // Show data summary
  displayDataSummary(session);
}

/**
 * Display summary of collected data
 */
function displayDataSummary(session: SessionState): void {
  display.sectionHeader('Data Summary');

  // Brief
  if (session.brief) {
    display.keyValue('Industry', session.brief.industry);
    display.keyValue('Target Market', session.brief.targetMarket);
    display.keyValue('Brand Name', session.brief.brandName || '(not set)');
  } else {
    display.keyValue('Brief', '(not collected)');
  }

  // Products
  display.keyValue('Products', `${session.products.length} defined`);

  // Count products with images
  const productsWithImages = session.products.filter(
    (p) => p.images.studio !== null
  ).length;
  display.keyValue('Products with images', `${productsWithImages}`);

  // Sections
  const newSections = session.sections.filter((s) => s.type === 'new').length;
  const modifiedSections = session.sections.filter(
    (s) => s.type === 'modified'
  ).length;
  display.keyValue(
    'Sections',
    `${newSections} new, ${modifiedSections} modified`
  );

  // Design System
  display.keyValue('Design System', session.designSystem ? 'configured' : '(not set)');

  // Test Results
  const passedTests = session.testResults.filter((t) => t.passed).length;
  const totalTests = session.testResults.length;
  if (totalTests > 0) {
    display.keyValue('Test Results', `${passedTests}/${totalTests} passed`);
  }

  // Submission Assets
  const assetsCount = countSubmissionAssets(session.submissionAssets);
  display.keyValue('Submission Assets', `${assetsCount} generated`);

  display.newline();
}

/**
 * Prompt user for resume options
 */
export async function promptResumeOptions(
  session: SessionState
): Promise<'continue' | 'restart-phase' | 'restart-all'> {
  const currentPhase = formatPhase(session.currentPhase);

  const choice = await promptSelect<'continue' | 'restart-phase' | 'restart-all'>(
    'How would you like to proceed?',
    [
      {
        name: `Continue from ${currentPhase}`,
        value: 'continue',
      },
      {
        name: `Restart ${currentPhase} from beginning`,
        value: 'restart-phase',
      },
      {
        name: 'Start over (keep session data)',
        value: 'restart-all',
      },
    ]
  );

  return choice;
}

/**
 * Reset session to beginning of a phase
 */
export function resetToPhase(session: SessionState, phase: Phase): void {
  session.currentPhase = phase;

  // Remove approval records for this phase and later
  const phaseIndex = PHASE_ORDER.indexOf(phase);
  session.approvalHistory = session.approvalHistory.filter((record) => {
    const recordPhaseIndex = PHASE_ORDER.indexOf(record.phase);
    return recordPhaseIndex < phaseIndex;
  });

  // Clear phase-specific data based on which phase we're resetting to
  switch (phase) {
    case 'brief':
      session.brief = null;
      session.products = [];
      session.sections = [];
      session.designSystem = null;
      session.testResults = [];
      clearSubmissionAssets(session);
      break;
    case 'products':
      session.products = [];
      // Keep brief
      session.sections = [];
      session.designSystem = null;
      session.testResults = [];
      clearSubmissionAssets(session);
      break;
    case 'images':
      // Clear image data from products
      session.products = session.products.map((p) => ({
        ...p,
        images: { studio: null, angles: [], lifestyle: [] },
      }));
      session.testResults = [];
      clearSubmissionAssets(session);
      break;
    case 'differentiation':
      session.sections = [];
      session.designSystem = null;
      session.testResults = [];
      clearSubmissionAssets(session);
      break;
    case 'design-system':
      session.designSystem = null;
      session.testResults = [];
      clearSubmissionAssets(session);
      break;
    case 'code-generation':
      session.testResults = [];
      clearSubmissionAssets(session);
      break;
    case 'testing':
      session.testResults = [];
      clearSubmissionAssets(session);
      break;
    case 'submission':
      clearSubmissionAssets(session);
      break;
  }
}

// Helper functions

function formatDate(date: Date): string {
  return new Date(date).toLocaleString();
}

function formatPhase(phase: Phase): string {
  const names: Record<Phase, string> = {
    brief: 'Brief & Market Analysis',
    products: 'Product Catalog',
    images: 'Image Generation',
    differentiation: 'Theme Differentiation',
    'design-system': 'Design System',
    'code-generation': 'Code Generation',
    testing: 'Preview & Testing',
    submission: 'Submission Assets',
  };
  return names[phase];
}

function countSubmissionAssets(assets: SessionState['submissionAssets']): number {
  if (!assets) return 0;
  let count = 0;
  if (assets.thumbnail) count++;
  if (assets.desktopPreview) count++;
  if (assets.mobilePreview) count++;
  if (assets.keyFeatureImages) count += assets.keyFeatureImages.length;
  if (assets.keyFeatures) count += assets.keyFeatures.length;
  if (assets.assets?.keyFeatures) count += assets.assets.keyFeatures.length;
  if (assets.documentation) count++;
  return count;
}

function clearSubmissionAssets(session: SessionState): void {
  session.submissionAssets = {
    thumbnail: null,
    desktopPreview: null,
    mobilePreview: null,
    keyFeatureImages: [],
    documentation: null,
  };
}
