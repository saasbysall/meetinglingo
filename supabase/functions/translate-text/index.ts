
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Simple translations for demo purposes
const translations = {
  en: {
    "Hello": "Hello",
    "Welcome": "Welcome",
    "Translated:": "Translated:",
  },
  es: {
    "Hello": "Hola",
    "Welcome": "Bienvenido",
    "Translated:": "Traducido:",
  },
  fr: {
    "Hello": "Bonjour",
    "Welcome": "Bienvenue",
    "Translated:": "Traduit:",
  },
  de: {
    "Hello": "Hallo",
    "Welcome": "Willkommen",
    "Translated:": "Übersetzt:",
  },
  it: {
    "Hello": "Ciao",
    "Welcome": "Benvenuto",
    "Translated:": "Tradotto:",
  },
  pt: {
    "Hello": "Olá",
    "Welcome": "Bem-vindo",
    "Translated:": "Traduzido:",
  },
  ar: {
    "Hello": "مرحبا",
    "Welcome": "أهلا بك",
    "Translated:": "مترجم:",
  },
  zh: {
    "Hello": "你好",
    "Welcome": "欢迎",
    "Translated:": "翻译:",
  },
  ja: {
    "Hello": "こんにちは",
    "Welcome": "ようこそ",
    "Translated:": "翻訳:",
  },
  ko: {
    "Hello": "안녕하세요",
    "Welcome": "환영합니다",
    "Translated:": "번역:",
  },
  tr: {
    "Hello": "Merhaba",
    "Welcome": "Hoş geldiniz",
    "Translated:": "Çevrilmiş:",
  }
};

// Simple translation function
function translateText(text: string, targetLanguage: string): string {
  if (targetLanguage === 'en') return text; // No translation needed for English
  
  const langTranslations = translations[targetLanguage];
  if (!langTranslations) return `${text} (No translation available for ${targetLanguage})`;
  
  // Check if we have a direct translation
  if (langTranslations[text]) return langTranslations[text];
  
  // If not, add a prefix to indicate it's been processed
  const prefix = langTranslations["Translated:"] || "Translated:";
  return `${prefix} ${text}`;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { text, sourceLanguage, targetLanguage } = await req.json();
    
    // Perform the translation
    const translatedText = translateText(text, targetLanguage);
    
    return new Response(
      JSON.stringify({ text: translatedText }),
      { 
        headers: { 
          ...corsHeaders,
          "Content-Type": "application/json" 
        } 
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 400, 
        headers: { 
          ...corsHeaders,
          "Content-Type": "application/json" 
        } 
      }
    );
  }
});
