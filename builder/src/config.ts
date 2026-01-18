import { config as dotenvConfig } from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Load environment variables
dotenvConfig();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Paths
export const PATHS = {
  root: join(__dirname, '..', '..'),
  builder: join(__dirname, '..'),
  elle: join(__dirname, '..', '..', 'elle'),
  output: join(__dirname, '..', '..', 'output'),
  prompts: join(__dirname, '..', 'prompts'),
  sessions: join(__dirname, '..', '..', 'sessions'),
} as const;

// AI Model Configuration (via OpenRouter)
export const AI_MODELS = {
  planning: 'anthropic/claude-opus-4.5',
  coding: 'openai/gpt-5.2-codex-extra-high-thinking',
} as const;

// API Configuration
export const API_CONFIG = {
  openRouter: {
    baseUrl: 'https://openrouter.ai/api/v1',
    apiKey: process.env.OPENROUTER_API_KEY || '',
    referer: 'https://theme-builder.local',
    title: 'Theme Builder',
  },
  replicate: {
    apiToken: process.env.REPLICATE_API_TOKEN || '',
    nanoBananaModel: 'fofr/sticker-maker:4acb778eb059772225ec213948f0660867b2e03f277448f18cf1800b96a65a1a',
  },
  shopify: {
    cliToken: process.env.SHOPIFY_CLI_THEME_TOKEN || '',
    devStore: process.env.SHOPIFY_DEV_STORE || '',
  },
} as const;

// Generation Settings
export const GENERATION_CONFIG = {
  productsCount: 20,
  newSectionsCount: 4,
  modifiedSectionsCount: 4,
  anglesPerProduct: 4,
  lifestyleImagesPerProduct: 3,
  maxApprovalIterations: 10,
} as const;

// AI Temperature Settings
export const AI_TEMPERATURE = {
  planning: 0.7,
  coding: 0.2,
} as const;

// AI Token Limits
export const AI_MAX_TOKENS = {
  planning: 4096,
  coding: 8192,
} as const;

// Validate required environment variables
export function validateConfig(): { valid: boolean; missing: string[] } {
  const required = [
    'OPENROUTER_API_KEY',
    'REPLICATE_API_TOKEN',
    'SHOPIFY_CLI_THEME_TOKEN',
    'SHOPIFY_DEV_STORE',
  ];

  const missing = required.filter((key) => !process.env[key]);

  return {
    valid: missing.length === 0,
    missing,
  };
}
