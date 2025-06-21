
import { Link } from 'react-router-dom';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { PricingContainer, PricingPlan } from '@/components/ui/pricing-container';
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

// Updated pricing plans with proper 20% discount calculation
const MEETING_LINGO_PLANS: PricingPlan[] = [
  {
    name: "Starter",
    description: "Perfect for small teams and occasional meetings",
    monthlyPrice: 50,
    yearlyPrice: 40,  // $50 - 20% = $40 per month when paid yearly
    features: [
      'Up to 10 participants per meeting',
      'Unlimited meetings',
      'Support for 5 languages',
      'Basic email support',
      'Basic meeting history'
    ],
    isPopular: false,
    accent: "bg-teal",
    rotation: -1
  },
  {
    name: "Professional",
    description: "For growing teams with regular international meetings",
    monthlyPrice: 100,
    yearlyPrice: 80,  // $100 - 20% = $80 per month when paid yearly
    features: [
      'Up to 30 participants per meeting',
      'Unlimited meetings',
      'Support for all 50+ languages',
      'Priority support',
      'Advanced analytics',
      'Custom language settings',
      '30-day transcript history'
    ],
    isPopular: true,
    accent: "bg-blue-500",
    rotation: 0
  },
  {
    name: "Enterprise",
    description: "For organizations that require a custom plan tailored to their needs",
    monthlyPrice: 500,
    yearlyPrice: 400,  // $500 - 20% = $400 per month when paid yearly
    features: [
      'Unlimited participants',
      'Unlimited meetings',
      'Support for all 50+ languages',
      'Dedicated support',
      'Advanced security features',
      'Custom integrations',
      'SLA guarantees',
      'Unlimited transcript history'
    ],
    isPopular: false,
    accent: "bg-purple-500",
    rotation: 1
  }
];

export default function Pricing() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleGetStarted = (planName: string) => {
    if (user) {
      navigate('/app');
      toast({
        title: "Welcome back!",
        description: "You can now create meetings with translation.",
      });
    } else {
      navigate('/signup');
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow pt-20">
        <div className="container mx-auto px-4 py-12">
          <PricingContainer
            title="Choose Your Perfect Plan"
            plans={MEETING_LINGO_PLANS}
            onGetStarted={handleGetStarted}
          />
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
