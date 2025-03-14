
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { google } from "https://esm.sh/googleapis@118.0.0";

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
    const { action, code, meetingLink } = await req.json();
    
    // Get client credentials from environment variables
    const clientId = Deno.env.get('GOOGLE_CLIENT_ID');
    const clientSecret = Deno.env.get('GOOGLE_CLIENT_SECRET');
    const redirectUri = Deno.env.get('GOOGLE_REDIRECT_URI');
    
    if (!clientId || !clientSecret || !redirectUri) {
      throw new Error('Missing Google API credentials. Please set GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, and GOOGLE_REDIRECT_URI in your environment variables.');
    }

    console.log(`Using Google credentials - Client ID: ${clientId.substring(0, 5)}... Redirect URI: ${redirectUri}`);

    // Create OAuth2 client
    const oauth2Client = new google.auth.OAuth2(
      clientId,
      clientSecret,
      redirectUri
    );

    // Handle different actions
    switch (action) {
      case 'getAuthUrl':
        // Generate authentication URL
        const authUrl = oauth2Client.generateAuthUrl({
          access_type: 'offline',
          scope: [
            'https://www.googleapis.com/auth/meetings.space.created',
            'https://www.googleapis.com/auth/meetings.space.joined',
            'https://www.googleapis.com/auth/meetings.space.participant',
          ],
        });
        
        console.log(`Generated auth URL: ${authUrl.substring(0, 50)}...`);
        
        return new Response(
          JSON.stringify({ authUrl }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
        
      case 'getTokens':
        if (!code) {
          throw new Error('Authorization code is required');
        }
        
        console.log(`Exchanging authorization code for tokens...`);
        
        // Exchange code for tokens
        const { tokens } = await oauth2Client.getToken(code);
        oauth2Client.setCredentials(tokens);
        
        console.log(`Tokens received successfully: ${tokens.access_token ? 'Access token present' : 'No access token'}`);
        
        return new Response(
          JSON.stringify({ tokens }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
        
      case 'joinMeeting':
        if (!meetingLink) {
          throw new Error('Meeting link is required');
        }
        
        console.log(`Attempting to join meeting: ${meetingLink}`);
        
        // Extract meeting code from link
        const meetingCode = extractMeetingCode(meetingLink);
        
        if (!req.headers.get('Authorization')) {
          throw new Error('Authorization token is required');
        }
        
        // Set credentials from the provided token
        const token = req.headers.get('Authorization')!.split('Bearer ')[1];
        oauth2Client.setCredentials({ access_token: token });
        
        console.log(`Using access token to join meeting with code: ${meetingCode}`);
        
        // Initialize Google Meet API
        const meetService = google.meet({ version: 'v2', auth: oauth2Client });
        
        // Join the meeting
        const response = await meetService.spaces.join({
          name: `spaces/${meetingCode}`,
          requestBody: { regionCode: "US" }
        });
        
        console.log(`Successfully joined meeting: ${JSON.stringify(response.data).substring(0, 100)}...`);
        
        return new Response(
          JSON.stringify({ success: true, meetingDetails: response.data }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
        
      default:
        throw new Error('Invalid action');
    }
  } catch (error) {
    console.error('Error in Google Meet function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 400, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});

// Helper function to extract meeting code from a Google Meet link
function extractMeetingCode(meetingLink: string): string {
  // Example: https://meet.google.com/abc-defg-hij
  const regex = /meet\.google\.com\/([a-z0-9-]+)/i;
  const match = meetingLink.match(regex);
  
  if (match && match[1]) {
    return match[1];
  }
  
  throw new Error('Invalid Google Meet link format');
}
