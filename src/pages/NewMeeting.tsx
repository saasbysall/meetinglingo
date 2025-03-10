
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Languages, Link as LinkIcon, Video } from 'lucide-react';

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

export default function NewMeeting() {
  const [meetingLink, setMeetingLink] = useState('');
  const [sourceLanguage, setSourceLanguage] = useState('en-GB');
  const [targetLanguage, setTargetLanguage] = useState('es-ES');
  const [platform, setPlatform] = useState('zoom');
  const [isLoading, setIsLoading] = useState(false);
  
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login');
    }
  }, [user, authLoading, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please log in to join a meeting",
        variant: "destructive"
      });
      return navigate('/login');
    }

    if (!meetingLink) {
      return toast({
        title: "Missing meeting link",
        description: "Please enter a valid meeting link",
        variant: "destructive"
      });
    }

    setIsLoading(true);

    try {
      // Detect platform from link (simplified)
      let detectedPlatform = 'other';
      if (meetingLink.includes('zoom.')) detectedPlatform = 'zoom';
      if (meetingLink.includes('teams.')) detectedPlatform = 'teams';
      if (meetingLink.includes('meet.google.')) detectedPlatform = 'meet';

      // Save meeting in database
      const { data, error } = await supabase
        .from('meetings')
        .insert({
          user_id: user.id,
          meeting_link: meetingLink,
          platform: detectedPlatform,
          source_language: sourceLanguage,
          target_language: targetLanguage
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Meeting created",
        description: "Joining meeting with translation..."
      });
      
      // Navigate to the meeting room with the meeting ID
      navigate(`/meeting/${data.id}`);
    } catch (error: any) {
      console.error('Error creating meeting:', error);
      toast({
        title: "Failed to create meeting",
        description: error.message || "There was an error creating your meeting",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (authLoading) {
    return <div className="h-screen flex justify-center items-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex-grow flex items-center justify-center px-4 py-12 bg-gradient-to-b from-gray-50 to-blue-50">
        <div className="w-full max-w-md space-y-8 bg-white p-8 rounded-xl shadow-md">
          <div className="text-center">
            <Video className="h-12 w-12 mx-auto text-teal" />
            <h2 className="mt-4 text-3xl font-bold text-darkblue">Join a Meeting</h2>
            <p className="mt-2 text-gray-600">
              Enter your meeting details to start real-time translation
            </p>
          </div>
          
          <form onSubmit={handleSubmit} className="mt-8 space-y-6">
            <div className="space-y-4">
              <div>
                <label htmlFor="meeting-link" className="block text-sm font-medium text-gray-700">
                  Meeting Link
                </label>
                <div className="mt-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <LinkIcon className="h-5 w-5 text-gray-400" />
                  </div>
                  <Input
                    id="meeting-link"
                    placeholder="https://zoom.us/j/123456789"
                    value={meetingLink}
                    onChange={(e) => setMeetingLink(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>
              
              <div>
                <label htmlFor="source-language" className="block text-sm font-medium text-gray-700">
                  Source Language (what you'll hear)
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
                  Target Language (what you'll speak)
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
            
            <Button
              type="submit"
              className="w-full bg-teal hover:bg-teal/90 text-white py-2"
              disabled={isLoading}
            >
              {isLoading ? 'Starting...' : 'Join Meeting'}
            </Button>
          </form>
        </div>
      </div>
      <Footer />
    </div>
  );
}
