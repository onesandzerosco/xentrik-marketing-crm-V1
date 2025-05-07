
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Mail, Plus } from "lucide-react";
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
      
      // Initialize onboard_submissions bucket if it doesn't exist
      try {
        console.log("Creating or checking bucket...");
        const bucketResponse = await supabase.functions.invoke("create-onboard-submissions-bucket");
        console.log("Bucket response:", bucketResponse);
      } catch (err) {
        console.warn("Bucket operation warning:", err);
        // Continue anyway as this is just a precautionary step
      }
      
      console.log("Creating invitation record...");
      // Insert invitation record to get a token
      const { data: invitation, error } = await supabase
        .from("creator_invitations")
        .insert({
          email: data.email,
          stage_name: data.stageName || null,
        })
        .select("token")
        .single();
        
      if (error) {
        console.error("Database error:", error);
        throw new Error(`Database error: ${error.message}`);
      }
      
      if (!invitation?.token) {
        console.error("No token generated");
        throw new Error("Failed to generate invitation token");
      }

      console.log("Invitation created with token:", invitation.token);
      
      // Send invitation email
      const appUrl = window.location.origin;
      console.log("Sending email with appUrl:", appUrl);
      
      // Detailed logging for troubleshooting
      console.log("Sending to email function with payload:", {
        email: data.email,
        stageName: data.stageName,
        token: invitation.token,
        appUrl,
      });
      
      const emailResponse = await supabase.functions.invoke("send-invite-email", {
        body: {
          email: data.email,
          stageName: data.stageName || undefined,
          token: invitation.token,
          appUrl,
        },
      });
      
      console.log("Email function complete response:", emailResponse);
      
      if (emailResponse.error) {
        console.error("Edge function error:", emailResponse.error);
        
        // Remove the invitation if email sending fails
        await supabase
          .from("creator_invitations")
          .delete()
          .eq("token", invitation.token);
          
        throw new Error(`Failed to send email: ${emailResponse.error.message || "Edge function error"}`);
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
              <Plus className="mr-2 h-4 w-4" />
              Invite Creator
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default InviteCreatorCard;
