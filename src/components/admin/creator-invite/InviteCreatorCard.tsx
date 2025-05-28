
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link, Copy, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const InviteCreatorCard: React.FC = () => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [generatedLink, setGeneratedLink] = useState<string>("");
  const [copied, setCopied] = useState(false);

  const generateInviteLink = async () => {
    try {
      setIsLoading(true);
      
      // Initialize onboard_submissions bucket if it doesn't exist
      try {
        await supabase.functions.invoke("create-onboard-submissions-bucket");
      } catch (err) {
        console.warn("Bucket may already exist:", err);
        // Continue anyway as this is just a precautionary step
      }
      
      // Insert invitation record to get a token
      const { data: invitation, error } = await supabase
        .from("creator_invitations")
        .insert({
          email: null, // No email required anymore
          stage_name: null,
        })
        .select("token")
        .single();
        
      if (error) {
        throw error;
      }
      
      if (!invitation?.token) {
        throw new Error("Failed to generate invitation token");
      }

      // Generate the link
      const appUrl = window.location.origin;
      const inviteLink = `${appUrl}/onboard/${invitation.token}`;
      setGeneratedLink(inviteLink);

      toast({
        title: "Invitation link generated",
        description: "You can now copy and share this link with the creator.",
      });
      
    } catch (error: any) {
      console.error("Error generating invitation link:", error);
      toast({
        variant: "destructive",
        title: "Failed to generate invitation link",
        description: error.message || "An unexpected error occurred",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(generatedLink);
      setCopied(true);
      toast({
        title: "Link copied",
        description: "The invitation link has been copied to your clipboard.",
      });
      
      // Reset copied state after 2 seconds
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Failed to copy",
        description: "Could not copy the link to clipboard.",
      });
    }
  };

  const generateNewLink = () => {
    setGeneratedLink("");
    setCopied(false);
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div>
          <CardTitle>Generate Invite Link</CardTitle>
          <CardDescription>
            Create a unique link for creator onboarding
          </CardDescription>
        </div>
        <Link className="h-5 w-5 text-muted-foreground" />
      </CardHeader>
      <CardContent className="space-y-4">
        {!generatedLink ? (
          <Button 
            onClick={generateInviteLink}
            className="w-full" 
            disabled={isLoading}
            variant="premium"
          >
            <Link className="mr-2 h-4 w-4" />
            {isLoading ? "Generating..." : "Generate Invite Link"}
          </Button>
        ) : (
          <div className="space-y-3">
            <Label>Generated Invitation Link:</Label>
            <div className="flex gap-2">
              <Input 
                value={generatedLink}
                readOnly
                className="font-mono text-xs"
              />
              <Button 
                onClick={copyToClipboard}
                variant="outline"
                size="icon"
                className="shrink-0"
              >
                {copied ? (
                  <Check className="h-4 w-4 text-green-500" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
            <Button 
              onClick={generateNewLink}
              variant="outline"
              className="w-full"
            >
              Generate New Link
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default InviteCreatorCard;
