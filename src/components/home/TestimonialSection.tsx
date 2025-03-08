
import { useState, useEffect } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Quote } from 'lucide-react';

interface Testimonial {
  id: number;
  name: string;
  role: string;
  company: string;
  avatar: string;
  content: string;
}

const TestimonialSection = () => {
  const testimonials: Testimonial[] = [
    {
      id: 1,
      name: 'Sarah Johnson',
      role: 'Head of Global Operations',
      company: 'TechVentures Inc.',
      avatar: 'https://i.pravatar.cc/150?img=37',
      content: 'MeetingLingo has transformed how our global teams collaborate. Our meetings are now more inclusive and productive with real-time translation breaking down language barriers. It\'s become an essential tool for our company.'
    },
    {
      id: 2,
      name: 'Akio Tanaka',
      role: 'Product Manager',
      company: 'Nexus Innovation',
      avatar: 'https://i.pravatar.cc/150?img=60',
      content: 'Being able to communicate in my native language while everyone hears in theirs has made our international projects run so much smoother. The UI is intuitive and the translation quality exceeds what we\'ve tried before.'
    },
    {
      id: 3,
      name: 'Elena Rodriguez',
      role: 'Director of Communications',
      company: 'GlobalConnect',
      avatar: 'https://i.pravatar.cc/150?img=5',
      content: 'We conduct weekly meetings with partners across 12 countries. MeetingLingo has eliminated the need for separate translators and made our discussions more natural and engaging. The transcription feature is also incredibly useful for reference.'
    }
  ];
  
  const [activeIndex, setActiveIndex] = useState(0);
  
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((current) => (current + 1) % testimonials.length);
    }, 6000);
    
    return () => clearInterval(interval);
  }, [testimonials.length]);
  
  return (
    <section className="py-20 bg-lightgray">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <span className="px-3 py-1 rounded-full bg-teal/10 text-teal text-sm font-medium mb-4 inline-block">
            Trusted Worldwide
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-darkblue mb-4">
            What our customers say
          </h2>
          <p className="text-lg text-darkblue/70">
            Teams around the world are using MeetingLingo to break down language barriers and improve global collaboration.
          </p>
        </div>

        <div className="max-w-4xl mx-auto relative">
          <div className="absolute top-0 left-12 text-teal opacity-20">
            <Quote size={80} />
          </div>
          
          <div className="relative z-10 bg-white rounded-2xl p-8 md:p-12 shadow-subtle">
            {testimonials.map((testimonial, index) => (
              <div 
                key={testimonial.id}
                className={`transition-opacity duration-500 absolute inset-0 p-8 md:p-12 ${
                  index === activeIndex ? 'opacity-100 z-10' : 'opacity-0 -z-10'
                }`}
              >
                <p className="text-xl md:text-2xl text-darkblue/80 italic mb-8">
                  "{testimonial.content}"
                </p>
                
                <div className="flex items-center">
                  <Avatar className="h-14 w-14 border-2 border-white shadow-sm">
                    <AvatarImage src={testimonial.avatar} alt={testimonial.name} />
                    <AvatarFallback>{testimonial.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="ml-4">
                    <h4 className="font-semibold text-darkblue">{testimonial.name}</h4>
                    <p className="text-sm text-darkblue/70">{testimonial.role}, {testimonial.company}</p>
                  </div>
                </div>
              </div>
            ))}
            
            {/* This div maintains the height */}
            <div className="invisible">
              <p className="text-xl md:text-2xl text-darkblue/80 italic mb-8">
                "{testimonials[0].content}"
              </p>
              <div className="flex items-center">
                <div className="h-14 w-14"></div>
                <div className="ml-4">
                  <h4 className="font-semibold text-darkblue">{testimonials[0].name}</h4>
                  <p className="text-sm text-darkblue/70">{testimonials[0].role}, {testimonials[0].company}</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex justify-center mt-8 space-x-2">
            {testimonials.map((_, index) => (
              <button
                key={index}
                className={`h-2 w-2 rounded-full transition-all ${
                  index === activeIndex ? 'bg-teal w-6' : 'bg-teal/30'
                }`}
                onClick={() => setActiveIndex(index)}
                aria-label={`View testimonial ${index + 1}`}
              />
            ))}
          </div>
        </div>
        
        <div className="mt-20 flex flex-wrap justify-center items-center gap-12 opacity-70">
          {['TechVentures', 'GlobalConnect', 'Nexus', 'FutureCorp', 'Innovate', 'BlueWave'].map((company) => (
            <div key={company} className="text-center">
              <p className="text-xl font-bold text-darkblue/60">{company}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialSection;
