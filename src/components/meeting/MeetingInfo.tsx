
import React from 'react';

interface MeetingInfoProps {
  platform: string;
  sourceLanguage: string;
  targetLanguage: string;
}

const MeetingInfo: React.FC<MeetingInfoProps> = ({ 
  platform, 
  sourceLanguage, 
  targetLanguage 
}) => {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <p className="text-sm text-gray-500">Platform</p>
        <p className="font-medium">{platform}</p>
      </div>
      
      <div className="space-y-2">
        <p className="text-sm text-gray-500">Source Language</p>
        <p className="font-medium">{sourceLanguage}</p>
      </div>
      
      <div className="space-y-2">
        <p className="text-sm text-gray-500">Target Language</p>
        <p className="font-medium">{targetLanguage}</p>
      </div>
    </div>
  );
};

export default MeetingInfo;
