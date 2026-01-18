import type { TaskType } from '../types.js';

/**
 * Model configuration for different AI tasks
 */
export const MODEL_CONFIG = {
  // Claude Opus 4.5 - Best for reasoning, creativity, nuanced analysis
  planning: {
    id: 'anthropic/claude-opus-4.5',
    name: 'Claude Opus 4.5',
    provider: 'Anthropic',
    strengths: ['Reasoning', 'Creativity', 'Nuanced analysis'],
    bestFor: [
      'Market analysis and positioning',
      'Brand strategy and naming',
      'Section concept proposals',
      'Design system decisions',
      'Screenshot visual review',
      'Architecture and planning',
    ],
    temperature: 0.7,
    maxTokens: 4096,
  },

  // GPT 5.2 Codex - Best for code quality, syntax accuracy, structured output
  coding: {
    id: 'openai/gpt-5.2-codex-extra-high-thinking',
    name: 'GPT 5.2 Codex (Extra High Thinking)',
    provider: 'OpenAI',
    strengths: ['Code quality', 'Syntax accuracy', 'Structured output'],
    bestFor: [
      'Liquid template generation',
      'JavaScript code generation',
      'CSS generation',
      'Section schema generation',
      'Header/footer rewrites',
      'Code modifications',
    ],
    temperature: 0.2,
    maxTokens: 8192,
  },
} as const;

/**
 * Task-to-model mapping for easy reference
 */
export const TASK_MODEL_MAP: Record<string, TaskType> = {
  // Planning tasks -> Claude Opus 4.5
  'market-analysis': 'planning',
  'brand-positioning': 'planning',
  'section-concepts': 'planning',
  'design-decisions': 'planning',
  'screenshot-review': 'planning',
  'product-names': 'planning',
  'product-descriptions': 'planning',
  'feature-analysis': 'planning',

  // Coding tasks -> GPT 5.2 Codex
  'liquid-generation': 'coding',
  'javascript-generation': 'coding',
  'css-generation': 'coding',
  'schema-generation': 'coding',
  'header-rewrite': 'coding',
  'footer-rewrite': 'coding',
  'section-modification': 'coding',
  'settings-configuration': 'coding',
};

/**
 * Get the task type for a specific task name
 */
export function getTaskType(taskName: string): TaskType {
  return TASK_MODEL_MAP[taskName] || 'planning';
}

/**
 * Get model configuration for a task type
 */
export function getModelConfig(taskType: TaskType) {
  return MODEL_CONFIG[taskType];
}

/**
 * Display model information
 */
export function getModelInfo(taskType: TaskType): string {
  const config = MODEL_CONFIG[taskType];
  return `${config.name} (${config.provider})`;
}
