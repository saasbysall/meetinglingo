
import { Check, Globe, Zap, Lock, Download, Headphones, PieChart } from 'lucide-react';

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

const FeatureCard = ({ icon, title, description }: FeatureCardProps) => {
  return (
    <div className="glass-card p-8 rounded-xl backdrop-blur-md transition-all duration-300 hover:shadow-elevated hover:-translate-y-1">
      <div className="h-12 w-12 rounded-lg bg-teal/10 flex items-center justify-center text-teal mb-6">
        {icon}
      </div>
      <h3 className="text-xl font-semibold text-darkblue mb-3">{title}</h3>
      <p className="text-darkblue/70">{description}</p>
    </div>
  );
};

const FeaturesSection = () => {
  const features = [
    {
      icon: <Globe size={24} />,
      title: "50+ Languages",
      description: "Support for over 50 languages including English, Spanish, Chinese, French, German, Japanese, and more."
    },
    {
      icon: <Zap size={24} />,
      title: "Real-time Translation",
      description: "Instant voice translation with minimal latency, ensuring natural conversation flow during your meetings."
    },
    {
      icon: <Lock size={24} />,
      title: "Privacy Focused",
      description: "End-to-end encryption and no data retention policies to keep your conversations secure and private."
    },
    {
      icon: <Download size={24} />,
      title: "Downloadable Transcripts",
      description: "Get multi-language transcripts of your meetings for sharing or future reference."
    },
    {
      icon: <Headphones size={24} />,
      title: "Platform Integration",
      description: "Seamlessly works with Zoom, Microsoft Teams, and Google Meet with a simple setup process."
    },
    {
      icon: <PieChart size={24} />,
      title: "Meeting Analytics",
      description: "View insights on language usage, speaking time, and participation across your team's meetings."
    }
  ];

  return (
    <section className="py-20 relative">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-darkblue mb-4">Features that make language barriers disappear</h2>
          <p className="text-lg text-darkblue/70">
            MeetingLingo combines cutting-edge AI with intuitive design to create a seamless translation experience.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div key={index} className="animate-fade-in-up" style={{ animationDelay: `${0.1 * index}s` }}>
              <FeatureCard
                icon={feature.icon}
                title={feature.title}
                description={feature.description}
              />
            </div>
          ))}
        </div>

        <div className="mt-16 bg-lightgray rounded-2xl p-8 md:p-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <h3 className="text-2xl md:text-3xl font-bold text-darkblue mb-6">How MeetingLingo Works</h3>
              <p className="text-darkblue/70 mb-8">
                Our AI-powered solution translates speech in real-time, providing both audio output and subtitles for seamless multilingual communication.
              </p>
              
              <ul className="space-y-4">
                {[
                  "Connect MeetingLingo to your preferred video platform",
                  "Select your desired translation language",
                  "Join your meeting as usual",
                  "Hear translated audio and see real-time subtitles",
                  "Download transcripts after the meeting"
                ].map((item, index) => (
                  <li key={index} className="flex items-start">
                    <div className="h-6 w-6 rounded-full bg-teal/20 flex items-center justify-center text-teal mr-3 mt-0.5">
                      <Check size={14} />
                    </div>
                    <span className="text-darkblue/80">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="relative">
              <div className="relative rounded-xl overflow-hidden border border-white/30 shadow-subtle">
                <img 
                  src="https://images.unsplash.com/photo-1581591524425-c7e0978865fc?auto=format&fit=crop&q=80&w=1000" 
                  alt="MeetingLingo in action" 
                  className="w-full h-full object-cover"
                />
                
                {/* Simulated subtitles overlay */}
                <div className="absolute bottom-0 left-0 right-0 bg-darkblue/75 backdrop-blur-sm p-4 text-white">
                  <p className="text-sm mb-1 opacity-80">Speaker (English):</p>
                  <p className="font-medium">Our quarterly results show significant growth in Asia.</p>
                  <p className="text-sm mt-3 mb-1 opacity-80">Translated (Spanish):</p>
                  <p className="font-medium">Nuestros resultados trimestrales muestran un crecimiento significativo en Asia.</p>
                </div>
              </div>
              
              {/* Decorative elements */}
              <div className="absolute -top-5 -right-5 h-24 w-24 bg-teal/5 rounded-full blur-xl"></div>
              <div className="absolute -bottom-5 -left-5 h-24 w-24 bg-teal/5 rounded-full blur-xl"></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
