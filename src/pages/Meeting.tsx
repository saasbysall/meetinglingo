
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useUserData } from '@/hooks/useUserData';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import TranslationService from '@/services/translationService';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Mic, MicOff, ExternalLink, Volume2, Volume1, VolumeX } from 'lucide-react';

export default function Meeting() {
  const { meetingId } = useParams<{ meetingId: string }>();
  const { user, loading: authLoading } = useAuth();
  const { userData } = useUserData();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [meeting, setMeeting] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [translating, setTranslating] = useState(false);
  const [showPermissionModal, setShowPermissionModal] = useState(false);
  const [volume, setVolume] = useState(70);
  const [translationService, setTranslationService] = useState<TranslationService | null>(null);
  
  // Fetch meeting data
  useEffect(() => {
    if (!meetingId || authLoading) return;
    
    if (!user) {
      navigate('/login');
      return;
    }
    
    const fetchMeeting = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('meetings')
          .select('*')
          .eq('id', meetingId)
          .single();
        
        if (error) throw error;
        if (!data) {
          toast({
            title: 'Meeting not found',
            description: 'The requested meeting could not be found.',
            variant: 'destructive',
          });
          navigate('/dashboard');
          return;
        }
        
        setMeeting(data);
      } catch (error: any) {
        console.error('Error fetching meeting:', error);
        toast({
          title: 'Error loading meeting',
          description: error.message,
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchMeeting();
  }, [meetingId, user, authLoading, navigate, toast]);
  
  // Check if user has microphone permission
  useEffect(() => {
    if (!userData) return;
    
    if (!userData.mic_enabled) {
      setShowPermissionModal(true);
    }
  }, [userData]);
  
  const handleMicrophonePermission = async () => {
    try {
      // Request microphone permission
      await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // Update user profile
      await supabase
        .from('users')
        .update({ mic_enabled: true })
        .eq('id', user!.id);
      
      setShowPermissionModal(false);
      toast({
        title: 'Microphone permission granted',
        description: 'You can now use the translation service.',
      });
    } catch (error) {
      toast({
        title: 'Permission denied',
        description: 'Microphone access is required for the translation service.',
        variant: 'destructive',
      });
    }
  };
  
  const handleOpenMeeting = () => {
    if (!meeting) return;
    window.open(meeting.meeting_link, '_blank');
  };
  
  const handleStartTranslation = async () => {
    if (!meeting) return;
    
    // Check if user has minutes available
    if (userData?.minutes <= 0) {
      toast({
        title: 'No translation minutes available',
        description: 'You have used all your available translation minutes.',
        variant: 'destructive',
      });
      return;
    }
    
    try {
      // Initialize translation service
      const service = new TranslationService({
        sourceLanguage: meeting.source_language,
        targetLanguage: meeting.target_language,
        meetingId: meetingId,
      });
      
      const initialized = await service.initialize();
      if (!initialized) {
        throw new Error('Failed to initialize translation service');
      }
      
      setTranslationService(service);
      await service.startTranslation();
      setTranslating(true);
      
      toast({
        title: 'Translation started',
        description: 'Real-time translation is now active.',
      });
    } catch (error: any) {
      console.error('Error starting translation:', error);
      toast({
        title: 'Error starting translation',
        description: error.message,
        variant: 'destructive',
      });
    }
  };
  
  const handleStopTranslation = async () => {
    if (!translationService) return;
    
    try {
      await translationService.stopTranslation();
      setTranslating(false);
      setTranslationService(null);
      
      toast({
        title: 'Translation stopped',
        description: 'Translation service has been stopped.',
      });
      
      // Update meeting end time
      await supabase
        .from('meetings')
        .update({ end_time: new Date().toISOString() })
        .eq('id', meetingId);
    } catch (error: any) {
      console.error('Error stopping translation:', error);
      toast({
        title: 'Error stopping translation',
        description: error.message,
        variant: 'destructive',
      });
    }
  };
  
  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseInt(e.target.value);
    setVolume(newVolume);
    
    // Apply volume to audio elements
    const audioElements = document.querySelectorAll('audio');
    audioElements.forEach(audio => {
      audio.volume = newVolume / 100;
    });
  };
  
  const getVolumeIcon = () => {
    if (volume === 0) return <VolumeX />;
    if (volume < 50) return <Volume1 />;
    return <Volume2 />;
  };
  
  if (loading || authLoading) {
    return <div className="h-screen flex justify-center items-center">Loading...</div>;
  }
  
  if (!meeting) {
    return <div className="h-screen flex justify-center items-center">Meeting not found</div>;
  }
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex-grow container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="p-8">
              <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-darkblue">Meeting Translation</h1>
                <Button 
                  variant="outline" 
                  className="flex items-center gap-2"
                  onClick={handleOpenMeeting}
                >
                  <ExternalLink className="h-4 w-4" />
                  Open Meeting
                </Button>
              </div>
              
              <Separator className="my-6" />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <p className="text-sm text-gray-500">Platform</p>
                    <p className="font-medium">{meeting.platform}</p>
                  </div>
                  
                  <div className="space-y-2">
                    <p className="text-sm text-gray-500">Source Language</p>
                    <p className="font-medium">{meeting.source_language}</p>
                  </div>
                  
                  <div className="space-y-2">
                    <p className="text-sm text-gray-500">Target Language</p>
                    <p className="font-medium">{meeting.target_language}</p>
                  </div>
                </div>
                
                <div className="space-y-6">
                  <div className="space-y-2">
                    <p className="text-sm text-gray-500">Available Minutes</p>
                    <p className="font-medium">{userData?.minutes || 0} minutes</p>
                  </div>
                  
                  <div className="space-y-2">
                    <p className="text-sm text-gray-500">Translation Status</p>
                    <div className="flex items-center gap-2">
                      <span className={`inline-block w-3 h-3 rounded-full ${translating ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></span>
                      <p className="font-medium">{translating ? 'Active' : 'Inactive'}</p>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-gray-500">Output Volume</p>
                      <div className="w-6 h-6">{getVolumeIcon()}</div>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={volume}
                      onChange={handleVolumeChange}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>
                </div>
              </div>
              
              <Separator className="my-6" />
              
              <div className="flex justify-center">
                {!translating ? (
                  <Button 
                    className="bg-teal hover:bg-teal/90 text-white"
                    size="lg" 
                    onClick={handleStartTranslation}
                    disabled={!userData?.mic_enabled || userData?.minutes <= 0}
                  >
                    <Mic className="h-4 w-4 mr-2" />
                    Start Translation
                  </Button>
                ) : (
                  <Button 
                    variant="destructive" 
                    size="lg" 
                    onClick={handleStopTranslation}
                  >
                    <MicOff className="h-4 w-4 mr-2" />
                    Stop Translation
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
      
      <AlertDialog open={showPermissionModal} onOpenChange={setShowPermissionModal}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Microphone Permission Required</AlertDialogTitle>
            <AlertDialogDescription>
              MeetingLingo needs access to your microphone to provide real-time translation. 
              Please allow microphone access when prompted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleMicrophonePermission}>
              Grant Permission
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
