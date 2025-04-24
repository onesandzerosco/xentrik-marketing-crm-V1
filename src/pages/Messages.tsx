
import React from 'react';
import { useToast } from '@/hooks/use-toast';
import WebhookMessageForm from '@/components/messages/WebhookMessageForm';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const Messages: React.FC = () => {
  const { toast } = useToast();
  
  const handleWebhookSend = async (recipients: { id: string; type: 'creator' | 'team' }[], message: string) => {
    if (!message.trim()) {
      toast({
        title: "Error",
        description: "Please enter a message",
        variant: "destructive",
      });
      return;
    }

    try {
      // Replace with your n8n webhook URL
      const webhookUrl = process.env.N8N_WEBHOOK_URL || '';
      
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message,
          recipients,
          timestamp: new Date().toISOString(),
        }),
      });

      if (!response.ok) throw new Error('Failed to send message');

      toast({
        title: "Success",
        description: "Message sent successfully",
      });
    } catch (error) {
      console.error('Error sending webhook:', error);
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="container mx-auto p-6">
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle>Send Messages</CardTitle>
        </CardHeader>
        <CardContent>
          <WebhookMessageForm onSend={handleWebhookSend} />
        </CardContent>
      </Card>
    </div>
  );
};

export default Messages;
