
import React from 'react';
import { MessageSquare } from 'lucide-react';

const MessageHeader: React.FC = () => {
  return (
    <div className="mb-8">
      <h1 className="text-3xl font-bold mb-2">WhatsApp Messages</h1>
      <p className="text-muted-foreground">
        Send messages to your creators through WhatsApp
      </p>
    </div>
  );
};

export default MessageHeader;

