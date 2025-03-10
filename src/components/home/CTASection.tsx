
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';

const CTASection = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleTrialClick = () => {
    if (user) {
      navigate('/meeting/new');
      toast({
        title: "Welcome back!",
        description: "Create a new meeting with translation.",
      });
    } else {
      navigate('/signup');
    }
  };

  const handleContactClick = () => {
    navigate('/contact');
  };

  return (
    <section className="py-20 bg-darkblue relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10">
        <div className="absolute top-[10%] right-[10%] w-[300px] h-[300px] bg-teal/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-[10%] left-[10%] w-[300px] h-[300px] bg-teal/10 rounded-full blur-3xl"></div>
      </div>
      
      <div className="container mx-auto px-4 md:px-6 relative z-10">
        <div className="max-w-3xl mx-auto text-center">
          <span className="px-3 py-1 rounded-full bg-white/10 text-white text-sm font-medium mb-6 inline-block">
            Ready to Get Started?
          </span>
          
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6">
            Break language barriers in your next meeting
          </h2>
          
          <p className="text-white/80 text-lg mb-8 max-w-2xl mx-auto">
            Join thousands of global teams using MeetingLingo to communicate effortlessly across languages. Start your free trial today.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4">
            <Button 
              className="w-full sm:w-auto bg-teal hover:bg-teal/90 text-white px-8 py-6 text-lg"
              onClick={handleTrialClick}
            >
              Start Your Free Trial
              <ArrowRight size={20} className="ml-2" />
            </Button>
            
            <Button 
              variant="outline" 
              className="w-full sm:w-auto border-white/20 text-white hover:bg-white/10 px-8 py-6 text-lg"
              onClick={handleContactClick}
            >
              Contact Sales
            </Button>
          </div>
          
          <p className="text-white/60 mt-6 text-sm">
            No credit card required. 7-day free trial.
          </p>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
