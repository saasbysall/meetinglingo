
import { 
  speechToText, 
  translateText, 
  textToSpeech,
  saveTranscript 
} from './supabaseApi';

export interface TranscriptResult {
  originalText: string;
  translatedText: string;
  audioContent?: string;
}

export class TranscriptService {
  constructor(
    private sourceLanguage: string,
    private targetLanguage: string,
    private meetingId?: string
  ) {}

  async processTranscript(audioData: string): Promise<TranscriptResult | null> {
    try {
      // 1. Convert speech to text
      const originalText = await speechToText(audioData, this.sourceLanguage);
      if (!originalText) {
        console.log('No speech detected in this chunk');
        return null;
      }

      console.log('Speech detected:', originalText);

      // 2. Translate text
      const translatedText = await translateText(
        originalText,
        this.sourceLanguage,
        this.targetLanguage
      );

      console.log('Translated text:', translatedText);

      // 3. Convert to speech
      const audioContent = await textToSpeech(translatedText, this.targetLanguage);

      // 4. Save transcript if in a meeting
      if (this.meetingId) {
        await saveTranscript(
          this.meetingId,
          { original: originalText, translated: translatedText },
          this.targetLanguage
        );
      }

      return {
        originalText,
        translatedText,
        audioContent
      };
    } catch (error) {
      console.error('Error processing transcript:', error);
      return null;
    }
  }
}
