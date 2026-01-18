import { API_CONFIG } from '../config.js';
import { writeFile, mkdir } from 'fs/promises';
import { dirname } from 'path';

interface ReplicatePrediction {
  id: string;
  status: 'starting' | 'processing' | 'succeeded' | 'failed' | 'canceled';
  output: string[] | null;
  error: string | null;
  urls: {
    get: string;
    cancel: string;
  };
}

export interface ImageGenerationResult {
  success: boolean;
  imageUrl?: string;
  localPath?: string;
  error?: string;
  prompt: string;
  type: 'studio' | 'angle' | 'lifestyle';
  variant?: string;
}

export interface GenerationProgress {
  productId: string;
  productName: string;
  stage: 'studio' | 'angles' | 'lifestyle' | 'complete';
  current: number;
  total: number;
}

type ProgressCallback = (progress: GenerationProgress) => void;

/**
 * Replicate API client for Nano Banana Pro image generation
 */
export class ReplicateClient {
  private apiToken: string;
  private baseUrl = 'https://api.replicate.com/v1';

  constructor() {
    this.apiToken = API_CONFIG.replicate.apiToken;

    if (!this.apiToken) {
      throw new Error('REPLICATE_API_TOKEN is not set');
    }
  }

  /**
   * Generate a product studio image
   */
  async generateStudioImage(
    productName: string,
    productDescription: string,
    style?: string
  ): Promise<ImageGenerationResult> {
    const prompt = this.buildStudioPrompt(productName, productDescription, style);
    try {
      const urls = await this.generate(prompt);
      return {
        success: true,
        imageUrl: urls[0],
        prompt,
        type: 'studio',
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
        prompt,
        type: 'studio',
      };
    }
  }

  /**
   * Generate a single image with custom prompt
   */
  async generateImage(prompt: string, type: 'studio' | 'angle' | 'lifestyle', variant?: string): Promise<ImageGenerationResult> {
    try {
      const urls = await this.generate(prompt);
      return {
        success: true,
        imageUrl: urls[0],
        prompt,
        type,
        variant,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
        prompt,
        type,
        variant,
      };
    }
  }

  /**
   * Generate angle variation images from a core image
   */
  async generateAngleVariations(
    productName: string,
    productDescription: string,
    angles: string[] = ['front', 'side', 'detail', 'flat-lay'],
    onProgress?: (completed: number, total: number) => void
  ): Promise<ImageGenerationResult[]> {
    const results: ImageGenerationResult[] = [];

    for (let i = 0; i < angles.length; i++) {
      const angle = angles[i];
      const prompt = this.buildAnglePrompt(productName, productDescription, angle);
      const result = await this.generateImage(prompt, 'angle', angle);
      results.push(result);
      onProgress?.(i + 1, angles.length);
    }

    return results;
  }

  /**
   * Generate lifestyle images from a core image
   */
  async generateLifestyleImages(
    productName: string,
    productDescription: string,
    contexts: string[] = ['in-use', 'environment', 'styled'],
    onProgress?: (completed: number, total: number) => void
  ): Promise<ImageGenerationResult[]> {
    const results: ImageGenerationResult[] = [];

    for (let i = 0; i < contexts.length; i++) {
      const context = contexts[i];
      const prompt = this.buildLifestylePrompt(productName, productDescription, context);
      const result = await this.generateImage(prompt, 'lifestyle', context);
      results.push(result);
      onProgress?.(i + 1, contexts.length);
    }

    return results;
  }

  /**
   * Generate all images for a product (studio + angles + lifestyle)
   */
  async generateAllProductImages(
    productId: string,
    productName: string,
    productDescription: string,
    style: string,
    onProgress?: ProgressCallback
  ): Promise<{
    studio: ImageGenerationResult;
    angles: ImageGenerationResult[];
    lifestyle: ImageGenerationResult[];
  }> {
    const totalImages = 1 + 4 + 3; // studio + angles + lifestyle
    let completed = 0;

    const reportProgress = (stage: GenerationProgress['stage']) => {
      onProgress?.({
        productId,
        productName,
        stage,
        current: completed,
        total: totalImages,
      });
    };

    // Generate studio shot first
    reportProgress('studio');
    const studio = await this.generateStudioImage(productName, productDescription, style);
    completed++;
    reportProgress('angles');

    // Generate angle variations
    const angles = await this.generateAngleVariations(
      productName,
      productDescription,
      ['front', 'side', 'detail', 'flat-lay'],
      (done) => {
        completed = 1 + done;
        reportProgress('angles');
      }
    );

    // Generate lifestyle images
    reportProgress('lifestyle');
    const lifestyle = await this.generateLifestyleImages(
      productName,
      productDescription,
      ['in-use', 'environment', 'styled'],
      (done) => {
        completed = 5 + done;
        reportProgress('lifestyle');
      }
    );

    reportProgress('complete');

    return { studio, angles, lifestyle };
  }

  /**
   * Run image generation with Nano Banana Pro
   */
  private async generate(prompt: string, retries = 2): Promise<string[]> {
    let lastError: Error | null = null;

    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        // Create prediction
        const prediction = await this.createPrediction(prompt);

        // Poll for completion
        const result = await this.pollPrediction(prediction.id);

        if (result.status === 'failed') {
          throw new Error(`Image generation failed: ${result.error}`);
        }

        return result.output || [];
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));

        if (attempt < retries) {
          // Wait before retry (exponential backoff: 5s, 10s)
          const delay = Math.pow(2, attempt) * 5000;
          await new Promise((resolve) => setTimeout(resolve, delay));
        }
      }
    }

    throw lastError || new Error('Image generation failed after retries');
  }

  /**
   * Create a prediction
   */
  private async createPrediction(prompt: string): Promise<ReplicatePrediction> {
    const response = await fetch(`${this.baseUrl}/predictions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: API_CONFIG.replicate.nanoBananaModel,
        input: {
          prompt,
          width: 1024,
          height: 1024,
          num_outputs: 1,
        },
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Replicate API error: ${error}`);
    }

    return (await response.json()) as ReplicatePrediction;
  }

  /**
   * Poll prediction until completion
   */
  private async pollPrediction(
    predictionId: string,
    maxAttempts = 60,
    intervalMs = 5000
  ): Promise<ReplicatePrediction> {
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      const response = await fetch(
        `${this.baseUrl}/predictions/${predictionId}`,
        {
          headers: {
            'Authorization': `Bearer ${this.apiToken}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to check prediction status: ${response.statusText}`);
      }

      const prediction = (await response.json()) as ReplicatePrediction;

      if (prediction.status === 'succeeded' || prediction.status === 'failed') {
        return prediction;
      }

      // Wait before next poll
      await new Promise((resolve) => setTimeout(resolve, intervalMs));
    }

    throw new Error('Prediction timed out');
  }

  /**
   * Download an image and save to disk
   */
  async downloadImage(url: string, outputPath: string): Promise<void> {
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Failed to download image: ${response.statusText}`);
    }

    const buffer = await response.arrayBuffer();

    // Ensure directory exists
    await mkdir(dirname(outputPath), { recursive: true });

    // Write file
    await writeFile(outputPath, Buffer.from(buffer));
  }

  /**
   * Build studio shot prompt
   */
  private buildStudioPrompt(
    productName: string,
    description: string,
    style?: string
  ): string {
    const styleGuide = style || 'clean, professional, high-end';
    return `Professional product photography of ${productName}. ${description}. Studio lighting, white background, ${styleGuide}. E-commerce ready, high resolution, sharp focus.`;
  }

  /**
   * Build angle variation prompt
   */
  private buildAnglePrompt(productName: string, description: string, angle: string): string {
    const angleDescriptions: Record<string, string> = {
      'front': 'front view, straight on, showing main features',
      'side': 'side profile view, 90 degree angle, showing depth',
      'detail': 'extreme close-up detail shot, texture and craftsmanship visible',
      'flat-lay': 'flat lay overhead view, top down perspective, clean arrangement',
    };

    const angleDesc = angleDescriptions[angle] || angle;
    return `Professional product photography of ${productName}. ${description}. ${angleDesc}. Studio lighting, white background, clean, sharp focus, e-commerce ready.`;
  }

  /**
   * Build lifestyle prompt
   */
  private buildLifestylePrompt(
    productName: string,
    description: string,
    context: string
  ): string {
    const contextDescriptions: Record<string, string> = {
      'in-use': 'product being used in natural setting, lifestyle photography',
      'environment': 'product in styled environment, interior design setting',
      'styled': 'artistic product styling with props and accessories',
    };

    const contextDesc = contextDescriptions[context] || context;
    return `${productName} - ${description}. ${contextDesc}. Professional lifestyle photography, natural lighting, aspirational mood.`;
  }
}

// Singleton instance
let clientInstance: ReplicateClient | null = null;

/**
 * Get the Replicate client instance
 */
export function getReplicateClient(): ReplicateClient {
  if (!clientInstance) {
    clientInstance = new ReplicateClient();
  }
  return clientInstance;
}

export default ReplicateClient;
