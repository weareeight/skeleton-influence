/**
 * Phase 7: Submission Assets
 *
 * Final phase that generates everything needed for Shopify Theme Store submission:
 * 1. Package theme into ZIP
 * 2. Generate submission images (key features, thumbnail, previews)
 * 3. Generate documentation
 * 4. Run final verification
 * 5. Present summary for approval
 */

import { display } from '../ui/display.js';
import { promptConfirm, promptSelect, promptText } from '../ui/prompts.js';
import type { SessionState } from '../types.js';
import {
  packageTheme,
  verifyThemePackage,
  getPackageSummary,
} from '../generators/theme-package.js';
import {
  generateSubmissionAssets,
  getDefaultFeatures,
  getSubmissionAssetsSummary,
  type FeatureHighlight,
} from '../generators/submission-assets.js';
import {
  generateDocumentation,
  getDocumentationSummary,
} from '../generators/documentation.js';
import { ShopifyCLI, getShopifyCLI } from '../testing/shopify-cli.js';

export async function runSubmissionPhase(session: SessionState): Promise<void> {
  display.phase('Phase 7: Submission Assets');

  const themeName = session.themeName || session.id;

  // ═══════════════════════════════════════════════════════════════════════════
  // Step 1: Package Theme
  // ═══════════════════════════════════════════════════════════════════════════
  display.step(1, 5, 'Packaging theme');
  display.info('Assembling complete theme from base + generated files...');

  let packageResult;
  try {
    packageResult = await packageTheme(session);
    display.success('Theme packaged successfully');
    display.box(getPackageSummary(packageResult));
  } catch (error) {
    display.error(`Failed to package theme: ${error}`);
    throw error;
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // Step 2: Verify Theme Package
  // ═══════════════════════════════════════════════════════════════════════════
  display.step(2, 5, 'Verifying theme package');

  const verification = await verifyThemePackage(packageResult.themePath);

  if (!verification.valid) {
    display.error('Theme verification failed:');
    verification.errors.forEach(err => display.error(`  • ${err}`));

    const proceed = await promptConfirm(
      'Theme has errors. Continue anyway?',
      false
    );
    if (!proceed) {
      throw new Error('Theme verification failed - aborting submission');
    }
  } else {
    display.success('Theme verification passed');
  }

  if (verification.warnings.length > 0) {
    display.warning('Warnings:');
    verification.warnings.forEach(warn => display.warning(`  • ${warn}`));
  }

  // Run Theme Check if Shopify CLI available
  display.info('Running Shopify Theme Check...');
  try {
    const cli = getShopifyCLI();
    const checkResult = await cli.runThemeCheck(packageResult.themePath);

    if (checkResult.passed) {
      display.success(`Theme Check passed (${checkResult.warnings.length} warnings)`);
    } else {
      display.error(`Theme Check found ${checkResult.errors.length} errors:`);
      checkResult.errors.slice(0, 5).forEach(err => display.error(`  • ${err}`));
      if (checkResult.errors.length > 5) {
        display.warning(`  ... and ${checkResult.errors.length - 5} more errors`);
      }
    }
  } catch (error) {
    display.warning('Could not run Theme Check (Shopify CLI may not be installed)');
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // Step 3: Generate Submission Assets
  // ═══════════════════════════════════════════════════════════════════════════
  display.step(3, 5, 'Generating submission assets');

  // Check if we have a preview URL from testing phase
  let previewUrl = session.testThemePreviewUrl;

  if (!previewUrl) {
    display.warning('No preview URL found from testing phase.');
    display.info('Submission assets require a live Shopify preview URL.');

    const pushNow = await promptConfirm(
      'Push theme to Shopify now for screenshots?',
      true
    );

    if (pushNow) {
      try {
        const cli = getShopifyCLI();
        display.info('Pushing theme to Shopify...');
        const pushResult = await cli.pushTheme(
          packageResult.themePath,
          `${themeName}-submission-preview`
        );

        if (pushResult.success && pushResult.previewUrl) {
          previewUrl = pushResult.previewUrl;
          session.submissionThemeId = pushResult.themeId;
          display.success(`Theme pushed: ${previewUrl}`);
        } else {
          throw new Error('Push failed');
        }
      } catch (error) {
        display.error('Failed to push theme to Shopify');

        // Allow manual URL entry
        previewUrl = await promptText(
          'Enter preview URL manually (or leave empty to skip screenshots):',
          ''
        );
      }
    } else {
      previewUrl = await promptText(
        'Enter preview URL manually (or leave empty to skip screenshots):',
        ''
      );
    }
  }

  if (previewUrl) {
    display.info('Capturing submission screenshots...');
    display.info('This may take a minute...');

    // Get feature highlights
    const defaultFeatures = getDefaultFeatures(session);

    // Allow customization of features
    const customizeFeatures = await promptConfirm(
      'Customize feature highlights for screenshots?',
      false
    );

    let features: FeatureHighlight[] = defaultFeatures;

    if (customizeFeatures) {
      features = [];
      for (let i = 0; i < 3; i++) {
        display.info(`\nFeature ${i + 1}:`);
        const name = await promptText(
          'Feature name:',
          defaultFeatures[i]?.name || `Feature ${i + 1}`
        );
        const description = await promptText(
          'Description:',
          defaultFeatures[i]?.description || ''
        );
        features.push({ name, description });
      }
    }

    try {
      const assetsResult = await generateSubmissionAssets(session, previewUrl, features);
      display.success('Submission assets generated');
      display.box(getSubmissionAssetsSummary(assetsResult));

      // Store in session
      session.submissionAssets = assetsResult.manifest;
    } catch (error) {
      display.error(`Failed to generate submission assets: ${error}`);
      display.warning('Continuing without screenshots...');
    }
  } else {
    display.warning('Skipping submission screenshots (no preview URL)');
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // Step 4: Generate Documentation
  // ═══════════════════════════════════════════════════════════════════════════
  display.step(4, 5, 'Generating documentation');

  try {
    const docsResult = await generateDocumentation(session, packageResult.manifest);
    display.success('Documentation generated');
    display.box(getDocumentationSummary(docsResult));

    // Store in session
    session.documentation = docsResult;
  } catch (error) {
    display.error(`Failed to generate documentation: ${error}`);
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // Step 5: Final Summary & Cleanup
  // ═══════════════════════════════════════════════════════════════════════════
  display.step(5, 5, 'Final summary');

  // Calculate differentiation metrics
  const manifest = packageResult.manifest;
  const newSectionsScore = Math.min(manifest.sections.new.length / 4, 1) * 25;
  const modifiedSectionsScore = Math.min(manifest.sections.modified.length / 4, 1) * 25;
  const designSystemScore = session.designSystem ? 25 : 0;
  const headerFooterScore = 25;
  const totalScore = newSectionsScore + modifiedSectionsScore + designSystemScore + headerFooterScore;

  const finalSummary = `
╔════════════════════════════════════════════════════════════════════════════╗
║                        THEME GENERATION COMPLETE                           ║
╠════════════════════════════════════════════════════════════════════════════╣
║                                                                            ║
║  Theme Name: ${themeName.padEnd(58)}║
║  Differentiation Score: ${totalScore.toFixed(0)}%${' '.repeat(50)}║
║                                                                            ║
╠════════════════════════════════════════════════════════════════════════════╣
║  SECTIONS                                                                  ║
║  ────────                                                                  ║
║  New Sections:      ${String(manifest.sections.new.length).padEnd(4)} ${manifest.sections.new.length >= 4 ? '✓' : '✗'} (need 4+)${' '.repeat(35)}║
║  Modified Sections: ${String(manifest.sections.modified.length).padEnd(4)} ${manifest.sections.modified.length >= 4 ? '✓' : '✗'} (need 4+)${' '.repeat(35)}║
║  Total Sections:    ${String(manifest.sections.total).padEnd(52)}║
║                                                                            ║
╠════════════════════════════════════════════════════════════════════════════╣
║  OUTPUT FILES                                                              ║
║  ────────────                                                              ║
║  📦 ${packageResult.zipPath.substring(packageResult.zipPath.lastIndexOf('/') + 1).padEnd(68)}║
║  📄 documentation.md${' '.repeat(52)}║
║  📋 submission-checklist.md${' '.repeat(45)}║
║  📊 generation-report.md${' '.repeat(48)}║
║                                                                            ║
╚════════════════════════════════════════════════════════════════════════════╝
`;

  display.box(finalSummary);

  // Cleanup: offer to delete submission preview theme
  if (session.submissionThemeId) {
    const cleanup = await promptConfirm(
      'Delete the submission preview theme from Shopify?',
      true
    );

    if (cleanup) {
      try {
        const cli = getShopifyCLI();
        await cli.deleteTheme(session.submissionThemeId);
        display.success('Submission preview theme deleted');
      } catch (error) {
        display.warning('Could not delete preview theme - please delete manually');
      }
    }
  }

  // Final approval
  const reviewResult = await promptSelect<string>(
    'Review the generated files. What would you like to do?',
    [
      { name: 'Complete - Ready for submission', value: 'complete' },
      { name: 'Review files before finalizing', value: 'review' },
      { name: 'Regenerate specific components', value: 'regenerate' },
    ]
  );

  if (reviewResult === 'review') {
    display.info('\nGenerated files are located at:');
    display.info(`  ${packageResult.themePath}`);
    display.info('\nReview the files and run the builder again if changes needed.');
  } else if (reviewResult === 'regenerate') {
    display.info('\nTo regenerate specific components, restart the builder');
    display.info('and skip to the relevant phase.');
  }

  // Mark phase complete
  session.completedPhases.push('submission');

  display.success('🎉 Theme generation complete!');
  display.info('');
  display.info('Next steps:');
  display.info('  1. Review submission-checklist.md');
  display.info('  2. Test theme thoroughly on staging store');
  display.info('  3. Submit to Shopify Theme Store via Partner Dashboard');
  display.info('');
}
