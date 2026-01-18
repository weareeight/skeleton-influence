import cliProgress from 'cli-progress';
import chalk from 'chalk';

/**
 * Create a single progress bar
 */
export function createProgressBar(
  label: string,
  total: number
): cliProgress.SingleBar {
  const bar = new cliProgress.SingleBar(
    {
      format: `${chalk.cyan(label)} │{bar}│ {percentage}% │ {value}/{total} │ {eta}s remaining`,
      barCompleteChar: '█',
      barIncompleteChar: '░',
      hideCursor: true,
    },
    cliProgress.Presets.shades_classic
  );

  bar.start(total, 0);
  return bar;
}

/**
 * Create a multi-bar container for multiple concurrent progress bars
 */
export function createMultiProgressBar(): cliProgress.MultiBar {
  return new cliProgress.MultiBar(
    {
      format: `{label} │{bar}│ {percentage}% │ {value}/{total}`,
      barCompleteChar: '█',
      barIncompleteChar: '░',
      hideCursor: true,
      clearOnComplete: false,
    },
    cliProgress.Presets.shades_classic
  );
}

/**
 * Progress tracker for long-running operations
 */
export class ProgressTracker {
  private bar: cliProgress.SingleBar;
  private current: number = 0;
  private total: number;

  constructor(label: string, total: number) {
    this.total = total;
    this.bar = createProgressBar(label, total);
  }

  /**
   * Increment progress by 1
   */
  increment(amount = 1): void {
    this.current += amount;
    this.bar.update(this.current);
  }

  /**
   * Set progress to specific value
   */
  update(value: number): void {
    this.current = value;
    this.bar.update(value);
  }

  /**
   * Complete and close the progress bar
   */
  complete(): void {
    this.bar.update(this.total);
    this.bar.stop();
  }

  /**
   * Stop the progress bar (for errors)
   */
  stop(): void {
    this.bar.stop();
  }
}

/**
 * Track progress for image generation across multiple products
 */
export class ImageGenerationTracker {
  private multiBar: cliProgress.MultiBar;
  private bars: Map<string, cliProgress.SingleBar> = new Map();

  constructor() {
    this.multiBar = createMultiProgressBar();
  }

  /**
   * Add a product to track
   */
  addProduct(productId: string, productName: string, totalImages: number): void {
    const bar = this.multiBar.create(totalImages, 0, {
      label: productName.padEnd(20).substring(0, 20),
    });
    this.bars.set(productId, bar);
  }

  /**
   * Update progress for a product
   */
  updateProduct(productId: string, completed: number): void {
    const bar = this.bars.get(productId);
    if (bar) {
      bar.update(completed);
    }
  }

  /**
   * Increment progress for a product
   */
  incrementProduct(productId: string, amount = 1): void {
    const bar = this.bars.get(productId);
    if (bar) {
      bar.increment(amount);
    }
  }

  /**
   * Stop all progress bars
   */
  stop(): void {
    this.multiBar.stop();
  }
}
