
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
    <Card className="md:col-span-2 flex flex-col h-full shadow-premium-md border-premium-border animate-fade-in">
      <CardHeader className="pb-2 border-b border-premium-border">
        <CardTitle className="text-xl flex items-center gap-2">
          <MessageSquare className="h-5 w-5 text-muted-foreground" />
          Send WhatsApp Message
        </CardTitle>
        <CardDescription>
          Compose and send WhatsApp messages via n8n automation
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-grow flex flex-col p-6">
        {selectedRecipient ? (
          <>
            <div className="mb-4">
              <label className="text-sm font-medium mb-1 block">Recipient</label>
              <div className="flex items-center gap-3 p-4 bg-premium-darker rounded-[15px] border border-premium-border shadow-premium-inner">
                <Avatar className="h-12 w-12 border-2 border-premium-border shadow-premium-sm">
                  <AvatarImage src={selectedRecipient.profileImage || ""} alt={selectedRecipient.name} />
                  <AvatarFallback className="bg-secondary">
                    <User className="h-5 w-5" />
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium text-base">{selectedRecipient.name}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <p className="text-xs text-muted-foreground">{selectedRecipient.role || "Team Member"}</p>
                    <Badge variant={selectedRecipient.type === 'creator' ? 'default' : 'secondary'} className="text-xs">
                      {selectedRecipient.type === 'creator' ? 'Creator' : 'Team'}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>

            <div className="mb-6 flex-grow">
              <label htmlFor="message" className="text-sm font-medium mb-2 block">
                Message
              </label>
              <Textarea 
                id="message"
                placeholder="Type your WhatsApp message here..."
                className="resize-none h-[calc(100vh-450px)] min-h-[200px] bg-premium-darker border-premium-border focus:border-premium-accent1 focus:ring-1 focus:ring-premium-accent1/50 rounded-[15px] shadow-premium-inner"
                value={message}
                onChange={(e) => onMessageChange(e.target.value)}
              />
            </div>

            <Button 
              onClick={onSendMessage}
              className="w-full bg-secondary hover:bg-secondary/90 text-white rounded-[15px] transform hover:-translate-y-1 transition-all duration-300 shadow-premium-sm hover:shadow-premium-md p-6 h-auto"
              disabled={isLoading}
            >
              <Send className="h-5 w-5 mr-2" />
              {isLoading ? "Sending..." : "Send WhatsApp Message"}
            </Button>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-full p-8 text-center">
            <div className="bg-secondary/20 rounded-full p-6 mb-4">
              <MessageSquare className="h-12 w-12 text-muted-foreground" />
            </div>
            <p className="text-lg font-medium">Select a recipient</p>
            <p className="text-sm text-muted-foreground mt-2 max-w-md">
              Choose a team member or creator from the list to start composing a message
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default MessageComposer;
