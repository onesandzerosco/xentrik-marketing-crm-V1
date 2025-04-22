
import React from 'react';
import MessageController, { useMessageController } from '@/components/messages/MessageController';
import MessageHeader from '@/components/messages/MessageHeader';
import MessageContent from '@/components/messages/MessageContent';
import FileManager from '@/components/messages/FileManager';

const Messages: React.FC = () => {
  const messageController = useMessageController();
  const selectedCreator = messageController.selectedRecipients[0];
  
  return (
    <div className="flex min-h-screen w-full bg-secondary/5">
      <div className="flex-grow flex flex-col p-6 w-full max-w-[1400px] mx-auto gap-6">
        <MessageHeader />
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
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
          </div>

          {selectedCreator && (
            <div className="bg-card rounded-lg border p-6">
              <FileManager 
                creatorId={selectedCreator.id}
                allowDelete={true}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Messages;
