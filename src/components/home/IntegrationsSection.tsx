
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

const IntegrationsSection = () => {
  const [activeTab, setActiveTab] = useState('zoom');
  
  const platforms = [
    {
      id: 'zoom',
      name: 'Zoom',
      logo: 'https://cdn-icons-png.flaticon.com/512/2504/2504927.png',
      description: 'Integrate MeetingLingo with Zoom to provide real-time translation for all participants in your video conferences.',
      features: [
        'One-click installation',
        'Works with Zoom Meetings and Webinars',
        'Supports breakout rooms',
        'Automatic speaker detection'
      ]
    },
    {
      id: 'teams',
      name: 'Microsoft Teams',
      logo: 'https://cdn-icons-png.flaticon.com/512/2504/2504854.png',
      description: 'Enhance Microsoft Teams with MeetingLingo to enable seamless communication across language barriers.',
      features: [
        'Direct integration with Teams',
        'Compatible with Teams channels',
        'Works in one-on-one and group calls',
        'Supports screen sharing sessions'
      ]
    },
    {
      id: 'meet',
      name: 'Google Meet',
      logo: 'https://cdn-icons-png.flaticon.com/512/2504/2504926.png',
      description: 'Add MeetingLingo to your Google Meet calls to facilitate multilingual collaboration without friction.',
      features: [
        'Quick setup through Google Workspace',
        'Supports all Google Meet features',
        'Works with browser-based calls',
        'Integrates with Google Calendar'
      ]
    }
  ];

  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <span className="px-3 py-1 rounded-full bg-teal/10 text-teal text-sm font-medium mb-4 inline-block">
            Seamless Integrations
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-darkblue mb-4">
            Works with your favorite platforms
          </h2>
          <p className="text-lg text-darkblue/70">
            MeetingLingo integrates directly with the tools you already use, making multilingual meetings effortless.
          </p>
        </div>

        <Tabs defaultValue="zoom" className="w-full max-w-4xl mx-auto" onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3 mb-12">
            <TabsTrigger value="zoom" className="data-[state=active]:bg-teal/10 data-[state=active]:text-teal">Zoom</TabsTrigger>
            <TabsTrigger value="teams" className="data-[state=active]:bg-teal/10 data-[state=active]:text-teal">Microsoft Teams</TabsTrigger>
            <TabsTrigger value="meet" className="data-[state=active]:bg-teal/10 data-[state=active]:text-teal">Google Meet</TabsTrigger>
          </TabsList>
          
          {platforms.map((platform) => (
            <TabsContent key={platform.id} value={platform.id} className="mt-0">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                <div>
                  <div className="flex items-center mb-6">
                    <img src={platform.logo} alt={platform.name} className="w-12 h-12 mr-4" />
                    <h3 className="text-2xl font-bold text-darkblue">{platform.name}</h3>
                  </div>
                  
                  <p className="text-darkblue/70 mb-8">
                    {platform.description}
                  </p>
                  
                  <ul className="space-y-4 mb-8">
                    {platform.features.map((feature, index) => (
                      <li key={index} className="flex items-center text-darkblue/80">
                        <div className="h-5 w-5 rounded-full bg-teal/20 flex items-center justify-center text-teal mr-3">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                        {feature}
                      </li>
                    ))}
                  </ul>
                  
                  <Link to="/signup">
                    <Button className="button-primary">
                      Try with {platform.name}
                      <ArrowRight size={16} className="ml-2" />
                    </Button>
                  </Link>
                </div>
                
                <div className="glass-card p-1 rounded-xl shadow-elevated">
                  <img 
                    src={`https://images.unsplash.com/photo-156424234${platform.id === 'zoom' ? '7863' : platform.id === 'teams' ? '3691' : '1298'}-62f5be9bd552?auto=format&fit=crop&q=80&w=1000`}
                    alt={`MeetingLingo with ${platform.name}`}
                    className="w-full h-full object-cover rounded-lg"
                  />
                </div>
              </div>
            </TabsContent>
          ))}
        </Tabs>

        <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-8 items-center justify-items-center">
          {['English', 'Spanish', 'French', 'German', 'Chinese', 'Japanese', 'Portuguese', 'Russian'].map((language, index) => (
            <div 
              key={language} 
              className="text-center" 
            >
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gray-50 mb-4">
                <span className="text-xl font-bold text-darkblue/80">{language.substring(0, 2)}</span>
              </div>
              <p className="text-sm text-darkblue/70">{language}</p>
            </div>
          ))}
        </div>
        
        <div className="text-center mt-12">
          <p className="text-darkblue/70">
            Supporting 50+ languages worldwide
          </p>
        </div>
      </div>
    </section>
  );
};

export default IntegrationsSection;
