
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Link2, Mic, Languages, Video } from 'lucide-react';
import GoogleMeetBot from '@/components/meeting/GoogleMeetBot';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { useTranslation } from '@/context/TranslationContext';

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
  const { t } = useTranslation();
  const [meetingLink, setMeetingLink] = useState('');
  const [sourceLanguage, setSourceLanguage] = useState('en-US');
  const [targetLanguage, setTargetLanguage] = useState('es-ES');
  const [isLoading, setIsLoading] = useState(false);
  const [showMicPermissionDialog, setShowMicPermissionDialog] = useState(false);
  const [permissionGranted, setPermissionGranted] = useState(false);
  const [botJoined, setBotJoined] = useState(false);
  const [activeTab, setActiveTab] = useState('new-meeting');
  const [platformIcon, setPlatformIcon] = useState<any>(null);
  
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  // Check if user is authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login');
    }
  }, [user, authLoading, navigate]);

  // Check for microphone permissions
  useEffect(() => {
    const checkMicPermissions = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        setPermissionGranted(true);
        // Stop the stream immediately since we're just checking permissions
        stream.getTracks().forEach(track => track.stop());
      } catch (err) {
        setPermissionGranted(false);
        // Only show the dialog if we're sure permission isn't granted
        setShowMicPermissionDialog(true);
      }
    };

    if (user) {
      checkMicPermissions();
    }
  }, [user]);

  // Function to detect meeting platform from the link
  useEffect(() => {
    if (meetingLink) {
      if (meetingLink.includes('meet.google.com')) {
        setPlatformIcon(<Video className="h-5 w-5 text-red-500" />);
      } else if (meetingLink.includes('zoom.us')) {
        setPlatformIcon(<Video className="h-5 w-5 text-blue-500" />);
      } else if (meetingLink.includes('teams.microsoft.com')) {
        setPlatformIcon(<Video className="h-5 w-5 text-purple-500" />);
      } else {
        setPlatformIcon(null);
      }
    } else {
      setPlatformIcon(null);
    }
  }, [meetingLink]);

  const requestMicrophonePermission = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setPermissionGranted(true);
      setShowMicPermissionDialog(false);
      // Stop the stream immediately since we're just checking permissions
      stream.getTracks().forEach(track => track.stop());
      
      toast({
        title: "Microphone access granted",
        description: "You can now use the translation service."
      });
    } catch (err) {
      toast({
        title: "Microphone access denied",
        description: "You need to allow microphone access to use the translation service.",
        variant: "destructive"
      });
    }
  };

  const handleJoinMeeting = async () => {
    if (!meetingLink) {
      return toast({
        title: "Meeting link required",
        description: "Please enter a valid meeting link",
        variant: "destructive"
      });
    }

    if (!permissionGranted) {
      return setShowMicPermissionDialog(true);
    }

    setIsLoading(true);

    try {
      // Save the meeting info to Supabase
      const { data, error } = await supabase
        .from('meetings')
        .insert({
          user_id: user!.id,
          meeting_link: meetingLink,
          platform: 'google-meet',
          source_language: sourceLanguage,
          target_language: targetLanguage
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Meeting created",
        description: "You can now join the meeting"
      });
      
      // Set the tab to 'active-meeting' to show the bot
      setActiveTab('active-meeting');
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

  const handleBotJoined = (success: boolean) => {
    setBotJoined(success);
    if (success) {
      toast({
        title: "Bot joined the meeting",
        description: "Translation is now active"
      });
    }
  };

  if (authLoading) {
    return <div className="h-screen flex justify-center items-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      {/* Main content area */}
      <div className="flex-grow pt-20 p-4">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full max-w-4xl mx-auto">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="new-meeting">{t('meeting.new')}</TabsTrigger>
            <TabsTrigger value="active-meeting" disabled={!meetingLink}>{t('meeting.active')}</TabsTrigger>
          </TabsList>
          
          <TabsContent value="new-meeting" className="mt-6">
            <div className="max-w-3xl mx-auto">
              <div className="mb-6">
                <h1 className="text-3xl font-bold text-center mb-2" dangerouslySetInnerHTML={{ __html: t('meeting.add') }}></h1>
                <p className="text-gray-600 text-center">{t('meeting.description')}</p>
              </div>
              
              <Card className="shadow-md">
                <CardContent className="pt-6">
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {t('meeting.link')}
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          {platformIcon || <Link2 className="h-4 w-4 text-gray-400" />}
                        </div>
                        <Input
                          value={meetingLink}
                          onChange={(e) => setMeetingLink(e.target.value)}
                          placeholder="https://meet.google.com/abc-defg-hij"
                          className="pl-10"
                        />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          {t('meeting.sourceLanguage')}
                        </label>
                        <Select 
                          value={sourceLanguage} 
                          onValueChange={setSourceLanguage}
                        >
                          <SelectTrigger>
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
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          {t('meeting.targetLanguage')}
                        </label>
                        <Select 
                          value={targetLanguage} 
                          onValueChange={setTargetLanguage}
                        >
                          <SelectTrigger>
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
                </CardContent>
                
                <CardFooter className="flex justify-center pb-6">
                  <Button 
                    onClick={handleJoinMeeting}
                    className="w-full md:w-auto bg-teal hover:bg-teal/90"
                    disabled={isLoading || !meetingLink}
                  >
                    {isLoading ? 'Processing...' : t('meeting.join')}
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="active-meeting">
            <div className="max-w-3xl mx-auto">
              <div className="mb-6">
                <h1 className="text-3xl font-bold text-center mb-2" dangerouslySetInnerHTML={{ __html: t('app.name') + ' Bot' }}></h1>
                <p className="text-gray-600 text-center">
                  {botJoined 
                    ? "The bot has joined your meeting and is translating" 
                    : "Complete the authorization to join your meeting"}
                </p>
              </div>
              
              <GoogleMeetBot 
                sourceLanguage={sourceLanguage}
                targetLanguage={targetLanguage}
                onBotJoined={handleBotJoined}
              />
            </div>
          </TabsContent>
        </Tabs>
      </div>
      
      <Footer />

      {/* Microphone permission dialog */}
      {showMicPermissionDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6">
            <div className="text-center mb-6">
              <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <Mic className="h-10 w-10 text-teal" />
              </div>
              <h2 className="text-2xl font-bold mb-2">To use MeetingLingo, enable microphone access</h2>
              <p className="text-gray-600">Please allow microphone access in your browser settings.</p>
            </div>
            
            <div className="flex justify-center">
              <Button 
                onClick={requestMicrophonePermission}
                className="bg-teal hover:bg-teal/90 w-full"
              >
                Allow Microphone Access
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
