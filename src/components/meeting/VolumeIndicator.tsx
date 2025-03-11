
import React from 'react';
import { Volume1, Volume2, VolumeX } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

interface VolumeIndicatorProps {
  volume: number;
  isSpeaking: boolean;
}

const VolumeIndicator: React.FC<VolumeIndicatorProps> = ({ volume, isSpeaking }) => {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-sm text-gray-500">Input Level</span>
        <div className="w-6 h-6">
          {volume === 0 ? (
            <VolumeX className="text-gray-400" />
          ) : volume < 50 ? (
            <Volume1 className="text-blue-500" />
          ) : (
            <Volume2 className="text-green-500" />
          )}
        </div>
      </div>
      <Progress 
        value={volume} 
        className={`h-2 ${isSpeaking ? 'bg-green-100' : 'bg-gray-100'}`}
      />
    </div>
  );
};

export default VolumeIndicator;
