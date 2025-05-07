
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Mail, Plus, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

// Validation schema
const inviteSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  stageName: z.string().optional(),
});

type InviteFormValues = z.infer<typeof inviteSchema>;

const InviteCreatorCard: React.FC = () => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  
  const form = useForm<InviteFormValues>({
    resolver: zodResolver(inviteSchema),
    defaultValues: {
      email: "",
      stageName: "",
    },
  });

  const handleInviteCreator = async (data: InviteFormValues) => {
    try {
      setIsLoading(true);
      
      // First, try to create the onboard_submissions bucket if needed
      try {
        await supabase.functions.invoke("create-onboard-submissions-bucket");
      } catch (err) {
        console.warn("Bucket operation warning:", err);
        // Continue anyway as this is just a precautionary step
      }
      
      // Generate a token directly - no DB record until onboarding is completed
      const token = crypto.randomUUID();
      
      // Send invitation email with token
      const appUrl = window.location.origin;
      
      // Call the edge function to send the email
      const { data: emailData, error: emailError } = await supabase.functions.invoke("send-invite-email", {
        body: {
          email: data.email,
          stageName: data.stageName || undefined,
          token,
          appUrl,
        },
      });
      
      if (emailError) {
        throw new Error(`Email sending failed: ${emailError.message}`);
      }
      
      if (!emailData?.success) {
        throw new Error("Failed to send invitation email");
      }
      
      // Only save invitation record if email was sent successfully
      const { error } = await supabase
        .from("creator_invitations")
        .insert({
          email: data.email,
          stage_name: data.stageName || null,
          token,
          expires_at: new Date(Date.now() + 72 * 60 * 60 * 1000).toISOString(), // 72 hours from now
          status: "pending"
        });
        
      if (error) {
        console.error("Database error:", error);
        throw new Error(`Failed to save invitation: ${error.message}`);
      }
      
      toast({
        title: "Invitation sent",
        description: `An invitation has been sent to ${data.email}`,
      });
      
      form.reset();
      
    } catch (error: any) {
      console.error("Error sending invitation:", error);
      toast({
        variant: "destructive",
        title: "Failed to send invitation",
        description: error.message || "An unexpected error occurred",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div>
          <CardTitle>Invite Creator</CardTitle>
          <CardDescription>
            Send invitation to a new creator
          </CardDescription>
        </div>
        <Mail className="h-5 w-5 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleInviteCreator)} className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email address <span className="text-red-500">*</span></FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="creator@example.com" 
                      {...field} 
                      disabled={isLoading}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="stageName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Stage Name (optional)</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Creator's stage name" 
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
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending Invitation...
                </>
              ) : (
                <>
                  <Plus className="mr-2 h-4 w-4" />
                  Invite Creator
                </>
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default InviteCreatorCard;
