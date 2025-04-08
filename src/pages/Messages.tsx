
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Send, Users, Banana, User, ArrowLeft } from 'lucide-react';
import { format } from 'date-fns';
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { Separator } from "@/components/ui/separator";
import { mockEmployees } from '@/data/mockEmployees';

interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  timestamp: Date;
  isRead: boolean;
}

interface Conversation {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  lastMessage: string;
  lastMessageTime: Date;
  unreadCount: number;
}

const Messages: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("team");
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [telegramMessage, setTelegramMessage] = useState("");
  const [telegramWebhookUrl, setTelegramWebhookUrl] = useState("");
  const [isConfigured, setIsConfigured] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const mockConversations = mockEmployees.map(employee => ({
      id: employee.id,
      userId: employee.id,
      userName: employee.name,
      userAvatar: employee.profileImage || "",
      lastMessage: "Hey there! Let's collaborate on the next campaign.",
      lastMessageTime: new Date(Date.now() - Math.random() * 86400000 * 7),
      unreadCount: Math.floor(Math.random() * 3)
    }));

    setConversations(mockConversations);

    if (mockConversations.length > 0) {
      setSelectedConversation(mockConversations[0].id);
      loadMessages(mockConversations[0].id);
    }

    const savedWebhook = localStorage.getItem("telegramWebhookUrl");
    if (savedWebhook) {
      setTelegramWebhookUrl(savedWebhook);
      setIsConfigured(true);
    }
  }, []);

  const loadMessages = (conversationId: string) => {
    const mockMessages: Message[] = [];
    const conversation = conversations.find(c => c.id === conversationId);
    
    if (!conversation) return;
    
    const timeBase = new Date();
    const messagesCount = 5 + Math.floor(Math.random() * 10);
    
    for (let i = 0; i < messagesCount; i++) {
      const isFromUser = Math.random() > 0.5;
      timeBase.setMinutes(timeBase.getMinutes() - Math.floor(Math.random() * 60));
      
      mockMessages.push({
        id: `msg-${i}-${conversationId}`,
        senderId: isFromUser ? "current-user" : conversation.userId,
        receiverId: isFromUser ? conversation.userId : "current-user",
        content: isFromUser 
          ? `This is a message to ${conversation.userName}. Let's collaborate on our next campaign!` 
          : `Hi! I'd love to discuss our marketing strategy for the upcoming launch.`,
        timestamp: new Date(timeBase),
        isRead: true
      });
    }
    
    mockMessages.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
    setMessages(mockMessages);
  };

  const handleSelectConversation = (conversationId: string) => {
    setSelectedConversation(conversationId);
    loadMessages(conversationId);
    
    setConversations(prev => 
      prev.map(conv => 
        conv.id === conversationId 
          ? { ...conv, unreadCount: 0 } 
          : conv
      )
    );
  };

  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedConversation) return;
    
    const conversation = conversations.find(c => c.id === selectedConversation);
    if (!conversation) return;
    
    const newMessageObj: Message = {
      id: `msg-${Date.now()}`,
      senderId: "current-user",
      receiverId: conversation.userId,
      content: newMessage,
      timestamp: new Date(),
      isRead: false
    };
    
    setMessages(prev => [...prev, newMessageObj]);
    
    setConversations(prev => 
      prev.map(conv => 
        conv.id === selectedConversation 
          ? { 
              ...conv, 
              lastMessage: newMessage,
              lastMessageTime: new Date()
            } 
          : conv
      )
    );
    
    setNewMessage("");
    
    toast({
      title: "Message sent",
      description: "Your message has been sent successfully"
    });
  };

  const handleSendTelegramMessage = () => {
    if (!telegramMessage.trim() || !telegramWebhookUrl) return;
    
    toast({
      title: "Sending message to Telegram...",
    });
    
    setTimeout(() => {
      setTelegramMessage("");
      
      toast({
        title: "Message sent to Telegram",
        description: "Your message has been broadcast to the Telegram group"
      });
    }, 1000);
  };

  const handleConfigureTelegram = () => {
    if (!telegramWebhookUrl.trim()) {
      toast({
        title: "Error",
        description: "Please enter a valid Telegram Webhook URL",
        variant: "destructive"
      });
      return;
    }
    
    localStorage.setItem("telegramWebhookUrl", telegramWebhookUrl);
    setIsConfigured(true);
    
    toast({
      title: "Telegram Configured",
      description: "Your Telegram webhook has been saved"
    });
  };

  const filteredConversations = conversations.filter(conv => 
    conv.userName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const messagesEndRef = React.useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <div className="flex min-h-screen bg-background">
      <div className="flex-1 flex flex-col p-6 pl-72 max-w-[1400px] mx-auto w-full">
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
            <MessageIcon className="mr-3 text-brand-yellow" />
            Messages
          </h1>
        </div>

        <Tabs 
          defaultValue="team" 
          value={activeTab} 
          onValueChange={setActiveTab}
          className="w-full"
        >
          <TabsList className="mb-6">
            <TabsTrigger value="team" className="flex items-center gap-2">
              <Users size={16} />
              <span>Team Chat</span>
            </TabsTrigger>
            <TabsTrigger value="telegram" className="flex items-center gap-2">
              <Banana size={16} />
              <span>Telegram Broadcast</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="team" className="w-full animate-slide-up">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-[calc(100vh-220px)]">
              <Card className="md:col-span-1 flex flex-col">
                <CardHeader className="pb-2">
                  <CardTitle className="text-xl">Conversations</CardTitle>
                  <div className="relative mt-2">
                    <Search className="absolute top-2.5 left-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search team members..."
                      className="pl-9"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </CardHeader>
                <CardContent className="flex-grow overflow-hidden px-2 pb-0">
                  <ScrollArea className="h-[calc(100vh-330px)]">
                    <div className="space-y-1 px-1 py-2">
                      {filteredConversations.map((conversation) => (
                        <button
                          key={conversation.id}
                          className={`w-full text-left px-3 py-3 rounded-lg transition-colors flex items-center gap-3 ${
                            selectedConversation === conversation.id 
                              ? 'bg-accent text-accent-foreground' 
                              : 'hover:bg-muted'
                          }`}
                          onClick={() => handleSelectConversation(conversation.id)}
                        >
                          <div className="relative">
                            <Avatar>
                              <AvatarImage src={conversation.userAvatar || ""} alt={conversation.userName} />
                              <AvatarFallback>
                                <User className="h-4 w-4" />
                              </AvatarFallback>
                            </Avatar>
                            {conversation.unreadCount > 0 && (
                              <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-brand-yellow text-[10px] font-medium text-black">
                                {conversation.unreadCount}
                              </span>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-center">
                              <p className="font-medium truncate">{conversation.userName}</p>
                              <p className="text-xs text-muted-foreground">
                                {format(conversation.lastMessageTime, 'h:mm a')}
                              </p>
                            </div>
                            <p className="text-sm text-muted-foreground truncate max-w-[180px]">
                              {conversation.lastMessage}
                            </p>
                          </div>
                        </button>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>

              <Card className="md:col-span-2 flex flex-col">
                {selectedConversation ? (
                  <>
                    <CardHeader className="pb-2 flex flex-row items-center justify-between">
                      {(() => {
                        const conversation = conversations.find(c => c.id === selectedConversation);
                        if (!conversation) return null;
                        return (
                          <div className="flex items-center gap-3">
                            <Avatar>
                              <AvatarImage src={conversation.userAvatar || ""} alt={conversation.userName} />
                              <AvatarFallback>
                                <User className="h-4 w-4" />
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <CardTitle className="text-xl">{conversation.userName}</CardTitle>
                              <CardDescription>
                                Active now
                              </CardDescription>
                            </div>
                          </div>
                        );
                      })()}
                    </CardHeader>
                    <Separator className="mb-4" />
                    <CardContent className="flex-grow overflow-hidden p-0">
                      <ScrollArea className="h-[calc(100vh-380px)] px-6">
                        <div className="space-y-4 py-4">
                          {messages.map((message) => {
                            const isOutgoing = message.senderId === "current-user";
                            return (
                              <div 
                                key={message.id} 
                                className={`flex ${isOutgoing ? 'justify-end' : 'justify-start'}`}
                              >
                                <div 
                                  className={`max-w-[75%] rounded-lg px-4 py-2 ${
                                    isOutgoing 
                                      ? 'bg-brand-yellow text-black' 
                                      : 'bg-accent text-accent-foreground'
                                  }`}
                                >
                                  <p>{message.content}</p>
                                  <p className="text-[10px] mt-1 opacity-70 text-right">
                                    {format(message.timestamp, 'h:mm a')}
                                  </p>
                                </div>
                              </div>
                            );
                          })}
                          <div ref={messagesEndRef} />
                        </div>
                      </ScrollArea>
                    </CardContent>
                    <CardFooter className="border-t p-4">
                      <div className="flex items-center w-full gap-2">
                        <Input
                          placeholder="Type your message..."
                          value={newMessage}
                          onChange={(e) => setNewMessage(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              handleSendMessage();
                            }
                          }}
                          className="flex-1"
                        />
                        <Button 
                          onClick={handleSendMessage}
                          className="bg-brand-yellow hover:bg-brand-highlight text-black"
                          size="icon"
                        >
                          <Send className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardFooter>
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full p-6 text-center">
                    <MessageIcon className="h-12 w-12 mb-4 text-muted-foreground" />
                    <p className="text-lg font-medium">Select a conversation</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Choose a team member from the list to start chatting
                    </p>
                  </div>
                )}
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="telegram" className="w-full animate-slide-up">
            <Card className="w-full max-w-3xl mx-auto">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Banana className="h-6 w-6 text-brand-yellow" />
                  <CardTitle>Telegram Group Broadcast</CardTitle>
                </div>
                <CardDescription>
                  Send messages to your entire team through the Telegram group
                </CardDescription>
              </CardHeader>
              <CardContent>
                {!isConfigured ? (
                  <div className="space-y-4">
                    <div className="banana-banner flex items-start gap-4 p-4 bg-brand-yellow/10 rounded-lg border border-brand-yellow/30">
                      <Banana className="h-5 w-5 mt-0.5 text-brand-yellow" />
                      <div>
                        <h4 className="font-medium text-brand-yellow">Configure Telegram Integration</h4>
                        <p className="text-sm text-muted-foreground mt-1">
                          Enter your Telegram Bot Webhook URL to start broadcasting messages
                        </p>
                      </div>
                    </div>
                    <div className="grid gap-2">
                      <label htmlFor="webhook" className="text-sm font-medium">
                        Telegram Webhook URL
                      </label>
                      <Input
                        id="webhook"
                        placeholder="https://api.telegram.org/bot..."
                        value={telegramWebhookUrl}
                        onChange={(e) => setTelegramWebhookUrl(e.target.value)}
                      />
                      <p className="text-xs text-muted-foreground">
                        Create a Telegram bot and get your webhook URL from BotFather
                      </p>
                    </div>
                    <Button 
                      onClick={handleConfigureTelegram}
                      className="bg-brand-yellow hover:bg-brand-highlight text-black w-full"
                    >
                      Configure Telegram
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="banana-banner flex items-start gap-4 p-4 bg-brand-yellow/10 rounded-lg border border-brand-yellow/30">
                      <Banana className="h-5 w-5 mt-0.5 text-brand-yellow" />
                      <div>
                        <h4 className="font-medium text-brand-yellow">Telegram Connected</h4>
                        <p className="text-sm text-muted-foreground mt-1">
                          Your messages will be sent to the connected Telegram group
                        </p>
                      </div>
                    </div>
                    <div className="grid gap-4">
                      <div className="p-4 bg-muted rounded-lg">
                        <label className="text-sm font-medium block mb-2">
                          Broadcast Message
                        </label>
                        <textarea
                          className="w-full h-32 bg-background border rounded-md p-3 text-foreground resize-none"
                          placeholder="Write your announcement here..."
                          value={telegramMessage}
                          onChange={(e) => setTelegramMessage(e.target.value)}
                        />
                      </div>
                      <Button 
                        onClick={handleSendTelegramMessage}
                        className="bg-brand-yellow hover:bg-brand-highlight text-black"
                      >
                        <Send className="h-4 w-4 mr-2" />
                        Send to Telegram Group
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

const MessageIcon = ({ className }: { className?: string }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 24 24" 
    fill="none"
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
    width="24"
    height="24"
  >
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    <path d="M8 9h.01" />
    <path d="M12 9h.01" />
    <path d="M16 9h.01" />
  </svg>
);

export default Messages;
