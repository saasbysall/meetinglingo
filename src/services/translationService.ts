
import { supabase } from '@/integrations/supabase/client';

interface TranslationOptions {
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

  constructor(options: TranslationOptions) {
    this.options = options;
    this.audioElement = new Audio();
  }

  async initialize() {
    try {
      // Get permission to use the microphone
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      this.audioContext = new AudioContext();
      this.sourceNode = this.audioContext.createMediaStreamSource(stream);
      
      // Setup recorder
      this.mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm',
      });
      
      this.mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          this.chunks.push(e.data);
        }
      };
      
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
    
    // Process audio in 5-second chunks
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
    }, 5000); // 5 seconds
  }

  async stopTranslation() {
    this.isRecording = false;
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
  }

  private async processAudioChunk() {
    if (this.chunks.length === 0) return;
    
    try {
      const audioBlob = new Blob(this.chunks, { type: 'audio/webm' });
      const base64Audio = await this.blobToBase64(audioBlob);
      
      // Update user minutes
      if (this.options.meetingId) {
        const { data: userData } = await supabase.from('users')
          .select('minutes')
          .eq('id', (await supabase.auth.getUser()).data.user?.id)
          .single();
        
        if (userData && userData.minutes > 0) {
          await supabase.from('users').update({
            minutes: userData.minutes - 1
          }).eq('id', (await supabase.auth.getUser()).data.user?.id);
        } else {
          throw new Error('No translation minutes available');
        }
      }
      
      // 1. Convert speech to text
      const { data: sttData, error: sttError } = await supabase.functions.invoke('speech-to-text', {
        body: {
          audio: base64Audio,
          sourceLanguage: this.options.sourceLanguage
        }
      });
      
      if (sttError) throw new Error(`Speech-to-text error: ${sttError.message}`);
      if (!sttData?.text) return; // No speech detected
      
      // 2. Translate text
      const { data: translationData, error: translationError } = await supabase.functions.invoke('translate-text', {
        body: {
          text: sttData.text,
          sourceLanguage: this.options.sourceLanguage,
          targetLanguage: this.options.targetLanguage
        }
      });
      
      if (translationError) throw new Error(`Translation error: ${translationError.message}`);
      
      // 3. Convert text to speech
      const { data: ttsData, error: ttsError } = await supabase.functions.invoke('text-to-speech', {
        body: {
          text: translationData.text,
          targetLanguage: this.options.targetLanguage
        }
      });
      
      if (ttsError) throw new Error(`Text-to-speech error: ${ttsError.message}`);
      
      // 4. Play the translated audio
      if (ttsData?.audioContent) {
        this.playAudio(ttsData.audioContent);
      }
      
      // Save transcript if in a meeting
      if (this.options.meetingId) {
        // Store original and translated text
        const { error: transcriptError } = await supabase.from('transcripts').insert([
          {
            meeting_id: this.options.meetingId,
            file_url: JSON.stringify({
              original: sttData.text,
              translated: translationData.text
            }),
            language: this.options.targetLanguage
          }
        ]);
        
        if (transcriptError) console.error('Failed to save transcript:', transcriptError);
      }
    } catch (error) {
      console.error('Error processing audio chunk:', error);
    }
  }

  private playAudio(base64Audio: string) {
    try {
      // Convert base64 to blob
      const byteCharacters = atob(base64Audio);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: 'audio/mp3' });
      
      // Create object URL and play
      const url = URL.createObjectURL(blob);
      
      if (this.audioElement) {
        this.audioElement.src = url;
        this.audioElement.play();
        
        // Clean up URL after playing
        this.audioElement.onended = () => {
          URL.revokeObjectURL(url);
        };
      }
    } catch (error) {
      console.error('Error playing audio:', error);
    }
  }

  private blobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        // Remove the data URL prefix
        const base64 = base64String.split(',')[1];
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }
}

export default TranslationService;
