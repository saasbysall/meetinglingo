
import { AudioProcessor, createAudioElement } from '@/utils/audioProcessing';
import { 
  updateUserMinutes, 
  speechToText, 
  translateText, 
  textToSpeech,
  saveTranscript 
} from './supabaseApi';
import { useToast } from '@/components/ui/use-toast';

export interface TranslationOptions {
  sourceLanguage: string;
  targetLanguage: string;
  meetingId?: string;
}

class TranslationService {
  private audioProcessor: AudioProcessor | null = null;
  private isTranslating = false;
  private audioElement: HTMLAudioElement | null = null;
  private processingInterval: number | null = null;
  private audioQueue: string[] = [];
  private isProcessing = false;
  private onTranscriptUpdate: ((original: string, translated: string) => void) | null = null;

  constructor(
    private options: TranslationOptions,
    onTranscriptUpdate?: (original: string, translated: string) => void
  ) {
    this.onTranscriptUpdate = onTranscriptUpdate;
  }

  async initialize(): Promise<boolean> {
    try {
      console.log('Initializing translation service...');

      // Initialize audio processor
      this.audioProcessor = new AudioProcessor(this.handleAudioData.bind(this));
      const initialized = await this.audioProcessor.initialize();

      if (!initialized) {
        throw new Error('Failed to initialize audio processor');
      }

      // Initialize audio output
      this.audioElement = new Audio();
      this.audioElement.volume = 0.7;

      console.log('Translation service initialized successfully');
      return true;
    } catch (error) {
      console.error('Failed to initialize translation service:', error);
      return false;
    }
  }

  private handleAudioData(audioData: Float32Array) {
    if (!this.isTranslating) return;

    // Convert Float32Array to base64
    const buffer = new ArrayBuffer(audioData.length * 2);
    const view = new DataView(buffer);
    for (let i = 0; i < audioData.length; i++) {
      const multiplier = audioData[i] < 0 ? 0x8000 : 0x7FFF;
      view.setInt16(i * 2, audioData[i] * multiplier, true);
    }
    const base64Audio = btoa(String.fromCharCode(...new Uint8Array(buffer)));
    
    // Add to processing queue
    this.audioQueue.push(base64Audio);
  }

  async startTranslation() {
    if (!this.audioProcessor) {
      throw new Error('Translation service not initialized');
    }

    this.isTranslating = true;
    this.processingInterval = window.setInterval(
      this.processAudioQueue.bind(this),
      2000
    );

    console.log('Started translation service');
  }

  private async processAudioQueue() {
    if (this.isProcessing || this.audioQueue.length === 0) return;

    this.isProcessing = true;
    const audioData = this.audioQueue.shift();

    try {
      if (audioData) {
        // Update user minutes
        if (this.options.meetingId) {
          await updateUserMinutes();
        }

        // 1. Convert speech to text
        const originalText = await speechToText(audioData, this.options.sourceLanguage);
        if (!originalText) {
          console.log('No speech detected in this chunk');
          return;
        }

        console.log('Speech detected:', originalText);

        // 2. Translate text
        const translatedText = await translateText(
          originalText,
          this.options.sourceLanguage,
          this.options.targetLanguage
        );

        console.log('Translated text:', translatedText);

        // Update transcript
        if (this.onTranscriptUpdate) {
          this.onTranscriptUpdate(originalText, translatedText);
        }

        // 3. Convert to speech
        const audioContent = await textToSpeech(translatedText, this.options.targetLanguage);

        // 4. Play translated audio
        if (audioContent && this.audioElement) {
          try {
            const audio = await createAudioElement(audioContent);
            await audio.play();
          } catch (error) {
            console.error('Error playing audio:', error);
          }
        }

        // Save transcript if in a meeting
        if (this.options.meetingId) {
          await saveTranscript(
            this.options.meetingId,
            { original: originalText, translated: translatedText },
            this.options.targetLanguage
          );
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

    if (this.audioProcessor) {
      this.audioProcessor.stop();
      this.audioProcessor = null;
    }

    // Process any remaining audio in the queue
    while (this.audioQueue.length > 0) {
      await this.processAudioQueue();
    }
  }

  setVolume(volume: number) {
    if (this.audioElement) {
      this.audioElement.volume = volume / 100;
    }
    if (this.audioProcessor) {
      this.audioProcessor.setVolume(volume / 100);
    }
  }
}

export default TranslationService;
