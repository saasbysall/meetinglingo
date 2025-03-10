
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from './use-toast';

export function useAudioPermission() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [permissionLoading, setPermissionLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setPermissionLoading(false);
      return;
    }

    const checkPermissionStatus = async () => {
      try {
        setPermissionLoading(true);
        
        // Check database status first
        const { data } = await supabase
          .from('users')
          .select('mic_enabled')
          .eq('id', user.id)
          .single();
        
        if (data && data.mic_enabled) {
          setHasPermission(true);
        } else {
          // Need to check browser permission
          setHasPermission(false);
        }
      } catch (error) {
        console.error('Error checking permission status:', error);
        setHasPermission(false);
      } finally {
        setPermissionLoading(false);
      }
    };

    checkPermissionStatus();
  }, [user]);

  const requestPermission = async () => {
    if (!user) return false;
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // Clean up the stream
      stream.getTracks().forEach(track => track.stop());
      
      // Update permission in database
      await supabase
        .from('users')
        .update({ mic_enabled: true })
        .eq('id', user.id);
      
      setHasPermission(true);
      
      toast({
        title: 'Microphone access granted',
        description: 'You can now use the translation service.',
      });
      
      return true;
    } catch (error) {
      console.error('Error requesting microphone permission:', error);
      
      toast({
        title: 'Permission denied',
        description: 'Microphone access is required for the translation service.',
        variant: 'destructive',
      });
      
      setHasPermission(false);
      return false;
    }
  };

  return {
    hasPermission,
    permissionLoading,
    requestPermission
  };
}
