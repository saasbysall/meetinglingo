
import React from 'react';
import { Volume2 } from 'lucide-react';
import VolumeIndicator from './VolumeIndicator';

interface MeetingStatusProps {
  minutes: number;
  translating: boolean;
  volume: number;
  inputVolume: number;
  isSpeaking: boolean;
  handleVolumeChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const MeetingStatus: React.FC<MeetingStatusProps> = ({ 
  minutes, 
  translating, 
  volume,
  inputVolume,
  isSpeaking,
  handleVolumeChange 
}) => {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <p className="text-sm text-gray-500">Available Minutes</p>
        <p className="font-medium">{minutes || 0} minutes</p>
      </div>
      
      <div className="space-y-2">
        <p className="text-sm text-gray-500">Translation Status</p>
        <div className="flex items-center gap-2">
          <span className={`inline-block w-3 h-3 rounded-full ${
            translating ? 'bg-green-500 animate-pulse' : 'bg-red-500'
          }`} />
          <p className="font-medium">{translating ? 'Active' : 'Inactive'}</p>
        </div>
      </div>

      <VolumeIndicator volume={inputVolume} isSpeaking={isSpeaking} />
      
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-500">Output Volume</p>
          <div className="w-6 h-6">
            <Volume2 />
          </div>
        </div>
        <input
          type="range"
          min="0"
          max="100"
          value={volume}
          onChange={handleVolumeChange}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
        />
      </div>
    </div>
  );
};

export default MeetingStatus;
