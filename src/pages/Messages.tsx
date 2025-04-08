
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, MessageSquare } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import RecipientList from '@/components/messages/RecipientList';
import MessageComposer from '@/components/messages/MessageComposer';
import WebhookConfig from '@/components/messages/WebhookConfig';
import { useCreators } from '../context/CreatorContext';
import { mockEmployees } from '@/data/mockEmployees';
import { Recipient } from '@/types/message';

const Messages: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { creators } = useCreators();
  
  const [recipients, setRecipients] = useState<Recipient[]>([]);
  const [selectedRecipientId, setSelectedRecipientId] = useState<string>("");
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

  const handleSendMessage = async () => {
    if (!selectedRecipientId) {
      toast({
        title: "No recipient selected",
        description: "Please select a recipient for your message",
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

    const recipient = recipients.find(r => r.id === selectedRecipientId);
    if (!recipient) return;

    setIsLoading(true);

    try {
      // Call the n8n webhook with the message and recipient details
      const response = await fetch(webhookUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        mode: "no-cors", // Handle CORS issues
        body: JSON.stringify({
          message: message,
          recipient: {
            id: recipient.id,
            name: recipient.name,
            role: recipient.role || "Team Member"
          },
          timestamp: new Date().toISOString()
        }),
      });

      toast({
        title: "Message sent",
        description: `Your message has been sent to ${recipient.name} via WhatsApp`
      });
      
      // Clear the message input after successful send
      setMessage("");
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

  // Get the selected recipient object
  const selectedRecipient = recipients.find(r => r.id === selectedRecipientId);

  return (
    <div className="flex min-h-screen w-full bg-background">
      <div className="flex-grow flex flex-col p-6 w-full">
        <div className="flex items-center gap-3 mb-6 animate-fade-in">
          <Button 
            variant="ghost" 
            size="icon" 
            className="rounded-full hover:bg-brand-yellow/20"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="h-5 w-5" />
            <span className="sr-only">Go back</span>
          </Button>
          <h1 className="text-3xl font-bold flex items-center">
            <MessageSquare className="mr-3 text-brand-yellow" />
            WhatsApp Messages
          </h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-full">
          {/* Recipients List */}
          <RecipientList 
            recipients={filteredRecipients}
            selectedRecipientId={selectedRecipientId}
            onSelectRecipient={setSelectedRecipientId}
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            selectedTags={selectedTags}
            onTagsChange={setSelectedTags}
          />

          {/* Message Composer */}
          <MessageComposer 
            selectedRecipient={selectedRecipient}
            message={message}
            onMessageChange={setMessage}
            onSendMessage={handleSendMessage}
            isLoading={isLoading}
          />
        </div>

        {/* Webhook Configuration */}
        <WebhookConfig 
          webhookUrl={webhookUrl}
          onWebhookUrlChange={setWebhookUrl}
          onSaveWebhook={handleSaveWebhook}
        />
      </div>
    </div>
  );
};

export default Messages;
