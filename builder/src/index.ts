#!/usr/bin/env node

import { validateConfig, PATHS } from './config.js';
import { display } from './ui/display.js';
import { promptMainMenu, promptResume } from './ui/prompts.js';
import { SessionManager } from './session/state.js';
import type { Phase, SessionState } from './types.js';

// Phase imports
import { runBriefPhase } from './phases/1-brief.js';
import { runProductsPhase } from './phases/2-products.js';
// Future phase imports (to be implemented)
// import { runImagesPhase } from './phases/3-images.js';
// import { runDifferentiationPhase } from './phases/4-differentiation.js';
// import { runDesignSystemPhase } from './phases/5-design-system.js';
// import { runCodeGenerationPhase } from './phases/6-code-generation.js';
// import { runTestingPhase } from './phases/7-testing.js';
// import { runSubmissionPhase } from './phases/8-submission.js';

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

async function main(): Promise<void> {
  display.banner();
  display.divider();

  // Validate configuration
  const configStatus = validateConfig();
  if (!configStatus.valid) {
    display.error('Missing required environment variables:');
    configStatus.missing.forEach((key) => display.error(`  - ${key}`));
    display.info('\nCopy builder/.env.example to builder/.env and fill in your values.');
    process.exit(1);
  }

  display.success('Configuration validated');
  display.divider();

  // Initialize session manager
  const sessionManager = new SessionManager(PATHS.sessions);

  // Check for existing sessions
  const existingSessions = await sessionManager.listSessions();

  let session: SessionState;

  if (existingSessions.length > 0) {
    const choice = await promptResume(existingSessions);

    if (choice === 'new') {
      session = await sessionManager.createSession();
      display.success(`Created new session: ${session.id}`);
    } else {
      session = await sessionManager.loadSession(choice);
      display.success(`Resumed session: ${session.id}`);
      display.info(`Continuing from phase: ${session.currentPhase}`);
    }
  } else {
    session = await sessionManager.createSession();
    display.success(`Created new session: ${session.id}`);
  }

  display.divider();

  // Run the generation flow
  try {
    await runGenerationFlow(session, sessionManager);
  } catch (error) {
    display.error('An error occurred during generation:');
    display.error(error instanceof Error ? error.message : String(error));

    // Auto-save on error
    await sessionManager.saveSession(session);
    display.info('Session saved. You can resume later.');

    process.exit(1);
  }
}

async function runGenerationFlow(
  session: SessionState,
  sessionManager: SessionManager
): Promise<void> {
  const startIndex = PHASE_ORDER.indexOf(session.currentPhase);

  for (let i = startIndex; i < PHASE_ORDER.length; i++) {
    const phase = PHASE_ORDER[i];
    session.currentPhase = phase;

    display.phaseHeader(getPhaseTitle(phase), i + 1, PHASE_ORDER.length);

    // Run the phase (placeholder for now)
    await runPhase(phase, session);

    // Save after each phase
    session.lastUpdatedAt = new Date();
    await sessionManager.saveSession(session);

    display.success(`Phase ${i + 1}/${PHASE_ORDER.length} complete`);
    display.divider();
  }

  display.banner();
  display.success('Theme generation complete!');
  display.info(`Output directory: ${PATHS.output}/${session.themeName || session.id}`);
}

async function runPhase(phase: Phase, session: SessionState): Promise<void> {
  switch (phase) {
    case 'brief':
      await runBriefPhase(session);
      break;
    case 'products':
      await runProductsPhase(session);
      break;
    case 'images':
      display.info('Image Generation phase - implementation pending');
      display.warning('Skipping to next phase...');
      break;
    case 'differentiation':
      display.info('Theme Differentiation phase - implementation pending');
      display.warning('Skipping to next phase...');
      break;
    case 'design-system':
      display.info('Design System phase - implementation pending');
      display.warning('Skipping to next phase...');
      break;
    case 'code-generation':
      display.info('Code Generation phase - implementation pending');
      display.warning('Skipping to next phase...');
      break;
    case 'testing':
      display.info('Testing phase - implementation pending');
      display.warning('Skipping to next phase...');
      break;
    case 'submission':
      display.info('Submission Assets phase - implementation pending');
      display.warning('Skipping to next phase...');
      break;
  }
}

function getPhaseTitle(phase: Phase): string {
  const titles: Record<Phase, string> = {
    brief: 'Brief & Market Analysis',
    products: 'Product Catalog Definition',
    images: 'Core Product Images',
    differentiation: 'Theme Differentiation',
    'design-system': 'Design System',
    'code-generation': 'Code Generation',
    testing: 'Preview & Testing',
    submission: 'Submission Assets',
  };
  return titles[phase];
}

// Run the application
main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
