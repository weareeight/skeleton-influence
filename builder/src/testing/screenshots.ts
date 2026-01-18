import { mkdir, writeFile } from 'fs/promises';
import { join } from 'path';
import { display } from '../ui/display.js';
import { ProgressTracker } from '../ui/progress.js';

interface ScreenshotConfig {
  previewUrl: string;
  outputDir: string;
  pages: PageConfig[];
  viewports: ViewportConfig[];
}

interface PageConfig {
  name: string;
  path: string;
  waitFor?: string; // CSS selector to wait for
}

interface ViewportConfig {
  name: string;
  width: number;
  height: number;
}

interface ScreenshotResult {
  page: string;
  viewport: string;
  path: string;
  success: boolean;
  error?: string;
}

interface ScreenshotManifest {
  generatedAt: string;
  previewUrl: string;
  screenshots: ScreenshotResult[];
}

// Default pages to capture
const DEFAULT_PAGES: PageConfig[] = [
  { name: 'homepage', path: '/', waitFor: 'main' },
  { name: 'collection', path: '/collections/all', waitFor: '.collection' },
  { name: 'product', path: '/products', waitFor: '.product' }, // Will use first product
  { name: 'cart', path: '/cart', waitFor: '.cart' },
  { name: 'search', path: '/search?q=test', waitFor: '.search' },
];

// Default viewports
const DEFAULT_VIEWPORTS: ViewportConfig[] = [
  { name: 'desktop', width: 1440, height: 900 },
  { name: 'mobile', width: 375, height: 812 },
];

/**
 * Capture screenshots of theme pages using Puppeteer
 */
export async function captureScreenshots(
  previewUrl: string,
  outputDir: string,
  options?: {
    pages?: PageConfig[];
    viewports?: ViewportConfig[];
  }
): Promise<ScreenshotManifest> {
  const screenshotsDir = join(outputDir, 'screenshots');
  await mkdir(screenshotsDir, { recursive: true });

  const config: ScreenshotConfig = {
    previewUrl: previewUrl.replace(/\/$/, ''), // Remove trailing slash
    outputDir: screenshotsDir,
    pages: options?.pages || DEFAULT_PAGES,
    viewports: options?.viewports || DEFAULT_VIEWPORTS,
  };

  const results: ScreenshotResult[] = [];
  const totalScreenshots = config.pages.length * config.viewports.length;

  display.info(`Capturing ${totalScreenshots} screenshots...`);
  const progress = new ProgressTracker('Screenshots', totalScreenshots);

  try {
    // Dynamic import of puppeteer
    const puppeteer = await import('puppeteer');
    const browser = await puppeteer.default.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    try {
      const page = await browser.newPage();

      // Set default timeout
      page.setDefaultTimeout(30000);

      for (const pageConfig of config.pages) {
        for (const viewport of config.viewports) {
          const result = await capturePageScreenshot(
            page,
            config.previewUrl,
            pageConfig,
            viewport,
            config.outputDir
          );
          results.push(result);
          progress.increment();

          if (result.success) {
            display.success(`Captured: ${result.page}-${result.viewport}`);
          } else {
            display.warning(`Failed: ${result.page}-${result.viewport} - ${result.error}`);
          }
        }
      }
    } finally {
      await browser.close();
    }
  } catch (error) {
    display.error(`Puppeteer error: ${error instanceof Error ? error.message : error}`);
    display.warning('Screenshots could not be captured. Is Puppeteer installed correctly?');
  }

  progress.complete();

  // Generate manifest
  const manifest: ScreenshotManifest = {
    generatedAt: new Date().toISOString(),
    previewUrl: config.previewUrl,
    screenshots: results,
  };

  await writeFile(
    join(config.outputDir, 'manifest.json'),
    JSON.stringify(manifest, null, 2),
    'utf-8'
  );

  return manifest;
}

/**
 * Capture a single page screenshot
 */
async function capturePageScreenshot(
  page: Awaited<ReturnType<Awaited<typeof import('puppeteer')>['default']['launch']>> extends { newPage(): Promise<infer P> } ? P : never,
  baseUrl: string,
  pageConfig: PageConfig,
  viewport: ViewportConfig,
  outputDir: string
): Promise<ScreenshotResult> {
  const filename = `${pageConfig.name}-${viewport.name}.png`;
  const filepath = join(outputDir, filename);

  try {
    // Set viewport
    await page.setViewport({
      width: viewport.width,
      height: viewport.height,
    });

    // Navigate to page
    const url = `${baseUrl}${pageConfig.path}`;
    await page.goto(url, {
      waitUntil: 'networkidle2',
      timeout: 30000,
    });

    // Wait for specific element if specified
    if (pageConfig.waitFor) {
      try {
        await page.waitForSelector(pageConfig.waitFor, { timeout: 5000 });
      } catch {
        // Continue even if selector not found
      }
    }

    // Additional wait for animations to settle
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Take screenshot
    await page.screenshot({
      path: filepath,
      fullPage: false, // Just viewport, not full page
    });

    return {
      page: pageConfig.name,
      viewport: viewport.name,
      path: filepath,
      success: true,
    };
  } catch (error) {
    return {
      page: pageConfig.name,
      viewport: viewport.name,
      path: filepath,
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

/**
 * Capture full-page screenshot (for submission assets)
 */
export async function captureFullPageScreenshot(
  previewUrl: string,
  outputPath: string,
  viewport: ViewportConfig = { name: 'desktop', width: 1440, height: 900 }
): Promise<boolean> {
  try {
    const puppeteer = await import('puppeteer');
    const browser = await puppeteer.default.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    try {
      const page = await browser.newPage();
      await page.setViewport({
        width: viewport.width,
        height: viewport.height,
      });

      await page.goto(previewUrl, {
        waitUntil: 'networkidle2',
        timeout: 30000,
      });

      await new Promise((resolve) => setTimeout(resolve, 2000));

      await page.screenshot({
        path: outputPath,
        fullPage: true,
      });

      return true;
    } finally {
      await browser.close();
    }
  } catch (error) {
    display.error(`Screenshot failed: ${error instanceof Error ? error.message : error}`);
    return false;
  }
}

/**
 * Generate comparison grid of screenshots
 */
export function getScreenshotSummary(manifest: ScreenshotManifest): string {
  const successful = manifest.screenshots.filter((s) => s.success);
  const failed = manifest.screenshots.filter((s) => !s.success);

  let summary = `Screenshots captured: ${successful.length}/${manifest.screenshots.length}\n\n`;

  if (successful.length > 0) {
    summary += 'Captured:\n';
    for (const s of successful) {
      summary += `  ✓ ${s.page} (${s.viewport})\n`;
    }
  }

  if (failed.length > 0) {
    summary += '\nFailed:\n';
    for (const s of failed) {
      summary += `  ✗ ${s.page} (${s.viewport}): ${s.error}\n`;
    }
  }

  return summary;
}

export default captureScreenshots;
