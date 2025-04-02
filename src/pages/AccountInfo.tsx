
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export default function AccountInfo() {
  const [name, setName] = useState('');
  const [company, setCompany] = useState('');
  const [companySize, setCompanySize] = useState('1-5');
  const [goal, setGoal] = useState('personal');
  const [isLoading, setIsLoading] = useState(false);
  const [receiveUpdates, setReceiveUpdates] = useState(true);
  
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: "Not authenticated",
        description: "Please log in to continue",
        variant: "destructive"
      });
      return navigate('/login');
    }

    setIsLoading(true);

    try {
      // Save user info to profiles table
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          full_name: name,
          company_name: company,
          company_size: companySize,
          usage_goal: goal,
          receive_updates: receiveUpdates,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;

      toast({
        title: "Profile updated",
        description: "Your account information has been saved"
      });
      
      // Redirect to permissions page
      navigate('/permissions');
    } catch (error: any) {
      console.error('Error updating profile:', error);
      toast({
        title: "Failed to update profile",
        description: error.message || "There was an error saving your information",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="text-center mb-6">
            <div className="flex justify-center">
              <div className="text-2xl font-bold text-darkblue">
                Meeting<span className="text-teal">Lingo</span>
              </div>
            </div>
            <h1 className="text-2xl font-bold mt-4">Create your account</h1>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm text-gray-700">
                Name
              </label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1"
                required
              />
            </div>
            
            <div>
              <label htmlFor="company" className="block text-sm text-gray-700">
                Company name
              </label>
              <Input
                id="company"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                className="mt-1"
              />
            </div>
            
            <div>
              <label htmlFor="company-size" className="block text-sm text-gray-700">
                What's the size of your company?
              </label>
              <Select 
                value={companySize} 
                onValueChange={setCompanySize}
              >
                <SelectTrigger className="mt-1" id="company-size">
                  <SelectValue placeholder="Select company size" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1-5">1-5 employees</SelectItem>
                  <SelectItem value="6-20">6-20 employees</SelectItem>
                  <SelectItem value="21-50">21-50 employees</SelectItem>
                  <SelectItem value="51-200">51-200 employees</SelectItem>
                  <SelectItem value="201-500">201-500 employees</SelectItem>
                  <SelectItem value="501+">501+ employees</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label htmlFor="goal" className="block text-sm text-gray-700">
                What are you planning to achieve with MeetingLingo?
              </label>
              <Select 
                value={goal} 
                onValueChange={setGoal}
              >
                <SelectTrigger className="mt-1" id="goal">
                  <SelectValue placeholder="Select your goal" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="personal">Personal use</SelectItem>
                  <SelectItem value="client-communication">Communicate with my clients</SelectItem>
                  <SelectItem value="team-collaboration">Team collaboration</SelectItem>
                  <SelectItem value="international-meetings">International meetings</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-start mt-4">
              <div className="flex items-center h-5">
                <input
                  id="receive-updates"
                  type="checkbox"
                  checked={receiveUpdates}
                  onChange={(e) => setReceiveUpdates(e.target.checked)}
                  className="w-4 h-4 text-teal border-gray-300 rounded focus:ring-teal"
                />
              </div>
              <div className="ml-3 text-sm">
                <label htmlFor="receive-updates" className="text-gray-600">
                  Send me updates via email. Unsubscribe any time
                </label>
              </div>
            </div>
            
            <Button
              type="submit"
              className="w-full bg-darkblue hover:bg-darkblue/90 mt-4"
              disabled={isLoading}
            >
              {isLoading ? 'Saving...' : 'Continue'}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
