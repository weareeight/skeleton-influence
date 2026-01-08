#!/usr/bin/env node

/**
 * Translation Checker Script
 * Scans all .liquid files for translation keys and checks if they exist in locale files.
 *
 * Usage: node scripts/check-translations.js
 */

const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.join(__dirname, '..');
const LOCALES_DIR = path.join(ROOT_DIR, 'locales');

// Directories to scan for .liquid files
const SCAN_DIRS = ['sections', 'snippets', 'layout', 'templates', 'blocks'];

// Load JSON file
function loadJSON(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(content);
  } catch (e) {
    console.error(`Error loading ${filePath}:`, e.message);
    return null;
  }
}

// Get all .liquid files recursively
function getLiquidFiles(dir) {
  const files = [];
  const fullPath = path.join(ROOT_DIR, dir);

  if (!fs.existsSync(fullPath)) return files;

  const entries = fs.readdirSync(fullPath, { withFileTypes: true });

  for (const entry of entries) {
    const entryPath = path.join(fullPath, entry.name);
    if (entry.isDirectory()) {
      files.push(...getLiquidFiles(path.join(dir, entry.name)));
    } else if (entry.name.endsWith('.liquid')) {
      files.push(entryPath);
    }
  }

  return files;
}

// Extract translation keys from file content
function extractTranslationKeys(content) {
  const keys = new Set();

  // Match t:key patterns (in schema JSON and Liquid)
  // Patterns like "t:sections.header.name" or {{ 'key' | t }}
  const schemaPattern = /"t:([^"]+)"/g;
  const liquidPattern = /['"]([^'"]+)['"]\s*\|\s*t(?:\s|}}|,|\|)/g;

  let match;

  // Schema translations (t:...)
  while ((match = schemaPattern.exec(content)) !== null) {
    keys.add(match[1]);
  }

  // Liquid translations ({{ 'key' | t }})
  while ((match = liquidPattern.exec(content)) !== null) {
    keys.add(match[1]);
  }

  return Array.from(keys);
}

// Check if a key exists in the locale object
function keyExists(obj, keyPath) {
  const parts = keyPath.split('.');
  let current = obj;

  for (const part of parts) {
    if (current && typeof current === 'object' && part in current) {
      current = current[part];
    } else {
      return false;
    }
  }

  return true;
}

// Categorize keys by their prefix
function categorizeKey(key) {
  if (key.startsWith('settings_schema.')) return 'schema';
  if (key.startsWith('sections.')) return 'schema';
  if (key.startsWith('blocks.')) return 'schema';
  if (key.startsWith('labels.')) return 'schema';
  if (key.startsWith('options.')) return 'schema';
  if (key.startsWith('general.')) return 'schema';
  return 'default';
}

// Main function
function main() {
  console.log('🔍 Scanning for missing translations...\n');

  // Load locale files
  const defaultLocale = loadJSON(path.join(LOCALES_DIR, 'en.default.json'));
  const schemaLocale = loadJSON(path.join(LOCALES_DIR, 'en.default.schema.json'));

  if (!defaultLocale || !schemaLocale) {
    console.error('Failed to load locale files');
    process.exit(1);
  }

  const allKeys = new Map(); // key -> [files where used]
  const missingKeys = new Map(); // key -> { files, category }

  // Scan all directories
  for (const dir of SCAN_DIRS) {
    const files = getLiquidFiles(dir);

    for (const file of files) {
      const content = fs.readFileSync(file, 'utf8');
      const keys = extractTranslationKeys(content);
      const relativePath = path.relative(ROOT_DIR, file);

      for (const key of keys) {
        if (!allKeys.has(key)) {
          allKeys.set(key, []);
        }
        allKeys.get(key).push(relativePath);
      }
    }
  }

  // Check each key
  for (const [key, files] of allKeys) {
    const category = categorizeKey(key);
    const locale = category === 'schema' ? schemaLocale : defaultLocale;

    if (!keyExists(locale, key)) {
      missingKeys.set(key, { files, category });
    }
  }

  // Report results
  if (missingKeys.size === 0) {
    console.log('✅ All translation keys are present!\n');
    return;
  }

  console.log(`❌ Found ${missingKeys.size} missing translation keys:\n`);

  // Group by section/category for better readability
  const grouped = new Map();

  for (const [key, info] of missingKeys) {
    const prefix = key.split('.').slice(0, 2).join('.');
    if (!grouped.has(prefix)) {
      grouped.set(prefix, []);
    }
    grouped.get(prefix).push({ key, ...info });
  }

  // Sort and display
  const sortedGroups = Array.from(grouped.entries()).sort((a, b) => a[0].localeCompare(b[0]));

  for (const [prefix, items] of sortedGroups) {
    console.log(`\n📁 ${prefix}`);
    console.log('─'.repeat(60));

    for (const item of items) {
      console.log(`  ❌ ${item.key}`);
      console.log(`     └─ Used in: ${item.files.join(', ')}`);
    }
  }

  // Generate stub for missing translations
  console.log('\n\n📝 Suggested translations to add to en.default.schema.json:');
  console.log('─'.repeat(60));

  const schemaStubs = [];
  const defaultStubs = [];

  for (const [key, info] of missingKeys) {
    const parts = key.split('.');
    const stub = generateStub(parts);

    if (info.category === 'schema') {
      schemaStubs.push({ key, stub, parts });
    } else {
      defaultStubs.push({ key, stub, parts });
    }
  }

  // Output grouped stubs
  if (schemaStubs.length > 0) {
    console.log('\n// For en.default.schema.json:');
    outputStubs(schemaStubs);
  }

  if (defaultStubs.length > 0) {
    console.log('\n// For en.default.json:');
    outputStubs(defaultStubs);
  }

  console.log(`\n\n📊 Summary: ${missingKeys.size} missing keys in ${grouped.size} groups`);
  process.exit(1);
}

// Generate a human-readable stub value
function generateStub(parts) {
  const lastPart = parts[parts.length - 1];

  // Convert snake_case to Title Case
  return lastPart
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

// Output stubs in a grouped format
function outputStubs(stubs) {
  // Group by top-level key
  const byTopLevel = new Map();

  for (const { key, stub, parts } of stubs) {
    const topLevel = parts[0];
    if (!byTopLevel.has(topLevel)) {
      byTopLevel.set(topLevel, []);
    }
    byTopLevel.set(topLevel, [...byTopLevel.get(topLevel), { key, stub, parts }]);
  }

  for (const [topLevel, items] of byTopLevel) {
    console.log(`\n"${topLevel}": {`);

    for (const { key, stub, parts } of items) {
      console.log(`  // ${key}`);
      console.log(`  // Suggested: "${stub}"`);
    }

    console.log('}');
  }
}

main();
