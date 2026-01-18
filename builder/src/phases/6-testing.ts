import { display } from '../ui/display.js';
import { promptConfirm, promptSelect } from '../ui/prompts.js';
import { generateTestTheme, getTestThemeSections } from '../testing/test-theme.js';
import { getShopifyCLI } from '../testing/shopify-cli.js';
import { captureScreenshots, getScreenshotSummary } from '../testing/screenshots.js';
import { openUrl, openDirectory } from '../ui/image-viewer.js';
import type { SessionState, TestResult } from '../types.js';
import { join } from 'path';
import { PATHS } from '../config.js';

/**
 * Phase 6: Testing
 *
 * Tests the generated theme:
 * 1. Generate test theme (full copy with focused homepage)
 * 2. Run Theme Check validation
 * 3. Push to Shopify as unpublished
 * 4. Capture screenshots
 * 5. Manual review with approval
 * 6. Cleanup test theme
 */
export async function runTestingPhase(session: SessionState): Promise<void> {
  const outputDir = join(PATHS.output, session.themeName || session.id);
  let testThemeId: string | null = null;

  display.sectionHeader('Testing Framework');
  display.info('This phase will test your generated theme on Shopify.');
  display.newline();

  display.text('Testing process:');
  display.numberedList([
    'Generate test theme (full theme with focused homepage)',
    'Run Shopify Theme Check for validation',
    'Push to your dev store as unpublished',
    'Capture screenshots of key pages',
    'Manual review and approval',
    'Cleanup test theme from store',
  ]);
  display.newline();

  const proceed = await promptConfirm('Ready to begin testing?', true);
  if (!proceed) {
    display.info('Skipping testing phase. You can run tests manually.');
    return;
  }

  try {
    // Step 1: Generate test theme
    display.sectionHeader('Step 1: Generate Test Theme');

    const testThemePath = await generateTestTheme(session);
    display.success(`Test theme generated: ${testThemePath}`);

    // Show what's in the test homepage
    const testSections = getTestThemeSections(session);
    display.info('Test homepage will show:');
    display.list(testSections);

    // Step 2: Run Theme Check
    display.sectionHeader('Step 2: Theme Check Validation');

    const cli = getShopifyCLI();
    const checkResult = await cli.runThemeCheck(testThemePath);

    if (checkResult.errors.length > 0) {
      display.error(`Theme Check found ${checkResult.errors.length} errors:`);
      for (const error of checkResult.errors.slice(0, 10)) {
        display.error(`  • ${error}`);
      }
      if (checkResult.errors.length > 10) {
        display.error(`  ... and ${checkResult.errors.length - 10} more`);
      }

      session.testResults.push({
        passed: false,
        category: 'theme-check',
        name: 'Theme Check Validation',
        message: `${checkResult.errors.length} errors found`,
        severity: 'error',
      });

      const continueAnyway = await promptConfirm('Continue with errors?', false);
      if (!continueAnyway) {
        display.info('Fix errors and resume testing.');
        return;
      }
    } else {
      display.success('Theme Check passed!');
      session.testResults.push({
        passed: true,
        category: 'theme-check',
        name: 'Theme Check Validation',
        severity: 'info',
      });
    }

    if (checkResult.warnings.length > 0) {
      display.warning(`${checkResult.warnings.length} warnings found`);
      for (const warning of checkResult.warnings.slice(0, 5)) {
        display.warning(`  • ${warning}`);
      }
    }

    // Step 3: Push to Shopify
    display.sectionHeader('Step 3: Push to Shopify');

    const themeName = `${session.themeName || 'Theme'} - Test ${Date.now()}`;
    display.info(`Pushing theme as: ${themeName}`);

    const pushResult = await cli.pushTheme(testThemePath, themeName);

    if (!pushResult.success) {
      display.error(`Failed to push theme: ${pushResult.error}`);
      session.testResults.push({
        passed: false,
        category: 'shopify-push',
        name: 'Theme Push',
        message: pushResult.error,
        severity: 'error',
      });
      return;
    }

    testThemeId = pushResult.themeId || null;
    const previewUrl = pushResult.previewUrl || '';

    display.success('Theme pushed successfully!');
    display.keyValue('Theme ID', testThemeId || 'Unknown');
    display.keyValue('Preview URL', previewUrl);

    session.testResults.push({
      passed: true,
      category: 'shopify-push',
      name: 'Theme Push',
      message: `Theme ID: ${testThemeId}`,
      severity: 'info',
    });

    // Open preview in browser
    const openPreview = await promptConfirm('Open preview in browser?', true);
    if (openPreview && previewUrl) {
      await openUrl(previewUrl);
    }

    // Step 4: Capture screenshots
    display.sectionHeader('Step 4: Capture Screenshots');

    if (previewUrl) {
      const screenshotManifest = await captureScreenshots(previewUrl, outputDir);
      const summary = getScreenshotSummary(screenshotManifest);
      display.text(summary);

      const successCount = screenshotManifest.screenshots.filter((s) => s.success).length;
      session.testResults.push({
        passed: successCount > 0,
        category: 'screenshots',
        name: 'Screenshot Capture',
        message: `${successCount}/${screenshotManifest.screenshots.length} captured`,
        severity: successCount === 0 ? 'warning' : 'info',
      });

      const openScreenshots = await promptConfirm('Open screenshots directory?', false);
      if (openScreenshots) {
        await openDirectory(join(outputDir, 'screenshots'));
      }
    } else {
      display.warning('No preview URL available for screenshots');
    }

    // Step 5: Manual review
    display.sectionHeader('Step 5: Manual Review');

    display.info('Please review the theme in your browser.');
    display.text('\nCheck the following:');
    display.list([
      'Header displays correctly on desktop and mobile',
      'Footer displays correctly',
      'New sections render properly',
      'Modified sections work as expected',
      'JavaScript interactions function correctly',
      'Colors and typography match design system',
      'No console errors in browser dev tools',
    ]);
    display.newline();

    const reviewResult = await promptSelect<string>(
      'How does the theme look?',
      [
        { name: 'Looks good - ready for final packaging', value: 'pass' },
        { name: 'Minor issues - note them and continue', value: 'minor' },
        { name: 'Major issues - need to fix before continuing', value: 'fail' },
      ]
    );

    session.testResults.push({
      passed: reviewResult !== 'fail',
      category: 'manual-review',
      name: 'Visual Review',
      message: reviewResult === 'pass' ? 'Approved' : reviewResult === 'minor' ? 'Minor issues noted' : 'Failed review',
      severity: reviewResult === 'fail' ? 'error' : reviewResult === 'minor' ? 'warning' : 'info',
    });

    if (reviewResult === 'fail') {
      display.warning('Theme failed manual review. Fix issues and re-run testing.');
    } else {
      display.success('Testing complete!');
    }

  } finally {
    // Step 6: Cleanup
    display.sectionHeader('Step 6: Cleanup');

    if (testThemeId) {
      const cleanup = await promptConfirm('Delete test theme from Shopify?', true);
      if (cleanup) {
        const cli = getShopifyCLI();
        const deleted = await cli.deleteTheme(testThemeId);
        if (deleted) {
          display.success('Test theme deleted');
        } else {
          display.warning('Could not delete test theme - clean up manually');
        }
      } else {
        display.info(`Test theme remains on store. Theme ID: ${testThemeId}`);
      }
    }
  }

  // Summary
  display.divider();
  display.sectionHeader('Test Results Summary');

  const passed = session.testResults.filter((r) => r.passed).length;
  const failed = session.testResults.filter((r) => !r.passed).length;

  display.keyValue('Passed', String(passed));
  display.keyValue('Failed', String(failed));

  for (const result of session.testResults) {
    const icon = result.passed ? '✓' : '✗';
    const color = result.passed ? 'success' : 'error';
    display.text(`  ${icon} ${result.name}: ${result.message || 'OK'}`);
  }
}

export default runTestingPhase;
