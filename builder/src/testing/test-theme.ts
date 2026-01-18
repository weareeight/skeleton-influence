import { mkdir, readdir, copyFile, writeFile, readFile } from 'fs/promises';
import { join, relative } from 'path';
import { existsSync } from 'fs';
import { PATHS } from '../config.js';
import type { SessionState, SectionProposal } from '../types.js';

interface TestThemeConfig {
  themeName: string;
  outputDir: string;
  elleDir: string;
  generatedDir: string;
  sections: SectionProposal[];
}

/**
 * Generate a test theme that is a FULL copy of the production theme,
 * but with the homepage configured to show only new/modified sections.
 *
 * This allows testing new code in isolation while maintaining
 * a complete, uploadable theme structure.
 */
export async function generateTestTheme(session: SessionState): Promise<string> {
  const themeName = session.themeName || session.id;
  const outputBase = join(PATHS.output, themeName);
  const testThemeDir = join(outputBase, 'test-theme');
  const generatedThemeDir = join(outputBase, 'theme');

  // Create test theme directory structure
  await mkdir(testThemeDir, { recursive: true });

  const config: TestThemeConfig = {
    themeName,
    outputDir: testThemeDir,
    elleDir: PATHS.elle,
    generatedDir: generatedThemeDir,
    sections: session.sections,
  };

  // Step 1: Copy entire Elle base theme
  await copyDirectory(config.elleDir, config.outputDir);

  // Step 2: Overlay generated sections, assets, config
  await overlayGeneratedFiles(config);

  // Step 3: Create test-specific index.json
  await createTestHomepage(config, session);

  return testThemeDir;
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
 * Overlay generated files onto the test theme
 */
async function overlayGeneratedFiles(config: TestThemeConfig): Promise<void> {
  const { generatedDir, outputDir } = config;

  // Check if generated theme exists
  if (!existsSync(generatedDir)) {
    return;
  }

  // Copy sections
  const sectionsDir = join(generatedDir, 'sections');
  if (existsSync(sectionsDir)) {
    const sections = await readdir(sectionsDir);
    await mkdir(join(outputDir, 'sections'), { recursive: true });
    for (const section of sections) {
      await copyFile(
        join(sectionsDir, section),
        join(outputDir, 'sections', section)
      );
    }
  }

  // Copy assets
  const assetsDir = join(generatedDir, 'assets');
  if (existsSync(assetsDir)) {
    const assets = await readdir(assetsDir);
    await mkdir(join(outputDir, 'assets'), { recursive: true });
    for (const asset of assets) {
      await copyFile(
        join(assetsDir, asset),
        join(outputDir, 'assets', asset)
      );
    }
  }

  // Copy config
  const configDir = join(generatedDir, 'config');
  if (existsSync(configDir)) {
    const configs = await readdir(configDir);
    await mkdir(join(outputDir, 'config'), { recursive: true });
    for (const cfg of configs) {
      await copyFile(
        join(configDir, cfg),
        join(outputDir, 'config', cfg)
      );
    }
  }

  // Copy snippets if any
  const snippetsDir = join(generatedDir, 'snippets');
  if (existsSync(snippetsDir)) {
    const snippets = await readdir(snippetsDir);
    await mkdir(join(outputDir, 'snippets'), { recursive: true });
    for (const snippet of snippets) {
      await copyFile(
        join(snippetsDir, snippet),
        join(outputDir, 'snippets', snippet)
      );
    }
  }
}

/**
 * Create test-specific index.json with only new/modified sections
 */
async function createTestHomepage(
  config: TestThemeConfig,
  session: SessionState
): Promise<void> {
  const { outputDir, sections } = config;

  // Build the test homepage template
  const indexJson = {
    sections: {} as Record<string, unknown>,
    order: [] as string[],
  };

  // Add header first
  indexJson.sections['header'] = {
    type: 'header',
    settings: {},
  };
  indexJson.order.push('header');

  // Add announcement bar
  indexJson.sections['announcement-bar'] = {
    type: 'announcement-bar',
    settings: {
      text: 'TEST THEME - New & Modified Sections Only',
      show_announcement: true,
    },
  };
  indexJson.order.push('announcement-bar');

  // Add a hero section for context
  indexJson.sections['test-hero'] = {
    type: 'hero',
    settings: {
      heading: `${session.themeName} - Test Theme`,
      subheading: 'This homepage shows only the new and modified sections for testing',
    },
  };
  indexJson.order.push('test-hero');

  // Add all new sections
  const newSections = sections.filter((s) => s.type === 'new');
  for (let i = 0; i < newSections.length; i++) {
    const section = newSections[i];
    const key = `new-section-${i + 1}`;
    indexJson.sections[key] = {
      type: section.id,
      settings: {},
    };
    indexJson.order.push(key);
  }

  // Add divider between new and modified
  indexJson.sections['divider-1'] = {
    type: 'rich-text',
    settings: {
      heading: '— Modified Sections Below —',
    },
  };
  indexJson.order.push('divider-1');

  // Add all modified sections
  const modifiedSections = sections.filter((s) => s.type === 'modified');
  for (let i = 0; i < modifiedSections.length; i++) {
    const section = modifiedSections[i];
    const key = `modified-section-${i + 1}`;
    indexJson.sections[key] = {
      type: section.id,
      settings: {},
    };
    indexJson.order.push(key);
  }

  // Add footer last
  indexJson.sections['footer'] = {
    type: 'footer',
    settings: {},
  };
  indexJson.order.push('footer');

  // Write the test index.json
  const templatesDir = join(outputDir, 'templates');
  await mkdir(templatesDir, { recursive: true });
  await writeFile(
    join(templatesDir, 'index.json'),
    JSON.stringify(indexJson, null, 2),
    'utf-8'
  );
}

/**
 * Get list of sections in the test theme homepage
 */
export function getTestThemeSections(session: SessionState): string[] {
  const sections: string[] = ['header'];

  // New sections
  for (const s of session.sections.filter((s) => s.type === 'new')) {
    sections.push(s.id);
  }

  // Modified sections
  for (const s of session.sections.filter((s) => s.type === 'modified')) {
    sections.push(s.id);
  }

  sections.push('footer');
  return sections;
}

export default generateTestTheme;
