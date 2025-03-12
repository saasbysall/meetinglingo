
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
    console.log('TranslationService created');
  }

  async initialize(): Promise<boolean> {
    try {
      console.log('Initializing translation service...');

      // Initialize audio handling service
      this.audioHandlingService = new AudioHandlingService(this.handleAudioData.bind(this));
      
      // Set volume callback from the start
      if (this.onVolumeUpdate) {
        console.log('Setting volume callback in TranslationService.initialize');
        this.audioHandlingService.setVolumeCallback((volume) => {
          console.log(`Volume update in TranslationService: ${volume}`);
          if (this.onVolumeUpdate) {
            this.onVolumeUpdate(volume);
          }
        });
      }
      
      const initialized = await this.audioHandlingService.initialize();
      if (!initialized) {
        console.error('Failed to initialize audio handling service');
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
    console.log('Audio data received in translation service');
    if (!this.isTranslating) return;
    
    // Add to processing queue
    this.audioQueue.push(audioData);
  }

  async startTranslation() {
    console.log('Starting translation...');
    
    if (!this.audioHandlingService) {
      console.error('Translation service not initialized');
      throw new Error('Translation service not initialized');
    }

    this.isTranslating = true;
    
    // Make sure the volume callback is properly set
    if (this.audioHandlingService && this.onVolumeUpdate) {
      console.log('Setting volume callback in startTranslation');
      this.audioHandlingService.setVolumeCallback((volume) => {
        console.log(`Volume update from AudioHandlingService: ${volume}`);
        if (this.onVolumeUpdate) {
          this.onVolumeUpdate(volume);
        }
      });
    }
    
    // Start the audio processing interval
    this.processingInterval = window.setInterval(
      this.processAudioQueue.bind(this),
      2000
    );

    console.log('Started translation service successfully');
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
    
    console.log('Translation service stopped');
  }

  setVolume(volume: number) {
    if (this.audioHandlingService) {
      this.audioHandlingService.setVolume(volume);
    }
  }
}

export default TranslationService;
