
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

export default function GoogleAuthCallback() {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Get the hash fragment from the URL
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const accessToken = hashParams.get('access_token');
        const error = hashParams.get('error');
        const errorDescription = hashParams.get('error_description');

        if (error) {
          console.error('OAuth error:', error, errorDescription);
          setStatus('error');
          setErrorMessage(errorDescription || 'Authentication failed');
          toast({
            title: 'Authentication failed',
            description: errorDescription || 'Failed to sign in with Google',
            variant: 'destructive'
          });
          return;
        }

        if (!accessToken) {
          // Check for code in search params (authorization code flow)
          const urlParams = new URLSearchParams(window.location.search);
          const code = urlParams.get('code');
          
          if (code) {
            console.log('Authorization code received, completing auth flow');
            // The auth state change listener in AuthContext will handle session updates
            setStatus('success');
            toast({
              title: 'Success!',
              description: 'Successfully authenticated with Google',
            });
            navigate('/meeting/bot');
            return;
          }
          
          // No token or code found
          console.error('No access token or authorization code found in callback URL');
          setStatus('error');
          setErrorMessage('No authentication data received');
          return;
        }

        // Successfully got the token
        console.log('Access token received, completing auth flow');
        setStatus('success');
        toast({
          title: 'Success!',
          description: 'Successfully authenticated with Google',
        });
        navigate('/meeting/bot');
      } catch (error) {
        console.error('Error handling OAuth callback:', error);
        setStatus('error');
        setErrorMessage(error instanceof Error ? error.message : 'Unknown error occurred');
        toast({
          title: 'Authentication error',
          description: error instanceof Error ? error.message : 'Unknown error occurred',
          variant: 'destructive'
        });
      }
    };

    handleCallback();
  }, [navigate, toast]);

  if (status === 'loading') {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <Loader2 className="h-12 w-12 text-teal animate-spin mb-4" />
        <h1 className="text-2xl font-bold mb-2">Completing Authentication</h1>
        <p className="text-gray-600">Please wait while we finish the Google authentication process...</p>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md w-full">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Authentication Failed</h1>
          <p className="text-gray-800 mb-4">{errorMessage || 'There was a problem authenticating with Google.'}</p>
          <p className="text-gray-600 mb-6">Please try again or contact support if the issue persists.</p>
          <button 
            onClick={() => navigate('/login')} 
            className="w-full bg-teal hover:bg-teal/90 text-white py-2 px-4 rounded"
          >
            Return to Login
          </button>
        </div>
      </div>
    );
  }

  return null;
}
