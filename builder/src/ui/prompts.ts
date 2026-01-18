import inquirer from 'inquirer';
import type { SessionState } from '../types.js';

/**
 * Prompt for main menu selection
 */
export async function promptMainMenu(): Promise<'new' | 'resume' | 'quit'> {
  const { action } = await inquirer.prompt([
    {
      type: 'list',
      name: 'action',
      message: 'What would you like to do?',
      choices: [
        { name: 'Start new theme generation', value: 'new' },
        { name: 'Resume existing session', value: 'resume' },
        { name: 'Quit', value: 'quit' },
      ],
    },
  ]);
  return action;
}

/**
 * Prompt to resume or start new session
 */
export async function promptResume(
  sessions: Array<{ id: string; themeName?: string; lastUpdatedAt: Date; currentPhase: string }>
): Promise<string> {
  const choices = [
    { name: 'Start new session', value: 'new' },
    ...sessions.map((s) => ({
      name: `Resume: ${s.themeName || s.id} (${s.currentPhase}) - ${formatDate(s.lastUpdatedAt)}`,
      value: s.id,
    })),
  ];

  const { session } = await inquirer.prompt([
    {
      type: 'list',
      name: 'session',
      message: 'Resume existing session or start new?',
      choices,
    },
  ]);
  return session;
}

/**
 * Prompt for text input
 */
export async function promptText(
  message: string,
  defaultValue?: string
): Promise<string> {
  const { value } = await inquirer.prompt([
    {
      type: 'input',
      name: 'value',
      message,
      default: defaultValue,
    },
  ]);
  return value;
}

/**
 * Prompt for multiline text input (editor)
 */
export async function promptEditor(
  message: string,
  defaultValue?: string
): Promise<string> {
  const { value } = await inquirer.prompt([
    {
      type: 'editor',
      name: 'value',
      message,
      default: defaultValue,
    },
  ]);
  return value;
}

/**
 * Prompt for confirmation
 */
export async function promptConfirm(
  message: string,
  defaultValue = true
): Promise<boolean> {
  const { confirmed } = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'confirmed',
      message,
      default: defaultValue,
    },
  ]);
  return confirmed;
}

/**
 * Prompt for single selection
 */
export async function promptSelect<T extends string>(
  message: string,
  choices: Array<{ name: string; value: T }>
): Promise<T> {
  const { selection } = await inquirer.prompt([
    {
      type: 'list',
      name: 'selection',
      message,
      choices,
    },
  ]);
  return selection;
}

/**
 * Prompt for multiple selection
 */
export async function promptMultiSelect<T extends string>(
  message: string,
  choices: Array<{ name: string; value: T; checked?: boolean }>
): Promise<T[]> {
  const { selections } = await inquirer.prompt([
    {
      type: 'checkbox',
      name: 'selections',
      message,
      choices,
    },
  ]);
  return selections;
}

/**
 * Prompt for number input
 */
export async function promptNumber(
  message: string,
  defaultValue?: number,
  min?: number,
  max?: number
): Promise<number> {
  const { value } = await inquirer.prompt([
    {
      type: 'number',
      name: 'value',
      message,
      default: defaultValue,
      validate: (input: number) => {
        if (min !== undefined && input < min) {
          return `Value must be at least ${min}`;
        }
        if (max !== undefined && input > max) {
          return `Value must be at most ${max}`;
        }
        return true;
      },
    },
  ]);
  return value;
}

/**
 * Prompt for password/secret input
 */
export async function promptPassword(message: string): Promise<string> {
  const { value } = await inquirer.prompt([
    {
      type: 'password',
      name: 'value',
      message,
      mask: '*',
    },
  ]);
  return value;
}

/**
 * Prompt for a list of items (one per line)
 */
export async function promptList(
  message: string,
  defaultValue?: string[]
): Promise<string[]> {
  const { value } = await inquirer.prompt([
    {
      type: 'editor',
      name: 'value',
      message: `${message} (one per line)`,
      default: defaultValue?.join('\n'),
    },
  ]);
  return value
    .split('\n')
    .map((line: string) => line.trim())
    .filter((line: string) => line.length > 0);
}

// Helper function
function formatDate(date: Date): string {
  return new Date(date).toLocaleString();
}
