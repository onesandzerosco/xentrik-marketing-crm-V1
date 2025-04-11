
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, MessageSquare } from 'lucide-react';
import { Button } from "@/components/ui/button";

const MessageHeader: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="flex items-center gap-3 mb-8 animate-fade-in">
      <Button 
        variant="ghost" 
        size="icon" 
        className="rounded-full hover:bg-secondary/20"
        onClick={() => navigate(-1)}
      >
        <ArrowLeft className="h-5 w-5" />
        <span className="sr-only">Go back</span>
      </Button>
      <h1 className="text-3xl font-bold flex items-center gap-3">
        <MessageSquare className="h-7 w-7 text-primary" />
        WhatsApp Messages
      </h1>
    </div>
  );
};

export default MessageHeader;
