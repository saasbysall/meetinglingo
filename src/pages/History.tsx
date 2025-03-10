
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Calendar, Clock, ExternalLink, AlertCircle } from 'lucide-react';
import { formatDistanceToNow, format, parseISO } from 'date-fns';

type Meeting = {
  id: string;
  platform: string;
  meeting_link: string;
  source_language: string;
  target_language: string;
  start_time: string;
  end_time: string | null;
  created_at: string;
  transcripts: {
    id: string;
    file_url: string;
    language: string;
  }[];
};

export default function History() {
  const { user, loading: authLoading } = useAuth();
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedMeeting, setExpandedMeeting] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading) return;
    
    if (!user) {
      window.location.href = '/login';
      return;
    }
    
    const fetchMeetings = async () => {
      setLoading(true);
      try {
        // Fetch meetings with transcripts using a join
        const { data, error } = await supabase
          .from('meetings')
          .select(`
            *,
            transcripts (
              id,
              file_url,
              language
            )
          `)
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });
        
        if (error) throw error;
        setMeetings(data || []);
      } catch (error) {
        console.error('Error fetching meetings:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchMeetings();
  }, [user, authLoading]);

  const toggleMeetingExpansion = (meetingId: string) => {
    if (expandedMeeting === meetingId) {
      setExpandedMeeting(null);
    } else {
      setExpandedMeeting(meetingId);
    }
  };

  const formatDuration = (start: string, end: string | null) => {
    if (!end) return 'Ongoing';
    
    const startDate = new Date(start);
    const endDate = new Date(end);
    const durationMs = endDate.getTime() - startDate.getTime();
    
    const minutes = Math.floor(durationMs / 60000);
    const seconds = Math.floor((durationMs % 60000) / 1000);
    
    return `${minutes} min ${seconds} sec`;
  };
  
  const parseTranscriptData = (fileUrl: string) => {
    try {
      return JSON.parse(fileUrl);
    } catch (e) {
      return { original: 'No data', translated: 'No data' };
    }
  };

  if (loading || authLoading) {
    return <div className="h-screen flex justify-center items-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex-grow container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-darkblue mb-6">Meeting History</h1>
          
          {meetings.length === 0 ? (
            <div className="bg-white rounded-xl shadow-md p-8 text-center">
              <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-medium text-gray-600 mb-2">No meetings found</h3>
              <p className="text-gray-500 mb-6">You haven't participated in any translated meetings yet.</p>
              <Link to="/meeting/new">
                <Button className="bg-teal hover:bg-teal/90 text-white">Start a New Meeting</Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-6">
              {meetings.map((meeting) => (
                <Card key={meeting.id} className="overflow-hidden">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-xl font-semibold">
                          {meeting.platform} Meeting
                        </CardTitle>
                        <CardDescription>
                          {format(parseISO(meeting.created_at), 'PPP')} ({formatDistanceToNow(parseISO(meeting.created_at), { addSuffix: true })})
                        </CardDescription>
                      </div>
                      <Link to={`/meeting/${meeting.id}`} className="text-blue-500 hover:text-blue-700">
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                      </Link>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-2 text-gray-500" />
                        <span className="text-sm text-gray-600">
                          {formatDuration(meeting.start_time, meeting.end_time)}
                        </span>
                      </div>
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-2 text-gray-500" />
                        <span className="text-sm text-gray-600">
                          {format(parseISO(meeting.start_time), 'h:mm a')}
                        </span>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <span className="text-xs font-medium text-gray-500 uppercase">From</span>
                        <p>{meeting.source_language}</p>
                      </div>
                      <div>
                        <span className="text-xs font-medium text-gray-500 uppercase">To</span>
                        <p>{meeting.target_language}</p>
                      </div>
                    </div>
                    
                    {expandedMeeting === meeting.id && meeting.transcripts.length > 0 && (
                      <div className="mt-6">
                        <Separator className="mb-4" />
                        <h4 className="font-medium mb-3">Transcripts</h4>
                        <div className="space-y-4 max-h-80 overflow-y-auto p-2">
                          {meeting.transcripts.map((transcript) => {
                            const transcriptData = parseTranscriptData(transcript.file_url);
                            return (
                              <div key={transcript.id} className="rounded-lg bg-gray-50 p-3">
                                <div className="mb-2">
                                  <span className="text-xs font-medium text-gray-500">Original ({meeting.source_language})</span>
                                  <p className="text-sm">{transcriptData.original}</p>
                                </div>
                                <div>
                                  <span className="text-xs font-medium text-gray-500">Translated ({transcript.language})</span>
                                  <p className="text-sm">{transcriptData.translated}</p>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </CardContent>
                  <CardFooter>
                    <Button 
                      variant="ghost" 
                      onClick={() => toggleMeetingExpansion(meeting.id)}
                      className="text-gray-600 hover:text-gray-800"
                      disabled={meeting.transcripts.length === 0}
                    >
                      {expandedMeeting === meeting.id ? 'Hide Transcripts' : 'Show Transcripts'}
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
}
