
import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Calendar, Clock, ExternalLink, Video } from 'lucide-react';
import { format } from 'date-fns';

type Meeting = {
  id: string;
  meeting_link: string;
  platform: string;
  source_language: string;
  target_language: string;
  start_time: string;
  end_time: string | null;
};

export default function History() {
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login');
    }
  }, [user, authLoading, navigate]);

  // Fetch meetings
  useEffect(() => {
    const fetchMeetings = async () => {
      if (!user) return;
      
      try {
        const { data, error } = await supabase
          .from('meetings')
          .select('*')
          .eq('user_id', user.id)
          .order('start_time', { ascending: false });
          
        if (error) throw error;
        setMeetings(data || []);
      } catch (error) {
        console.error('Error fetching meetings:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMeetings();
  }, [user]);

  // Get platform icon
  const getPlatformIcon = (platform: string) => {
    // You could use specific icons for each platform, for now using Video for all
    return <Video className="h-5 w-5" />;
  };

  if (authLoading || isLoading) {
    return <div className="h-screen flex justify-center items-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex-grow container mx-auto px-4 py-12">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-darkblue">Meeting History</h1>
          <Link to="/meeting/new">
            <Button className="bg-teal hover:bg-teal/90 text-white">New Meeting</Button>
          </Link>
        </div>

        {meetings.length === 0 ? (
          <div className="bg-white p-8 rounded-xl shadow-md text-center">
            <Calendar className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <h2 className="text-xl font-semibold text-darkblue mb-2">No meetings yet</h2>
            <p className="text-gray-600 mb-6">
              You haven't joined any meetings with MeetingLingo yet.
            </p>
            <Link to="/meeting/new">
              <Button className="bg-teal hover:bg-teal/90 text-white">Start Your First Meeting</Button>
            </Link>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Platform
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Languages
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Duration
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {meetings.map((meeting) => {
                    const startDate = new Date(meeting.start_time);
                    const endDate = meeting.end_time ? new Date(meeting.end_time) : null;
                    
                    // Calculate duration if end time exists
                    let duration = 'In progress';
                    if (endDate) {
                      const durationMs = endDate.getTime() - startDate.getTime();
                      const minutes = Math.floor(durationMs / 60000);
                      duration = `${minutes} min`;
                    }
                    
                    return (
                      <tr key={meeting.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10 flex items-center justify-center rounded-full bg-blue-100 text-blue-600">
                              {getPlatformIcon(meeting.platform)}
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900 capitalize">
                                {meeting.platform}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{format(startDate, 'MMM d, yyyy')}</div>
                          <div className="text-sm text-gray-500">{format(startDate, 'h:mm a')}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                              {meeting.source_language.split('-')[0]}
                            </span>
                            <span className="mx-2">→</span>
                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                              {meeting.target_language.split('-')[0]}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <div className="flex items-center">
                            <Clock className="h-4 w-4 mr-1 text-gray-400" />
                            {duration}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <Link to={`/meeting/${meeting.id}`} className="text-teal hover:text-teal/80 mr-4">
                            View
                          </Link>
                          <a href={meeting.meeting_link} target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-gray-900 inline-flex items-center">
                            Link <ExternalLink className="h-3 w-3 ml-1" />
                          </a>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}
