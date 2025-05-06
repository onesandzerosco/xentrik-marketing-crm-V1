
import React, { useState } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Send } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';

// Form schema
const inviteFormSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
  stageName: z.string().optional()
});

type InviteFormValues = z.infer<typeof inviteFormSchema>;

const InviteCreatorCard = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();
  
  // Initialize form
  const form = useForm<InviteFormValues>({
    resolver: zodResolver(inviteFormSchema),
    defaultValues: {
      email: "",
      stageName: ""
    }
  });

  const onSubmit = async (data: InviteFormValues) => {
    try {
      setIsSubmitting(true);
      
      // Generate a token (this will be done server-side)
      const token = crypto.randomUUID();
      
      // Get the current app URL
      const appUrl = window.location.origin;
      
      // Call the Supabase Edge Function to send the invitation email
      const { error, data: responseData } = await supabase.functions.invoke("send-invite-email", {
        body: {
          email: data.email,
          stageName: data.stageName || undefined,
          token,
          appUrl,
          userId: user?.id // Pass the current user's ID
        },
      });
      
      if (error) throw error;
      
      console.log("Invitation sent:", responseData);
      
      toast({
        title: "Invitation sent",
        description: `An email has been sent to ${data.email}`,
      });
      
      // Reset form
      form.reset();
      
    } catch (error: any) {
      console.error("Error sending invitation:", error);
      toast({
        variant: "destructive",
        title: "Failed to send invitation",
        description: error.message,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Invite Creator</CardTitle>
        <CardDescription>
          Send an invitation to a creator to join the platform
        </CardDescription>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="creator@example.com" {...field} />
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
                  <FormLabel>Stage Name (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="CreatorName" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
          
          <CardFooter>
            <Button 
              type="submit" 
              className="w-full bg-brand-yellow text-black hover:bg-brand-yellow/90"
              disabled={isSubmitting}
            >
              <Send className="mr-2 h-4 w-4" />
              {isSubmitting ? "Sending..." : "Send Invitation"}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
};

export default InviteCreatorCard;
