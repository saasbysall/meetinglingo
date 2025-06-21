
import { serve } from "std/http/server";
import { google } from "googleapis";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    console.log('Handling CORS preflight request');
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    console.log('Processing request to google-meet-auth function');
    
    // Parse request body
    let requestData;
    try {
      requestData = await req.json();
      console.log('Request data:', JSON.stringify(requestData));
    } catch (parseError) {
      console.error('Error parsing request body:', parseError);
      return new Response(
        JSON.stringify({ error: 'Invalid JSON in request body' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    const { action, code, meetingLink } = requestData;
    
    // Validate required action parameter
    if (!action) {
      console.error('Missing required parameter: action');
      return new Response(
        JSON.stringify({ error: 'Missing required parameter: action' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Simple ping action to test connectivity
    if (action === 'ping') {
      console.log('Ping request received, responding with pong');
      return new Response(
        JSON.stringify({ status: 'ok', message: 'pong' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Get client credentials from environment variables
    const clientId = Deno.env.get('GOOGLE_CLIENT_ID');
    const clientSecret = Deno.env.get('GOOGLE_CLIENT_SECRET');
    const redirectUri = Deno.env.get('GOOGLE_REDIRECT_URI');
    
    if (!clientId || !clientSecret || !redirectUri) {
      console.error('Missing environment variables:', {
        clientId: !!clientId,
        clientSecret: !!clientSecret,
        redirectUri: !!redirectUri
      });
      return new Response(
        JSON.stringify({ 
          error: 'Missing Google API credentials. Please set GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, and GOOGLE_REDIRECT_URI in your environment variables.',
          envVars: {
            clientId: !!clientId,
            clientSecret: !!clientSecret,
            redirectUri: !!redirectUri
          }
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Using Google credentials with redirect URI: ${redirectUri}`);

    // Create OAuth2 client
    const oauth2Client = new google.auth.OAuth2(
      clientId,
      clientSecret,
      redirectUri
    );

    // Handle different actions
    switch (action) {
      case 'getAuthUrl':
        // Generate authentication URL with only valid scopes
        const authUrl = oauth2Client.generateAuthUrl({
          access_type: 'offline',
          scope: [
            'https://www.googleapis.com/auth/userinfo.email',
            'https://www.googleapis.com/auth/userinfo.profile',
            'https://www.googleapis.com/auth/meetings.space.created'
          ],
          prompt: 'consent',
        });
        
        console.log(`Generated auth URL: ${authUrl.substring(0, 50)}...`);
        
        return new Response(
          JSON.stringify({ authUrl }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
        
      case 'getTokens':
        if (!code) {
          console.error('Missing required parameter: code');
          return new Response(
            JSON.stringify({ error: 'Authorization code is required' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        
        console.log(`Exchanging authorization code for tokens...`);
        
        try {
          // Exchange code for tokens
          const { tokens } = await oauth2Client.getToken(code);
          oauth2Client.setCredentials(tokens);
          
          console.log(`Tokens received successfully: ${tokens.access_token ? 'Access token present' : 'No access token'}`);
          
          return new Response(
            JSON.stringify({ tokens }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        } catch (tokenError) {
          console.error('Token exchange error:', tokenError);
          return new Response(
            JSON.stringify({ error: `Failed to exchange code for tokens: ${tokenError.message}` }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        
      case 'joinMeeting':
        if (!meetingLink) {
          console.error('Missing required parameter: meetingLink');
          return new Response(
            JSON.stringify({ error: 'Meeting link is required' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        
        console.log(`Attempting to join meeting: ${meetingLink}`);
        
        // Extract meeting code from link
        let meetingCode;
        try {
          meetingCode = extractMeetingCode(meetingLink);
        } catch (extractError) {
          console.error('Error extracting meeting code:', extractError);
          return new Response(
            JSON.stringify({ error: extractError.message }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        
        if (!req.headers.get('Authorization')) {
          console.error('Missing authorization header');
          return new Response(
            JSON.stringify({ error: 'Authorization token is required' }),
            { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        
        // Set credentials from the provided token
        const token = req.headers.get('Authorization')!.split('Bearer ')[1];
        oauth2Client.setCredentials({ access_token: token });
        
        console.log(`Using access token to join meeting with code: ${meetingCode}`);
        
        try {
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
        } catch (joinError) {
          console.error('Error joining meeting:', joinError);
          return new Response(
            JSON.stringify({ error: `Failed to join meeting: ${joinError.message}` }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        
      default:
        console.error(`Invalid action: ${action}`);
        return new Response(
          JSON.stringify({ error: 'Invalid action. Supported actions: ping, getAuthUrl, getTokens, joinMeeting' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }
  } catch (error) {
    console.error('Error in Google Meet function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
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
  
  throw new Error('Invalid Google Meet link format. Expected format: https://meet.google.com/xxx-xxxx-xxx');
}
