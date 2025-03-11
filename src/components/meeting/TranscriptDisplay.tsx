
import React from 'react';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';

interface TranscriptDisplayProps {
  originalText: string;
  translatedText: string;
  sourceLanguage: string;
  targetLanguage: string;
}

const TranscriptDisplay: React.FC<TranscriptDisplayProps> = ({
  originalText,
  translatedText,
  sourceLanguage,
  targetLanguage
}) => {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Live Transcript</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="p-4 relative bg-gray-50">
          <h3 className="font-medium mb-2 text-sm text-gray-500">Source: {sourceLanguage}</h3>
          <ScrollArea className="h-32">
            <p>{originalText}</p>
          </ScrollArea>
        </Card>
        
        <Card className="p-4 relative bg-gray-50">
          <h3 className="font-medium mb-2 text-sm text-gray-500">Target: {targetLanguage}</h3>
          <ScrollArea className="h-32">
            <p>{translatedText}</p>
          </ScrollArea>
        </Card>
      </div>
    </div>
  );
};

export default TranscriptDisplay;
