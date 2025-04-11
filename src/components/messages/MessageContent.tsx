
import React from 'react';
import RecipientList from '@/components/messages/RecipientList';
import MessageComposer from '@/components/messages/MessageComposer';
import { Recipient } from '@/types/message';

interface MessageContentProps {
  recipients: Recipient[];
  selectedRecipientIds: string[];
  selectedRecipients: Recipient[];
  message: string;
  searchTerm: string;
  isLoading: boolean;
  selectedTags: string[];
  handleSelectRecipient: (id: string) => void;
  handleRemoveRecipient: (id: string) => void;
  handleSendMessage: () => void;
  setMessage: (message: string) => void;
  setSearchTerm: (term: string) => void;
  setSelectedTags: (tags: string[]) => void;
}

const MessageContent: React.FC<MessageContentProps> = ({
  recipients,
  selectedRecipientIds,
  selectedRecipients,
  message,
  searchTerm,
  isLoading,
  selectedTags,
  handleSelectRecipient,
  handleRemoveRecipient,
  handleSendMessage,
  setMessage,
  setSearchTerm,
  setSelectedTags
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-full mb-8">
      {/* Recipients List */}
      <RecipientList 
        recipients={recipients}
        selectedRecipientIds={selectedRecipientIds}
        onSelectRecipient={handleSelectRecipient}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        selectedTags={selectedTags}
        onTagsChange={setSelectedTags}
      />

      {/* Message Composer */}
      <MessageComposer 
        selectedRecipients={selectedRecipients}
        message={message}
        onMessageChange={setMessage}
        onSendMessage={handleSendMessage}
        onRemoveRecipient={handleRemoveRecipient}
        isLoading={isLoading}
      />
    </div>
  );
};

export default MessageContent;
