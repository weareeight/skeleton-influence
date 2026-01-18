import { display } from '../ui/display.js';
import { promptConfirm, promptSelect, promptText } from '../ui/prompts.js';
import { approvalLoop } from '../ui/approval.js';
import { ProgressTracker } from '../ui/progress.js';
import { openImage, openDirectory } from '../ui/image-viewer.js';
import { getReplicateClient, ImageGenerationResult } from '../ai/replicate.js';
import type { SessionState, Product } from '../types.js';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { PATHS, GENERATION_CONFIG } from '../config.js';

interface ProductImageSet {
  productId: string;
  productName: string;
  studio: ImageGenerationResult;
  angles: ImageGenerationResult[];
  lifestyle: ImageGenerationResult[];
  localPaths: {
    studio: string | null;
    angles: string[];
    lifestyle: string[];
  };
}

interface ImageManifest {
  themeName: string;
  generatedAt: string;
  products: Array<{
    id: string;
    name: string;
    images: {
      studio: string | null;
      angles: string[];
      lifestyle: string[];
    };
  }>;
}

/**
 * Phase 3: Image Generation
 *
 * Generates product images using Nano Banana Pro via Replicate:
 * - Core studio shot per product (with approval)
 * - 4 angle variations
 * - 3 lifestyle images
 */
export async function runImagesPhase(session: SessionState): Promise<void> {
  if (!session.brief || session.products.length === 0) {
    throw new Error('Brief and products must be completed before generating images');
  }

  const replicate = getReplicateClient();
  const outputDir = join(PATHS.output, session.themeName || session.id, 'images');
  await mkdir(outputDir, { recursive: true });

  display.sectionHeader('Image Generation Configuration');

  // Confirm generation settings
  const totalProducts = session.products.length;
  const imagesPerProduct = 1 + GENERATION_CONFIG.anglesPerProduct + GENERATION_CONFIG.lifestyleImagesPerProduct;
  const totalImages = totalProducts * imagesPerProduct;

  display.keyValue('Products', String(totalProducts));
  display.keyValue('Images per product', `${imagesPerProduct} (1 studio + ${GENERATION_CONFIG.anglesPerProduct} angles + ${GENERATION_CONFIG.lifestyleImagesPerProduct} lifestyle)`);
  display.keyValue('Total images', String(totalImages));
  display.keyValue('Estimated time', `${Math.ceil(totalImages * 2)} - ${Math.ceil(totalImages * 3)} minutes`);
  display.newline();

  display.warning('Image generation is time-intensive. Each image takes 1-3 minutes.');
  display.info('You can approve/regenerate each product\'s studio shot before generating variations.');
  display.newline();

  const proceed = await promptConfirm('Ready to begin image generation?', true);
  if (!proceed) {
    display.info('Skipping image generation phase. You can resume later.');
    return;
  }

  // Process each product
  const imageResults: ProductImageSet[] = [];

  for (let i = 0; i < session.products.length; i++) {
    const product = session.products[i];

    display.divider();
    display.phaseHeader(`Product ${i + 1}/${totalProducts}: ${product.name}`, i + 1, totalProducts);

    const imageSet = await processProduct(
      product,
      session.brief!.styleDirection,
      outputDir,
      replicate
    );

    imageResults.push(imageSet);

    // Update product with image paths
    product.images = {
      studio: imageSet.localPaths.studio,
      angles: imageSet.localPaths.angles,
      lifestyle: imageSet.localPaths.lifestyle,
    };

    // Save progress after each product
    await saveImageManifest(outputDir, session.themeName || session.id, imageResults);

    display.success(`Completed ${i + 1}/${totalProducts} products`);
  }

  display.divider();
  display.success(`Generated ${imageResults.length * imagesPerProduct} images for ${imageResults.length} products`);
  display.keyValue('Output directory', outputDir);

  // Offer to open output directory
  const openDir = await promptConfirm('Open output directory?', false);
  if (openDir) {
    await openDirectory(outputDir);
  }
}

/**
 * Process a single product's images
 */
async function processProduct(
  product: Product,
  styleDirection: string,
  outputDir: string,
  replicate: ReturnType<typeof getReplicateClient>
): Promise<ProductImageSet> {
  const productDir = join(outputDir, product.id);
  await mkdir(productDir, { recursive: true });

  // Step 1: Generate and approve studio shot
  display.sectionHeader('Step 1: Core Studio Image');

  const { result: studioResult } = await approvalLoop<ImageGenerationResult>(
    'images',
    `studio-${product.id}`,
    {
      generate: async (feedback) => {
        const description = feedback
          ? `${product.description} ${feedback}`
          : product.description;

        display.info('Generating studio image...');
        const spinner = createSimpleSpinner();

        const result = await replicate.generateStudioImage(
          product.name,
          description,
          styleDirection
        );

        spinner.stop();
        return result;
      },
      display: (result) => displayImageResult(result, 'Studio Shot'),
    }
  );

  // Download studio image
  let studioLocalPath: string | null = null;
  if (studioResult.success && studioResult.imageUrl) {
    studioLocalPath = join(productDir, 'studio-main.png');
    await replicate.downloadImage(studioResult.imageUrl, studioLocalPath);
    display.success(`Saved: studio-main.png`);
  }

  // Step 2: Generate angle variations
  display.sectionHeader('Step 2: Angle Variations');
  display.info('Generating 4 angle variations...');

  const angleProgress = new ProgressTracker('Angles', GENERATION_CONFIG.anglesPerProduct);
  const angleResults = await replicate.generateAngleVariations(
    product.name,
    product.description,
    ['front', 'side', 'detail', 'flat-lay'],
    (completed) => angleProgress.update(completed)
  );
  angleProgress.complete();

  // Download angle images
  const angleLocalPaths: string[] = [];
  for (let i = 0; i < angleResults.length; i++) {
    const result = angleResults[i];
    if (result.success && result.imageUrl) {
      const path = join(productDir, `angle-${result.variant || i + 1}.png`);
      await replicate.downloadImage(result.imageUrl, path);
      angleLocalPaths.push(path);
      display.success(`Saved: angle-${result.variant || i + 1}.png`);
    } else {
      display.warning(`Failed: angle-${result.variant || i + 1} - ${result.error}`);
    }
  }

  // Step 3: Generate lifestyle images
  display.sectionHeader('Step 3: Lifestyle Images');
  display.info('Generating 3 lifestyle images...');

  const lifestyleProgress = new ProgressTracker('Lifestyle', GENERATION_CONFIG.lifestyleImagesPerProduct);
  const lifestyleResults = await replicate.generateLifestyleImages(
    product.name,
    product.description,
    ['in-use', 'environment', 'styled'],
    (completed) => lifestyleProgress.update(completed)
  );
  lifestyleProgress.complete();

  // Download lifestyle images
  const lifestyleLocalPaths: string[] = [];
  for (let i = 0; i < lifestyleResults.length; i++) {
    const result = lifestyleResults[i];
    if (result.success && result.imageUrl) {
      const path = join(productDir, `lifestyle-${result.variant || i + 1}.png`);
      await replicate.downloadImage(result.imageUrl, path);
      lifestyleLocalPaths.push(path);
      display.success(`Saved: lifestyle-${result.variant || i + 1}.png`);
    } else {
      display.warning(`Failed: lifestyle-${result.variant || i + 1} - ${result.error}`);
    }
  }

  // Summarize results
  const successCount =
    (studioResult.success ? 1 : 0) +
    angleResults.filter((r) => r.success).length +
    lifestyleResults.filter((r) => r.success).length;

  const totalCount = 1 + angleResults.length + lifestyleResults.length;

  display.newline();
  display.keyValue('Success rate', `${successCount}/${totalCount} images`);

  // Offer to view images
  if (studioLocalPath) {
    const viewStudio = await promptConfirm('View studio image?', false);
    if (viewStudio) {
      await openImage(studioLocalPath);
    }
  }

  return {
    productId: product.id,
    productName: product.name,
    studio: studioResult,
    angles: angleResults,
    lifestyle: lifestyleResults,
    localPaths: {
      studio: studioLocalPath,
      angles: angleLocalPaths,
      lifestyle: lifestyleLocalPaths,
    },
  };
}

/**
 * Display image generation result
 */
function displayImageResult(result: ImageGenerationResult, label: string): void {
  if (result.success) {
    display.proposal(label, `
Status: SUCCESS

Image URL: ${result.imageUrl}

Prompt used:
${result.prompt}

The image has been generated. You can:
- Accept to proceed with angle/lifestyle variations
- Provide comments to regenerate with adjusted prompt
`);
  } else {
    display.proposal(label, `
Status: FAILED

Error: ${result.error}

Prompt attempted:
${result.prompt}

Please provide feedback to try again with a modified prompt.
`);
  }
}

/**
 * Save image manifest for tracking
 */
async function saveImageManifest(
  outputDir: string,
  themeName: string,
  results: ProductImageSet[]
): Promise<void> {
  const manifest: ImageManifest = {
    themeName,
    generatedAt: new Date().toISOString(),
    products: results.map((r) => ({
      id: r.productId,
      name: r.productName,
      images: {
        studio: r.localPaths.studio,
        angles: r.localPaths.angles,
        lifestyle: r.localPaths.lifestyle,
      },
    })),
  };

  const manifestPath = join(outputDir, 'manifest.json');
  await writeFile(manifestPath, JSON.stringify(manifest, null, 2), 'utf-8');
}

/**
 * Create a simple console spinner for long operations
 */
function createSimpleSpinner() {
  const frames = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];
  let i = 0;
  let running = true;

  const interval = setInterval(() => {
    if (running) {
      process.stdout.write(`\r${frames[i++ % frames.length]} Generating...`);
    }
  }, 100);

  return {
    stop: () => {
      running = false;
      clearInterval(interval);
      process.stdout.write('\r                    \r');
    },
  };
}

export default runImagesPhase;
