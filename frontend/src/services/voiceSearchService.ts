import { SearchFilters } from '../types';
import { aiSearchService } from './aiSearchService';

interface VoiceSearchOptions {
  language?: string;
  continuous?: boolean;
  interimResults?: boolean;
  maxAlternatives?: number;
}

interface VoiceSearchResult {
  transcript: string;
  confidence: number;
  filters?: SearchFilters;
  isListening: boolean;
}

// Type definitions for Speech Recognition API
interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
  message: string;
}

interface SpeechRecognitionResultList {
  length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
  length: number;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
  isFinal: boolean;
}

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

class VoiceSearchService {
  private recognition: any | null = null;
  private isSupported: boolean = false;
  private isListening: boolean = false;
  private onResultCallback?: (result: VoiceSearchResult) => void;
  private onErrorCallback?: (error: string) => void;
  private onStatusChangeCallback?: (isListening: boolean) => void;

  constructor() {
    this.initializeSpeechRecognition();
  }

  /**
   * Initialize speech recognition if supported by the browser
   */
  private initializeSpeechRecognition(): void {
    // Check for browser support
    const SpeechRecognition = 
      (window as any).SpeechRecognition || 
      (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      this.recognition = new SpeechRecognition();
      this.isSupported = true;
      this.setupRecognitionEvents();
    } else {
      this.isSupported = false;
      console.warn('Speech recognition not supported in this browser');
    }
  }

  /**
   * Setup event listeners for speech recognition
   */
  private setupRecognitionEvents(): void {
    if (!this.recognition) return;

    this.recognition.onstart = () => {
      this.isListening = true;
      this.onStatusChangeCallback?.(true);
    };

    this.recognition.onend = () => {
      this.isListening = false;
      this.onStatusChangeCallback?.(false);
    };

    this.recognition.onresult = async (event: SpeechRecognitionEvent) => {
      const result = event.results[event.results.length - 1];
      const transcript = result[0].transcript;
      const confidence = result[0].confidence;

      try {
        // Process the transcript with AI to extract search filters
        const aiResult = await aiSearchService.processNaturalLanguageQuery(transcript);
        
        const voiceResult: VoiceSearchResult = {
          transcript,
          confidence,
          filters: aiResult.filters,
          isListening: this.isListening
        };

        this.onResultCallback?.(voiceResult);
      } catch (error) {
        console.error('Error processing voice search:', error);
        this.onErrorCallback?.('Failed to process voice search');
      }
    };

    this.recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      console.error('Speech recognition error:', event.error);
      this.isListening = false;
      this.onStatusChangeCallback?.(false);
      
      let errorMessage = 'Voice search error';
      switch (event.error) {
        case 'no-speech':
          errorMessage = 'No speech detected. Please try again.';
          break;
        case 'audio-capture':
          errorMessage = 'Microphone not accessible. Please check permissions.';
          break;
        case 'not-allowed':
          errorMessage = 'Microphone access denied. Please enable microphone permissions.';
          break;
        case 'network':
          errorMessage = 'Network error. Please check your connection.';
          break;
        case 'service-not-allowed':
          errorMessage = 'Speech recognition service not available.';
          break;
        default:
          errorMessage = `Speech recognition error: ${event.error}`;
      }
      
      this.onErrorCallback?.(errorMessage);
    };
  }

  /**
   * Check if voice search is supported
   */
  isVoiceSearchSupported(): boolean {
    return this.isSupported;
  }

  /**
   * Check if currently listening
   */
  getIsListening(): boolean {
    return this.isListening;
  }

  /**
   * Start voice search with options
   */
  startListening(options: VoiceSearchOptions = {}): void {
    if (!this.isSupported || !this.recognition) {
      this.onErrorCallback?.('Voice search not supported in this browser');
      return;
    }

    if (this.isListening) {
      this.stopListening();
      return;
    }

    // Configure recognition options
    this.recognition.lang = options.language || 'en-GB';
    this.recognition.continuous = options.continuous || false;
    this.recognition.interimResults = options.interimResults || false;
    this.recognition.maxAlternatives = options.maxAlternatives || 1;

    try {
      this.recognition.start();
    } catch (error) {
      console.error('Error starting voice recognition:', error);
      this.onErrorCallback?.('Failed to start voice search');
    }
  }

  /**
   * Stop voice search
   */
  stopListening(): void {
    if (this.recognition && this.isListening) {
      this.recognition.stop();
    }
  }

  /**
   * Set callback for search results
   */
  onResult(callback: (result: VoiceSearchResult) => void): void {
    this.onResultCallback = callback;
  }

  /**
   * Set callback for errors
   */
  onError(callback: (error: string) => void): void {
    this.onErrorCallback = callback;
  }

  /**
   * Set callback for status changes
   */
  onStatusChange(callback: (isListening: boolean) => void): void {
    this.onStatusChangeCallback = callback;
  }

  /**
   * Request microphone permissions
   */
  async requestMicrophonePermission(): Promise<boolean> {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      // Stop the stream immediately as we only needed permission
      stream.getTracks().forEach(track => track.stop());
      return true;
    } catch (error) {
      console.error('Microphone permission denied:', error);
      return false;
    }
  }

  /**
   * Get available languages for speech recognition
   */
  getSupportedLanguages(): string[] {
    return [
      'en-GB', // English (UK)
      'en-US', // English (US)
      'es-ES', // Spanish (Spain)
      'fr-FR', // French (France)
      'de-DE', // German (Germany)
      'it-IT', // Italian (Italy)
      'pt-PT', // Portuguese (Portugal)
      'nl-NL', // Dutch (Netherlands)
      'pl-PL', // Polish (Poland)
      'ru-RU', // Russian (Russia)
      'zh-CN', // Chinese (Simplified)
      'ja-JP', // Japanese (Japan)
      'ko-KR', // Korean (South Korea)
      'ar-SA', // Arabic (Saudi Arabia)
      'hi-IN'  // Hindi (India)
    ];
  }

  /**
   * Convert speech to text without processing (for general use)
   */
  async speechToText(
    options: VoiceSearchOptions = {}
  ): Promise<{ transcript: string; confidence: number }> {
    return new Promise((resolve, reject) => {
      if (!this.isSupported || !this.recognition) {
        reject(new Error('Voice search not supported'));
        return;
      }

      // Temporarily override the result handler
      const originalHandler = this.onResultCallback;
      
      this.onResultCallback = (result) => {
        this.onResultCallback = originalHandler; // Restore original handler
        resolve({
          transcript: result.transcript,
          confidence: result.confidence
        });
      };

      // Temporarily override the error handler
      const originalErrorHandler = this.onErrorCallback;
      
      this.onErrorCallback = (error) => {
        this.onErrorCallback = originalErrorHandler; // Restore original handler
        reject(new Error(error));
      };

      this.startListening(options);
    });
  }

  /**
   * Process voice command for property search
   */
  async processVoiceCommand(transcript: string): Promise<SearchFilters> {
    try {
      const result = await aiSearchService.processNaturalLanguageQuery(transcript);
      return result.filters;
    } catch (error) {
      console.error('Error processing voice command:', error);
      throw new Error('Failed to process voice command');
    }
  }

  /**
   * Get voice search tips for users
   */
  getVoiceSearchTips(): string[] {
    return [
      'Speak clearly and at a normal pace',
      'Try: "Find a 3 bedroom house in London under £500,000"',
      'Try: "Show me flats near good schools with parking"',
      'Try: "Search for properties with gardens in Manchester"',
      'Include specific features like "balcony", "garage", or "gym"',
      'Mention price ranges: "between £300k and £500k"',
      'Specify areas: "near the city center" or "close to transport"',
      'Use natural language - speak as you would to a person'
    ];
  }

  /**
   * Clean up resources
   */
  destroy(): void {
    if (this.recognition) {
      this.stopListening();
      this.recognition = null;
    }
    this.onResultCallback = undefined;
    this.onErrorCallback = undefined;
    this.onStatusChangeCallback = undefined;
  }
}

// Create and export a singleton instance
export const voiceSearchService = new VoiceSearchService();
export default voiceSearchService;

// Export types for use in components
export type { VoiceSearchOptions, VoiceSearchResult };