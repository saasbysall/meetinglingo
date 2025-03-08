
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Play, ChevronRight, Globe, Clock, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';

const HeroSection = () => {
  const [isVideoOpen, setIsVideoOpen] = useState(false);

  return (
    <div className="relative pt-24 md:pt-32 pb-16 overflow-hidden">
      {/* Background elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10">
        <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-teal/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-[-10%] left-[-5%] w-[500px] h-[500px] bg-teal/5 rounded-full blur-3xl"></div>
      </div>

      <div className="container mx-auto px-4 md:px-6">
        <div className="flex flex-col items-center text-center max-w-4xl mx-auto">
          <div className="inline-flex items-center px-3 py-1 rounded-full bg-teal/10 text-teal text-sm font-medium mb-6 animate-fade-in">
            <span className="bg-teal h-2 w-2 rounded-full mr-2"></span>
            Breaking language barriers in virtual meetings
          </div>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-darkblue leading-tight mb-6 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
            Real-time AI Translation for <span className="text-teal">Video Calls</span>
          </h1>

          <p className="text-lg md:text-xl text-darkblue/70 mb-8 max-w-3xl animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            Enable seamless communication across 50+ languages during your Zoom, Teams, and Google Meet calls with instant voice translation and real-time subtitles.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
            <Link to="/signup">
              <Button className="button-primary flex items-center w-full sm:w-auto">
                Start Free 7-Day Trial
                <ChevronRight size={18} className="ml-1" />
              </Button>
            </Link>
            
            <Dialog open={isVideoOpen} onOpenChange={setIsVideoOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="button-secondary flex items-center w-full sm:w-auto">
                  <Play size={18} className="mr-2 text-teal" />
                  Watch Demo
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl p-0 bg-black border-none">
                <div className="aspect-video w-full">
                  <iframe 
                    className="w-full h-full"
                    src="https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1" 
                    title="MeetingLingo Demo Video"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  ></iframe>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 text-darkblue/70 animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
            <div className="flex items-center">
              <Globe size={18} className="mr-2 text-teal" />
              <span>50+ Languages</span>
            </div>
            <div className="flex items-center">
              <Clock size={18} className="mr-2 text-teal" />
              <span>Real-time Translation</span>
            </div>
            <div className="flex items-center">
              <Shield size={18} className="mr-2 text-teal" />
              <span>End-to-end Encryption</span>
            </div>
          </div>
        </div>
        
        <div className="mt-16 relative max-w-5xl mx-auto animate-fade-in-up" style={{ animationDelay: '0.5s' }}>
          <div className="relative rounded-xl overflow-hidden shadow-elevated border border-white/20 aspect-video">
            <img 
              src="https://images.unsplash.com/photo-1565932887479-b18108f07ffd?auto=format&fit=crop&q=80&w=1000" 
              alt="MeetingLingo Interface" 
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-darkblue/50 to-transparent pointer-events-none"></div>
            
            <Button 
              className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-darkblue p-6 rounded-full"
              onClick={() => setIsVideoOpen(true)}
            >
              <Play size={32} />
            </Button>
          </div>
          
          {/* Floating annotation elements */}
          <div className="glass-card absolute -top-4 -right-4 p-3 rounded-lg hidden md:flex items-center space-x-2 shadow-elevated">
            <div className="h-3 w-3 bg-green-500 rounded-full pulse-subtle"></div>
            <span className="text-sm font-medium">Live Translation Active</span>
          </div>
          
          <div className="glass-card absolute -bottom-4 -left-4 p-3 rounded-lg hidden md:flex items-center space-x-2 shadow-elevated">
            <span className="px-2 py-1 bg-teal/20 text-teal text-xs font-semibold rounded">NEW</span>
            <span className="text-sm font-medium">Multi-speaker detection</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;
