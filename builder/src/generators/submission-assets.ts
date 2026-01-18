/**
 * Submission Assets Generator
 * Creates all required images for Shopify Theme Store submission
 */

import { mkdir, writeFile } from 'fs/promises';
import { join } from 'path';
import puppeteer, { Browser, Page } from 'puppeteer';
import type { SessionState } from '../types.js';
import { PATHS } from '../config.js';

// Shopify Theme Store required dimensions
export const SUBMISSION_DIMENSIONS = {
  keyFeature: { width: 1200, height: 900 },
  thumbnail: { width: 1200, height: 900 },
  desktopPreview: { width: 1920, height: 1080 },
  mobilePreview: { width: 750, height: 1334 },
};

export interface SubmissionAsset {
  name: string;
  path: string;
  dimensions: { width: number; height: number };
  description: string;
}

export interface SubmissionAssetsResult {
  outputDir: string;
  assets: SubmissionAsset[];
  manifest: SubmissionManifest;
}

export interface SubmissionManifest {
  themeName: string;
  generatedAt: string;
  previewUrl: string;
  assets: {
    keyFeatures: string[];
    thumbnail: string;
    desktopPreview: string;
    mobilePreview: string;
  };
}

export interface FeatureHighlight {
  name: string;
  description: string;
  selector?: string;
  url?: string;
}

/**
 * Capture a screenshot at specific dimensions
 */
async function captureScreenshot(
  page: Page,
  url: string,
  outputPath: string,
  dimensions: { width: number; height: number },
  options?: {
    fullPage?: boolean;
    waitForSelector?: string;
    scrollToSelector?: string;
  }
): Promise<void> {
  await page.setViewport(dimensions);
  await page.goto(url, { waitUntil: 'networkidle0', timeout: 60000 });

  // Wait for any specified selector
  if (options?.waitForSelector) {
    await page.waitForSelector(options.waitForSelector, { timeout: 10000 }).catch(() => {
      // Continue even if selector not found
    });
  }

  // Scroll to specific element if needed
  if (options?.scrollToSelector) {
    await page.evaluate((selector) => {
      const element = document.querySelector(selector);
      if (element) {
        element.scrollIntoView({ behavior: 'instant', block: 'center' });
      }
    }, options.scrollToSelector);
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  // Hide any development banners or Shopify preview bars
  await page.evaluate(() => {
    const selectors = [
      '.shopify-preview-bar',
      '#preview-bar-iframe',
      '.development-mode-banner',
      '[data-shopify-editor-bar]',
    ];
    selectors.forEach(selector => {
      const elements = document.querySelectorAll(selector);
      elements.forEach(el => {
        (el as HTMLElement).style.display = 'none';
      });
    });
  });

  await page.screenshot({
    path: outputPath,
    type: 'png',
    fullPage: options?.fullPage ?? false,
  });
}

/**
 * Generate key feature images with annotations
 * These showcase unique theme features with callouts
 */
async function generateKeyFeatureImages(
  browser: Browser,
  previewUrl: string,
  outputDir: string,
  features: FeatureHighlight[]
): Promise<SubmissionAsset[]> {
  const page = await browser.newPage();
  const assets: SubmissionAsset[] = [];
  const { width, height } = SUBMISSION_DIMENSIONS.keyFeature;

  for (let i = 0; i < Math.min(features.length, 3); i++) {
    const feature = features[i];
    const filename = `key-feature-${i + 1}.png`;
    const outputPath = join(outputDir, filename);

    // Navigate to feature URL or homepage
    const url = feature.url || previewUrl;

    await page.setViewport({ width, height });
    await page.goto(url, { waitUntil: 'networkidle0', timeout: 60000 });

    // Scroll to feature element if selector provided
    if (feature.selector) {
      await page.evaluate((selector) => {
        const element = document.querySelector(selector);
        if (element) {
          element.scrollIntoView({ behavior: 'instant', block: 'center' });
        }
      }, feature.selector);
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    // Add annotation overlay
    await page.evaluate((featureName, featureDesc) => {
      // Create annotation container
      const overlay = document.createElement('div');
      overlay.style.cssText = `
        position: fixed;
        bottom: 40px;
        left: 40px;
        right: 40px;
        background: linear-gradient(135deg, rgba(0,0,0,0.9), rgba(30,30,30,0.95));
        color: white;
        padding: 24px 32px;
        border-radius: 12px;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        z-index: 99999;
        box-shadow: 0 8px 32px rgba(0,0,0,0.3);
        border: 1px solid rgba(255,255,255,0.1);
      `;

      const title = document.createElement('div');
      title.style.cssText = `
        font-size: 28px;
        font-weight: 700;
        margin-bottom: 8px;
        letter-spacing: -0.5px;
      `;
      title.textContent = featureName;

      const desc = document.createElement('div');
      desc.style.cssText = `
        font-size: 16px;
        opacity: 0.85;
        line-height: 1.5;
      `;
      desc.textContent = featureDesc;

      overlay.appendChild(title);
      overlay.appendChild(desc);
      document.body.appendChild(overlay);
    }, feature.name, feature.description);

    await page.screenshot({
      path: outputPath,
      type: 'png',
    });

    assets.push({
      name: `Key Feature ${i + 1}: ${feature.name}`,
      path: outputPath,
      dimensions: { width, height },
      description: feature.description,
    });
  }

  await page.close();
  return assets;
}

/**
 * Generate theme thumbnail (clean homepage shot)
 */
async function generateThumbnail(
  browser: Browser,
  previewUrl: string,
  outputDir: string,
  themeName: string
): Promise<SubmissionAsset> {
  const page = await browser.newPage();
  const { width, height } = SUBMISSION_DIMENSIONS.thumbnail;
  const filename = 'theme-thumbnail.png';
  const outputPath = join(outputDir, filename);

  await captureScreenshot(page, previewUrl, outputPath, { width, height });

  // Add subtle theme name watermark
  await page.evaluate((name) => {
    const watermark = document.createElement('div');
    watermark.style.cssText = `
      position: fixed;
      bottom: 20px;
      right: 20px;
      background: rgba(0,0,0,0.7);
      color: white;
      padding: 8px 16px;
      border-radius: 4px;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      font-size: 14px;
      font-weight: 500;
      z-index: 99999;
    `;
    watermark.textContent = name;
    document.body.appendChild(watermark);
  }, themeName);

  await page.screenshot({
    path: outputPath,
    type: 'png',
  });

  await page.close();

  return {
    name: 'Theme Thumbnail',
    path: outputPath,
    dimensions: { width, height },
    description: 'Main theme thumbnail for store listing',
  };
}

/**
 * Generate desktop preview (full homepage)
 */
async function generateDesktopPreview(
  browser: Browser,
  previewUrl: string,
  outputDir: string
): Promise<SubmissionAsset> {
  const page = await browser.newPage();
  const { width, height } = SUBMISSION_DIMENSIONS.desktopPreview;
  const filename = 'desktop-preview.png';
  const outputPath = join(outputDir, filename);

  await captureScreenshot(page, previewUrl, outputPath, { width, height });
  await page.close();

  return {
    name: 'Desktop Preview',
    path: outputPath,
    dimensions: { width, height },
    description: 'Full desktop homepage preview',
  };
}

/**
 * Generate mobile preview
 */
async function generateMobilePreview(
  browser: Browser,
  previewUrl: string,
  outputDir: string
): Promise<SubmissionAsset> {
  const page = await browser.newPage();
  const { width, height } = SUBMISSION_DIMENSIONS.mobilePreview;
  const filename = 'mobile-preview.png';
  const outputPath = join(outputDir, filename);

  // Set mobile viewport with device scale factor
  await page.setViewport({
    width,
    height,
    deviceScaleFactor: 2,
    isMobile: true,
    hasTouch: true,
  });

  await page.goto(previewUrl, { waitUntil: 'networkidle0', timeout: 60000 });

  // Hide preview bars
  await page.evaluate(() => {
    const selectors = [
      '.shopify-preview-bar',
      '#preview-bar-iframe',
    ];
    selectors.forEach(selector => {
      const elements = document.querySelectorAll(selector);
      elements.forEach(el => {
        (el as HTMLElement).style.display = 'none';
      });
    });
  });

  await page.screenshot({
    path: outputPath,
    type: 'png',
  });

  await page.close();

  return {
    name: 'Mobile Preview',
    path: outputPath,
    dimensions: { width, height },
    description: 'Mobile homepage preview',
  };
}

/**
 * Main function to generate all submission assets
 */
export async function generateSubmissionAssets(
  session: SessionState,
  previewUrl: string,
  features: FeatureHighlight[]
): Promise<SubmissionAssetsResult> {
  const themeName = session.themeName || session.id;
  const outputDir = join(PATHS.output, themeName, 'submission');

  // Create output directory
  await mkdir(outputDir, { recursive: true });

  // Launch browser
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  try {
    const assets: SubmissionAsset[] = [];

    // Generate key feature images (3 required)
    const keyFeatureAssets = await generateKeyFeatureImages(
      browser,
      previewUrl,
      outputDir,
      features
    );
    assets.push(...keyFeatureAssets);

    // Generate thumbnail
    const thumbnail = await generateThumbnail(browser, previewUrl, outputDir, themeName);
    assets.push(thumbnail);

    // Generate desktop preview
    const desktopPreview = await generateDesktopPreview(browser, previewUrl, outputDir);
    assets.push(desktopPreview);

    // Generate mobile preview
    const mobilePreview = await generateMobilePreview(browser, previewUrl, outputDir);
    assets.push(mobilePreview);

    // Create manifest
    const manifest: SubmissionManifest = {
      themeName,
      generatedAt: new Date().toISOString(),
      previewUrl,
      assets: {
        keyFeatures: keyFeatureAssets.map(a => a.path),
        thumbnail: thumbnail.path,
        desktopPreview: desktopPreview.path,
        mobilePreview: mobilePreview.path,
      },
    };

    // Save manifest
    await writeFile(
      join(outputDir, 'submission-manifest.json'),
      JSON.stringify(manifest, null, 2)
    );

    return {
      outputDir,
      assets,
      manifest,
    };
  } finally {
    await browser.close();
  }
}

/**
 * Get default feature highlights based on session data
 */
export function getDefaultFeatures(session: SessionState): FeatureHighlight[] {
  const features: FeatureHighlight[] = [];

  // Add features based on what was generated in the session
  if (session.newSections && session.newSections.length > 0) {
    // Feature 1: Highlight first new section
    const firstSection = session.newSections[0];
    features.push({
      name: firstSection.name || 'Custom Section',
      description: firstSection.description || 'Unique section designed specifically for this theme',
      selector: `[data-section-type="${firstSection.filename?.replace('.liquid', '')}"]`,
    });

    // Feature 2: Second new section if available
    if (session.newSections.length > 1) {
      const secondSection = session.newSections[1];
      features.push({
        name: secondSection.name || 'Interactive Component',
        description: secondSection.description || 'Enhanced user experience with interactive elements',
        selector: `[data-section-type="${secondSection.filename?.replace('.liquid', '')}"]`,
      });
    }
  }

  // Feature 3: Design system / overall aesthetic
  features.push({
    name: 'Custom Design System',
    description: 'Carefully crafted color palette, typography, and spacing for a cohesive brand experience',
  });

  // Ensure we have at least 3 features
  while (features.length < 3) {
    features.push({
      name: 'Responsive Design',
      description: 'Optimized layouts for desktop, tablet, and mobile devices',
    });
  }

  return features.slice(0, 3);
}

/**
 * Get submission assets summary for display
 */
export function getSubmissionAssetsSummary(result: SubmissionAssetsResult): string {
  return `
Submission Assets Generated
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📸 Key Feature Images (${result.assets.filter(a => a.name.startsWith('Key Feature')).length}/3)
${result.assets
  .filter(a => a.name.startsWith('Key Feature'))
  .map(a => `   • ${a.name}`)
  .join('\n')}

🖼️ Theme Assets
   • Theme Thumbnail (1200x900)
   • Desktop Preview (1920x1080)
   • Mobile Preview (750x1334)

📁 Output Directory
   ${result.outputDir}

✅ All required submission images generated!
`.trim();
}
