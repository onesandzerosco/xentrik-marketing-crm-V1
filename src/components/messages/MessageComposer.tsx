
import React from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { X } from 'lucide-react';

interface MessageComposerProps {
  selectedRecipients: { id: string; name: string }[];
  message: string;
  onMessageChange: (message: string) => void;
  onSendMessage: () => void;
  onRemoveRecipient: (id: string) => void;
  isLoading: boolean;
}

const MessageComposer: React.FC<MessageComposerProps> = ({
  selectedRecipients,
  message,
  onMessageChange,
  onSendMessage,
  onRemoveRecipient,
  isLoading
}) => {
  return (
    <div className="p-4 space-y-4">
      {/* Recipient Chips Section */}
      {selectedRecipients.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {selectedRecipients.map(recipient => (
            <div 
              key={recipient.id} 
              className="flex items-center bg-secondary/20 rounded-full px-3 py-1 text-sm"
            >
              {recipient.name}
              <Button 
                variant="ghost" 
                size="icon" 
                className="ml-2 h-5 w-5 rounded-full"
                onClick={() => onRemoveRecipient(recipient.id)}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          ))}
        </div>
      )}

      {/* Message Input */}
      <Textarea
        placeholder="Type your message..."
        value={message}
        onChange={(e) => onMessageChange(e.target.value)}
        className="min-h-[120px] w-full"
      />

      {/* Send Button */}
      <div className="flex justify-end">
        <Button 
          onClick={onSendMessage}
          disabled={isLoading || !message.trim()}
          className="w-full sm:w-auto bg-gradient-premium-yellow text-black font-medium hover:shadow-premium-highlight transition-all duration-300 transform hover:-translate-y-1 hover:opacity-90"
          variant="premium"
        >
          {isLoading ? 'Sending...' : 'Send Message'}
        </Button>
      </div>
    </div>
  );
};

export default MessageComposer;
