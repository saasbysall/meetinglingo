
export class AudioProcessor {
  private audioContext: AudioContext | null = null;
  private mediaStream: MediaStream | null = null;
  private sourceNode: MediaStreamAudioSourceNode | null = null;
  private processorNode: ScriptProcessorNode | null = null;
  private gainNode: GainNode | null = null;
  private analyserNode: AnalyserNode | null = null;
  private volumeDataArray: Uint8Array | null = null;
  private volumeCallback: ((volume: number) => void) | null = null;

  constructor(
    private onAudioData: (data: Float32Array) => void,
    onVolumeUpdate?: (volume: number) => void
  ) {
    this.volumeCallback = onVolumeUpdate || null;
  }

  // Method to update the volume callback if needed after initialization
  setVolumeCallback(callback: (volume: number) => void) {
    this.volumeCallback = callback;
  }

  async initialize() {
    try {
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

      // Process audio data and update volume
      this.processorNode.onaudioprocess = (e) => {
        const inputData = e.inputBuffer.getChannelData(0);
        this.onAudioData(new Float32Array(inputData));

        if (this.volumeCallback && this.analyserNode && this.volumeDataArray) {
          this.analyserNode.getByteFrequencyData(this.volumeDataArray);
          const average = this.volumeDataArray.reduce((a, b) => a + b) / this.volumeDataArray.length;
          this.volumeCallback(Math.min(100, (average / 128) * 100));
        }
      };

      return true;
    } catch (error) {
      console.error('Failed to initialize audio processor:', error);
      return false;
    }
  }

  setVolume(volume: number) {
    if (this.gainNode) {
      this.gainNode.gain.value = volume;
    }
  }

  stop() {
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
  }
}
