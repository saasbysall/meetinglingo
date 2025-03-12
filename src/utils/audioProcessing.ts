
export class AudioProcessor {
  private audioContext: AudioContext | null = null;
  private mediaStream: MediaStream | null = null;
  private sourceNode: MediaStreamAudioSourceNode | null = null;
  private processorNode: ScriptProcessorNode | null = null;
  private gainNode: GainNode | null = null;
  private analyserNode: AnalyserNode | null = null;
  private volumeDataArray: Uint8Array | null = null;
  private volumeCallback: ((volume: number) => void) | null = null;
  private volumeMonitoringId: number | null = null;

  constructor(
    private onAudioData: (data: Float32Array) => void,
    onVolumeUpdate?: (volume: number) => void
  ) {
    this.volumeCallback = onVolumeUpdate || null;
  }

  setVolumeCallback(callback: (volume: number) => void) {
    this.volumeCallback = callback;
  }

  async initialize(): Promise<boolean> {
    try {
      console.log('Initializing AudioProcessor...');
      
      // Request microphone access with optimal settings for speech
      this.mediaStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          channelCount: 1,
          sampleRate: 44100
        }
      });
      
      console.log('Microphone access granted');

      this.audioContext = new AudioContext();
      this.sourceNode = this.audioContext.createMediaStreamSource(this.mediaStream);
      this.gainNode = this.audioContext.createGain();
      this.analyserNode = this.audioContext.createAnalyser();
      this.processorNode = this.audioContext.createScriptProcessor(2048, 1, 1);

      // Configure analyser for volume monitoring
      this.analyserNode.fftSize = 256;
      this.volumeDataArray = new Uint8Array(this.analyserNode.frequencyBinCount);

      // Connect nodes: Source -> Gain -> Analyser -> Processor -> Destination
      this.sourceNode.connect(this.gainNode);
      this.gainNode.connect(this.analyserNode);
      this.analyserNode.connect(this.processorNode);
      this.processorNode.connect(this.audioContext.destination);

      // Start continuous volume monitoring
      this.startVolumeMonitoring();

      // Process audio data
      this.processorNode.onaudioprocess = (e) => {
        const inputData = e.inputBuffer.getChannelData(0);
        this.onAudioData(new Float32Array(inputData));
      };

      console.log('AudioProcessor initialized successfully');
      return true;
    } catch (error) {
      console.error('Failed to initialize audio processor:', error);
      return false;
    }
  }

  private startVolumeMonitoring() {
    const checkVolume = () => {
      if (!this.analyserNode || !this.volumeDataArray || !this.volumeCallback) {
        return;
      }
      
      this.analyserNode.getByteFrequencyData(this.volumeDataArray);
      const sum = this.volumeDataArray.reduce((a, b) => a + b, 0);
      const average = sum / this.volumeDataArray.length;
      const normalizedVolume = Math.min(100, (average / 128) * 100);
      
      this.volumeCallback(normalizedVolume);
      
      if (this.audioContext?.state === 'running') {
        this.volumeMonitoringId = requestAnimationFrame(checkVolume);
      }
    };
    
    this.volumeMonitoringId = requestAnimationFrame(checkVolume);
    console.log('Volume monitoring started');
  }

  setVolume(volume: number) {
    if (this.gainNode) {
      this.gainNode.gain.value = volume;
    }
  }

  stop() {
    console.log('Stopping AudioProcessor');
    
    if (this.volumeMonitoringId) {
      cancelAnimationFrame(this.volumeMonitoringId);
      this.volumeMonitoringId = null;
    }
    
    if (this.processorNode) {
      this.processorNode.disconnect();
      this.processorNode = null;
    }
    
    if (this.sourceNode) {
      this.sourceNode.disconnect();
      this.sourceNode = null;
    }
    
    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach(track => track.stop());
      this.mediaStream = null;
    }
    
    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }
    
    console.log('AudioProcessor stopped');
  }
}
