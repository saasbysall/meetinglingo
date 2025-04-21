
import { Check, Globe, Zap, Lock, Download, Headphones, PieChart } from 'lucide-react';
import { useTranslation } from '@/context/TranslationContext';

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
  const { t } = useTranslation();

  const features = [
    {
      icon: <Globe size={24} />,
      title: t('features.languages'),
      description: t('features.languages.desc')
    },
    {
      icon: <Zap size={24} />,
      title: t('features.realtime'),
      description: t('features.realtime.desc')
    },
    {
      icon: <Lock size={24} />,
      title: t('features.privacy'),
      description: t('features.privacy.desc')
    },
    {
      icon: <Download size={24} />,
      title: t('features.transcripts'),
      description: t('features.transcripts.desc')
    },
    {
      icon: <Headphones size={24} />,
      title: t('features.integration'),
      description: t('features.integration.desc')
    },
    {
      icon: <PieChart size={24} />,
      title: t('features.analytics'),
      description: t('features.analytics.desc')
    }
  ];

  return (
    <section className="py-20 relative">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-darkblue mb-4">{t('features.title')}</h2>
          <p className="text-lg text-darkblue/70">
            {t('features.subtitle')}
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
              <h3 className="text-2xl md:text-3xl font-bold text-darkblue mb-6">{t('features.how')}</h3>
              <p className="text-darkblue/70 mb-8">
                {t('features.how.desc')}
              </p>
              
              <ul className="space-y-4">
                {[
                  t('features.step1'),
                  t('features.step2'),
                  t('features.step3'),
                  t('features.step4'),
                  t('features.step5')
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
