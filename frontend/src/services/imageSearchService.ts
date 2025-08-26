import { SearchFilters, Property, PropertyType } from '../types';
import { aiSearchService } from './aiSearchService';

interface ImageSearchOptions {
  maxFileSize?: number; // in bytes
  allowedTypes?: string[];
  quality?: number; // 0-1 for compression
  maxWidth?: number;
  maxHeight?: number;
}

interface ImageAnalysisResult {
  propertyType?: string;
  features: string[];
  style?: string;
  estimatedPrice?: {
    min: number;
    max: number;
  };
  location?: {
    area?: string;
    confidence: number;
  };
  confidence: number;
}

interface ImageSearchResult {
  analysis: ImageAnalysisResult;
  filters: SearchFilters;
  similarProperties: Property[];
  searchQuery: string;
}

interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

class ImageSearchService {
  private readonly defaultOptions: ImageSearchOptions = {
    maxFileSize: 10 * 1024 * 1024, // 10MB
    allowedTypes: ['image/jpeg', 'image/png', 'image/webp'],
    quality: 0.8,
    maxWidth: 1920,
    maxHeight: 1080
  };

  /**
   * Validate uploaded image file
   */
  validateImage(file: File, options: ImageSearchOptions = {}): { valid: boolean; error?: string } {
    const opts = { ...this.defaultOptions, ...options };

    // Check file type
    if (!opts.allowedTypes?.includes(file.type)) {
      return {
        valid: false,
        error: `Invalid file type. Allowed types: ${opts.allowedTypes?.join(', ')}`
      };
    }

    // Check file size
    if (file.size > (opts.maxFileSize || this.defaultOptions.maxFileSize!)) {
      const maxSizeMB = (opts.maxFileSize || this.defaultOptions.maxFileSize!) / (1024 * 1024);
      return {
        valid: false,
        error: `File too large. Maximum size: ${maxSizeMB}MB`
      };
    }

    return { valid: true };
  }

  /**
   * Compress and resize image if needed
   */
  private async processImage(
    file: File, 
    options: ImageSearchOptions = {}
  ): Promise<{ blob: Blob; dataUrl: string }> {
    const opts = { ...this.defaultOptions, ...options };

    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      img.onload = () => {
        // Calculate new dimensions
        let { width, height } = img;
        const maxWidth = opts.maxWidth || this.defaultOptions.maxWidth!;
        const maxHeight = opts.maxHeight || this.defaultOptions.maxHeight!;

        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width *= ratio;
          height *= ratio;
        }

        // Set canvas dimensions
        canvas.width = width;
        canvas.height = height;

        // Draw and compress image
        ctx?.drawImage(img, 0, 0, width, height);
        
        canvas.toBlob(
          (blob) => {
            if (blob) {
              const dataUrl = canvas.toDataURL('image/jpeg', opts.quality);
              resolve({ blob, dataUrl });
            } else {
              reject(new Error('Failed to process image'));
            }
          },
          'image/jpeg',
          opts.quality
        );
      };

      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = URL.createObjectURL(file);
    });
  }

  /**
   * Analyze image to extract property features and characteristics
   */
  private async analyzeImage(imageData: string): Promise<ImageAnalysisResult> {
    // In a real implementation, this would call an AI vision service
    // For now, we'll simulate the analysis with mock data
    
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Mock analysis based on image characteristics
      // In reality, this would use computer vision APIs like:
      // - Google Vision API
      // - AWS Rekognition
      // - Azure Computer Vision
      // - Custom trained models

      const mockAnalysis: ImageAnalysisResult = {
        propertyType: this.detectPropertyType(imageData),
        features: this.extractFeatures(imageData),
        style: this.detectArchitecturalStyle(imageData),
        estimatedPrice: this.estimatePrice(imageData),
        location: this.detectLocation(imageData),
        confidence: Math.random() * 0.3 + 0.7 // 70-100% confidence
      };

      return mockAnalysis;
    } catch (error) {
      console.error('Error analyzing image:', error);
      throw new Error('Failed to analyze image');
    }
  }

  /**
   * Mock property type detection
   */
  private detectPropertyType(imageData: string): string {
    const types = ['house', 'flat', 'apartment', 'bungalow', 'townhouse', 'cottage'];
    return types[Math.floor(Math.random() * types.length)];
  }

  /**
   * Mock feature extraction
   */
  private extractFeatures(imageData: string): string[] {
    const allFeatures = [
      'garden', 'parking', 'balcony', 'terrace', 'garage', 'driveway',
      'fireplace', 'bay windows', 'conservatory', 'patio', 'deck',
      'swimming pool', 'gym', 'modern kitchen', 'hardwood floors',
      'high ceilings', 'period features', 'en-suite', 'walk-in closet'
    ];
    
    const numFeatures = Math.floor(Math.random() * 6) + 2; // 2-7 features
    const features: string[] = [];
    
    for (let i = 0; i < numFeatures; i++) {
      const feature = allFeatures[Math.floor(Math.random() * allFeatures.length)];
      if (!features.includes(feature)) {
        features.push(feature);
      }
    }
    
    return features;
  }

  /**
   * Mock architectural style detection
   */
  private detectArchitecturalStyle(imageData: string): string {
    const styles = [
      'Victorian', 'Georgian', 'Edwardian', 'Modern', 'Contemporary',
      'Tudor', 'Art Deco', 'Minimalist', 'Traditional', 'Industrial'
    ];
    return styles[Math.floor(Math.random() * styles.length)];
  }

  /**
   * Mock price estimation
   */
  private estimatePrice(imageData: string): { min: number; max: number } {
    const basePrice = Math.floor(Math.random() * 800000) + 200000; // £200k - £1M
    const variance = basePrice * 0.2; // ±20%
    
    return {
      min: Math.floor(basePrice - variance),
      max: Math.floor(basePrice + variance)
    };
  }

  /**
   * Mock location detection
   */
  private detectLocation(imageData: string): { area?: string; confidence: number } {
    const areas = [
      'Central London', 'North London', 'South London', 'East London', 'West London',
      'Manchester City Centre', 'Birmingham', 'Leeds', 'Liverpool', 'Bristol',
      'Edinburgh', 'Glasgow', 'Cardiff', 'Newcastle', 'Sheffield'
    ];
    
    return {
      area: areas[Math.floor(Math.random() * areas.length)],
      confidence: Math.random() * 0.4 + 0.6 // 60-100% confidence
    };
  }

  /**
   * Convert analysis result to search filters
   */
  private analysisToFilters(analysis: ImageAnalysisResult): SearchFilters {
    const filters: SearchFilters = {};

    // Set property type
    if (analysis.propertyType) {
      filters.type = analysis.propertyType as PropertyType;
    }

    // Set price range
    if (analysis.estimatedPrice) {
      filters.minPrice = analysis.estimatedPrice.min;
      filters.maxPrice = analysis.estimatedPrice.max;
    }

    // Set location
    if (analysis.location?.area) {
      filters.location = analysis.location.area;
    }

    // Set features
    if (analysis.features.length > 0) {
      filters.features = analysis.features;
    }

    return filters;
  }

  /**
   * Generate search query from analysis
   */
  private generateSearchQuery(analysis: ImageAnalysisResult): string {
    const parts = [];

    if (analysis.propertyType) {
      parts.push(analysis.propertyType);
    }

    if (analysis.location?.area) {
      parts.push(`in ${analysis.location.area}`);
    }

    if (analysis.features.length > 0) {
      const topFeatures = analysis.features.slice(0, 3);
      parts.push(`with ${topFeatures.join(', ')}`);
    }

    if (analysis.estimatedPrice) {
      const { min, max } = analysis.estimatedPrice;
      parts.push(`£${(min / 1000).toFixed(0)}k - £${(max / 1000).toFixed(0)}k`);
    }

    return parts.join(' ') || 'Similar properties';
  }

  /**
   * Search for properties by image
   */
  async searchByImage(
    file: File,
    options: ImageSearchOptions = {},
    onProgress?: (progress: UploadProgress) => void
  ): Promise<ImageSearchResult> {
    // Validate image
    const validation = this.validateImage(file, options);
    if (!validation.valid) {
      throw new Error(validation.error);
    }

    try {
      // Process image
      onProgress?.({ loaded: 0, total: 100, percentage: 0 });
      const { dataUrl } = await this.processImage(file, options);
      onProgress?.({ loaded: 25, total: 100, percentage: 25 });

      // Analyze image
      const analysis = await this.analyzeImage(dataUrl);
      onProgress?.({ loaded: 75, total: 100, percentage: 75 });

      // Convert to search filters
      const filters = this.analysisToFilters(analysis);
      
      // Generate search query
      const searchQuery = this.generateSearchQuery(analysis);

      // Get similar properties using AI search
      const searchResult = await aiSearchService.intelligentSearch('', filters);
      onProgress?.({ loaded: 100, total: 100, percentage: 100 });

      return {
        analysis,
        filters,
        similarProperties: searchResult.data,
        searchQuery
      };
    } catch (error) {
      console.error('Error in image search:', error);
      throw new Error('Failed to search by image');
    }
  }

  /**
   * Search for similar properties to an existing property image
   */
  async findSimilarProperties(
    propertyImageUrl: string,
    excludePropertyId?: string
  ): Promise<Property[]> {
    try {
      // In a real implementation, this would:
      // 1. Download the image from the URL
      // 2. Analyze it using computer vision
      // 3. Find properties with similar visual characteristics
      
      // For now, return mock similar properties
      const recommendations = await aiSearchService.generateSmartRecommendations(
        'user-id',
        [{
          type: PropertyType.HOUSE,
          minPrice: 300000,
          maxPrice: 600000
        }]
      );
      
      // Convert recommendations to properties (mock implementation)
      const mockProperties: Property[] = [];

      // Filter out the current property if specified
      return mockProperties.filter(p => p.id !== excludePropertyId);
    } catch (error) {
      console.error('Error finding similar properties:', error);
      throw new Error('Failed to find similar properties');
    }
  }

  /**
   * Extract text from property images (OCR)
   */
  async extractTextFromImage(file: File): Promise<string[]> {
    try {
      // In a real implementation, this would use OCR services like:
      // - Google Cloud Vision OCR
      // - AWS Textract
      // - Azure Computer Vision OCR
      
      // Mock OCR results
      const mockTexts = [
        'For Sale',
        '£450,000',
        '3 Bedrooms',
        '2 Bathrooms',
        'Garden',
        'Parking',
        'Estate Agent Name',
        'Phone: 020 1234 5678'
      ];

      // Simulate processing delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      return mockTexts;
    } catch (error) {
      console.error('Error extracting text from image:', error);
      throw new Error('Failed to extract text from image');
    }
  }

  /**
   * Get supported image formats
   */
  getSupportedFormats(): string[] {
    return this.defaultOptions.allowedTypes || [];
  }

  /**
   * Get maximum file size
   */
  getMaxFileSize(): number {
    return this.defaultOptions.maxFileSize || 0;
  }

  /**
   * Get image search tips for users
   */
  getImageSearchTips(): string[] {
    return [
      'Use clear, well-lit photos for best results',
      'Include the full exterior or interior view',
      'Avoid blurry or heavily filtered images',
      'Property photos work better than people or objects',
      'Multiple angles can provide more accurate results',
      'Screenshots from property websites work well',
      'Supported formats: JPEG, PNG, WebP',
      'Maximum file size: 10MB'
    ];
  }
}

// Create and export a singleton instance
export const imageSearchService = new ImageSearchService();
export default imageSearchService;

// Export types for use in components
export type {
  ImageSearchOptions,
  ImageAnalysisResult,
  ImageSearchResult,
  UploadProgress
};