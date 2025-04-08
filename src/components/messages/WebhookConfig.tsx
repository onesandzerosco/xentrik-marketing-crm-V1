
import React from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

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
    <Card className="mt-6">
      <CardHeader>
        <CardTitle className="text-lg">n8n Webhook Configuration</CardTitle>
        <CardDescription>
          Configure the n8n webhook URL to enable WhatsApp messaging
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-end gap-4">
          <div className="flex-grow">
            <label htmlFor="webhook" className="text-sm font-medium block mb-1">
              n8n Webhook URL
            </label>
            <Input
              id="webhook"
              placeholder="https://your-n8n-instance.com/webhook/..."
              value={webhookUrl}
              onChange={(e) => onWebhookUrlChange(e.target.value)}
            />
          </div>
          <Button onClick={onSaveWebhook} className="bg-brand-yellow hover:bg-brand-highlight text-black">
            Save Webhook
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default WebhookConfig;
