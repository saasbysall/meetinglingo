
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { text, voice, targetLanguage } = await req.json();

    if (!text) {
      throw new Error('Text is required');
    }

    console.log(`Converting to speech in language: ${targetLanguage}`);
    console.log(`Text to convert (first 50 chars): ${text.substring(0, 50)}...`);

    // Determine the voice based on target language if not provided
    let voiceId = voice || 'alloy';
    
    // Map language codes to OpenAI voices (simplified mapping)
    if (!voice && targetLanguage) {
      const langCode = targetLanguage.split('-')[0];
      // OpenAI currently doesn't have language-specific voices, 
      // but we could map to different voices in the future
      if (langCode === 'es') voiceId = 'nova';
      else if (langCode === 'fr') voiceId = 'echo';
      else if (langCode === 'de') voiceId = 'onyx';
      else if (langCode === 'ja') voiceId = 'shimmer';
      else voiceId = 'alloy';
    }

    console.log(`Using voice: ${voiceId}`);

    // Generate speech from text using OpenAI API
    const response = await fetch('https://api.openai.com/v1/audio/speech', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'tts-1',
        input: text,
        voice: voiceId,
        response_format: 'mp3',
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('OpenAI API error:', error);
      throw new Error(error.error?.message || 'Failed to generate speech');
    }

    // Convert audio buffer to base64
    const arrayBuffer = await response.arrayBuffer();
    const base64Audio = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));

    console.log(`Successfully generated audio (length: ${base64Audio.length})`);

    return new Response(
      JSON.stringify({ audioContent: base64Audio }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    );
  } catch (error) {
    console.error('Error in text-to-speech function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    );
  }
});
