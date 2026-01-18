import { display } from '../ui/display.js';
import { promptNumber, promptConfirm } from '../ui/prompts.js';
import { approvalLoop, batchApproval } from '../ui/approval.js';
import { chat, OpenRouterClient } from '../ai/openrouter.js';
import { getModelInfo } from '../ai/models.js';
import { generateProductCSV } from '../generators/csv.js';
import type { SessionState, Product, Message } from '../types.js';
import { readFile, writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { PATHS, GENERATION_CONFIG } from '../config.js';

/**
 * Phase 2: Product Catalog Generation
 *
 * Generates a complete product catalog based on the brief:
 * - 20 products with names, descriptions, prices
 * - Categories and collections
 * - Variants (sizes, colors where applicable)
 * - SEO metadata
 */
export async function runProductsPhase(session: SessionState): Promise<void> {
  if (!session.brief) {
    throw new Error('Brief must be completed before generating products');
  }

  display.sectionHeader('Step 1: Generate Product Catalog');
  display.info(`Using ${getModelInfo('planning')} to create ${GENERATION_CONFIG.productsCount} products...`);

  // Ask if user wants to customize product count
  const customCount = await promptConfirm(
    `Generate ${GENERATION_CONFIG.productsCount} products? (No to customize)`,
    true
  );

  const productCount = customCount
    ? GENERATION_CONFIG.productsCount
    : await promptNumber('How many products?', 20, 5, 50);

  // Generate products with approval loop
  const { result: products, record } = await approvalLoop<Product[]>(
    'products',
    'product-catalog',
    {
      generate: async (feedback) => generateProducts(session, productCount, feedback),
      display: displayProductCatalog,
    }
  );

  session.products = products;
  session.approvalHistory.push(record);

  display.success(`${products.length} products generated`);
  display.divider();

  // Generate and save CSV
  display.sectionHeader('Step 2: Export Product CSV');

  const outputDir = join(PATHS.output, session.themeName || session.id);
  await mkdir(outputDir, { recursive: true });

  const csvPath = join(outputDir, 'products.csv');
  const csvContent = generateProductCSV(products);
  await writeFile(csvPath, csvContent, 'utf-8');

  display.success(`CSV exported to: ${csvPath}`);
  display.info('Note: Image columns are empty - add image URLs after hosting');
}

/**
 * Generate products using AI
 */
async function generateProducts(
  session: SessionState,
  count: number,
  feedback?: string
): Promise<Product[]> {
  const brief = session.brief!;

  const systemPrompt = `You are an expert e-commerce product manager and copywriter. Generate a realistic product catalog for a ${brief.industry} store targeting ${brief.targetMarket}.

BRAND: ${brief.brandName || brief.industry}
STYLE: ${brief.styleDirection}
POSITIONING: ${brief.positioning || 'Premium quality products'}

Generate exactly ${count} products that:
1. Are realistic and would sell in this niche
2. Have varied price points (budget, mid-range, premium)
3. Include a mix of product types within the niche
4. Have compelling, SEO-optimized names and descriptions
5. Include appropriate variants (sizes, colors, etc.)

Respond with valid JSON only in this format:
{
  "products": [
    {
      "id": "product-handle-1",
      "name": "Product Name",
      "description": "Compelling 2-3 sentence description with key features and benefits.",
      "price": 49.99,
      "compareAtPrice": 69.99,
      "category": "Category Name",
      "collection": "Collection Name",
      "variants": [
        { "name": "Small", "option1": "Small", "sku": "PROD-S", "inventory": 25 },
        { "name": "Medium", "option1": "Medium", "sku": "PROD-M", "inventory": 30 },
        { "name": "Large", "option1": "Large", "sku": "PROD-L", "inventory": 20 }
      ],
      "seoTitle": "SEO optimized title under 60 chars",
      "seoDescription": "Meta description under 160 chars with keywords"
    }
  ]
}

Guidelines:
- Use realistic pricing for the niche and target market
- compareAtPrice should be 20-40% higher than price (or null if no sale)
- Each product needs 2-4 variants where appropriate
- SKUs should follow a logical pattern
- Inventory should vary between 10-50 units
- Categories should group related products
- Collections can span categories (e.g., "New Arrivals", "Best Sellers")`;

  const messages: Message[] = [
    OpenRouterClient.systemMessage(systemPrompt),
  ];

  if (feedback) {
    messages.push(
      OpenRouterClient.userMessage(`Revise the product catalog based on this feedback: ${feedback}`)
    );
  } else {
    messages.push(
      OpenRouterClient.userMessage(`Generate ${count} products now. Respond with valid JSON only.`)
    );
  }

  const response = await chat(messages, 'planning');

  try {
    // Extract JSON from response
    const jsonMatch = response.match(/```(?:json)?\s*([\s\S]*?)```/) || [null, response];
    const jsonStr = jsonMatch[1]?.trim() || response.trim();
    const data = JSON.parse(jsonStr) as { products: Omit<Product, 'images'>[] };

    // Add empty images object to each product
    return data.products.map((p) => ({
      ...p,
      images: {
        studio: null,
        angles: [],
        lifestyle: [],
      },
    }));
  } catch (error) {
    display.warning('Failed to parse product JSON, generating fallback catalog...');
    return generateFallbackProducts(session, count);
  }
}

/**
 * Generate fallback products if AI fails
 */
function generateFallbackProducts(session: SessionState, count: number): Product[] {
  const brief = session.brief!;
  const products: Product[] = [];

  const priceRanges = [
    { min: 19.99, max: 39.99 },
    { min: 49.99, max: 89.99 },
    { min: 99.99, max: 199.99 },
  ];

  for (let i = 1; i <= count; i++) {
    const priceRange = priceRanges[i % 3];
    const price = Math.round((priceRange.min + Math.random() * (priceRange.max - priceRange.min)) * 100) / 100;

    products.push({
      id: `product-${i}`,
      name: `${brief.industry} Product ${i}`,
      description: `High-quality ${brief.industry.toLowerCase()} product designed for ${brief.targetMarket}. Premium materials and craftsmanship.`,
      price,
      compareAtPrice: Math.round(price * 1.3 * 100) / 100,
      category: `Category ${Math.ceil(i / 5)}`,
      collection: i <= 5 ? 'New Arrivals' : i <= 10 ? 'Best Sellers' : 'All Products',
      variants: [
        { name: 'Default', option1: 'Default', sku: `PROD-${i}`, inventory: 25 },
      ],
      seoTitle: `${brief.industry} Product ${i} | ${brief.brandName || 'Our Store'}`,
      seoDescription: `Shop our ${brief.industry.toLowerCase()} product ${i}. Perfect for ${brief.targetMarket}. Free shipping available.`,
      images: {
        studio: null,
        angles: [],
        lifestyle: [],
      },
    });
  }

  return products;
}

/**
 * Display product catalog for approval
 */
function displayProductCatalog(products: Product[]): void {
  // Group by category
  const byCategory = products.reduce((acc, product) => {
    const cat = product.category;
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(product);
    return acc;
  }, {} as Record<string, Product[]>);

  // Calculate stats
  const totalValue = products.reduce((sum, p) => sum + p.price, 0);
  const avgPrice = totalValue / products.length;
  const minPrice = Math.min(...products.map((p) => p.price));
  const maxPrice = Math.max(...products.map((p) => p.price));

  let output = `
PRODUCT CATALOG SUMMARY
═══════════════════════════════════════════════════════════════

Total Products: ${products.length}
Categories: ${Object.keys(byCategory).length}
Price Range: $${minPrice.toFixed(2)} - $${maxPrice.toFixed(2)}
Average Price: $${avgPrice.toFixed(2)}

PRODUCTS BY CATEGORY
───────────────────────────────────────────────────────────────
`;

  for (const [category, categoryProducts] of Object.entries(byCategory)) {
    output += `\n${category} (${categoryProducts.length} products)\n`;
    output += '─'.repeat(50) + '\n';

    for (const product of categoryProducts) {
      const saleTag = product.compareAtPrice ? ' [SALE]' : '';
      const variantCount = product.variants.length;
      output += `  • ${product.name}${saleTag}\n`;
      output += `    $${product.price.toFixed(2)} | ${variantCount} variant${variantCount > 1 ? 's' : ''} | ${product.collection}\n`;
    }
  }

  // Show collections
  const collections = [...new Set(products.map((p) => p.collection))];
  output += `\nCOLLECTIONS: ${collections.join(', ')}\n`;

  display.proposal('Product Catalog', output);
}

export default runProductsPhase;
