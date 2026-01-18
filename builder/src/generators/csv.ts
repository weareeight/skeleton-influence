import type { Product, ProductVariant } from '../types.js';

/**
 * Shopify Product CSV Column Headers
 * Based on Shopify's product import format
 */
const CSV_HEADERS = [
  'Handle',
  'Title',
  'Body (HTML)',
  'Vendor',
  'Product Category',
  'Type',
  'Tags',
  'Published',
  'Option1 Name',
  'Option1 Value',
  'Option2 Name',
  'Option2 Value',
  'Option3 Name',
  'Option3 Value',
  'Variant SKU',
  'Variant Grams',
  'Variant Inventory Tracker',
  'Variant Inventory Qty',
  'Variant Inventory Policy',
  'Variant Fulfillment Service',
  'Variant Price',
  'Variant Compare At Price',
  'Variant Requires Shipping',
  'Variant Taxable',
  'Variant Barcode',
  'Image Src',
  'Image Position',
  'Image Alt Text',
  'Gift Card',
  'SEO Title',
  'SEO Description',
  'Google Shopping / Google Product Category',
  'Google Shopping / Gender',
  'Google Shopping / Age Group',
  'Google Shopping / MPN',
  'Google Shopping / AdWords Grouping',
  'Google Shopping / AdWords Labels',
  'Google Shopping / Condition',
  'Google Shopping / Custom Product',
  'Google Shopping / Custom Label 0',
  'Google Shopping / Custom Label 1',
  'Google Shopping / Custom Label 2',
  'Google Shopping / Custom Label 3',
  'Google Shopping / Custom Label 4',
  'Variant Image',
  'Variant Weight Unit',
  'Variant Tax Code',
  'Cost per item',
  'Included / United States',
  'Price / United States',
  'Compare At Price / United States',
  'Included / International',
  'Price / International',
  'Compare At Price / International',
  'Status',
];

/**
 * Generate Shopify-compatible product CSV
 * Note: Image columns are left empty for manual hosting
 */
export function generateProductCSV(products: Product[]): string {
  const rows: string[][] = [];

  // Add header row
  rows.push(CSV_HEADERS);

  for (const product of products) {
    const variants = product.variants.length > 0 ? product.variants : [createDefaultVariant(product)];

    for (let i = 0; i < variants.length; i++) {
      const variant = variants[i];
      const isFirstVariant = i === 0;

      const row = createProductRow(product, variant, isFirstVariant);
      rows.push(row);
    }
  }

  // Convert to CSV string
  return rows.map((row) => row.map(escapeCSVField).join(',')).join('\n');
}

/**
 * Create a product row for the CSV
 */
function createProductRow(
  product: Product,
  variant: ProductVariant,
  isFirstVariant: boolean
): string[] {
  // Determine option names based on variant structure
  const hasSize = variant.option1 && variant.option1 !== 'Default';
  const hasColor = !!variant.option2;
  const hasMaterial = !!variant.option3;

  return [
    // Handle
    product.id,
    // Title (only on first variant)
    isFirstVariant ? product.name : '',
    // Body (HTML) (only on first variant)
    isFirstVariant ? formatDescription(product.description) : '',
    // Vendor (only on first variant)
    isFirstVariant ? '' : '', // Left empty, will be filled by store
    // Product Category
    isFirstVariant ? product.category : '',
    // Type
    isFirstVariant ? product.category : '',
    // Tags
    isFirstVariant ? formatTags(product) : '',
    // Published
    isFirstVariant ? 'TRUE' : '',
    // Option1 Name
    isFirstVariant ? (hasSize ? 'Size' : 'Title') : '',
    // Option1 Value
    variant.option1 || 'Default Title',
    // Option2 Name
    isFirstVariant && hasColor ? 'Color' : '',
    // Option2 Value
    variant.option2 || '',
    // Option3 Name
    isFirstVariant && hasMaterial ? 'Material' : '',
    // Option3 Value
    variant.option3 || '',
    // Variant SKU
    variant.sku || '',
    // Variant Grams
    '500', // Default weight
    // Variant Inventory Tracker
    'shopify',
    // Variant Inventory Qty
    String(variant.inventory || 25),
    // Variant Inventory Policy
    'deny',
    // Variant Fulfillment Service
    'manual',
    // Variant Price
    String(product.price),
    // Variant Compare At Price
    product.compareAtPrice ? String(product.compareAtPrice) : '',
    // Variant Requires Shipping
    'TRUE',
    // Variant Taxable
    'TRUE',
    // Variant Barcode
    '',
    // Image Src (empty - manual hosting)
    '',
    // Image Position
    '',
    // Image Alt Text
    isFirstVariant ? product.name : '',
    // Gift Card
    'FALSE',
    // SEO Title
    isFirstVariant ? product.seoTitle : '',
    // SEO Description
    isFirstVariant ? product.seoDescription : '',
    // Google Shopping fields (empty)
    '', '', '', '', '', '', '', '', '', '', '', '', '',
    // Variant Image (empty)
    '',
    // Variant Weight Unit
    'g',
    // Variant Tax Code
    '',
    // Cost per item
    '',
    // Included / United States
    'TRUE',
    // Price / United States
    '',
    // Compare At Price / United States
    '',
    // Included / International
    'TRUE',
    // Price / International
    '',
    // Compare At Price / International
    '',
    // Status
    isFirstVariant ? 'active' : '',
  ];
}

/**
 * Create a default variant if product has none
 */
function createDefaultVariant(product: Product): ProductVariant {
  return {
    name: 'Default',
    option1: 'Default Title',
    sku: product.id.toUpperCase().replace(/-/g, ''),
    inventory: 25,
  };
}

/**
 * Format description as basic HTML
 */
function formatDescription(description: string): string {
  // Wrap in paragraph tags and escape HTML
  const escaped = description
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
  return `<p>${escaped}</p>`;
}

/**
 * Format tags from product metadata
 */
function formatTags(product: Product): string {
  const tags: string[] = [
    product.collection,
    product.category,
  ];

  // Add sale tag if on sale
  if (product.compareAtPrice && product.compareAtPrice > product.price) {
    tags.push('Sale');
  }

  return tags.filter(Boolean).join(', ');
}

/**
 * Escape a field for CSV format
 */
function escapeCSVField(field: string): string {
  if (field === null || field === undefined) {
    return '';
  }

  const str = String(field);

  // If field contains comma, newline, or quote, wrap in quotes and escape internal quotes
  if (str.includes(',') || str.includes('\n') || str.includes('"')) {
    return `"${str.replace(/"/g, '""')}"`;
  }

  return str;
}

/**
 * Generate a CSV with just product names and handles (for quick reference)
 */
export function generateProductSummaryCSV(products: Product[]): string {
  const rows: string[][] = [
    ['Handle', 'Title', 'Price', 'Category', 'Collection', 'Variants'],
  ];

  for (const product of products) {
    rows.push([
      product.id,
      product.name,
      `$${product.price.toFixed(2)}`,
      product.category,
      product.collection,
      String(product.variants.length),
    ]);
  }

  return rows.map((row) => row.map(escapeCSVField).join(',')).join('\n');
}

export default generateProductCSV;
