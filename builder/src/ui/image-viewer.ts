import open from 'open';
import { display } from './display.js';

/**
 * Open an image file in the system default viewer
 */
export async function openImage(imagePath: string): Promise<void> {
  try {
    await open(imagePath);
    display.info(`Opened: ${imagePath}`);
  } catch (error) {
    display.error(`Failed to open image: ${imagePath}`);
    display.error(error instanceof Error ? error.message : String(error));
  }
}

/**
 * Open multiple images in the system default viewer
 */
export async function openImages(imagePaths: string[]): Promise<void> {
  display.info(`Opening ${imagePaths.length} images...`);

  for (const imagePath of imagePaths) {
    try {
      await open(imagePath);
      // Small delay to prevent overwhelming the system
      await new Promise((resolve) => setTimeout(resolve, 500));
    } catch (error) {
      display.error(`Failed to open: ${imagePath}`);
    }
  }
}

/**
 * Open a directory in the system file browser
 */
export async function openDirectory(dirPath: string): Promise<void> {
  try {
    await open(dirPath);
    display.info(`Opened directory: ${dirPath}`);
  } catch (error) {
    display.error(`Failed to open directory: ${dirPath}`);
    display.error(error instanceof Error ? error.message : String(error));
  }
}

/**
 * Open a URL in the system default browser
 */
export async function openUrl(url: string): Promise<void> {
  try {
    await open(url);
    display.info(`Opened: ${url}`);
  } catch (error) {
    display.error(`Failed to open URL: ${url}`);
    display.error(error instanceof Error ? error.message : String(error));
  }
}

/**
 * Display image information (for terminal display without opening)
 */
export function displayImageInfo(
  imagePath: string,
  description?: string
): void {
  display.keyValue('Image', imagePath);
  if (description) {
    display.keyValue('Description', description);
  }
}

/**
 * Display a grid of image information
 */
export function displayImageGrid(
  images: Array<{ path: string; label: string }>
): void {
  const headers = ['#', 'Label', 'Path'];
  const rows = images.map((img, i) => [
    String(i + 1),
    img.label,
    img.path.split('/').slice(-2).join('/'), // Show only last 2 path segments
  ]);
  display.table(headers, rows);
}
