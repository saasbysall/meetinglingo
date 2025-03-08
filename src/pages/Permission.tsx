import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Plus, ArrowRight, Home, X, Menu, Link2, Globe } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
const Permission = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [meetingLink, setMeetingLink] = useState('');
  const [sourceLanguage, setSourceLanguage] = useState('en-GB');
  const [targetLanguage, setTargetLanguage] = useState('es-ES');

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

  // List of available languages
  const languages = [{
    value: 'en-GB',
    label: 'GB English'
  }, {
    value: 'en-US',
    label: 'US English'
  }, {
    value: 'es-ES',
    label: 'ES Spanish'
  }, {
    value: 'fr-FR',
    label: 'FR French'
  }, {
    value: 'de-DE',
    label: 'DE German'
  }, {
    value: 'it-IT',
    label: 'IT Italian'
  }, {
    value: 'ja-JP',
    label: 'JP Japanese'
  }, {
    value: 'zh-CN',
    label: 'CN Chinese'
  }, {
    value: 'pt-BR',
    label: 'BR Portuguese'
  }, {
    value: 'ru-RU',
    label: 'RU Russian'
  }];
  return <div className="min-h-screen flex flex-col md:flex-row bg-lightgray">
      {/* Mobile Header - Only visible on small screens */}
      <header className="md:hidden flex items-center justify-between p-4 bg-white border-b border-gray-200 shadow-subtle">
        <Link to="/" className="flex items-center">
          <span className="text-xl font-bold text-darkblue">
            Meeting<span className="text-teal">Lingo</span>
          </span>
        </Link>
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2 text-darkblue rounded-md hover:bg-gray-100">
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </header>

      {/* Mobile Menu - Only visible when toggled on small screens */}
      {isMobileMenuOpen && <div className="md:hidden fixed inset-0 top-[60px] bg-white z-40 animate-fade-in">
          <div className="container mx-auto px-4 py-8 flex flex-col space-y-6">
            <Link to="/app" className="flex items-center space-x-3 text-darkblue font-medium text-lg py-3 border-b border-gray-100" onClick={() => setIsMobileMenuOpen(false)}>
              <Plus size={20} />
              <span>New Meeting</span>
            </Link>
            <Link to="/history" className="flex items-center space-x-3 text-darkblue font-medium text-lg py-3 border-b border-gray-100" onClick={() => setIsMobileMenuOpen(false)}>
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
        </div>}

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
      <main className="flex-1 md:ml-64 min-h-screen bg-gradient-to-br from-lightgray to-white py-6">
        <div className="flex items-center justify-center min-h-screen px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-xl shadow-elevated max-w-md w-full p-8 animate-fade-in-up">
            <div className="text-center mb-3">
              <h1 className="text-2xl font-semibold text-darkblue mb-3 md:text-2xl">
                Add MeetingLingo to your meeting
              </h1>
              <p className="text-gray-600 mb-8 text-base">
                Enter your meeting link and MeetingLingo will join the call
              </p>
              
              <div className="space-y-8 text-left">
                <div className="space-y-3">
                  <label htmlFor="meeting-link" className="text-gray-900 font-semibold text-lg block bg-cyan-50">Meeting link</label>
                  <div className="relative">
                    <Link2 className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                    <Input id="meeting-link" className="pl-10 w-full border-2 border-gray-200 rounded-lg py-3 text-base font-medium focus:border-teal focus:ring-1 focus:ring-teal/20" placeholder="Paste meeting link" value={meetingLink} onChange={e => setMeetingLink(e.target.value)} />
                  </div>
                </div>
                
                <div className="space-y-3">
                  <label className="text-gray-900 font-semibold text-lg block flex items-center">
                    <Globe size={18} className="mr-2 text-teal" />
                    Meeting languages
                  </label>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm text-gray-500 font-medium">Source language</label>
                      <Select value={sourceLanguage} onValueChange={setSourceLanguage}>
                        <SelectTrigger className="w-full border-2 border-gray-200 py-3 rounded-lg focus:ring-1 focus:ring-teal/20">
                          <SelectValue placeholder="Select language" />
                        </SelectTrigger>
                        <SelectContent className="max-h-60 overflow-y-auto">
                          {languages.map(language => <SelectItem key={language.value} value={language.value}>
                              {language.label}
                            </SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-sm text-gray-500 font-medium">Target language</label>
                      <Select value={targetLanguage} onValueChange={setTargetLanguage}>
                        <SelectTrigger className="w-full border-2 border-gray-200 py-3 rounded-lg focus:ring-1 focus:ring-teal/20">
                          <SelectValue placeholder="Select language" />
                        </SelectTrigger>
                        <SelectContent className="max-h-60 overflow-y-auto">
                          {languages.map(language => <SelectItem key={language.value} value={language.value}>
                              {language.label}
                            </SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </div>
              
              <Button className="bg-teal hover:bg-teal/90 active:bg-teal/80 text-white w-full py-6 mt-8 text-lg font-semibold rounded-lg shadow-glow-teal transition-all" disabled={!meetingLink}>
                Join call
                <ArrowRight className="ml-2" size={18} />
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>;
};
export default Permission;