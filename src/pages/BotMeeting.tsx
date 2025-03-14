
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import GoogleMeetBot from '@/components/meeting/GoogleMeetBot';
import { Languages } from 'lucide-react';

// Language options
const sourceLanguages = [
  { value: 'en-GB', label: 'English (UK)' },
  { value: 'en-US', label: 'English (US)' },
  { value: 'es-ES', label: 'Spanish (Spain)' },
  { value: 'fr-FR', label: 'French' },
  { value: 'de-DE', label: 'German' },
  { value: 'it-IT', label: 'Italian' },
  { value: 'pt-PT', label: 'Portuguese' },
  { value: 'ja-JP', label: 'Japanese' },
  { value: 'zh-CN', label: 'Chinese (Simplified)' },
  { value: 'ru-RU', label: 'Russian' },
];

export default function BotMeeting() {
  const [sourceLanguage, setSourceLanguage] = useState('en-GB');
  const [targetLanguage, setTargetLanguage] = useState('es-ES');
  const [botJoined, setBotJoined] = useState(false);
  const [meetingId, setMeetingId] = useState<string | null>(null);
  
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login');
    }
  }, [user, authLoading, navigate]);

  // Handle bot joining event
  const handleBotJoined = async (success: boolean) => {
    setBotJoined(success);
    
    if (success) {
      try {
        // Save bot meeting in database
        const { data, error } = await supabase
          .from('meetings')
          .insert({
            user_id: user?.id,
            meeting_link: "bot_meeting", // Special flag for bot meetings
            platform: "google_meet",
            source_language: sourceLanguage,
            target_language: targetLanguage,
            is_bot: true
          })
          .select()
          .single();

        if (error) throw error;
        
        setMeetingId(data.id);
        
      } catch (error: any) {
        console.error('Error saving bot meeting:', error);
        toast({
          title: "Failed to save meeting",
          description: error.message || "There was an error saving the meeting",
          variant: "destructive"
        });
      }
    }
  };

  if (authLoading) {
    return <div className="h-screen flex justify-center items-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex-grow flex flex-col items-center justify-center px-4 py-12 bg-gradient-to-b from-gray-50 to-blue-50">
        <div className="w-full max-w-4xl space-y-8">
          <div className="text-center">
            <Languages className="h-12 w-12 mx-auto text-teal" />
            <h2 className="mt-4 text-3xl font-bold text-darkblue">AI Translation Bot</h2>
            <p className="mt-2 text-gray-600">
              Let our AI bot join your meeting and translate in real-time
            </p>
          </div>
          
          {!botJoined ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-xl shadow-md">
                <h3 className="text-xl font-semibold mb-4">Translation Settings</h3>
                
                <div className="space-y-4">
                  <div>
                    <label htmlFor="source-language" className="block text-sm font-medium text-gray-700">
                      Source Language (what the bot will hear)
                    </label>
                    <Select 
                      value={sourceLanguage} 
                      onValueChange={setSourceLanguage}
                    >
                      <SelectTrigger className="w-full mt-1" id="source-language">
                        <SelectValue placeholder="Select language" />
                      </SelectTrigger>
                      <SelectContent>
                        {sourceLanguages.map((lang) => (
                          <SelectItem key={lang.value} value={lang.value}>
                            {lang.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <label htmlFor="target-language" className="block text-sm font-medium text-gray-700">
                      Target Language (what the bot will speak)
                    </label>
                    <Select 
                      value={targetLanguage} 
                      onValueChange={setTargetLanguage}
                    >
                      <SelectTrigger className="w-full mt-1" id="target-language">
                        <SelectValue placeholder="Select language" />
                      </SelectTrigger>
                      <SelectContent>
                        {sourceLanguages.map((lang) => (
                          <SelectItem key={lang.value} value={lang.value}>
                            {lang.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
              
              <GoogleMeetBot 
                sourceLanguage={sourceLanguage}
                targetLanguage={targetLanguage}
                onBotJoined={handleBotJoined}
              />
            </div>
          ) : (
            <div className="bg-white p-8 rounded-xl shadow-md text-center">
              <h3 className="text-xl font-semibold mb-4 text-green-600">Bot is active in your meeting!</h3>
              <p className="mb-6">
                The translation bot has joined your Google Meet and is translating from {sourceLanguage} to {targetLanguage}.
              </p>
              
              {meetingId && (
                <Button
                  onClick={() => navigate(`/meeting/${meetingId}`)}
                  className="bg-teal hover:bg-teal/90 text-white"
                >
                  View Translation Dashboard
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
}
