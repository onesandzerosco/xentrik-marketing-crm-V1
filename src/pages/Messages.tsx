
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Send, MessageSquare, ArrowLeft, User, Filter } from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import TagFilter from '@/components/TagFilter';
import { useCreators } from '../context/CreatorContext';
import { mockEmployees } from '@/data/mockEmployees';

interface Recipient {
  id: string;
  name: string;
  profileImage?: string;
  role?: string;
  type: 'creator' | 'employee';
}

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
    const allRecipients: Recipient[] = [
      ...creators.map(creator => ({
        id: creator.id,
        name: creator.name,
        profileImage: creator.profileImage,
        role: 'Creator',
        type: 'creator' as const
      })),
      ...mockEmployees.map(employee => ({
        id: employee.id,
        name: employee.name,
        profileImage: employee.profileImage,
        role: employee.role,
        type: 'employee' as const
      }))
    ];
    
    setRecipients(allRecipients);
    
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

  // Filter tags for recipient types
  const recipientTypeTags = ["Team", "Creator"];

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
          <Card className="md:col-span-1 flex flex-col h-full">
            <CardHeader className="pb-2">
              <CardTitle className="text-xl">Recipients</CardTitle>
              <CardDescription>
                Select a team member or creator to send a WhatsApp message
              </CardDescription>
              
              {/* Filter by type */}
              <div className="mt-2 mb-4">
                <div className="flex items-center mb-2">
                  <Filter className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span className="text-sm font-medium">Filter by type</span>
                </div>
                <TagFilter 
                  tags={recipientTypeTags}
                  selectedTags={selectedTags}
                  onChange={setSelectedTags}
                  type="team"
                />
              </div>
              
              {/* Search input */}
              <div className="relative mt-2">
                <Search className="absolute top-2.5 left-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search recipients..."
                  className="pl-9"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </CardHeader>
            <CardContent className="flex-grow overflow-hidden px-2 pb-0">
              <ScrollArea className="h-[calc(100vh-350px)]">
                <div className="space-y-1 px-1 py-2">
                  {filteredRecipients.map((recipient) => (
                    <button
                      key={recipient.id}
                      className={`w-full text-left px-3 py-3 rounded-lg transition-colors flex items-center gap-3 ${
                        selectedRecipientId === recipient.id 
                          ? 'bg-accent text-accent-foreground' 
                          : 'hover:bg-muted'
                      }`}
                      onClick={() => setSelectedRecipientId(recipient.id)}
                    >
                      <div className="relative">
                        <Avatar>
                          <AvatarImage src={recipient.profileImage || ""} alt={recipient.name} />
                          <AvatarFallback>
                            <User className="h-4 w-4" />
                          </AvatarFallback>
                        </Avatar>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-center">
                          <p className="font-medium truncate">{recipient.name}</p>
                        </div>
                        <div className="flex items-center gap-1">
                          <p className="text-sm text-muted-foreground truncate">
                            {recipient.role || "Team Member"}
                          </p>
                          <Badge variant="outline" className="ml-1 text-xs">
                            {recipient.type === 'creator' ? 'Creator' : 'Team'}
                          </Badge>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Message Composer */}
          <Card className="md:col-span-2 flex flex-col h-full">
            <CardHeader className="pb-2">
              <CardTitle className="text-xl">Send WhatsApp Message</CardTitle>
              <CardDescription>
                Compose and send WhatsApp messages via n8n automation
              </CardDescription>
            </CardHeader>
            <Separator className="mb-4" />
            <CardContent className="flex-grow flex flex-col p-6">
              {selectedRecipientId ? (
                <>
                  <div className="mb-4">
                    <label className="text-sm font-medium mb-1 block">Recipient</label>
                    <div className="flex items-center gap-2 p-2 bg-muted rounded-md">
                      {(() => {
                        const recipient = recipients.find(r => r.id === selectedRecipientId);
                        if (!recipient) return null;
                        return (
                          <>
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={recipient.profileImage || ""} alt={recipient.name} />
                              <AvatarFallback>
                                <User className="h-4 w-4" />
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">{recipient.name}</p>
                              <div className="flex items-center gap-1">
                                <p className="text-xs text-muted-foreground">{recipient.role || "Team Member"}</p>
                                <Badge variant="outline" className="text-xs">
                                  {recipient.type === 'creator' ? 'Creator' : 'Team'}
                                </Badge>
                              </div>
                            </div>
                          </>
                        );
                      })()}
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
                      onChange={(e) => setMessage(e.target.value)}
                    />
                  </div>

                  <Button 
                    onClick={handleSendMessage}
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
        </div>

        {/* Webhook Configuration */}
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
                  onChange={(e) => setWebhookUrl(e.target.value)}
                />
              </div>
              <Button onClick={handleSaveWebhook} className="bg-brand-yellow hover:bg-brand-highlight text-black">
                Save Webhook
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Messages;
