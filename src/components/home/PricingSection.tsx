
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Check, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

const PricingSection = () => {
  const [isAnnual, setIsAnnual] = useState(true);
  
  const plans = [
    {
      name: 'Starter',
      description: 'Perfect for small teams and occasional meetings',
      monthlyPrice: 19,
      annualPrice: 15,
      features: [
        'Up to 10 participants per meeting',
        '10 hours of translation per month',
        '7-day transcript history',
        '5 supported languages',
        'Basic email support'
      ],
      cta: 'Start Free Trial',
      highlighted: false
    },
    {
      name: 'Professional',
      description: 'For growing teams with regular international meetings',
      monthlyPrice: 49,
      annualPrice: 39,
      features: [
        'Up to 30 participants per meeting',
        '40 hours of translation per month',
        '30-day transcript history',
        'All 50+ supported languages',
        'Priority support',
        'Advanced analytics',
        'Custom language settings'
      ],
      cta: 'Start Free Trial',
      highlighted: true
    },
    {
      name: 'Enterprise',
      description: 'Custom solutions for large organizations',
      monthlyPrice: null,
      annualPrice: null,
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
      cta: 'Contact Sales',
      highlighted: false
    }
  ];
  
  return (
    <section id="pricing" className="py-20">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <span className="px-3 py-1 rounded-full bg-teal/10 text-teal text-sm font-medium mb-4 inline-block">
            Simple Pricing
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-darkblue mb-4">
            Choose the right plan for your team
          </h2>
          <p className="text-lg text-darkblue/70">
            All plans start with a 7-day free trial. No credit card required.
          </p>
          
          <div className="flex items-center justify-center mt-8">
            <span className={`mr-3 ${isAnnual ? 'text-darkblue/60' : 'text-darkblue font-medium'}`}>
              Monthly
            </span>
            <Switch
              checked={isAnnual}
              onCheckedChange={setIsAnnual}
              className="data-[state=checked]:bg-teal"
            />
            <span className={`ml-3 ${isAnnual ? 'text-darkblue font-medium' : 'text-darkblue/60'}`}>
              Annual <span className="text-teal text-sm font-medium">(Save 20%)</span>
            </span>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan, index) => (
            <div 
              key={index}
              className={`rounded-xl p-8 border transition-all ${
                plan.highlighted 
                  ? 'border-teal bg-white shadow-glow-teal scale-105 z-10 relative' 
                  : 'border-gray-200 bg-white hover:border-teal/40 hover:shadow-elevated'
              }`}
            >
              <div className="mb-6">
                <h3 className="text-xl font-bold text-darkblue mb-2">{plan.name}</h3>
                <p className="text-darkblue/70 text-sm h-12">{plan.description}</p>
              </div>
              
              <div className="mb-6">
                {plan.monthlyPrice !== null ? (
                  <>
                    <span className="text-4xl font-bold text-darkblue">
                      ${isAnnual ? plan.annualPrice : plan.monthlyPrice}
                    </span>
                    <span className="text-darkblue/60 text-sm ml-1">
                      /month {isAnnual && '(billed annually)'}
                    </span>
                  </>
                ) : (
                  <span className="text-2xl font-bold text-darkblue">Custom Pricing</span>
                )}
              </div>
              
              <ul className="space-y-3 mb-8">
                {plan.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-start">
                    <Check size={18} className="text-teal mr-2 mt-0.5 flex-shrink-0" />
                    <span className="text-darkblue/80 text-sm">{feature}</span>
                  </li>
                ))}
              </ul>
              
              <Link to={plan.name === 'Enterprise' ? '/contact' : '/signup'}>
                <Button 
                  className={
                    plan.highlighted 
                      ? 'w-full bg-teal hover:bg-teal/90 text-white' 
                      : 'w-full bg-white border border-gray-200 text-darkblue hover:bg-gray-50'
                  }
                >
                  {plan.cta}
                </Button>
              </Link>
            </div>
          ))}
        </div>
        
        <div className="mt-16 max-w-3xl mx-auto">
          <div className="bg-lightgray rounded-xl p-6 md:p-8">
            <h3 className="text-xl font-semibold text-darkblue mb-4 flex items-center">
              <span>Frequently Asked Questions</span>
            </h3>
            
            <div className="space-y-6">
              {[
                {
                  question: 'How does the free trial work?',
                  answer: 'Your 7-day free trial gives you full access to all features of your selected plan. No credit card is required to start. We\'ll send you a reminder before the trial ends.'
                },
                {
                  question: 'Can I switch plans later?',
                  answer: 'Yes, you can upgrade or downgrade your plan at any time. If you upgrade, you\'ll be charged the prorated difference. If you downgrade, the new rate will apply at the start of your next billing cycle.'
                },
                {
                  question: 'What happens if I exceed my monthly translation hours?',
                  answer: 'If you approach your limit, we\'ll notify you. You can either upgrade to a higher tier or purchase additional hours as needed. We\'ll never cut you off in the middle of an important meeting.'
                },
                {
                  question: 'Is there a limit on the number of meetings?',
                  answer: 'No, there\'s no limit on the number of meetings you can have. The plans are based on the total number of translation hours and participants per meeting.'
                }
              ].map((faq, index) => (
                <div key={index}>
                  <h4 className="font-medium text-darkblue mb-2">{faq.question}</h4>
                  <p className="text-darkblue/70 text-sm">{faq.answer}</p>
                </div>
              ))}
            </div>
            
            <div className="mt-6 text-center">
              <p className="text-darkblue/70 text-sm">
                Have more questions? <a href="/contact" className="text-teal font-medium">Contact our sales team</a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PricingSection;
