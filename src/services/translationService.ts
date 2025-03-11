
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
  private onTranscriptUpdate: ((original: string, translated: string) => void) | null = null;
  private stream: MediaStream | null = null;
  
  constructor(options: TranslationOptions, onTranscriptUpdate?: (original: string, translated: string) => void) {
    this.options = options;
    this.audioElement = new Audio();
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
      
      const base64Audio = await this.blobToBase64(audioBlob);
      
      // Update user minutes
      if (this.options.meetingId) {
        try {
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
        } catch (error) {
          console.error('Error updating user minutes:', error);
          return;
        }
      }
      
      // 1. Convert speech to text
      try {
        console.log('Sending audio to speech-to-text service...');
        const { data: sttData, error: sttError } = await supabase.functions.invoke('speech-to-text', {
          body: {
            audio: base64Audio,
            sourceLanguage: this.options.sourceLanguage
          }
        });
        
        if (sttError) {
          console.error('Speech-to-text error:', sttError);
          return;
        }
        
        if (!sttData?.text) {
          console.log('No speech detected in this chunk');
          return; // No speech detected
        }
        
        console.log('Speech-to-text result:', sttData.text);
        
        // 2. Translate text
        const { data: translationData, error: translationError } = await supabase.functions.invoke('translate-text', {
          body: {
            text: sttData.text,
            sourceLanguage: this.options.sourceLanguage,
            targetLanguage: this.options.targetLanguage
          }
        });
        
        if (translationError) {
          console.error('Translation error:', translationError);
          return;
        }
        
        console.log('Translation result:', translationData.text);
        
        // Update transcript callback if provided
        if (this.onTranscriptUpdate) {
          this.onTranscriptUpdate(sttData.text, translationData.text);
        }
        
        // 3. Convert text to speech
        const { data: ttsData, error: ttsError } = await supabase.functions.invoke('text-to-speech', {
          body: {
            text: translationData.text,
            targetLanguage: this.options.targetLanguage
          }
        });
        
        if (ttsError) {
          console.error('Text-to-speech error:', ttsError);
          return;
        }
        
        // 4. Play the translated audio
        if (ttsData?.audioContent) {
          console.log('Playing translated audio');
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
          
          if (transcriptError) {
            console.error('Failed to save transcript:', transcriptError);
          } else {
            console.log('Transcript saved successfully');
          }
        }
      } catch (error) {
        console.error('Error in translation pipeline:', error);
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

  setVolume(volumeLevel: number) {
    if (this.audioElement) {
      this.audioElement.volume = volumeLevel / 100;
    }
  }
}

export default TranslationService;
