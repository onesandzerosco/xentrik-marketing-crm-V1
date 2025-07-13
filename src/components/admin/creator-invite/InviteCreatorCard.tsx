
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link, Copy, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { generateInvitationToken } from "@/utils/onboardingUtils";

// Validation schema
const inviteSchema = z.object({
  modelName: z.string().min(1, "Model name is required"),
});

type InviteFormValues = z.infer<typeof inviteSchema>;

const InviteCreatorCard: React.FC = () => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [generatedLink, setGeneratedLink] = useState<string>("");
  const [copied, setCopied] = useState(false);
  
  const form = useForm<InviteFormValues>({
    resolver: zodResolver(inviteSchema),
    defaultValues: {
      modelName: "",
    },
  });

  const handleGenerateLink = async (data: InviteFormValues) => {
    try {
      setIsLoading(true);
      console.log("Generating link for model:", data.modelName);
      
      // Generate invitation token with model name
      const result = await generateInvitationToken(data.modelName);
        
      if (!result.success || !result.token) {
        throw new Error(result.error || "Failed to generate invitation token");
      }

      console.log("Received token from generation:", result.token);

      // Generate the onboarding link
      const appUrl = window.location.origin;
      const onboardingLink = `${appUrl}/onboarding-form/${result.token}`;
      
      console.log("Generated onboarding link:", onboardingLink);
      setGeneratedLink(onboardingLink);

      toast({
        title: "Onboarding link generated",
        description: `Copy the link and share it with ${data.modelName}`,
      });
      
      form.reset();
    } catch (error: any) {
      console.error("Error generating link:", error);
      toast({
        variant: "destructive",
        title: "Failed to generate link",
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
        description: "The onboarding link has been copied to your clipboard",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Failed to copy",
        description: "Could not copy the link to clipboard",
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
          <CardTitle>Generate Creator Onboarding Link</CardTitle>
          <CardDescription>
            Create a unique onboarding link for new creators (expires in 72 hours)
          </CardDescription>
        </div>
        <Link className="h-5 w-5 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        {!generatedLink ? (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleGenerateLink)} className="space-y-4">
              <FormField
                control={form.control}
                name="modelName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Model Name *</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Enter the model's name" 
                        {...field} 
                        disabled={isLoading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button 
                type="submit" 
                className="w-full" 
                disabled={isLoading}
              >
                <Link className="mr-2 h-4 w-4" />
                Generate Onboarding Link
              </Button>
            </form>
          </Form>
        ) : (
          <div className="space-y-4">
            <div>
              <Label>Generated Onboarding Link</Label>
              <div className="flex gap-2 mt-2">
                <Input 
                  value={generatedLink} 
                  readOnly 
                  className="flex-1"
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={copyToClipboard}
                  disabled={copied}
                >
                  {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
            </div>
            
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={generateNewLink}
                className="flex-1"
              >
                Generate New Link
              </Button>
              <Button
                onClick={copyToClipboard}
                disabled={copied}
                className="flex-1"
              >
                {copied ? "Copied!" : "Copy Link"}
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default InviteCreatorCard;
