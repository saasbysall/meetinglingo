
import { blobToBase64, playAudio } from './audioUtils';
import { 
  updateUserMinutes, 
  speechToText, 
  translateText, 
  textToSpeech, 
  saveTranscript,
  TranscriptData
} from './supabaseApi';

export interface TranslationOptions {
  sourceLanguage: string;
  targetLanguage: string;
  meetingId?: string;
}

class TranslationService {
  private audioContext: AudioContext | null = null;
  private mediaRecorder: MediaRecorder | null = null;
  private sourceNode: MediaStreamAudioSourceNode | null = null;
  private isRecording = false;
  private chunks: Blob[] = [];
  private recordingInterval: number | null = null;
  private processingChunk = false;
  private options: TranslationOptions;
  private audioElement: HTMLAudioElement | null = null;
  private onTranscriptUpdate: ((original: string, translated: string) => void) | null = null;
  private stream: MediaStream | null = null;
  
  constructor(options: TranslationOptions, onTranscriptUpdate?: (original: string, translated: string) => void) {
    this.options = options;
    this.audioElement = new Audio();
    this.audioElement.volume = 0.7; // Default volume
    if (onTranscriptUpdate) {
      this.onTranscriptUpdate = onTranscriptUpdate;
    }
  }

  async initialize() {
    try {
      console.log('Initializing translation service...');
      
      // Request system audio capture
      const constraints: MediaStreamConstraints = {
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        }
      };
      
      // Get permission to use the microphone
      this.stream = await navigator.mediaDevices.getUserMedia(constraints);
      
      this.audioContext = new AudioContext();
      this.sourceNode = this.audioContext.createMediaStreamSource(this.stream);
      
      // Setup recorder with better options for speech
      this.mediaRecorder = new MediaRecorder(this.stream, {
        mimeType: 'audio/webm;codecs=opus',
        audioBitsPerSecond: 128000 // Higher quality for better recognition
      });
      
      this.mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          this.chunks.push(e.data);
        }
      };
      
      console.log('Translation service initialized successfully');
      return true;
    } catch (error) {
      console.error('Failed to initialize audio capture:', error);
      return false;
    }
  }

  async startTranslation() {
    if (!this.mediaRecorder) {
      throw new Error('Media recorder not initialized');
    }
    
    // Reset state
    this.isRecording = true;
    this.chunks = [];
    
    // Start recording
    this.mediaRecorder.start();
    console.log('Started recording for translation');
    
    // Process audio in 3-second chunks (shorter for more responsiveness)
    this.recordingInterval = window.setInterval(async () => {
      if (this.processingChunk || !this.isRecording) return;
      
      this.processingChunk = true;
      this.mediaRecorder?.stop();
      
      await this.processAudioChunk();
      
      this.chunks = [];
      this.processingChunk = false;
      if (this.isRecording) {
        this.mediaRecorder?.start();
      }
    }, 3000); // 3 seconds for faster response
  }

  async stopTranslation() {
    this.isRecording = false;
    console.log('Stopping translation');
    
    if (this.recordingInterval) {
      clearInterval(this.recordingInterval);
      this.recordingInterval = null;
    }
    
    if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
      this.mediaRecorder.stop();
    }
    
    // Process any remaining audio
    if (this.chunks.length > 0 && !this.processingChunk) {
      await this.processAudioChunk();
    }
    
    // Clean up resources
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
      this.stream = null;
    }
    
    if (this.audioContext) {
      await this.audioContext.close();
      this.audioContext = null;
    }
  }

  private async processAudioChunk() {
    if (this.chunks.length === 0) return;
    
    try {
      const audioBlob = new Blob(this.chunks, { type: 'audio/webm' });
      console.log('Processing audio chunk of size:', audioBlob.size);
      
      if (audioBlob.size < 1000) {
        console.log('Audio chunk too small, skipping');
        return; // Skip very small chunks (likely silence)
      }
      
      const base64Audio = await blobToBase64(audioBlob);
      
      // Update user minutes
      if (this.options.meetingId) {
        try {
          await updateUserMinutes();
        } catch (error: any) {
          console.error('Error updating user minutes:', error);
          return;
        }
      }
      
      // 1. Convert speech to text
      try {
        const originalText = await speechToText(base64Audio, this.options.sourceLanguage);
        
        if (!originalText) {
          console.log('No speech detected in this chunk');
          return; // No speech detected
        }
        
        console.log('Speech-to-text result:', originalText);
        
        // 2. Translate text
        const translatedText = await translateText(
          originalText, 
          this.options.sourceLanguage, 
          this.options.targetLanguage
        );
        
        console.log('Translation result:', translatedText);
        
        // Update transcript callback if provided
        if (this.onTranscriptUpdate) {
          this.onTranscriptUpdate(originalText, translatedText);
        }
        
        // 3. Convert text to speech
        const audioContent = await textToSpeech(translatedText, this.options.targetLanguage);
        
        // 4. Play the translated audio
        if (audioContent) {
          console.log('Playing translated audio');
          if (this.audioElement) {
            playAudio(audioContent, this.audioElement);
          }
        }
        
        // Save transcript if in a meeting
        if (this.options.meetingId) {
          const transcriptData: TranscriptData = {
            original: originalText,
            translated: translatedText
          };
          
          await saveTranscript(
            this.options.meetingId,
            transcriptData,
            this.options.targetLanguage
          );
        }
      } catch (error) {
        console.error('Error in translation pipeline:', error);
      }
    } catch (error) {
      console.error('Error processing audio chunk:', error);
    }
  }

  setVolume(volumeLevel: number) {
    if (this.audioElement) {
      this.audioElement.volume = volumeLevel / 100;
    }
  }
}

export default TranslationService;
