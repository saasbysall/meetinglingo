
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { text, sourceLanguage, targetLanguage } = await req.json();
    
    if (!text) {
      throw new Error('No text provided for translation');
    }

    if (!targetLanguage) {
      throw new Error('Target language is required');
    }

    console.log(`Translating from ${sourceLanguage || 'auto'} to ${targetLanguage}`);
    console.log(`Text to translate (first 50 chars): ${text.substring(0, 50)}...`);

    const sourceLang = sourceLanguage ? sourceLanguage.split('-')[0] : 'auto';
    const targetLang = targetLanguage.split('-')[0];

    // Use OpenAI API for translation
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: `You are a high-quality translator. Translate the following text from ${sourceLang} to ${targetLang}. Preserve formatting, tone, and meaning. Only return the translated text with no explanation or additional text.`
          },
          {
            role: 'user',
            content: text
          }
        ],
        temperature: 0.3
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI API error:', errorText);
      throw new Error(`OpenAI API error: ${errorText}`);
    }

    const result = await response.json();
    const translatedText = result.choices[0]?.message?.content?.trim();
    
    if (!translatedText) {
      throw new Error('Failed to get translation from API');
    }

    console.log(`Translation result (first 50 chars): ${translatedText.substring(0, 50)}...`);

    return new Response(
      JSON.stringify({ text: translatedText }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in translate-text function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
