
import React from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Webhook, Save } from 'lucide-react';

interface WebhookConfigProps {
  webhookUrl: string;
  onWebhookUrlChange: (url: string) => void;
  onSaveWebhook: () => void;
}

const WebhookConfig: React.FC<WebhookConfigProps> = ({ 
  webhookUrl, 
  onWebhookUrlChange, 
  onSaveWebhook 
}) => {
  return (
    <Card className="w-full bg-secondary/5 border border-border/40 shadow-sm mt-6">
      <CardHeader className="pb-2">
        <CardTitle className="text-xl flex items-center gap-2">
          <Webhook className="h-5 w-5 text-primary" />
          n8n Webhook Configuration
        </CardTitle>
        <CardDescription>
          Configure your n8n webhook URL for WhatsApp message delivery
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <Input
            type="url"
            placeholder="Enter your n8n webhook URL..."
            value={webhookUrl}
            onChange={(e) => onWebhookUrlChange(e.target.value)}
            className="flex-grow bg-secondary/10 border-border/40"
          />
          <Button
            onClick={onSaveWebhook}
            className="bg-secondary hover:bg-secondary/90 text-white"
          >
            <Save className="h-4 w-4 mr-2" />
            Save Webhook
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default WebhookConfig;
