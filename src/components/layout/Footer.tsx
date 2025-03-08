
import { Link } from 'react-router-dom';
import { ExternalLink, Github, Linkedin, Twitter } from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white border-t border-gray-100 py-12 mt-16">
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <div className="flex items-center">
              <span className="text-2xl font-bold text-darkblue">
                Meeting<span className="text-teal">Lingo</span>
              </span>
            </div>
            <p className="text-darkblue/70 max-w-xs">
              Breaking language barriers in virtual meetings with real-time AI-powered translation.
            </p>
            <div className="flex items-center space-x-4 pt-2">
              <a href="#" className="text-darkblue/60 hover:text-teal transition-colors" aria-label="Twitter">
                <Twitter size={20} />
              </a>
              <a href="#" className="text-darkblue/60 hover:text-teal transition-colors" aria-label="LinkedIn">
                <Linkedin size={20} />
              </a>
              <a href="#" className="text-darkblue/60 hover:text-teal transition-colors" aria-label="GitHub">
                <Github size={20} />
              </a>
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-darkblue mb-4">Product</h4>
            <ul className="space-y-3">
              <li>
                <Link to="/features" className="text-darkblue/70 hover:text-teal transition-colors">
                  Features
                </Link>
              </li>
              <li>
                <Link to="/pricing" className="text-darkblue/70 hover:text-teal transition-colors">
                  Pricing
                </Link>
              </li>
              <li>
                <a href="#" className="text-darkblue/70 hover:text-teal transition-colors flex items-center">
                  Roadmap
                  <ExternalLink size={14} className="ml-1" />
                </a>
              </li>
              <li>
                <Link to="/about" className="text-darkblue/70 hover:text-teal transition-colors">
                  About Us
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-darkblue mb-4">Resources</h4>
            <ul className="space-y-3">
              <li>
                <Link to="/help" className="text-darkblue/70 hover:text-teal transition-colors">
                  Help Center
                </Link>
              </li>
              <li>
                <Link to="/blog" className="text-darkblue/70 hover:text-teal transition-colors">
                  Blog
                </Link>
              </li>
              <li>
                <a href="#" className="text-darkblue/70 hover:text-teal transition-colors flex items-center">
                  Documentation
                  <ExternalLink size={14} className="ml-1" />
                </a>
              </li>
              <li>
                <Link to="/contact" className="text-darkblue/70 hover:text-teal transition-colors">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-darkblue mb-4">Legal</h4>
            <ul className="space-y-3">
              <li>
                <Link to="/privacy" className="text-darkblue/70 hover:text-teal transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/terms" className="text-darkblue/70 hover:text-teal transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link to="/cookies" className="text-darkblue/70 hover:text-teal transition-colors">
                  Cookie Policy
                </Link>
              </li>
              <li>
                <Link to="/gdpr" className="text-darkblue/70 hover:text-teal transition-colors">
                  GDPR
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-100 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-darkblue/60 text-sm">
            © {currentYear} MeetingLingo. All rights reserved.
          </p>
          <div className="mt-4 md:mt-0">
            <select className="bg-gray-50 border border-gray-100 text-darkblue/70 text-sm rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-teal/20">
              <option value="en">English</option>
              <option value="es">Español</option>
              <option value="fr">Français</option>
              <option value="de">Deutsch</option>
              <option value="ja">日本語</option>
            </select>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
