
import React from 'react';
import { Button } from '@/components/ui/button';
import { Mic, MicOff } from 'lucide-react';

interface TranslationButtonProps {
  translating: boolean;
  micEnabled: boolean;
  availableMinutes: number;
  handleStartTranslation: () => void;
  handleStopTranslation: () => void;
}

const TranslationButton: React.FC<TranslationButtonProps> = ({ 
  translating, 
  micEnabled, 
  availableMinutes, 
  handleStartTranslation, 
  handleStopTranslation 
}) => {
  return (
    <div className="flex justify-center mb-6">
      {!translating ? (
        <Button 
          className="bg-teal hover:bg-teal/90 text-white"
          size="lg" 
          onClick={handleStartTranslation}
          disabled={!micEnabled || availableMinutes <= 0}
        >
          <Mic className="h-4 w-4 mr-2" />
          Start Translation
        </Button>
      ) : (
        <Button 
          variant="destructive" 
          size="lg" 
          onClick={handleStopTranslation}
        >
          <MicOff className="h-4 w-4 mr-2" />
          Stop Translation
        </Button>
      )}
    </div>
  );
};

export default TranslationButton;
