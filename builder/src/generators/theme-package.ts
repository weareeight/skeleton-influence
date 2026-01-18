/**
 * Theme Package Generator
 * Assembles complete theme from base Elle + generated modifications
 * Creates production-ready theme.zip
 */

import { mkdir, readdir, copyFile, stat, readFile, writeFile } from 'fs/promises';
import { join, relative } from 'path';
import { createWriteStream, existsSync } from 'fs';
import archiver from 'archiver';
import type { SessionState } from '../types.js';
import { PATHS } from '../config.js';

export interface ThemePackageResult {
  themePath: string;
  zipPath: string;
  fileCount: number;
  sizeBytes: number;
  manifest: ThemeManifest;
}

export interface ThemeManifest {
  name: string;
  version: string;
  generatedAt: string;
  baseTheme: string;
  sections: {
    total: number;
    new: string[];
    modified: string[];
    original: string[];
  };
  assets: {
    css: string[];
    js: string[];
    images: string[];
  };
  config: {
    settingsSchema: boolean;
    settingsData: boolean;
  };
}

/**
 * Copy a directory recursively
 */
async function copyDirectory(src: string, dest: string): Promise<void> {
  await mkdir(dest, { recursive: true });
  const entries = await readdir(src, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = join(src, entry.name);
    const destPath = join(dest, entry.name);

    if (entry.isDirectory()) {
      await copyDirectory(srcPath, destPath);
    } else {
      await copyFile(srcPath, destPath);
    }
  }
}

/**
 * Get all files in a directory recursively
 */
async function getFilesRecursive(dir: string, base: string = dir): Promise<string[]> {
  const files: string[] = [];

  if (!existsSync(dir)) {
    return files;
  }

  const entries = await readdir(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...await getFilesRecursive(fullPath, base));
    } else {
      files.push(relative(base, fullPath));
    }
  }

  return files;
}

/**
 * Calculate directory size
 */
async function getDirectorySize(dir: string): Promise<number> {
  let size = 0;
  const files = await getFilesRecursive(dir);

  for (const file of files) {
    const fileStat = await stat(join(dir, file));
    size += fileStat.size;
  }

  return size;
}

/**
 * Overlay generated files onto base theme
 */
async function overlayGeneratedFiles(
  baseDir: string,
  generatedDir: string,
  outputDir: string
): Promise<{ newFiles: string[]; modifiedFiles: string[] }> {
  const newFiles: string[] = [];
  const modifiedFiles: string[] = [];

  // Directories to overlay
  const overlayDirs = ['sections', 'assets', 'config', 'snippets'];

  for (const dir of overlayDirs) {
    const generatedPath = join(generatedDir, dir);
    const outputPath = join(outputDir, dir);

    if (!existsSync(generatedPath)) {
      continue;
    }

    const files = await getFilesRecursive(generatedPath);

    for (const file of files) {
      const srcPath = join(generatedPath, file);
      const destPath = join(outputPath, file);
      const baseFile = join(baseDir, dir, file);

      // Ensure destination directory exists
      await mkdir(join(outputPath, file, '..'), { recursive: true });

      // Check if this is a new file or modification
      if (existsSync(baseFile)) {
        modifiedFiles.push(join(dir, file));
      } else {
        newFiles.push(join(dir, file));
      }

      await copyFile(srcPath, destPath);
    }
  }

  return { newFiles, modifiedFiles };
}

/**
 * Generate theme manifest
 */
async function generateManifest(
  session: SessionState,
  outputDir: string,
  newFiles: string[],
  modifiedFiles: string[]
): Promise<ThemeManifest> {
  const themeName = session.themeName || session.id;

  // Get section info
  const sectionsDir = join(outputDir, 'sections');
  const allSections = existsSync(sectionsDir)
    ? (await readdir(sectionsDir)).filter(f => f.endsWith('.liquid'))
    : [];

  const newSections = newFiles
    .filter(f => f.startsWith('sections/'))
    .map(f => f.replace('sections/', ''));

  const modifiedSections = modifiedFiles
    .filter(f => f.startsWith('sections/'))
    .map(f => f.replace('sections/', ''));

  const originalSections = allSections.filter(
    s => !newSections.includes(s) && !modifiedSections.includes(s)
  );

  // Get asset info
  const assetsDir = join(outputDir, 'assets');
  const allAssets = existsSync(assetsDir)
    ? await readdir(assetsDir)
    : [];

  const manifest: ThemeManifest = {
    name: themeName,
    version: '1.0.0',
    generatedAt: new Date().toISOString(),
    baseTheme: 'Elle',
    sections: {
      total: allSections.length,
      new: newSections,
      modified: modifiedSections,
      original: originalSections,
    },
    assets: {
      css: allAssets.filter(f => f.endsWith('.css')),
      js: allAssets.filter(f => f.endsWith('.js')),
      images: allAssets.filter(f => /\.(png|jpg|jpeg|svg|webp|gif)$/i.test(f)),
    },
    config: {
      settingsSchema: existsSync(join(outputDir, 'config', 'settings_schema.json')),
      settingsData: existsSync(join(outputDir, 'config', 'settings_data.json')),
    },
  };

  // Write manifest to theme directory
  await writeFile(
    join(outputDir, 'theme-manifest.json'),
    JSON.stringify(manifest, null, 2)
  );

  return manifest;
}

/**
 * Create zip archive of theme
 */
async function createZipArchive(
  sourceDir: string,
  zipPath: string
): Promise<{ fileCount: number; sizeBytes: number }> {
  return new Promise((resolve, reject) => {
    const output = createWriteStream(zipPath);
    const archive = archiver('zip', {
      zlib: { level: 9 }, // Maximum compression
    });

    let fileCount = 0;

    output.on('close', () => {
      resolve({
        fileCount,
        sizeBytes: archive.pointer(),
      });
    });

    archive.on('error', reject);

    archive.on('entry', () => {
      fileCount++;
    });

    archive.pipe(output);
    archive.directory(sourceDir, false);
    archive.finalize();
  });
}

/**
 * Main function to package theme
 */
export async function packageTheme(session: SessionState): Promise<ThemePackageResult> {
  const themeName = session.themeName || session.id;
  const outputBase = join(PATHS.output, themeName);
  const themeDir = join(outputBase, 'theme');
  const generatedDir = join(outputBase, 'generated');
  const zipPath = join(outputBase, `${themeName}.zip`);

  // Step 1: Create theme directory and copy base Elle theme
  await mkdir(themeDir, { recursive: true });
  await copyDirectory(PATHS.elle, themeDir);

  // Step 2: Overlay generated files
  const { newFiles, modifiedFiles } = await overlayGeneratedFiles(
    PATHS.elle,
    generatedDir,
    themeDir
  );

  // Step 3: Generate manifest
  const manifest = await generateManifest(session, themeDir, newFiles, modifiedFiles);

  // Step 4: Create zip archive
  const { fileCount, sizeBytes } = await createZipArchive(themeDir, zipPath);

  return {
    themePath: themeDir,
    zipPath,
    fileCount,
    sizeBytes,
    manifest,
  };
}

/**
 * Verify theme package contents
 */
export async function verifyThemePackage(
  themePath: string
): Promise<{
  valid: boolean;
  errors: string[];
  warnings: string[];
}> {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Required directories
  const requiredDirs = ['assets', 'config', 'layout', 'sections', 'snippets', 'templates'];
  for (const dir of requiredDirs) {
    if (!existsSync(join(themePath, dir))) {
      errors.push(`Missing required directory: ${dir}`);
    }
  }

  // Required files
  const requiredFiles = [
    'layout/theme.liquid',
    'config/settings_schema.json',
    'config/settings_data.json',
  ];
  for (const file of requiredFiles) {
    if (!existsSync(join(themePath, file))) {
      errors.push(`Missing required file: ${file}`);
    }
  }

  // Check for index template
  const templatesDir = join(themePath, 'templates');
  if (existsSync(templatesDir)) {
    const templates = await readdir(templatesDir);
    const hasIndex = templates.some(t => t.startsWith('index.'));
    if (!hasIndex) {
      errors.push('Missing index template');
    }
  }

  // Check sections count
  const sectionsDir = join(themePath, 'sections');
  if (existsSync(sectionsDir)) {
    const sections = await readdir(sectionsDir);
    const liquidSections = sections.filter(s => s.endsWith('.liquid'));
    if (liquidSections.length < 10) {
      warnings.push(`Low section count: ${liquidSections.length} sections (expected 50+)`);
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Get theme package summary for display
 */
export function getPackageSummary(result: ThemePackageResult): string {
  const sizeMB = (result.sizeBytes / 1024 / 1024).toFixed(2);
  const { manifest } = result;

  return `
Theme Package: ${manifest.name}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📦 Package Info
   Files: ${result.fileCount}
   Size: ${sizeMB} MB
   Generated: ${manifest.generatedAt}

📑 Sections (${manifest.sections.total} total)
   New: ${manifest.sections.new.length}
   Modified: ${manifest.sections.modified.length}
   Original: ${manifest.sections.original.length}

🎨 Assets
   CSS: ${manifest.assets.css.length} files
   JS: ${manifest.assets.js.length} files
   Images: ${manifest.assets.images.length} files

⚙️ Config
   settings_schema.json: ${manifest.config.settingsSchema ? '✓' : '✗'}
   settings_data.json: ${manifest.config.settingsData ? '✓' : '✗'}

📍 Output Paths
   Theme: ${result.themePath}
   ZIP: ${result.zipPath}
`.trim();
}
