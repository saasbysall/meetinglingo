
import { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useUserData } from '@/hooks/useUserData';
import { Button } from '@/components/ui/button';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Calendar, Clock, Plus } from 'lucide-react';

export default function Dashboard() {
  const { user, loading: authLoading } = useAuth();
  const { userData, loading: userDataLoading } = useUserData();
  const navigate = useNavigate();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login');
    }
  }, [user, authLoading, navigate]);

  if (authLoading || userDataLoading) {
    return <div className="h-screen flex justify-center items-center">Loading...</div>;
  }

  if (!user || !userData) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex-grow container mx-auto px-4 py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-darkblue">Welcome, {userData.username}!</h1>
          <div className="mt-2 flex items-center">
            <Clock className="h-5 w-5 text-teal mr-2" />
            <span className="text-gray-600">{userData.minutes} minutes available</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white p-6 rounded-xl shadow-md">
            <h2 className="text-xl font-semibold text-darkblue mb-4">Start New Meeting</h2>
            <p className="text-gray-600 mb-6">
              Join a video call with real-time translation by providing a meeting link.
            </p>
            <Link to="/meeting/new">
              <Button className="w-full bg-teal hover:bg-teal/90 text-white">
                <Plus className="h-4 w-4 mr-2" />
                New Meeting
              </Button>
            </Link>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-md">
            <h2 className="text-xl font-semibold text-darkblue mb-4">Meeting History</h2>
            <p className="text-gray-600 mb-6">
              View your past meetings and access saved transcripts.
            </p>
            <Link to="/history">
              <Button className="w-full bg-gray-100 text-darkblue hover:bg-gray-200 border border-gray-200">
                <Calendar className="h-4 w-4 mr-2" />
                View History
              </Button>
            </Link>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
