
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { Eye, EyeOff, Loader2 } from 'lucide-react';

interface AuthFormProps {
  type: 'login' | 'signup';
}

const AuthForm = ({ type }: AuthFormProps) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (type === 'signup' && !agreeToTerms) {
      toast({
        title: "Please agree to terms",
        description: "You must agree to the terms and privacy policy to continue.",
        variant: "destructive"
      });
      return;
    }
    
    try {
      setLoading(true);
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Success! Redirect to dashboard or welcome page
      toast({
        title: type === 'login' ? "Login successful" : "Account created",
        description: type === 'login' 
          ? "Welcome back to MeetingLingo." 
          : "Your 7-day trial has been activated.",
      });
      
      if (type === 'signup') {
        navigate('/dashboard');
      } else {
        navigate('/dashboard');
      }
    } catch (error) {
      console.error("Authentication error:", error);
      toast({
        title: "Authentication failed",
        description: "Please check your credentials and try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="glass-panel rounded-xl p-8 w-full max-w-md">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-darkblue mb-2">
          {type === 'login' ? 'Welcome back' : 'Create your account'}
        </h2>
        <p className="text-darkblue/70">
          {type === 'login' 
            ? 'Sign in to your MeetingLingo account' 
            : 'Start your 7-day free trial. No credit card required.'}
        </p>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-5">
        {type === 'signup' && (
          <div className="space-y-2">
            <Label htmlFor="name">Full name</Label>
            <Input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your name"
              required
              className="input-field"
            />
          </div>
        )}
        
        <div className="space-y-2">
          <Label htmlFor="email">Email address</Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            required
            className="input-field"
          />
        </div>
        
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <Label htmlFor="password">Password</Label>
            {type === 'login' && (
              <Link to="/forgot-password" className="text-sm text-teal hover:underline">
                Forgot password?
              </Link>
            )}
          </div>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
              className="input-field pr-10"
              minLength={8}
            />
            <button
              type="button"
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-darkblue/50 hover:text-darkblue"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          {type === 'signup' && (
            <p className="text-sm text-darkblue/60 mt-1">
              Must be at least 8 characters
            </p>
          )}
        </div>
        
        {type === 'signup' && (
          <div className="flex items-start space-x-2 py-2">
            <Checkbox 
              id="terms" 
              checked={agreeToTerms}
              onCheckedChange={(checked) => setAgreeToTerms(checked as boolean)}
              className="mt-1"
            />
            <Label htmlFor="terms" className="text-sm font-normal text-darkblue/70 leading-tight">
              I agree to the <Link to="/terms" className="text-teal hover:underline">Terms of Service</Link> and <Link to="/privacy" className="text-teal hover:underline">Privacy Policy</Link>
            </Label>
          </div>
        )}
        
        <Button 
          type="submit" 
          className="w-full bg-teal hover:bg-teal/90 text-white"
          disabled={loading || (type === 'signup' && !agreeToTerms)}
        >
          {loading ? (
            <span className="flex items-center">
              <Loader2 size={18} className="animate-spin mr-2" />
              {type === 'login' ? 'Signing in...' : 'Creating account...'}
            </span>
          ) : (
            type === 'login' ? 'Sign in' : 'Create account'
          )}
        </Button>
        
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-darkblue/60">Or continue with</span>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <Button variant="outline" type="button" className="border-gray-200">
            <svg viewBox="0 0 24 24" width="16" height="16" className="mr-2">
              <path
                fill="currentColor"
                d="M12.0002 0C5.3722 0 0 5.373 0 12C0 18.627 5.3722 24 12.0002 24C18.6272 24 24 18.627 24 12C24 5.373 18.6272 0 12.0002 0ZM16.8732 8.013C16.8812 8.131 16.8842 8.249 16.8842 8.369C16.8842 12.453 13.7092 17.164 8.0462 17.164C6.3772 17.164 4.8122 16.682 3.5002 15.857C3.7402 15.883 3.9872 15.896 4.2342 15.896C5.6002 15.896 6.8492 15.431 7.8502 14.644C6.5872 14.622 5.5272 13.787 5.1652 12.644C5.3502 12.676 5.5502 12.694 5.7542 12.694C6.0332 12.694 6.3002 12.66 6.5552 12.594C5.2322 12.328 4.2352 11.155 4.2352 9.748C4.2352 9.735 4.2352 9.724 4.2352 9.712C4.6192 9.92 5.0522 10.046 5.5092 10.062C4.7382 9.546 4.2362 8.687 4.2362 7.711C4.2362 7.184 4.3772 6.687 4.6282 6.256C6.0662 7.995 8.2282 9.145 10.6612 9.267C10.6132 9.065 10.5862 8.85 10.5862 8.631C10.5862 7.046 11.8762 5.758 13.4612 5.758C14.2882 5.758 15.0382 6.106 15.5612 6.661C16.2122 6.53 16.8192 6.295 17.3702 5.978C17.1662 6.633 16.7242 7.183 16.1492 7.534C16.7122 7.464 17.2502 7.321 17.7502 7.112C17.3722 7.672 16.8952 8.166 16.3502 8.569C16.8732 8.013 16.8732 8.013 16.8732 8.013Z"
              />
            </svg>
            Google
          </Button>
          <Button variant="outline" type="button" className="border-gray-200">
            <svg viewBox="0 0 24 24" width="16" height="16" className="mr-2">
              <path
                fill="currentColor"
                d="M9.02396 21.985C19.0696 21.985 24.4156 13.8132 24.4156 6.82662C24.4156 6.66773 24.4156 6.50798 24.4087 6.34938C25.5407 5.52836 26.5226 4.51322 27.3056 3.36338C26.2529 3.83068 25.1234 4.13353 23.9536 4.2592C25.1704 3.52857 26.0838 2.36607 26.5158 0.997298C25.3777 1.68599 24.1334 2.16709 22.8306 2.41858C21.8231 1.3344 20.4387 0.64252 18.9409 0.477763C17.4431 0.313006 15.9371 0.68588 14.6848 1.53285C13.4326 2.37983 12.5315 3.64102 12.1514 5.08154C11.7714 6.52206 11.9348 8.0569 12.6116 9.38122C10.5459 9.27635 8.52651 8.74699 6.69164 7.82469C4.85677 6.90238 3.25322 5.6102 1.9932 4.03276C1.24867 5.5387 1.06752 7.27508 1.49163 8.91036C1.91574 10.5456 2.91432 11.9666 4.32 12.9C3.41493 12.8741 2.52951 12.6424 1.7344 12.2247V12.2952C1.73376 13.9328 2.29503 15.5195 3.31278 16.7901C4.33052 18.0606 5.74819 18.9371 7.3384 19.2688C6.49871 19.4865 5.62441 19.5201 4.77 19.3672C5.15972 20.7804 5.97186 22.0262 7.08989 22.9282C8.20792 23.8301 9.57465 24.3419 10.9872 24.3952C8.6417 26.2287 5.74464 27.2246 2.7592 27.2216C2.50548 27.2211 2.25188 27.2037 2 27.1696C5.02257 29.0602 8.48713 30.0797 12.0272 30.0764C23.0224 30.0764 29.0752 21.9992 29.0752 15.0196L29.0576 14.3016C30.1851 13.3952 31.1608 12.2904 31.936 11.0304C30.9123 11.4719 29.8234 11.7745 28.704 11.9272C29.8697 11.2289 30.7652 10.1359 31.1896 8.83722C30.0842 9.48997 28.8755 9.96072 27.6144 10.2328C26.6109 9.13523 25.2668 8.44204 23.8114 8.27547C22.356 8.10891 20.8863 8.48059 19.6838 9.32589C18.4812 10.172 17.6294 11.43 17.2947 12.8576C16.9599 14.2851 17.1633 15.7887 17.872 17.0912C14.9305 16.9284 12.0613 16.1244 9.45807 14.7421C6.85483 13.3598 4.58754 11.4348 2.8208 9.11823C2.0462 10.5883 1.85651 12.2994 2.28458 13.9151C2.71264 15.5309 3.73112 16.9357 5.1296 17.8392C4.31391 17.8138 3.51621 17.6073 2.8008 17.2359V17.2967C2.80209 18.866 3.36285 20.3848 4.37941 21.5932C5.39597 22.8016 6.79574 23.6234 8.3352 23.9256C7.53298 24.1311 6.69642 24.1624 5.88 24.0176C6.29112 25.3608 7.1128 26.5426 8.22567 27.4012C9.33854 28.2599 10.692 28.7536 12.096 28.8168C9.8268 30.5707 7.02464 31.5227 4.1392 31.52C3.89116 31.5193 3.6433 31.5059 3.3968 31.48C6.31453 33.2817 9.72699 34.255 13.2128 34.2504"
              />
            </svg>
            Microsoft
          </Button>
        </div>
        
        <div className="text-center text-sm text-darkblue/70 mt-6">
          {type === 'login' ? (
            <>
              Don't have an account?{' '}
              <Link to="/signup" className="text-teal font-medium hover:underline">
                Sign up
              </Link>
            </>
          ) : (
            <>
              Already have an account?{' '}
              <Link to="/login" className="text-teal font-medium hover:underline">
                Sign in
              </Link>
            </>
          )}
        </div>
      </form>
    </div>
  );
};

export default AuthForm;
