
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useTranslation } from '@/context/TranslationContext';
import LanguageDropdown from '@/components/ui/LanguageDropdown';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const handleSignOut = async () => {
    try {
      await signOut();
      toast({
        title: "Signed out successfully",
        description: "You have been logged out.",
      });
      navigate('/');
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to sign out. Please try again.",
        variant: "destructive"
      });
    }
  };

  const scrollToSection = (sectionId: string) => {
    // If we're not on the home page, navigate there first
    if (window.location.pathname !== '/') {
      navigate('/', { replace: true });
      // Wait for navigation to complete, then scroll
      setTimeout(() => {
        const element = document.getElementById(sectionId);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    } else {
      // We're already on the home page, just scroll
      const element = document.getElementById(sectionId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
    setIsMenuOpen(false);
  };

  return (
    <nav className="fixed top-0 left-0 right-0 bg-white/90 backdrop-blur-md border-b border-gray-100 z-50">
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <span className="text-2xl font-bold">
              Meeting<span className="text-teal">Lingo</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <button 
              onClick={() => scrollToSection('features')}
              className="text-darkblue hover:text-teal transition-colors cursor-pointer"
            >
              {t('nav.features')}
            </button>
            <Link to="/pricing" className="text-darkblue hover:text-teal transition-colors">
              {t('nav.pricing')}
            </Link>
            <button 
              onClick={() => scrollToSection('about')}
              className="text-darkblue hover:text-teal transition-colors cursor-pointer"
            >
              {t('nav.about')}
            </button>
            <LanguageDropdown />
          </div>

          {/* Auth Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <>
                <Link to="/app">
                  <Button variant="ghost" className="text-darkblue hover:text-teal">
                    {t('nav.app')}
                  </Button>
                </Link>
                <Button
                  onClick={handleSignOut}
                  variant="ghost"
                  className="text-darkblue hover:text-teal"
                >
                  {t('nav.signout')}
                </Button>
              </>
            ) : (
              <>
                <Link to="/login">
                  <Button variant="ghost" className="text-darkblue hover:text-teal">
                    {t('nav.login')}
                  </Button>
                </Link>
                <Link to="/login">
                  <Button className="bg-teal hover:bg-teal/90 text-white">
                    {t('nav.signup')}
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-darkblue hover:text-teal"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-100">
            <div className="flex flex-col space-y-4">
              <button 
                onClick={() => scrollToSection('features')}
                className="text-darkblue hover:text-teal transition-colors text-left"
              >
                {t('nav.features')}
              </button>
              <Link to="/pricing" className="text-darkblue hover:text-teal transition-colors">
                {t('nav.pricing')}
              </Link>
              <button 
                onClick={() => scrollToSection('about')}
                className="text-darkblue hover:text-teal transition-colors text-left"
              >
                {t('nav.about')}
              </button>
              <div className="pt-2">
                <LanguageDropdown />
              </div>
              {user ? (
                <>
                  <Link to="/app">
                    <Button variant="ghost" className="w-full justify-start text-darkblue hover:text-teal">
                      {t('nav.app')}
                    </Button>
                  </Link>
                  <Button
                    onClick={handleSignOut}
                    variant="ghost"
                    className="w-full justify-start text-darkblue hover:text-teal"
                  >
                    {t('nav.signout')}
                  </Button>
                </>
              ) : (
                <>
                  <Link to="/login">
                    <Button variant="ghost" className="w-full justify-start text-darkblue hover:text-teal">
                      {t('nav.login')}
                    </Button>
                  </Link>
                  <Link to="/login">
                    <Button className="w-full bg-teal hover:bg-teal/90 text-white">
                      {t('nav.signup')}
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
