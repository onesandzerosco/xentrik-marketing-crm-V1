
import React from 'react';
import { Send, User, MessageSquare } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

interface Recipient {
  id: string;
  name: string;
  profileImage?: string;
  role?: string;
  type: 'creator' | 'employee';
}

interface MessageComposerProps {
  selectedRecipient: Recipient | undefined;
  message: string;
  onMessageChange: (message: string) => void;
  onSendMessage: () => void;
  isLoading: boolean;
}

const MessageComposer: React.FC<MessageComposerProps> = ({
  selectedRecipient,
  message,
  onMessageChange,
  onSendMessage,
  isLoading
}) => {
  return (
    <Card className="md:col-span-2 flex flex-col h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-xl">Send WhatsApp Message</CardTitle>
        <CardDescription>
          Compose and send WhatsApp messages via n8n automation
        </CardDescription>
      </CardHeader>
      <Separator className="mb-4" />
      <CardContent className="flex-grow flex flex-col p-6">
        {selectedRecipient ? (
          <>
            <div className="mb-4">
              <label className="text-sm font-medium mb-1 block">Recipient</label>
              <div className="flex items-center gap-2 p-2 bg-muted rounded-md">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={selectedRecipient.profileImage || ""} alt={selectedRecipient.name} />
                  <AvatarFallback>
                    <User className="h-4 w-4" />
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{selectedRecipient.name}</p>
                  <div className="flex items-center gap-1">
                    <p className="text-xs text-muted-foreground">{selectedRecipient.role || "Team Member"}</p>
                    <Badge variant="outline" className="text-xs">
                      {selectedRecipient.type === 'creator' ? 'Creator' : 'Team'}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>

            <div className="mb-4 flex-grow">
              <label htmlFor="message" className="text-sm font-medium mb-1 block">
                Message
              </label>
              <Textarea 
                id="message"
                placeholder="Type your WhatsApp message here..."
                className="resize-none h-[calc(100vh-400px)]"
                value={message}
                onChange={(e) => onMessageChange(e.target.value)}
              />
            </div>

            <Button 
              onClick={onSendMessage}
              className="w-full bg-brand-yellow hover:bg-brand-highlight text-black"
              disabled={isLoading}
            >
              <Send className="h-4 w-4 mr-2" />
              Send WhatsApp Message
            </Button>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-full p-6 text-center">
            <MessageSquare className="h-12 w-12 mb-4 text-muted-foreground" />
            <p className="text-lg font-medium">Select a recipient</p>
            <p className="text-sm text-muted-foreground mt-1">
              Choose a team member or creator from the list to start composing a message
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default MessageComposer;
