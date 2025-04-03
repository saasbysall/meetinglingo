
import { Link } from 'react-router-dom';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { PricingContainer, PricingPlan } from '@/components/ui/pricing-container';
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

// Convert the existing pricing data to the new format
const MEETING_LINGO_PLANS: PricingPlan[] = [
  {
    name: "Starter",
    description: "Perfect for small teams and occasional meetings",
    monthlyPrice: 19,
    yearlyPrice: 190,
    features: [
      'Up to 10 participants per meeting',
      '10 hours of translation per month',
      '7-day transcript history',
      '5 supported languages',
      'Basic email support'
    ],
    isPopular: false,
    accent: "bg-teal",
    rotation: -1
  },
  {
    name: "Professional",
    description: "For growing teams with regular international meetings",
    monthlyPrice: 49,
    yearlyPrice: 490,
    features: [
      'Up to 30 participants per meeting',
      '40 hours of translation per month',
      '30-day transcript history',
      'All 50+ supported languages',
      'Priority support',
      'Advanced analytics',
      'Custom language settings'
    ],
    isPopular: true,
    accent: "bg-blue-500",
    rotation: 0
  },
  {
    name: "Enterprise",
    description: "Custom solutions for large organizations",
    monthlyPrice: 199,
    yearlyPrice: 1990,
    features: [
      'Unlimited participants',
      'Unlimited translation hours',
      'Unlimited transcript history',
      'All 50+ supported languages',
      'Dedicated support',
      'Advanced security features',
      'Custom integrations',
      'SLA guarantees'
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
    if (planName === 'Enterprise') {
      navigate('/contact');
    } else {
      if (user) {
        navigate('/dashboard');
        toast({
          title: "Welcome back!",
          description: "You're already logged in. You can create a new meeting from your dashboard.",
        });
      } else {
        navigate('/signup');
      }
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
