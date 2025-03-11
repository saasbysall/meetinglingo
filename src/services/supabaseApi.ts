
import { supabase } from '@/integrations/supabase/client';

export interface TranscriptData {
  original: string;
  translated: string;
}

export const updateUserMinutes = async (): Promise<number> => {
  const { data: userData, error: userError } = await supabase.from('users')
    .select('minutes')
    .eq('id', (await supabase.auth.getUser()).data.user?.id)
    .single();
  
  if (userError || !userData) {
    throw new Error('Failed to fetch user data');
  }
  
  if (userData.minutes <= 0) {
    throw new Error('No translation minutes available');
  }
  
  await supabase.from('users').update({
    minutes: userData.minutes - 1
  }).eq('id', (await supabase.auth.getUser()).data.user?.id);
  
  return userData.minutes - 1;
};

export const saveTranscript = async (
  meetingId: string,
  transcriptData: TranscriptData,
  language: string
): Promise<void> => {
  const { error } = await supabase.from('transcripts').insert([
    {
      meeting_id: meetingId,
      file_url: JSON.stringify(transcriptData),
      language
    }
  ]);
  
  if (error) {
    console.error('Failed to save transcript:', error);
    throw new Error('Failed to save transcript');
  }
};

export const speechToText = async (audio: string, sourceLanguage: string): Promise<string> => {
  const { data, error } = await supabase.functions.invoke('speech-to-text', {
    body: {
      audio,
      sourceLanguage
    }
  });
  
  if (error) {
    throw new Error(`Speech-to-text error: ${error.message}`);
  }
  
  return data?.text || '';
};

export const translateText = async (
  text: string,
  sourceLanguage: string,
  targetLanguage: string
): Promise<string> => {
  const { data, error } = await supabase.functions.invoke('translate-text', {
    body: {
      text,
      sourceLanguage,
      targetLanguage
    }
  });
  
  if (error) {
    throw new Error(`Translation error: ${error.message}`);
  }
  
  return data?.text || '';
};

export const textToSpeech = async (text: string, targetLanguage: string): Promise<string> => {
  const { data, error } = await supabase.functions.invoke('text-to-speech', {
    body: {
      text,
      targetLanguage
    }
  });
  
  if (error) {
    throw new Error(`Text-to-speech error: ${error.message}`);
  }
  
  return data?.audioContent || '';
};
