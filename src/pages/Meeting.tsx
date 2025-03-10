
import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Mic, MicOff, Video, Languages } from 'lucide-react';

type MeetingData = {
  id: string;
  meeting_link: string;
  platform: string;
  source_language: string;
  target_language: string;
  start_time: string;
};

export default function Meeting() {
  const { meetingId } = useParams<{ meetingId: string }>();
  const [meeting, setMeeting] = useState<MeetingData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [micEnabled, setMicEnabled] = useState(false);
  
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login');
    }
  }, [user, authLoading, navigate]);

  // Fetch meeting data
  useEffect(() => {
    if (!user || !meetingId) return;

    const fetchMeeting = async () => {
      try {
        const { data, error } = await supabase
          .from('meetings')
          .select('*')
          .eq('id', meetingId)
          .single();
          
        if (error) throw error;
        
        // Check if the meeting belongs to the current user
        if (data.user_id !== user.id) {
          throw new Error('Unauthorized: This meeting does not belong to you');
        }
        
        setMeeting(data);
      } catch (error) {
        console.error('Error fetching meeting:', error);
        navigate('/dashboard');
      } finally {
        setIsLoading(false);
      }
    };

    fetchMeeting();
  }, [meetingId, user, navigate]);

  // End meeting when component unmounts
  useEffect(() => {
    return () => {
      if (meeting && user) {
        // Record meeting end time
        supabase
          .from('meetings')
          .update({ end_time: new Date().toISOString() })
          .eq('id', meeting.id)
          .then(({ error }) => {
            if (error) console.error('Error ending meeting:', error);
          });
      }
    };
  }, [meeting, user]);

  const toggleMicrophone = () => {
    setMicEnabled(!micEnabled);
    // In a real application, you would handle the actual microphone access here
  };

  const endMeeting = async () => {
    if (!meeting) return;
    
    try {
      await supabase
        .from('meetings')
        .update({ end_time: new Date().toISOString() })
        .eq('id', meeting.id);
        
      navigate('/history');
    } catch (error) {
      console.error('Error ending meeting:', error);
    }
  };

  if (authLoading || isLoading) {
    return <div className="h-screen flex justify-center items-center">Loading...</div>;
  }

  if (!meeting) {
    return (
      <div className="h-screen flex flex-col justify-center items-center">
        <h2 className="text-2xl font-bold text-darkblue mb-4">Meeting not found</h2>
        <Link to="/dashboard">
          <Button>Return to Dashboard</Button>
        </Link>
      </div>
    );
  }

  // Format language codes for display
  const formatLanguage = (code: string) => {
    const languageMap: Record<string, string> = {
      'en-GB': 'English (UK)',
      'en-US': 'English (US)',
      'es-ES': 'Spanish',
      'fr-FR': 'French',
      'de-DE': 'German',
      'it-IT': 'Italian',
      'pt-PT': 'Portuguese',
      'ja-JP': 'Japanese',
      'zh-CN': 'Chinese',
      'ru-RU': 'Russian',
    };
    
    return languageMap[code] || code;
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-900 text-white">
      {/* Header */}
      <div className="bg-gray-800 shadow px-4 py-3">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center">
            <Video className="h-6 w-6 text-teal mr-2" />
            <h1 className="text-xl font-bold">MeetingLingo</h1>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center bg-gray-700 px-3 py-1 rounded-full">
              <Languages className="h-4 w-4 text-teal mr-2" />
              <span className="text-sm">
                {formatLanguage(meeting.source_language)} → {formatLanguage(meeting.target_language)}
              </span>
            </div>
            <Button 
              variant="destructive" 
              size="sm"
              onClick={endMeeting}
            >
              End Meeting
            </Button>
          </div>
        </div>
      </div>
      
      {/* Main Content - In a real app, this would contain the video component */}
      <div className="flex-grow flex items-center justify-center p-4">
        <div className="bg-gray-800 p-8 rounded-xl shadow-2xl text-center max-w-2xl w-full">
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-2">Meeting in Progress</h2>
            <p className="text-gray-400 mb-4">
              Platform: <span className="text-white capitalize">{meeting.platform}</span>
            </p>
            <div className="bg-gray-700 p-3 rounded text-sm mb-6 break-all">
              <p className="text-gray-300">Meeting Link:</p>
              <a href={meeting.meeting_link} target="_blank" rel="noopener noreferrer" className="text-teal hover:underline">
                {meeting.meeting_link}
              </a>
            </div>
          </div>
          
          <div className="text-center">
            <p className="text-gray-400 mb-4">Translation Status:</p>
            <div className="bg-gray-700 p-4 rounded-lg mb-6">
              <p className="text-lg">
                Listening to <span className="text-teal font-medium">{formatLanguage(meeting.source_language)}</span>
              </p>
              <div className="my-2">↓</div>
              <p className="text-lg">
                Speaking in <span className="text-green-400 font-medium">{formatLanguage(meeting.target_language)}</span>
              </p>
            </div>
            
            <Button
              className={`w-16 h-16 rounded-full ${micEnabled ? 'bg-teal hover:bg-teal/90' : 'bg-gray-600 hover:bg-gray-500'}`}
              onClick={toggleMicrophone}
            >
              {micEnabled ? <Mic className="h-6 w-6" /> : <MicOff className="h-6 w-6" />}
            </Button>
            <p className="mt-2 text-sm text-gray-400">
              {micEnabled ? 'Microphone On' : 'Microphone Off'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
