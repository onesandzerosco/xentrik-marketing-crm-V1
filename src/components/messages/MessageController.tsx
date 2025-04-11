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
  const [webhookUrl, setWebhookUrl] = useState("");
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
    
    // Load saved webhook URL from localStorage
    const savedWebhook = localStorage.getItem("n8nWebhookUrl");
    if (savedWebhook) {
      setWebhookUrl(savedWebhook);
    }
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

    if (!webhookUrl) {
      toast({
        title: "Webhook URL not configured",
        description: "Please configure your n8n webhook URL in the settings",
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

      // Call the n8n webhook with the message and recipients details
      const response = await fetch(webhookUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        mode: "no-cors", // Handle CORS issues
        body: JSON.stringify(payload),
      });

      toast({
        title: "Message sent",
        description: `Your message has been sent to ${selectedRecipients.length} recipient${selectedRecipients.length > 1 ? 's' : ''} via WhatsApp`
      });
      
      // Clear the message input after successful send
      setMessage("");
      // Keep the recipients selected for possible follow-up messages
    } catch (error) {
      console.error("Error sending message:", error);
      toast({
        title: "Error",
        description: "Failed to send WhatsApp message. Please check your webhook configuration.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveWebhook = () => {
    if (!webhookUrl.trim()) {
      toast({
        title: "Error",
        description: "Please enter a valid webhook URL",
        variant: "destructive"
      });
      return;
    }
    
    localStorage.setItem("n8nWebhookUrl", webhookUrl);
    
    toast({
      title: "Webhook Saved",
      description: "Your n8n webhook URL has been saved"
    });
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
    webhookUrl,
    searchTerm,
    isLoading,
    selectedTags,
    handleSelectRecipient,
    handleRemoveRecipient,
    handleSendMessage,
    handleSaveWebhook,
    setMessage,
    setWebhookUrl,
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
