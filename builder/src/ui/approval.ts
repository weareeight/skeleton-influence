import inquirer from 'inquirer';
import { display } from './display.js';
import type { ApprovalRecord, Phase } from '../types.js';
import { GENERATION_CONFIG } from '../config.js';

export interface ApprovalResult {
  accepted: boolean;
  feedback?: string;
  iteration: number;
}

interface ApprovalState {
  phase: Phase;
  step: string;
  iteration: number;
  history: ApprovalRecord[];
}

/**
 * Run an approval loop for a generated proposal
 *
 * This implements the cyclical "Accept or Comments" pattern:
 * 1. Display proposal to user
 * 2. Ask "Accept or provide comments?"
 * 3. If Accept -> return and proceed
 * 4. If Comments -> call regenerate function with feedback, loop back
 */
export async function approvalLoop<T>(
  phase: Phase,
  step: string,
  options: {
    /** Function that generates the proposal */
    generate: (feedback?: string) => Promise<T>;
    /** Function that displays the proposal to the user */
    display: (proposal: T) => void;
    /** Maximum iterations before forcing a decision */
    maxIterations?: number;
    /** Previous iteration history (for resume) */
    history?: ApprovalRecord[];
  }
): Promise<{ result: T; record: ApprovalRecord }> {
  const maxIterations = options.maxIterations || GENERATION_CONFIG.maxApprovalIterations;
  const history = options.history || [];
  let iteration = history.length + 1;
  let feedback: string | undefined;

  while (iteration <= maxIterations) {
    // Show iteration counter
    display.iteration(iteration, maxIterations);
    display.newline();

    // Generate proposal
    const proposal = await options.generate(feedback);

    // Display proposal
    options.display(proposal);

    // Ask for approval
    const { decision } = await inquirer.prompt([
      {
        type: 'list',
        name: 'decision',
        message: 'Accept this proposal, or provide comments to refine?',
        choices: [
          { name: 'Accept - proceed to next step', value: 'accept' },
          { name: 'Comments - I\'ll regenerate based on your feedback', value: 'comments' },
        ],
      },
    ]);

    if (decision === 'accept') {
      const record: ApprovalRecord = {
        phase,
        step,
        iteration,
        accepted: true,
        timestamp: new Date(),
      };

      display.success('Proposal accepted');
      return { result: proposal, record };
    }

    // Get feedback
    const { userFeedback } = await inquirer.prompt([
      {
        type: 'input',
        name: 'userFeedback',
        message: 'Enter your feedback (what should change?):',
        validate: (input: string) => {
          if (!input.trim()) {
            return 'Please provide feedback or select Accept';
          }
          return true;
        },
      },
    ]);

    feedback = userFeedback;

    // Record this iteration
    history.push({
      phase,
      step,
      iteration,
      accepted: false,
      feedback,
      timestamp: new Date(),
    });

    display.info('Incorporating feedback and regenerating...');
    display.divider();

    iteration++;
  }

  // Max iterations reached - force decision
  display.warning(`Maximum iterations (${maxIterations}) reached.`);

  const { finalDecision } = await inquirer.prompt([
    {
      type: 'list',
      name: 'finalDecision',
      message: 'You must accept the current proposal or skip this step:',
      choices: [
        { name: 'Accept current proposal', value: 'accept' },
        { name: 'Skip this step (may cause issues)', value: 'skip' },
      ],
    },
  ]);

  // Generate one last time for the final result
  const finalProposal = await options.generate(feedback);

  const record: ApprovalRecord = {
    phase,
    step,
    iteration: maxIterations,
    accepted: finalDecision === 'accept',
    feedback: finalDecision === 'skip' ? 'SKIPPED - max iterations' : undefined,
    timestamp: new Date(),
  };

  return { result: finalProposal, record };
}

/**
 * Simple yes/no approval without regeneration loop
 */
export async function simpleApproval(
  message: string,
  defaultValue = true
): Promise<boolean> {
  const { approved } = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'approved',
      message,
      default: defaultValue,
    },
  ]);
  return approved;
}

/**
 * Approval with option to view more details
 */
export async function detailedApproval<T>(
  phase: Phase,
  step: string,
  options: {
    summary: string;
    details: () => Promise<T>;
    onAccept: (details: T) => Promise<void>;
  }
): Promise<ApprovalRecord> {
  display.proposal(step, options.summary);

  let details: T | null = null;

  while (true) {
    const { action } = await inquirer.prompt([
      {
        type: 'list',
        name: 'action',
        message: 'What would you like to do?',
        choices: [
          { name: 'Accept this proposal', value: 'accept' },
          { name: 'View full details', value: 'details' },
          { name: 'Reject and regenerate', value: 'reject' },
        ],
      },
    ]);

    if (action === 'accept') {
      if (!details) {
        details = await options.details();
      }
      await options.onAccept(details);

      return {
        phase,
        step,
        iteration: 1,
        accepted: true,
        timestamp: new Date(),
      };
    }

    if (action === 'details') {
      details = await options.details();
      display.text(JSON.stringify(details, null, 2));
      continue;
    }

    if (action === 'reject') {
      return {
        phase,
        step,
        iteration: 1,
        accepted: false,
        timestamp: new Date(),
      };
    }
  }
}

/**
 * Batch approval for multiple items (e.g., product list)
 */
export async function batchApproval<T>(
  phase: Phase,
  step: string,
  items: T[],
  options: {
    displayItem: (item: T, index: number) => void;
    itemLabel: (item: T) => string;
  }
): Promise<{ approved: T[]; rejected: T[]; record: ApprovalRecord }> {
  display.sectionHeader(`Review ${items.length} items`);

  // Display all items
  items.forEach((item, index) => {
    options.displayItem(item, index);
  });

  display.divider();

  const { action } = await inquirer.prompt([
    {
      type: 'list',
      name: 'action',
      message: 'How would you like to proceed?',
      choices: [
        { name: 'Accept all items', value: 'accept-all' },
        { name: 'Review individually', value: 'individual' },
        { name: 'Reject all and regenerate', value: 'reject-all' },
      ],
    },
  ]);

  if (action === 'accept-all') {
    return {
      approved: items,
      rejected: [],
      record: {
        phase,
        step,
        iteration: 1,
        accepted: true,
        timestamp: new Date(),
      },
    };
  }

  if (action === 'reject-all') {
    return {
      approved: [],
      rejected: items,
      record: {
        phase,
        step,
        iteration: 1,
        accepted: false,
        timestamp: new Date(),
      },
    };
  }

  // Individual review
  const approved: T[] = [];
  const rejected: T[] = [];

  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    options.displayItem(item, i);

    const { itemAction } = await inquirer.prompt([
      {
        type: 'list',
        name: 'itemAction',
        message: `Accept "${options.itemLabel(item)}"?`,
        choices: [
          { name: 'Accept', value: 'accept' },
          { name: 'Reject', value: 'reject' },
        ],
      },
    ]);

    if (itemAction === 'accept') {
      approved.push(item);
    } else {
      rejected.push(item);
    }
  }

  return {
    approved,
    rejected,
    record: {
      phase,
      step,
      iteration: 1,
      accepted: approved.length > 0,
      feedback: rejected.length > 0 ? `${rejected.length} items rejected` : undefined,
      timestamp: new Date(),
    },
  };
}
