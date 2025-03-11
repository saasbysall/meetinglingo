
import React from 'react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ExternalLink } from 'lucide-react';

interface MeetingHeaderProps {
  meetingTitle: string;
  handleOpenMeeting: () => void;
}

const MeetingHeader: React.FC<MeetingHeaderProps> = ({ 
  meetingTitle, 
  handleOpenMeeting 
}) => {
  return (
    <>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-darkblue">{meetingTitle}</h1>
        <Button 
          variant="outline" 
          className="flex items-center gap-2"
          onClick={handleOpenMeeting}
        >
          <ExternalLink className="h-4 w-4" />
          Open Meeting
        </Button>
      </div>
      <Separator className="my-6" />
    </>
  );
};

export default MeetingHeader;
