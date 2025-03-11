
import React from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';

interface Transcript {
  original: string;
  translated: string;
}

interface ConversationHistoryProps {
  transcripts: Transcript[];
  sourceLanguage: string;
  targetLanguage: string;
}

const ConversationHistory: React.FC<ConversationHistoryProps> = ({ 
  transcripts, 
  sourceLanguage, 
  targetLanguage 
}) => {
  if (transcripts.length === 0) return null;

  return (
    <div className="mt-8 space-y-4">
      <h2 className="text-xl font-semibold">Conversation History</h2>
      <ScrollArea className="h-64 border rounded-md p-4">
        {transcripts.map((transcript, index) => (
          <div key={index} className="mb-4 pb-4 border-b last:border-0">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm text-gray-500 mb-1">Original ({sourceLanguage})</h3>
                <p>{transcript.original}</p>
              </div>
              <div>
                <h3 className="text-sm text-gray-500 mb-1">Translated ({targetLanguage})</h3>
                <p>{transcript.translated}</p>
              </div>
            </div>
          </div>
        ))}
      </ScrollArea>
    </div>
  );
};

export default ConversationHistory;
