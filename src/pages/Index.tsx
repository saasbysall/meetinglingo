import { Link } from 'react-router-dom';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import HeroSection from '@/components/home/HeroSection';
import FeaturesSection from '@/components/home/FeaturesSection';
import IntegrationsSection from '@/components/home/IntegrationsSection';
import TestimonialSection from '@/components/home/TestimonialSection';
import PricingSection from '@/components/home/PricingSection';
import CTASection from '@/components/home/CTASection';
import { Button } from '@/components/ui/button';

export default function Index() {
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow">
        {/* Hero Section */}
        <HeroSection />
        
        {/* Features Section */}
        <FeaturesSection />
        
        {/* Bot Translation Feature - NEW */}
        <section className="py-12 bg-gradient-to-r from-blue-50 to-teal-50">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="md:w-1/2">
                <h2 className="text-3xl font-bold text-darkblue mb-4">AI Translation Bot</h2>
                <p className="text-lg text-gray-700 mb-6">
                  Let our AI bot join your Google Meet and translate conversations automatically. 
                  No need to join yourself - our bot handles everything!
                </p>
                <Button 
                  asChild
                  className="bg-teal hover:bg-teal/90 text-white"
                >
                  <Link to="/meeting/bot">Try Bot Translation</Link>
                </Button>
              </div>
              <div className="md:w-1/2 flex justify-center">
                <div className="bg-white p-6 rounded-xl shadow-lg">
                  <img 
                    src="/placeholder.svg" 
                    alt="AI Translation Bot" 
                    className="max-w-xs mx-auto"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>
        
        {/* Integrations Section */}
        <IntegrationsSection />
        
        {/* Testimonial Section */}
        <TestimonialSection />
        
        {/* Pricing Section */}
        <PricingSection />
        
        {/* CTA Section */}
        <CTASection />
      </main>
      
      <Footer />
    </div>
  );
}
