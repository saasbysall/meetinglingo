
import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Session, User, Provider } from '@supabase/supabase-js';

type AuthContextType = {
  session: Session | null;
  user: User | null;
  signIn: (email: string, password: string) => Promise<{
    error: any | null;
    data: { session: Session | null } | null;
  }>;
  signUp: (email: string, password: string, username: string) => Promise<{
    error: any | null;
    data: { session: Session | null } | null;
  }>;
  signInWithGoogle: () => Promise<{
    error: any | null;
    data: { session: Session | null } | null;
  }>;
  signOut: () => Promise<void>;
  loading: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        console.log("Auth state changed:", _event, session?.user?.id);
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    const result = await supabase.auth.signInWithPassword({ email, password });
    return {
      data: { session: result.data.session },
      error: result.error
    };
  };

  const signUp = async (email: string, password: string, username: string) => {
    const result = await supabase.auth.signUp({ 
      email, 
      password,
      options: {
        data: { username }
      }
    });
    return {
      data: { session: result.data.session },
      error: result.error
    };
  };

  const signInWithGoogle = async () => {
    try {
      console.log('Starting Google sign in process');
      
      // Create a callback URL that includes our application route
      // This makes it more robust and enables us to handle the callback properly
      const redirectUrl = `${window.location.origin}/auth/callback`;
      
      console.log('Using redirect URL:', redirectUrl);
      
      const result = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUrl,
          scopes: 'https://www.googleapis.com/auth/meetings.space.created https://www.googleapis.com/auth/meetings.space.joined https://www.googleapis.com/auth/meetings.space.participant email profile',
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          }
        }
      });
      
      console.log('Google sign in response:', result);
      
      if (result.error) {
        console.error('Google sign in error:', result.error);
        throw result.error;
      }
      
      return {
        data: { session: null }, // Will be set by the onAuthStateChange event after redirect
        error: null
      };
    } catch (error) {
      console.error('Unexpected error during Google sign in:', error);
      return {
        data: { session: null },
        error: error
      };
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const value = {
    session,
    user,
    signIn,
    signUp,
    signInWithGoogle,
    signOut,
    loading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
