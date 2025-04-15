
import React from 'react';
import MessageController, { useMessageController } from '@/components/messages/MessageController';
import MessageHeader from '@/components/messages/MessageHeader';
import MessageContent from '@/components/messages/MessageContent';
import WebhookConfig from '@/components/messages/WebhookConfig';

const Messages: React.FC = () => {
  const messageController = useMessageController();
  
  return (
    <div className="flex min-h-screen w-full bg-secondary/5">
      <div className="flex-grow flex flex-col p-6 w-full max-w-[1400px] mx-auto">
        <MessageHeader />
        
        <MessageContent 
          recipients={messageController.recipients}
          selectedRecipientIds={messageController.selectedRecipientIds}
          selectedRecipients={messageController.selectedRecipients}
          message={messageController.message}
          searchTerm={messageController.searchTerm}
          isLoading={messageController.isLoading}
          selectedTags={messageController.selectedTags}
          handleSelectRecipient={messageController.handleSelectRecipient}
          handleRemoveRecipient={messageController.handleRemoveRecipient}
          handleSendMessage={messageController.handleSendMessage}
          setMessage={messageController.setMessage}
          setSearchTerm={messageController.setSearchTerm}
          setSelectedTags={messageController.setSelectedTags}
        />

        {/* Webhook Configuration */}
        <WebhookConfig 
          webhookUrl={messageController.webhookUrl}
          onWebhookUrlChange={messageController.setWebhookUrl}
          onSaveWebhook={messageController.handleSaveWebhook}
        />
      </div>
    </div>
  );
};

export default Messages;
