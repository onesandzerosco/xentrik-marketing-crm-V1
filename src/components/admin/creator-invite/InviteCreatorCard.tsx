
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Copy, Send, RotateCcw } from "lucide-react";

interface InviteCreatorCardProps {
  onInviteSent: () => void;
}

const InviteCreatorCard: React.FC<InviteCreatorCardProps> = ({ onInviteSent }) => {
  const [modelName, setModelName] = useState("");
  const [stageName, setStageName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const generateInviteLink = async () => {
    if (!modelName.trim() || !stageName.trim()) {
      toast({
        title: "Missing Information",
        description: "Please provide both model name and stage name",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('creator_invitations')
        .insert({
          model_name: modelName.trim(),
          stage_name: stageName.trim(),
          status: 'pending'
        })
        .select()
        .single();

      if (error) throw error;

      const inviteLink = `${window.location.origin}/creator-onboard-form?token=${data.token}`;
      
      // Copy to clipboard
      await navigator.clipboard.writeText(inviteLink);
      
      toast({
        title: "Invitation Created",
        description: "Invitation link has been copied to clipboard",
      });

      // Reset form
      setModelName("");
      setStageName("");
      
      // Notify parent to refresh the list
      onInviteSent();
      
    } catch (error) {
      console.error('Error creating invitation:', error);
      toast({
        title: "Error",
        description: "Failed to create invitation link",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="bg-card/50 backdrop-blur-sm border-border/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Send className="h-5 w-5" />
          Invite New Creator
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="modelName">Model Name</Label>
          <Input
            id="modelName"
            value={modelName}
            onChange={(e) => setModelName(e.target.value)}
            placeholder="Enter model name"
            disabled={isLoading}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="stageName">Stage Name</Label>
          <Input
            id="stageName"
            value={stageName}
            onChange={(e) => setStageName(e.target.value)}
            placeholder="Enter stage name"
            disabled={isLoading}
          />
        </div>

        <Button 
          onClick={generateInviteLink}
          disabled={isLoading || !modelName.trim() || !stageName.trim()}
          className="w-full"
        >
          {isLoading ? (
            <>
              <RotateCcw className="h-4 w-4 mr-2 animate-spin" />
              Creating Invitation...
            </>
          ) : (
            <>
              <Copy className="h-4 w-4 mr-2" />
              Generate & Copy Invite Link
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
};

export default InviteCreatorCard;
