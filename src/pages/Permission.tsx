
import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Mic, Plus, ArrowRight, Home, X, Menu } from 'lucide-react';
import { useState } from 'react';

const Permission = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // Scroll restoration on page load
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Mock user data (would come from auth context in a real app)
  const user = {
    username: 'johndoe',
    email: 'john@example.com',
    minutes: 0
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Mobile Header - Only visible on small screens */}
      <header className="md:hidden flex items-center justify-between p-4 bg-white border-b border-gray-200">
        <Link to="/" className="flex items-center">
          <span className="text-xl font-bold text-darkblue">
            Meeting<span className="text-teal">Lingo</span>
          </span>
        </Link>
        <button 
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 text-darkblue rounded-md hover:bg-gray-100"
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </header>

      {/* Mobile Menu - Only visible when toggled on small screens */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 top-[60px] bg-white z-40 animate-fade-in">
          <div className="container mx-auto px-4 py-8 flex flex-col space-y-6">
            <Link 
              to="/app" 
              className="flex items-center space-x-3 text-darkblue font-medium text-lg py-3 border-b border-gray-100"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <Plus size={20} />
              <span>New Meeting</span>
            </Link>
            <Link 
              to="/history" 
              className="flex items-center space-x-3 text-darkblue font-medium text-lg py-3 border-b border-gray-100"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <Home size={20} />
              <span>All Meetings</span>
            </Link>
            
            <div className="pt-4 flex flex-col space-y-4">
              <Link to="/signup">
                <Button className="w-full bg-gradient-to-r from-teal to-teal/90 text-white">
                  Start Trial
                </Button>
              </Link>
            </div>
            
            <div className="flex items-center mt-4 pt-4 border-t border-gray-100">
              <Avatar className="h-10 w-10">
                <AvatarImage src="https://github.com/shadcn.png" alt={user.username} />
                <AvatarFallback>{user.username.substring(0, 2).toUpperCase()}</AvatarFallback>
              </Avatar>
              <div className="ml-3">
                <p className="text-sm font-medium text-darkblue">{user.username}</p>
                <p className="text-xs text-gray-500">{user.email}</p>
              </div>
            </div>
            
            <div className="bg-gray-100 rounded-full px-4 py-2 inline-flex items-center justify-center">
              <span className="text-sm font-medium text-gray-700">{user.minutes} min</span>
            </div>
          </div>
        </div>
      )}

      {/* Sidebar - Only visible on medium screens and up */}
      <aside className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 border-r border-gray-200 bg-white">
        <div className="flex flex-col h-full overflow-y-auto">
          {/* Logo */}
          <div className="flex items-center px-6 py-4 border-b border-gray-200">
            <span className="text-xl font-bold text-darkblue">
              Meeting<span className="text-teal">Lingo</span>
            </span>
          </div>
          
          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2">
            <Link to="/app" className="flex items-center space-x-3 px-3 py-2 text-darkblue hover:bg-gray-100 rounded-md">
              <Plus size={20} className="text-darkblue" />
              <span className="font-medium">New Meeting</span>
            </Link>
            <Link to="/history" className="flex items-center space-x-3 px-3 py-2 text-darkblue hover:bg-gray-100 rounded-md">
              <Home size={20} className="text-darkblue" />
              <span className="font-medium">All Meetings</span>
            </Link>
          </nav>
          
          {/* Trial Call-to-Action */}
          <div className="px-4 py-4">
            <Link to="/signup">
              <Button className="w-full bg-gradient-to-r from-teal to-teal/90 text-white">
                Start Trial
              </Button>
            </Link>
          </div>
          
          {/* User Info */}
          <div className="px-4 py-4 border-t border-gray-200">
            <div className="flex items-center">
              <Avatar className="h-10 w-10">
                <AvatarImage src="https://github.com/shadcn.png" alt={user.username} />
                <AvatarFallback>{user.username.substring(0, 2).toUpperCase()}</AvatarFallback>
              </Avatar>
              <div className="ml-3">
                <p className="text-sm font-medium text-darkblue">{user.username}</p>
                <p className="text-xs text-gray-500">{user.email}</p>
              </div>
            </div>
          </div>
          
          {/* Minutes Balance */}
          <div className="px-4 py-4 mb-6">
            <div className="bg-gray-100 rounded-full px-4 py-2 inline-flex items-center justify-center">
              <span className="text-sm font-medium text-gray-700">{user.minutes} min</span>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 bg-lightgray md:ml-64 min-h-screen">
        <div className="flex items-center justify-center min-h-screen p-4">
          <div className="bg-white rounded-xl shadow-subtle max-w-md w-full p-8 animate-fade-in-up">
            <div className="text-center">
              <div className="mx-auto bg-teal/10 w-16 h-16 flex items-center justify-center rounded-full mb-6">
                <Mic size={32} className="text-teal" />
              </div>
              <h1 className="text-2xl md:text-3xl font-medium text-darkblue mb-4">
                To use MeetingLingo, enable microphone access
              </h1>
              <p className="text-gray-600 mb-6">
                MeetingLingo needs microphone access to provide real-time translation during your meetings. Please allow access when prompted by your browser.
              </p>
              
              <div className="mb-8 bg-gray-50 rounded-lg p-4">
                <img 
                  src="/placeholder.svg" 
                  alt="Microphone permission illustration" 
                  className="mx-auto h-48 object-contain"
                />
              </div>
              
              <Button className="bg-teal text-white w-full py-6 text-lg">
                Enable Microphone
                <ArrowRight size={20} className="ml-2" />
              </Button>
              
              <p className="text-sm text-gray-500 mt-4">
                You can change this permission anytime in your browser settings.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Permission;
