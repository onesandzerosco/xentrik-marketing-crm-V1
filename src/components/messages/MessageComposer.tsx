
import React from 'react';
import { Send, User, MessageSquare, X } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Recipient } from "@/types/message";

interface MessageComposerProps {
  selectedRecipients: Recipient[];
  message: string;
  onMessageChange: (message: string) => void;
  onSendMessage: () => void;
  onRemoveRecipient: (id: string) => void;
  isLoading: boolean;
}

const MessageComposer: React.FC<MessageComposerProps> = ({
  selectedRecipients,
  message,
  onMessageChange,
  onSendMessage,
  onRemoveRecipient,
  isLoading
}) => {
  return (
    <Card className="md:col-span-2 flex flex-col h-full shadow-md border border-border/40 bg-background">
      <CardHeader className="pb-2 border-b border-border/30">
        <CardTitle className="text-xl flex items-center gap-2">
          <MessageSquare className="h-5 w-5 text-primary" />
          Send WhatsApp Message
        </CardTitle>
        <CardDescription>
          Compose and send WhatsApp messages to multiple recipients via n8n automation
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-grow flex flex-col p-6">
        {selectedRecipients.length > 0 ? (
          <>
            <div className="mb-4">
              <label className="text-sm font-medium mb-1 block">Recipients ({selectedRecipients.length})</label>
              <div className="p-4 bg-background rounded-lg border border-border/60 shadow-sm">
                <ScrollArea className="max-h-32">
                  <div className="flex flex-wrap gap-2">
                    {selectedRecipients.map(recipient => (
                      <div 
                        key={recipient.id} 
                        className="flex items-center gap-2 p-2 bg-secondary/10 rounded-md border border-border/40"
                      >
                        <Avatar className="h-6 w-6">
                          <AvatarImage src={recipient.profileImage || ""} alt={recipient.name} />
                          <AvatarFallback className="bg-secondary text-xs">
                            <User className="h-3 w-3" />
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-sm font-medium">{recipient.name}</span>
                        <Badge variant="outline" className="text-xs px-1">
                          {recipient.type === 'creator' ? 'Creator' : 'Team'}
                        </Badge>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-5 w-5 rounded-full p-0 ml-1 hover:bg-secondary/20"
                          onClick={() => onRemoveRecipient(recipient.id)}
                        >
                          <X className="h-3 w-3" />
                          <span className="sr-only">Remove</span>
                        </Button>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            </div>

            <div className="mb-6 flex-grow">
              <label htmlFor="message" className="text-sm font-medium mb-2 block">
                Message
              </label>
              <Textarea 
                id="message"
                placeholder="Type your WhatsApp message here..."
                className="resize-none h-[calc(100vh-500px)] min-h-[200px] bg-background border border-border/60 focus:border-primary/30 focus:ring-1 focus:ring-primary/20 rounded-lg"
                value={message}
                onChange={(e) => onMessageChange(e.target.value)}
              />
            </div>

            <Button 
              onClick={onSendMessage}
              className="w-full bg-primary hover:bg-primary/90 text-white rounded-lg p-6 h-auto transition-all duration-200 shadow-sm hover:shadow-md"
              disabled={isLoading}
            >
              <Send className="h-5 w-5 mr-2" />
              {isLoading 
                ? "Sending..." 
                : `Send WhatsApp Message to ${selectedRecipients.length} Recipient${selectedRecipients.length > 1 ? 's' : ''}`
              }
            </Button>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-full p-8 text-center">
            <div className="bg-secondary/20 rounded-full p-6 mb-4">
              <MessageSquare className="h-12 w-12 text-muted-foreground" />
            </div>
            <p className="text-lg font-medium">Select recipients</p>
            <p className="text-sm text-muted-foreground mt-2 max-w-md">
              Choose team members or creators from the list to start composing a message
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default MessageComposer;
