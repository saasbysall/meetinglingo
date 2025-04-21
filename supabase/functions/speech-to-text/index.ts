
// Follow this setup guide to integrate the Deno runtime into your Next.js app:
// https://docs.deno.com/runtime/manual/getting_started/nextjs

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { audio, sourceLanguage } = await req.json();
    // In a real implementation, you would process the audio here or call an external API
    
    // Mocked response for demo purposes
    const text = "This is a sample transcription text.";
    
    return new Response(
      JSON.stringify({ text }),
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
