
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Robot, Link as LinkIcon, RotateCw } from 'lucide-react';

interface GoogleMeetBotProps {
  sourceLanguage: string;
  targetLanguage: string;
  onBotJoined: (success: boolean) => void;
}

const GoogleMeetBot: React.FC<GoogleMeetBotProps> = ({ 
  sourceLanguage, 
  targetLanguage,
  onBotJoined
}) => {
  const [meetingLink, setMeetingLink] = useState('');
  const [isAuthorizing, setIsAuthorizing] = useState(false);
  const [isJoiningMeeting, setIsJoiningMeeting] = useState(false);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const { toast } = useToast();

  // Handle Google authorization
  const handleAuthorize = async () => {
    try {
      setIsAuthorizing(true);
      
      // Get auth URL from edge function
      const { data, error } = await supabase.functions.invoke('google-meet-auth', {
        body: { action: 'getAuthUrl' }
      });
      
      if (error) throw new Error(error.message);
      
      // Open auth URL in a new window
      const authWindow = window.open(data.authUrl, '_blank', 'width=600,height=600');
      
      // Set up event listener for the auth callback
      window.addEventListener('message', async (event) => {
        // Check origin for security
        if (event.data?.type === 'GOOGLE_AUTH_CODE') {
          const code = event.data.code;
          
          // Exchange code for tokens
          const { data: tokenData, error: tokenError } = await supabase.functions.invoke('google-meet-auth', {
            body: { action: 'getTokens', code }
          });
          
          if (tokenError) throw new Error(tokenError.message);
          
          // Save access token
          setAccessToken(tokenData.tokens.access_token);
          
          toast({
            title: "Google authorization successful",
            description: "You can now join Google Meet meetings with the translation bot"
          });
          
          // Close auth window if still open
          if (authWindow && !authWindow.closed) {
            authWindow.close();
          }
        }
      }, false);
      
    } catch (error) {
      console.error('Google auth error:', error);
      toast({
        title: "Authorization failed",
        description: error.message || "Failed to authorize with Google",
        variant: "destructive"
      });
    } finally {
      setIsAuthorizing(false);
    }
  };

  // Handle joining the meeting
  const handleJoinMeeting = async () => {
    if (!meetingLink) {
      return toast({
        title: "Meeting link required",
        description: "Please enter a valid Google Meet link",
        variant: "destructive"
      });
    }
    
    if (!accessToken) {
      return toast({
        title: "Authorization required",
        description: "Please authorize with Google first",
        variant: "destructive"
      });
    }
    
    try {
      setIsJoiningMeeting(true);
      
      // Call edge function to join the meeting
      const { data, error } = await supabase.functions.invoke('google-meet-auth', {
        body: { 
          action: 'joinMeeting', 
          meetingLink 
        },
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      });
      
      if (error) throw new Error(error.message);
      
      toast({
        title: "Successfully joined meeting",
        description: "Translation bot has joined the meeting"
      });
      
      // Notify parent component
      onBotJoined(true);
      
    } catch (error) {
      console.error('Join meeting error:', error);
      toast({
        title: "Failed to join meeting",
        description: error.message || "The bot could not join the meeting",
        variant: "destructive"
      });
      
      onBotJoined(false);
    } finally {
      setIsJoiningMeeting(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Robot className="mr-2 h-5 w-5 text-teal" />
          Google Meet Translation Bot
        </CardTitle>
        <CardDescription>
          Join a Google Meet and translate automatically
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div>
          <Button 
            onClick={handleAuthorize} 
            variant="outline" 
            className="w-full"
            disabled={isAuthorizing}
          >
            {isAuthorizing ? (
              <>
                <RotateCw className="mr-2 h-4 w-4 animate-spin" />
                Authorizing...
              </>
            ) : (
              "Authorize with Google"
            )}
          </Button>
          {accessToken && (
            <p className="text-sm text-green-600 mt-1">✓ Authorized</p>
          )}
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Meeting Link
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <LinkIcon className="h-4 w-4 text-gray-400" />
            </div>
            <Input
              value={meetingLink}
              onChange={(e) => setMeetingLink(e.target.value)}
              placeholder="https://meet.google.com/abc-defg-hij"
              className="pl-10"
            />
          </div>
        </div>
        
        <div className="text-sm text-gray-600">
          <p>Translation settings:</p>
          <ul className="list-disc ml-5 mt-1">
            <li>Source: {sourceLanguage}</li>
            <li>Target: {targetLanguage}</li>
          </ul>
        </div>
      </CardContent>
      
      <CardFooter>
        <Button 
          onClick={handleJoinMeeting} 
          className="w-full bg-teal hover:bg-teal/90"
          disabled={isJoiningMeeting || !accessToken}
        >
          {isJoiningMeeting ? (
            <>
              <RotateCw className="mr-2 h-4 w-4 animate-spin" />
              Joining Meeting...
            </>
          ) : (
            "Join Meeting with Bot"
          )}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default GoogleMeetBot;
