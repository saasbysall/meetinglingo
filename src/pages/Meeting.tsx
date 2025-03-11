import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useUserData } from '@/hooks/useUserData';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import TranslationService from '@/services/translationService';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Separator } from '@/components/ui/separator';

import MeetingHeader from '@/components/meeting/MeetingHeader';
import MeetingInfo from '@/components/meeting/MeetingInfo';
import MeetingStatus from '@/components/meeting/MeetingStatus';
import InstructionsCard from '@/components/meeting/InstructionsCard';
import TranslationButton from '@/components/meeting/TranslationButton';
import TranscriptDisplay from '@/components/meeting/TranscriptDisplay';
import ConversationHistory from '@/components/meeting/ConversationHistory';
import PermissionDialog from '@/components/meeting/PermissionDialog';

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
  const [originalText, setOriginalText] = useState<string>("");
  const [translatedText, setTranslatedText] = useState<string>("");
  const [transcripts, setTranscripts] = useState<{original: string, translated: string}[]>([]);
  const [inputVolume, setInputVolume] = useState(0);
  const [isSpeaking, setIsSpeaking] = useState(false);

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
          navigate('/meeting/new');
          return;
        }
        
        setMeeting(data);
        
        const { data: transcriptData, error: transcriptError } = await supabase
          .from('transcripts')
          .select('*')
          .eq('meeting_id', meetingId)
          .order('created_at', { ascending: true });
        
        if (!transcriptError && transcriptData) {
          const formattedTranscripts = transcriptData.map(t => {
            try {
              return JSON.parse(t.file_url || "{}");
            } catch (e) {
              return { original: "", translated: "" };
            }
          });
          setTranscripts(formattedTranscripts);
        }
        
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
  
  useEffect(() => {
    if (!userData) return;
    
    if (!userData.mic_enabled) {
      setShowPermissionModal(true);
    }
  }, [userData]);
  
  const handleMicrophonePermission = async () => {
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
      
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
    
    toast({
      title: 'Meeting opened',
      description: 'After joining the meeting, come back to this tab and click "Start Translation"',
    });
  };
  
  const handleTranscriptUpdate = (original: string, translated: string) => {
    setOriginalText(original);
    setTranslatedText(translated);
    setTranscripts(prev => [...prev, { original, translated }]);
  };
  
  const handleStartTranslation = async () => {
    if (!meeting) return;

    toast({
      title: "Starting Translation",
      description: "Please ensure your meeting is active in another tab",
    });

    try {
      const service = new TranslationService(
        {
          sourceLanguage: meeting.source_language,
          targetLanguage: meeting.target_language,
          meetingId: meetingId,
        },
        handleTranscriptUpdate
      );

      const initialized = await service.initialize();
      if (!initialized) {
        throw new Error('Failed to initialize translation service');
      }

      setTranslationService(service);
      await service.startTranslation();
      setTranslating(true);

      toast({
        title: "Translation Active",
        description: "Real-time translation is now running",
      });
    } catch (error: any) {
      console.error('Error starting translation:', error);
      toast({
        title: "Error Starting Translation",
        description: error.message,
        variant: "destructive",
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
    
    if (translationService) {
      translationService.setVolume(newVolume);
    }
  };

  useEffect(() => {
    if (translationService) {
      translationService.onVolumeUpdate = (volume: number) => {
        setInputVolume(volume);
        setIsSpeaking(volume > 15); // Consider speaking if volume is above 15%
      };
    }
  }, [translationService]);

  if (loading || authLoading) {
    return <div className="h-screen flex justify-center items-center">Loading...</div>;
  }
  
  if (!meeting) {
    return <div className="h-screen flex justify-center items-center">Meeting not found</div>;
  }
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex-grow container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="p-8">
              <MeetingHeader 
                meetingTitle="Meeting Translation" 
                handleOpenMeeting={handleOpenMeeting} 
              />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <MeetingInfo 
                  platform={meeting.platform}
                  sourceLanguage={meeting.source_language}
                  targetLanguage={meeting.target_language}
                />
                
                <MeetingStatus 
                  minutes={userData?.minutes || 0}
                  translating={translating}
                  volume={volume}
                  inputVolume={inputVolume}
                  isSpeaking={isSpeaking}
                  handleVolumeChange={handleVolumeChange}
                />
              </div>
              
              <Separator className="my-6" />
              
              <InstructionsCard />
              
              <TranslationButton 
                translating={translating}
                micEnabled={userData?.mic_enabled || false}
                availableMinutes={userData?.minutes || 0}
                handleStartTranslation={handleStartTranslation}
                handleStopTranslation={handleStopTranslation}
              />
              
              <TranscriptDisplay 
                originalText={originalText}
                translatedText={translatedText}
                sourceLanguage={meeting.source_language}
                targetLanguage={meeting.target_language}
              />
              
              <ConversationHistory 
                transcripts={transcripts}
                sourceLanguage={meeting.source_language}
                targetLanguage={meeting.target_language}
              />
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
      
      <PermissionDialog 
        open={showPermissionModal}
        onOpenChange={setShowPermissionModal}
        handleMicrophonePermission={handleMicrophonePermission}
      />
    </div>
  );
}
