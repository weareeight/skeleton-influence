import { API_CONFIG } from '../config.js';
import { writeFile, mkdir } from 'fs/promises';
import { dirname, join } from 'path';

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
  ): Promise<string[]> {
    const prompt = this.buildStudioPrompt(productName, productDescription, style);
    return this.generate(prompt);
  }

  /**
   * Generate angle variation images from a core image
   */
  async generateAngleVariations(
    productName: string,
    coreImageUrl: string,
    angles: string[] = ['front', 'side', 'detail', 'flat-lay']
  ): Promise<string[]> {
    const results: string[] = [];

    for (const angle of angles) {
      const prompt = this.buildAnglePrompt(productName, angle);
      const images = await this.generate(prompt);
      results.push(...images);
    }

    return results;
  }

  /**
   * Generate lifestyle images from a core image
   */
  async generateLifestyleImages(
    productName: string,
    productDescription: string,
    contexts: string[] = ['in-use', 'environment', 'styled']
  ): Promise<string[]> {
    const results: string[] = [];

    for (const context of contexts) {
      const prompt = this.buildLifestylePrompt(productName, productDescription, context);
      const images = await this.generate(prompt);
      results.push(...images);
    }

    return results;
  }

  /**
   * Run image generation with Nano Banana Pro
   */
  private async generate(prompt: string): Promise<string[]> {
    // Create prediction
    const prediction = await this.createPrediction(prompt);

    // Poll for completion
    const result = await this.pollPrediction(prediction.id);

    if (result.status === 'failed') {
      throw new Error(`Image generation failed: ${result.error}`);
    }

    return result.output || [];
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
  private buildAnglePrompt(productName: string, angle: string): string {
    const angleDescriptions: Record<string, string> = {
      'front': 'front view, straight on',
      'side': 'side profile view, 90 degree angle',
      'detail': 'close-up detail shot, texture and craftsmanship',
      'flat-lay': 'flat lay overhead view, top down perspective',
    };

    const angleDesc = angleDescriptions[angle] || angle;
    return `Professional product photography of ${productName}, ${angleDesc}. Studio lighting, white background, clean, sharp focus.`;
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
