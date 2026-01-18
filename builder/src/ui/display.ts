import chalk from 'chalk';

const BANNER = `
╔═══════════════════════════════════════════════════════════════════════════════╗
║                                                                               ║
║   ████████╗██╗  ██╗███████╗███╗   ███╗███████╗    ██████╗ ██╗   ██╗██╗██╗     ║
║   ╚══██╔══╝██║  ██║██╔════╝████╗ ████║██╔════╝    ██╔══██╗██║   ██║██║██║     ║
║      ██║   ███████║█████╗  ██╔████╔██║█████╗      ██████╔╝██║   ██║██║██║     ║
║      ██║   ██╔══██║██╔══╝  ██║╚██╔╝██║██╔══╝      ██╔══██╗██║   ██║██║██║     ║
║      ██║   ██║  ██║███████╗██║ ╚═╝ ██║███████╗    ██████╔╝╚██████╔╝██║███████╗║
║      ╚═╝   ╚═╝  ╚═╝╚══════╝╚═╝     ╚═╝╚══════╝    ╚═════╝  ╚═════╝ ╚═╝╚══════╝║
║                                                                               ║
║                 Interactive Shopify Theme Generation Tool                      ║
║                                                                               ║
╚═══════════════════════════════════════════════════════════════════════════════╝
`;

const DIVIDER = '═'.repeat(79);
const THIN_DIVIDER = '─'.repeat(79);

export const display = {
  /**
   * Display the application banner
   */
  banner(): void {
    console.log(chalk.cyan(BANNER));
  },

  /**
   * Display a thick divider line
   */
  divider(): void {
    console.log(chalk.gray(DIVIDER));
  },

  /**
   * Display a thin divider line
   */
  thinDivider(): void {
    console.log(chalk.gray(THIN_DIVIDER));
  },

  /**
   * Display a phase header
   */
  phaseHeader(title: string, current: number, total: number): void {
    console.log('');
    console.log(chalk.cyan(DIVIDER));
    console.log(chalk.cyan.bold(`  PHASE ${current}/${total}: ${title.toUpperCase()}`));
    console.log(chalk.cyan(DIVIDER));
    console.log('');
  },

  /**
   * Display a section header within a phase
   */
  sectionHeader(title: string): void {
    console.log('');
    console.log(chalk.yellow(`▶ ${title}`));
    console.log(chalk.gray(THIN_DIVIDER));
  },

  /**
   * Display a success message
   */
  success(message: string): void {
    console.log(chalk.green(`✓ ${message}`));
  },

  /**
   * Display an error message
   */
  error(message: string): void {
    console.log(chalk.red(`✗ ${message}`));
  },

  /**
   * Display a warning message
   */
  warning(message: string): void {
    console.log(chalk.yellow(`⚠ ${message}`));
  },

  /**
   * Display an info message
   */
  info(message: string): void {
    console.log(chalk.blue(`ℹ ${message}`));
  },

  /**
   * Display plain text
   */
  text(message: string): void {
    console.log(message);
  },

  /**
   * Display a label and value pair
   */
  keyValue(label: string, value: string): void {
    console.log(`${chalk.gray(label + ':')} ${value}`);
  },

  /**
   * Display a list of items
   */
  list(items: string[], indent = 2): void {
    const prefix = ' '.repeat(indent);
    items.forEach((item) => {
      console.log(`${prefix}${chalk.gray('•')} ${item}`);
    });
  },

  /**
   * Display a numbered list
   */
  numberedList(items: string[], indent = 2): void {
    const prefix = ' '.repeat(indent);
    items.forEach((item, index) => {
      console.log(`${prefix}${chalk.gray(`${index + 1}.`)} ${item}`);
    });
  },

  /**
   * Display a code block
   */
  code(content: string, language?: string): void {
    console.log('');
    console.log(chalk.gray(`\`\`\`${language || ''}`));
    console.log(chalk.white(content));
    console.log(chalk.gray('```'));
    console.log('');
  },

  /**
   * Display a proposal for approval
   */
  proposal(title: string, content: string): void {
    console.log('');
    console.log(chalk.cyan.bold(`┌─ ${title} ─${'─'.repeat(Math.max(0, 70 - title.length))}`));
    console.log(chalk.cyan('│'));
    content.split('\n').forEach((line) => {
      console.log(chalk.cyan('│  ') + line);
    });
    console.log(chalk.cyan('│'));
    console.log(chalk.cyan('└' + '─'.repeat(75)));
    console.log('');
  },

  /**
   * Display a table
   */
  table(headers: string[], rows: string[][]): void {
    // Calculate column widths
    const widths = headers.map((h, i) => {
      const values = [h, ...rows.map((r) => r[i] || '')];
      return Math.max(...values.map((v) => v.length));
    });

    // Header row
    const headerRow = headers.map((h, i) => h.padEnd(widths[i])).join(' │ ');
    console.log(chalk.bold(headerRow));
    console.log(widths.map((w) => '─'.repeat(w)).join('─┼─'));

    // Data rows
    rows.forEach((row) => {
      const dataRow = row.map((cell, i) => (cell || '').padEnd(widths[i])).join(' │ ');
      console.log(dataRow);
    });
  },

  /**
   * Display iteration counter for approval loops
   */
  iteration(current: number, max: number): void {
    console.log(chalk.gray(`Iteration ${current}/${max}`));
  },

  /**
   * Clear the console
   */
  clear(): void {
    console.clear();
  },

  /**
   * Add empty lines
   */
  newline(count = 1): void {
    for (let i = 0; i < count; i++) {
      console.log('');
    }
  },
};

export default display;
