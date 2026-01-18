import { exec } from 'child_process';
import { promisify } from 'util';
import { API_CONFIG } from '../config.js';
import { display } from '../ui/display.js';

const execAsync = promisify(exec);

interface ThemePushResult {
  success: boolean;
  themeId?: string;
  previewUrl?: string;
  editorUrl?: string;
  error?: string;
}

interface ThemeInfo {
  id: string;
  name: string;
  role: string;
  previewUrl: string;
}

/**
 * Shopify CLI wrapper for theme operations
 */
export class ShopifyCLI {
  private store: string;
  private token: string;

  constructor() {
    this.store = API_CONFIG.shopify.devStore;
    this.token = API_CONFIG.shopify.cliToken;

    if (!this.store || !this.token) {
      throw new Error('SHOPIFY_DEV_STORE and SHOPIFY_CLI_THEME_TOKEN must be set');
    }
  }

  /**
   * Push theme to Shopify as unpublished
   */
  async pushTheme(themePath: string, themeName: string): Promise<ThemePushResult> {
    try {
      display.info(`Pushing theme to ${this.store}...`);

      const command = `shopify theme push "${themePath}" --unpublished --store="${this.store}" --theme="${themeName}" --json`;

      const { stdout, stderr } = await execAsync(command, {
        env: {
          ...process.env,
          SHOPIFY_CLI_THEME_TOKEN: this.token,
        },
        timeout: 300000, // 5 minute timeout
      });

      // Parse JSON output
      try {
        const result = JSON.parse(stdout);
        return {
          success: true,
          themeId: result.theme?.id?.toString(),
          previewUrl: result.theme?.preview_url,
          editorUrl: result.theme?.editor_url,
        };
      } catch {
        // Try to extract from text output
        const themeIdMatch = stdout.match(/Theme ID: (\d+)/);
        const previewMatch = stdout.match(/Preview: (https?:\/\/[^\s]+)/);

        if (themeIdMatch) {
          return {
            success: true,
            themeId: themeIdMatch[1],
            previewUrl: previewMatch?.[1],
          };
        }

        // Check if push was successful even without parsing
        if (stdout.includes('Theme pushed successfully') || !stderr) {
          return {
            success: true,
            previewUrl: `https://${this.store}/?preview_theme_id=`,
          };
        }

        throw new Error('Could not parse theme push output');
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      return {
        success: false,
        error: message,
      };
    }
  }

  /**
   * Get preview URL for a theme
   */
  async getPreviewUrl(themeId: string): Promise<string> {
    return `https://${this.store}/?preview_theme_id=${themeId}`;
  }

  /**
   * Delete a theme by ID
   */
  async deleteTheme(themeId: string): Promise<boolean> {
    try {
      display.info(`Deleting theme ${themeId}...`);

      const command = `shopify theme delete --theme="${themeId}" --store="${this.store}" --force`;

      await execAsync(command, {
        env: {
          ...process.env,
          SHOPIFY_CLI_THEME_TOKEN: this.token,
        },
        timeout: 60000,
      });

      return true;
    } catch (error) {
      display.warning(`Failed to delete theme: ${error instanceof Error ? error.message : error}`);
      return false;
    }
  }

  /**
   * List all themes on the store
   */
  async listThemes(): Promise<ThemeInfo[]> {
    try {
      const command = `shopify theme list --store="${this.store}" --json`;

      const { stdout } = await execAsync(command, {
        env: {
          ...process.env,
          SHOPIFY_CLI_THEME_TOKEN: this.token,
        },
        timeout: 30000,
      });

      const themes = JSON.parse(stdout);
      return themes.map((t: Record<string, unknown>) => ({
        id: String(t.id),
        name: String(t.name),
        role: String(t.role),
        previewUrl: `https://${this.store}/?preview_theme_id=${t.id}`,
      }));
    } catch {
      return [];
    }
  }

  /**
   * Run Shopify Theme Check on a theme directory
   */
  async runThemeCheck(themePath: string): Promise<{
    passed: boolean;
    errors: string[];
    warnings: string[];
  }> {
    try {
      const command = `shopify theme check "${themePath}" --json`;

      const { stdout, stderr } = await execAsync(command, {
        timeout: 120000,
      });

      try {
        const results = JSON.parse(stdout);
        const errors: string[] = [];
        const warnings: string[] = [];

        for (const issue of results) {
          const message = `${issue.path}: ${issue.message}`;
          if (issue.severity === 'error') {
            errors.push(message);
          } else {
            warnings.push(message);
          }
        }

        return {
          passed: errors.length === 0,
          errors,
          warnings,
        };
      } catch {
        // Theme check passed with no issues
        return {
          passed: true,
          errors: [],
          warnings: [],
        };
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      return {
        passed: false,
        errors: [message],
        warnings: [],
      };
    }
  }

  /**
   * Open theme in browser
   */
  async openPreview(previewUrl: string): Promise<void> {
    const { default: open } = await import('open');
    await open(previewUrl);
  }
}

// Singleton instance
let cliInstance: ShopifyCLI | null = null;

export function getShopifyCLI(): ShopifyCLI {
  if (!cliInstance) {
    cliInstance = new ShopifyCLI();
  }
  return cliInstance;
}

export default ShopifyCLI;
