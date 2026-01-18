// Core types for the Theme Builder application

export interface ThemeBrief {
  industry: string;
  targetMarket: string;
  styleDirection: string;
  competitors: string[];
  brandName?: string;
  positioning?: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  compareAtPrice?: number;
  category: string;
  collection: string;
  variants: ProductVariant[];
  seoTitle: string;
  seoDescription: string;
  images: ProductImages;
}

export interface ProductVariant {
  name: string;
  option1?: string;
  option2?: string;
  option3?: string;
  sku?: string;
  inventory: number;
}

export interface ProductImages {
  studio: string | null;
  angles: string[];
  lifestyle: string[];
}

export interface SectionProposal {
  id: string;
  name: string;
  type: 'new' | 'modified';
  concept: string;
  functionality: string;
  uniqueFeatures: string[];
  settingsSchema?: Record<string, unknown>;
}

export interface DesignSystem {
  colorSchemes: ColorScheme[];
  selectedScheme?: number;
  typography: TypographyConfig;
  spacing: SpacingConfig;
  corners: CornerConfig;
  buttons: ButtonConfig;
}

export interface ColorScheme {
  name: string;
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  text: string;
  muted: string;
}

export interface TypographyConfig {
  headingFont: string;
  bodyFont: string;
  headingWeight: number;
  bodyWeight: number;
  baseSize: string;
  scale: number;
}

export interface SpacingConfig {
  base: string;
  scale: number;
}

export interface CornerConfig {
  radius: string;
  style: 'sharp' | 'rounded' | 'pill';
}

export interface ButtonConfig {
  style: 'filled' | 'outline' | 'ghost';
  corners: string;
  padding: string;
}

export interface TestResult {
  passed: boolean;
  category: string;
  name: string;
  message?: string;
  severity: 'error' | 'warning' | 'info';
}

export interface SubmissionAssets {
  themeName?: string;
  generatedAt?: string;
  previewUrl?: string;
  thumbnail?: string | null;
  desktopPreview?: string | null;
  mobilePreview?: string | null;
  keyFeatureImages?: string[];
  keyFeatures?: string[];
  documentation?: string | null;
  assets?: {
    keyFeatures?: string[];
    thumbnail?: string;
    desktopPreview?: string;
    mobilePreview?: string;
  };
}

export interface SectionInfo {
  name?: string;
  filename?: string;
  description?: string;
}

export interface ImageManifest {
  total?: number;
  perProduct?: number;
}

export interface DocumentationPaths {
  documentationPath: string;
  checklistPath: string;
  reportPath: string;
}

export interface SessionState {
  id: string;
  themeName: string;
  startedAt: Date;
  lastUpdatedAt: Date;
  currentPhase: Phase;
  completedPhases: Phase[];
  brief: ThemeBrief | null;
  products: Product[];
  sections: SectionProposal[];
  newSections?: SectionInfo[];
  modifiedSections?: SectionInfo[];
  designSystem: DesignSystem | null;
  imageManifest?: ImageManifest;
  testResults: TestResult[];
  testThemePreviewUrl?: string;
  submissionThemeId?: string;
  submissionAssets: SubmissionAssets | null;
  documentation?: DocumentationPaths;
  approvalHistory: ApprovalRecord[];
}

export interface ApprovalRecord {
  phase: Phase;
  step: string;
  iteration: number;
  accepted: boolean;
  feedback?: string;
  timestamp: Date;
}

export type Phase =
  | 'brief'
  | 'products'
  | 'images'
  | 'differentiation'
  | 'design-system'
  | 'code-generation'
  | 'testing'
  | 'submission';

export interface Message {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export type TaskType = 'planning' | 'coding';

export interface AIResponse {
  content: string;
  model: string;
  tokensUsed: number;
}
