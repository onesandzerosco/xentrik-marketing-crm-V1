
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { UserPlus, Copy, ExternalLink } from "lucide-react";

const InviteCreatorCard: React.FC = () => {
  const [modelName, setModelName] = useState("");
  const [stageName, setStageName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [generatedLink, setGeneratedLink] = useState("");
  const { toast } = useToast();

  const generateInviteLink = async () => {
    if (!modelName.trim() || !stageName.trim()) {
      toast({
        title: "Missing Information",
        description: "Please provide both model name and stage name",
        variant: "destructive",
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

      const inviteUrl = `${window.location.origin}/creator-onboarding/${data.token}`;
      setGeneratedLink(inviteUrl);
      
      toast({
        title: "Invite Link Generated",
        description: "Creator onboarding link has been created successfully",
      });

      // Reset form
      setModelName("");
      setStageName("");
    } catch (error: any) {
      console.error('Error generating invite link:', error);
      toast({
        title: "Error",
        description: "Failed to generate invite link. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(generatedLink);
      toast({
        title: "Copied!",
        description: "Invite link copied to clipboard",
      });
    } catch (error) {
      toast({
        title: "Copy Failed",
        description: "Failed to copy link to clipboard",
        variant: "destructive",
      });
    }
  };

  const openLink = () => {
    window.open(generatedLink, '_blank');
  };

  return (
    <Card className="w-full h-fit">
      <CardHeader className="pb-4 sm:pb-6">
        <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
          <UserPlus className="h-4 w-4 sm:h-5 sm:w-5" />
          Create Invite Link
        </CardTitle>
        <CardDescription className="text-sm sm:text-base">
          Generate onboarding links for new creators
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 sm:space-y-6">
        <div className="space-y-4 sm:space-y-4">
          <div className="space-y-2">
            <Label htmlFor="modelName" className="text-sm sm:text-base">Model Name</Label>
            <Input
              id="modelName"
              value={modelName}
              onChange={(e) => setModelName(e.target.value)}
              placeholder="Enter model name"
              disabled={isLoading}
              className="text-sm sm:text-base h-10 sm:h-11"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="stageName" className="text-sm sm:text-base">Stage Name</Label>
            <Input
              id="stageName"
              value={stageName}
              onChange={(e) => setStageName(e.target.value)}
              placeholder="Enter stage name"
              disabled={isLoading}
              className="text-sm sm:text-base h-10 sm:h-11"
            />
          </div>
        </div>
        
        <Button 
          onClick={generateInviteLink}
          disabled={isLoading}
          className="w-full bg-brand-yellow text-black hover:bg-brand-yellow/90 h-10 sm:h-11 text-sm sm:text-base"
        >
          {isLoading ? "Generating..." : "Generate Invite Link"}
        </Button>
        
        {generatedLink && (
          <div className="space-y-3 sm:space-y-4 p-3 sm:p-4 bg-muted rounded-lg">
            <Label className="text-sm sm:text-base font-medium">Generated Link:</Label>
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
              <Input
                value={generatedLink}
                readOnly
                className="flex-1 text-xs sm:text-sm bg-background h-9 sm:h-10"
              />
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={copyToClipboard}
                  className="flex-1 sm:flex-none h-9 sm:h-10 text-xs sm:text-sm"
                >
                  <Copy className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                  Copy
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={openLink}
                  className="flex-1 sm:flex-none h-9 sm:h-10 text-xs sm:text-sm"
                >
                  <ExternalLink className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                  Open
                </Button>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default InviteCreatorCard;
