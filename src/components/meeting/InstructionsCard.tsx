
import React from 'react';

const InstructionsCard: React.FC = () => {
  return (
    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg mb-6">
      <h3 className="font-medium mb-2 text-blue-800">How to use:</h3>
      <ol className="list-decimal pl-5 space-y-1 text-sm text-blue-700">
        <li>Click "Open Meeting" to join your meeting in a new tab</li>
        <li>Join the meeting and enable your microphone there</li>
        <li>Come back to this tab</li>
        <li>Click "Start Translation" to begin real-time translation</li>
      </ol>
    </div>
  );
};

export default InstructionsCard;
