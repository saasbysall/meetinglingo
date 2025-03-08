
import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Menu, X } from 'lucide-react';

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  // Check if user is on the dashboard or other authenticated pages
  const isAuthenticated = location.pathname.includes('/dashboard') || 
                          location.pathname.includes('/settings');

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <nav 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? 'glass-navbar py-3' : 'bg-transparent py-5'
      }`}
    >
      <div className="container mx-auto px-4 md:px-6 flex items-center justify-between">
        <Link to="/" className="flex items-center">
          <span className="text-2xl font-bold text-darkblue">
            Meeting<span className="text-teal">Lingo</span>
          </span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-8">
          <div className="flex items-center space-x-6">
            <Link to="/features" className="text-darkblue/80 font-medium hover:text-darkblue transition-colors">
              Features
            </Link>
            <Link to="/pricing" className="text-darkblue/80 font-medium hover:text-darkblue transition-colors">
              Pricing
            </Link>
            <Link to="/about" className="text-darkblue/80 font-medium hover:text-darkblue transition-colors">
              About
            </Link>
          </div>
          
          {isAuthenticated ? (
            <Link to="/dashboard">
              <Button className="bg-darkblue text-white hover:bg-darkblue/90">
                Dashboard
              </Button>
            </Link>
          ) : (
            <div className="flex items-center space-x-4">
              <Link to="/login">
                <Button variant="outline" className="border-gray-200 hover:bg-gray-50">
                  Log in
                </Button>
              </Link>
              <Link to="/signup">
                <Button className="bg-teal text-white hover:bg-teal/90">
                  Start Free Trial
                </Button>
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button 
          className="md:hidden text-darkblue p-2" 
          onClick={toggleMobileMenu}
          aria-label="Toggle menu"
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 top-[60px] bg-white z-40 animate-fade-in">
          <div className="container mx-auto px-4 py-8 flex flex-col space-y-6">
            <Link 
              to="/features" 
              className="text-darkblue font-medium text-lg py-3 border-b border-gray-100"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Features
            </Link>
            <Link 
              to="/pricing" 
              className="text-darkblue font-medium text-lg py-3 border-b border-gray-100"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Pricing
            </Link>
            <Link 
              to="/about" 
              className="text-darkblue font-medium text-lg py-3 border-b border-gray-100"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              About
            </Link>
            
            <div className="pt-4 flex flex-col space-y-4">
              {isAuthenticated ? (
                <Link 
                  to="/dashboard" 
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <Button className="w-full bg-darkblue text-white hover:bg-darkblue/90">
                    Dashboard
                  </Button>
                </Link>
              ) : (
                <>
                  <Link 
                    to="/login" 
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <Button variant="outline" className="w-full border-gray-200 hover:bg-gray-50">
                      Log in
                    </Button>
                  </Link>
                  <Link 
                    to="/signup" 
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <Button className="w-full bg-teal text-white hover:bg-teal/90">
                      Start Free Trial
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
