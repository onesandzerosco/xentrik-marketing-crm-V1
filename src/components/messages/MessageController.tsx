import React, { useState, useEffect } from 'react';
import { useToast } from "@/hooks/use-toast";
import { useCreators } from '@/context/CreatorContext';
import { mockEmployees } from '@/data/mockEmployees';
import { Recipient, MessagePayload } from '@/types/message';

interface MessageControllerProps {
  children: React.ReactNode;
}

export const useMessageController = () => {
  const { toast } = useToast();
  const { creators } = useCreators();
  
  const [recipients, setRecipients] = useState<Recipient[]>([]);
  const [selectedRecipientIds, setSelectedRecipientIds] = useState<string[]>([]);
  const [message, setMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  useEffect(() => {
    // Combine creators and employees into a single recipients list
    const creatorsWithIds = creators.map(creator => ({
      id: `creator-${creator.id}`,
      name: creator.name,
      profileImage: creator.profileImage,
      role: 'Creator',
      type: 'creator' as const
    }));
    
    const employeesWithIds = mockEmployees.map(employee => ({
      id: `employee-${employee.id}`,
      name: employee.name,
      profileImage: employee.profileImage,
      role: employee.role,
      type: 'employee' as const
    }));
    
    setRecipients([...creatorsWithIds, ...employeesWithIds]);
  }, [creators]);

  const handleSelectRecipient = (id: string) => {
    setSelectedRecipientIds(prev => {
      // If already selected, remove it
      if (prev.includes(id)) {
        return prev.filter(recipientId => recipientId !== id);
      }
      // Otherwise add it
      return [...prev, id];
    });
  };

  const handleRemoveRecipient = (id: string) => {
    setSelectedRecipientIds(prev => prev.filter(recipientId => recipientId !== id));
  };

  const handleSendMessage = async () => {
    if (selectedRecipientIds.length === 0) {
      toast({
        title: "No recipients selected",
        description: "Please select at least one recipient for your message",
        variant: "destructive"
      });
      return;
    }

    if (!message.trim()) {
      toast({
        title: "Empty message",
        description: "Please enter a message to send",
        variant: "destructive"
      });
      return;
    }

    const selectedRecipients = recipients.filter(r => selectedRecipientIds.includes(r.id));
    if (selectedRecipients.length === 0) return;

    setIsLoading(true);

    try {
      // Prepare message payload
      const payload: MessagePayload = {
        message: message,
        recipients: selectedRecipients,
        timestamp: new Date().toISOString()
      };

      toast({
        title: "Message sent",
        description: `Your message has been sent to ${selectedRecipients.length} recipient${selectedRecipients.length > 1 ? 's' : ''}`
      });
      
      setMessage("");
    } catch (error) {
      console.error("Error sending message:", error);
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Filter and sort recipients
  const filteredRecipients = recipients.filter(recipient => {
    // Apply search filter
    const matchesSearch = recipient.name.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Apply type filter (Team/Creator)
    const matchesType = selectedTags.length === 0 || 
      (selectedTags.includes("Team") && recipient.type === 'employee') ||
      (selectedTags.includes("Creator") && recipient.type === 'creator');
    
    return matchesSearch && matchesType;
  });

  // Get the selected recipients as objects
  const selectedRecipients = recipients.filter(r => selectedRecipientIds.includes(r.id));

  return {
    recipients: filteredRecipients,
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
  };
};

const MessageController: React.FC<MessageControllerProps> = ({ children }) => {
  const messageController = useMessageController();
  
  // Simply pass all controller values to children as props
  return (
    <>{React.Children.map(children, child => {
      if (React.isValidElement(child)) {
        return React.cloneElement(child, { ...messageController });
      }
      return child;
    })}</>
  );
};

export default MessageController;
