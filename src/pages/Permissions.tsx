
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Mic } from 'lucide-react';

export default function Permissions() {
  const [isMicAllowed, setIsMicAllowed] = useState(false);
  const [isRequesting, setIsRequesting] = useState(false);
  
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is authenticated
    if (!user) {
      navigate('/login');
      return;
    }
    
    // Check if microphone permission is already granted
    const checkMicPermission = async () => {
      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const audioInputs = devices.filter(device => device.kind === 'audioinput');
        
        // If there are audio inputs, try to access them
        if (audioInputs.length > 0) {
          await navigator.mediaDevices.getUserMedia({ audio: true })
            .then(stream => {
              // Stop all tracks to release the microphone
              stream.getTracks().forEach(track => track.stop());
              setIsMicAllowed(true);
            })
            .catch(() => {
              setIsMicAllowed(false);
            });
        } else {
          setIsMicAllowed(false);
        }
      } catch (err) {
        console.error('Error checking microphone permissions:', err);
        setIsMicAllowed(false);
      }
    };
    
    checkMicPermission();
  }, [user, navigate]);

  const handleRequestMicPermission = async () => {
    setIsRequesting(true);
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      // Stop all tracks to release the microphone
      stream.getTracks().forEach(track => track.stop());
      
      setIsMicAllowed(true);
      toast({
        title: "Microphone access granted",
        description: "You can now use the translation service"
      });
    } catch (err) {
      console.error('Error requesting microphone permission:', err);
      setIsMicAllowed(false);
      toast({
        title: "Microphone access denied",
        description: "Please allow microphone access in your browser settings",
        variant: "destructive"
      });
    } finally {
      setIsRequesting(false);
    }
  };

  const handleContinue = () => {
    if (isMicAllowed) {
      navigate('/meeting/bot');
    } else {
      toast({
        title: "Microphone access required",
        description: "Please allow microphone access to continue",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center">
          <div className="flex justify-center mb-8">
            <div className="text-2xl font-bold text-darkblue">
              Meeting<span className="text-teal">Lingo</span>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-lg p-8 w-full">
            <div className="text-center mb-6">
              <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto">
                <Mic className="h-10 w-10 text-teal" />
              </div>
              <h1 className="text-2xl font-bold mt-4">To use MeetingLingo, enable microphone access</h1>
              <p className="text-gray-600 mt-2">
                Please allow microphone access in your browser settings.
              </p>
            </div>
            
            <div className="space-y-4">
              {!isMicAllowed ? (
                <Button
                  onClick={handleRequestMicPermission}
                  className="w-full bg-teal hover:bg-teal/90"
                  disabled={isRequesting}
                >
                  {isRequesting ? 'Requesting access...' : 'Allow microphone access'}
                </Button>
              ) : (
                <div className="flex flex-col items-center">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mb-4">
                    <Mic className="h-5 w-5 text-green-600" />
                  </div>
                  <p className="text-green-600 font-medium mb-4">Microphone access granted</p>
                </div>
              )}
              
              <Button
                onClick={handleContinue}
                className={`w-full ${isMicAllowed ? 'bg-darkblue hover:bg-darkblue/90' : 'bg-gray-300'}`}
                disabled={!isMicAllowed}
              >
                Continue to MeetingLingo
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
