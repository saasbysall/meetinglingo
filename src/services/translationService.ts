
import { updateUserMinutes } from './supabaseApi';
import { AudioHandlingService } from './audioHandlingService';
import { TranscriptService, TranscriptResult } from './transcriptService';

export interface TranslationOptions {
  sourceLanguage: string;
  targetLanguage: string;
  meetingId?: string;
}

class TranslationService {
  private audioHandlingService: AudioHandlingService | null = null;
  private transcriptService: TranscriptService | null = null;
  private isTranslating = false;
  private processingInterval: number | null = null;
  private audioQueue: string[] = [];
  private isProcessing = false;
  private onTranscriptUpdate: ((original: string, translated: string) => void) | null = null;
  onVolumeUpdate: ((volume: number) => void) | null = null;

  constructor(
    private options: TranslationOptions,
    onTranscriptUpdate?: (original: string, translated: string) => void
  ) {
    this.onTranscriptUpdate = onTranscriptUpdate;
  }

  async initialize(): Promise<boolean> {
    try {
      console.log('Initializing translation service...');

      // Initialize audio handling service
      this.audioHandlingService = new AudioHandlingService(this.handleAudioData.bind(this));
      
      // Set volume callback
      if (this.onVolumeUpdate) {
        this.audioHandlingService.setVolumeCallback(this.onVolumeUpdate);
      }
      
      const initialized = await this.audioHandlingService.initialize();
      if (!initialized) {
        throw new Error('Failed to initialize audio handling service');
      }

      // Initialize transcript service
      this.transcriptService = new TranscriptService(
        this.options.sourceLanguage,
        this.options.targetLanguage,
        this.options.meetingId
      );

      console.log('Translation service initialized successfully');
      return true;
    } catch (error) {
      console.error('Failed to initialize translation service:', error);
      return false;
    }
  }

  private handleAudioData(audioData: string) {
    if (!this.isTranslating) return;
    
    // Add to processing queue
    this.audioQueue.push(audioData);
  }

  async startTranslation() {
    if (!this.audioHandlingService) {
      throw new Error('Translation service not initialized');
    }

    this.isTranslating = true;
    this.processingInterval = window.setInterval(
      this.processAudioQueue.bind(this),
      2000
    );

    // Pass the onVolumeUpdate callback to the AudioHandlingService
    if (this.audioHandlingService && this.onVolumeUpdate) {
      this.audioHandlingService.setVolumeCallback(this.onVolumeUpdate);
    }

    console.log('Started translation service');
  }

  private async processAudioQueue() {
    if (this.isProcessing || this.audioQueue.length === 0) return;

    this.isProcessing = true;
    const audioData = this.audioQueue.shift();

    try {
      if (audioData && this.transcriptService) {
        // Update user minutes
        if (this.options.meetingId) {
          await updateUserMinutes();
        }

        // Process the transcript
        const result = await this.transcriptService.processTranscript(audioData);
        
        if (result) {
          // Update transcript UI
          if (this.onTranscriptUpdate) {
            this.onTranscriptUpdate(result.originalText, result.translatedText);
          }

          // Play translated audio
          if (result.audioContent && this.audioHandlingService) {
            await this.audioHandlingService.playAudio(result.audioContent);
          }
        }
      }
    } catch (error) {
      console.error('Error processing audio:', error);
    } finally {
      this.isProcessing = false;
    }
  }

  async stopTranslation() {
    console.log('Stopping translation service');
    
    this.isTranslating = false;
    
    if (this.processingInterval) {
      clearInterval(this.processingInterval);
      this.processingInterval = null;
    }

    if (this.audioHandlingService) {
      this.audioHandlingService.stop();
      this.audioHandlingService = null;
    }

    // Process any remaining audio in the queue
    while (this.audioQueue.length > 0) {
      await this.processAudioQueue();
    }
  }

  setVolume(volume: number) {
    if (this.audioHandlingService) {
      this.audioHandlingService.setVolume(volume);
    }
  }
}

export default TranslationService;
