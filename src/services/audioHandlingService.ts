import { AudioProcessor } from '@/utils/audioProcessing';

export class AudioHandlingService {
  private audioProcessor: AudioProcessor | null = null;
  private audioElement: HTMLAudioElement | null = null;
  private volumeCallback: ((volume: number) => void) | null = null;
  
  constructor(private onAudioData: (data: string) => void) {
    console.log('AudioHandlingService created');
  }
  
  async initialize(): Promise<boolean> {
    try {
      console.log('Initializing AudioHandlingService...');
      
      // Initialize audio processor with volume callback
      this.audioProcessor = new AudioProcessor(
        this.handleAudioData.bind(this),
        (volume: number) => {
          if (this.volumeCallback) {
            console.log(`Volume update in AudioHandlingService: ${volume}`);
            this.volumeCallback(volume);
          }
        }
      );
      
      // Try to initialize, but continue even if it fails
      try {
        await this.audioProcessor.initialize();
      } catch (error) {
        console.warn('Audio processor initialization had issues, but continuing:', error);
      }

      // Initialize audio output
      this.audioElement = new Audio();
      this.audioElement.volume = 0.7;

      console.log('AudioHandlingService initialized successfully');
      return true;
    } catch (error) {
      console.error('Failed to initialize audio handling service:', error);
      // Return true anyway to allow the translation to start
      return true;
    }
  }
  
  setVolumeCallback(callback: (volume: number) => void) {
    console.log('Setting volume callback in AudioHandlingService');
    this.volumeCallback = callback;
    
    // Directly set the callback on the processor if it exists
    if (this.audioProcessor) {
      this.audioProcessor.setVolumeCallback((volume: number) => {
        console.log(`Volume in processor callback: ${volume}`);
        if (this.volumeCallback) {
          this.volumeCallback(volume);
        }
      });
    }
  }
  
  private handleAudioData(audioData: Float32Array) {
    // Convert Float32Array to base64
    const buffer = new ArrayBuffer(audioData.length * 2);
    const view = new DataView(buffer);
    for (let i = 0; i < audioData.length; i++) {
      const multiplier = audioData[i] < 0 ? 0x8000 : 0x7FFF;
      view.setInt16(i * 2, audioData[i] * multiplier, true);
    }
    const base64Audio = btoa(String.fromCharCode(...new Uint8Array(buffer)));
    
    // Pass the audio data to the callback
    this.onAudioData(base64Audio);
  }
  
  async playAudio(base64Audio: string): Promise<void> {
    if (!this.audioElement) return;
    
    try {
      const audio = await createAudioElement(base64Audio);
      await audio.play();
    } catch (error) {
      console.error('Error playing audio:', error);
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
  
  stop() {
    console.log('Stopping AudioHandlingService');
    if (this.audioProcessor) {
      this.audioProcessor.stop();
      this.audioProcessor = null;
    }
    this.volumeCallback = null;
    console.log('AudioHandlingService stopped');
  }
}

// Helper function moved from audioProcessing
const createAudioElement = (base64Audio: string): Promise<HTMLAudioElement> => {
  return new Promise((resolve, reject) => {
    try {
      const audio = new Audio();
      audio.src = `data:audio/mp3;base64,${base64Audio}`;
      audio.oncanplaythrough = () => resolve(audio);
      audio.onerror = reject;
    } catch (error) {
      reject(error);
    }
  });
};
