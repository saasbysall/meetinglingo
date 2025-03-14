
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Bot, Link as LinkIcon, RotateCw, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

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
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const handleAuthorize = async () => {
    try {
      setIsAuthorizing(true);
      setError(null);
      
      console.log('Requesting auth URL from edge function...');
      const { data, error } = await supabase.functions.invoke('google-meet-auth', {
        body: { action: 'getAuthUrl' }
      });
      
      if (error) {
        console.error('Edge function error:', error);
        throw new Error(error.message || 'Failed to get authorization URL');
      }
      
      if (!data?.authUrl) {
        throw new Error('Invalid response from server: No authorization URL received');
      }
      
      console.log('Opening auth window with URL:', data.authUrl);
      const authWindow = window.open(data.authUrl, '_blank', 'width=600,height=600');
      
      if (!authWindow) {
        throw new Error('Popup blocked! Please allow popups for this site.');
      }
      
      const messageHandler = async (event: MessageEvent) => {
        if (event.data?.type === 'GOOGLE_AUTH_CODE') {
          const code = event.data.code;
          console.log('Received authorization code, exchanging for tokens...');
          
          try {
            const { data: tokenData, error: tokenError } = await supabase.functions.invoke('google-meet-auth', {
              body: { action: 'getTokens', code }
            });
            
            if (tokenError) {
              throw new Error(tokenError.message || 'Failed to exchange code for tokens');
            }
            
            if (!tokenData?.tokens?.access_token) {
              throw new Error('Invalid response: No access token received');
            }
            
            setAccessToken(tokenData.tokens.access_token);
            
            toast({
              title: "Google authorization successful",
              description: "You can now join Google Meet meetings with the translation bot"
            });
            
            if (authWindow && !authWindow.closed) {
              authWindow.close();
            }
          } catch (tokenExchangeError: any) {
            console.error('Token exchange error:', tokenExchangeError);
            setError(tokenExchangeError.message || 'Failed to complete authorization');
            toast({
              title: "Authorization failed",
              description: tokenExchangeError.message || "Failed to exchange authorization code for tokens",
              variant: "destructive"
            });
          }
        }
      };
      
      window.addEventListener('message', messageHandler, false);
      
      // Clean up the event listener when component unmounts or authorization completes
      return () => {
        window.removeEventListener('message', messageHandler, false);
      };
      
    } catch (error: any) {
      console.error('Google auth error:', error);
      setError(error.message || "Failed to authorize with Google");
      toast({
        title: "Authorization failed",
        description: error.message || "Failed to authorize with Google",
        variant: "destructive"
      });
    } finally {
      setIsAuthorizing(false);
    }
  };

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
      setError(null);
      
      const { data, error } = await supabase.functions.invoke('google-meet-auth', {
        body: { 
          action: 'joinMeeting', 
          meetingLink 
        },
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      });
      
      if (error) throw new Error(error.message || 'Failed to join meeting');
      
      toast({
        title: "Successfully joined meeting",
        description: "Translation bot has joined the meeting"
      });
      
      onBotJoined(true);
      
    } catch (error: any) {
      console.error('Join meeting error:', error);
      setError(error.message || "The bot could not join the meeting");
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
          <Bot className="mr-2 h-5 w-5 text-teal" />
          Google Meet Translation Bot
        </CardTitle>
        <CardDescription>
          Join a Google Meet and translate automatically
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
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
