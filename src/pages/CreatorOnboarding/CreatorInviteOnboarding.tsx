
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { creatorOnboardingSchema } from "@/components/onboarding/schema/creatorOnboardingSchema";
import { 
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

// Creator onboarding form component
const CreatorInviteOnboarding = () => {
  const { token } = useParams<{ token: string }>();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [inviteData, setInviteData] = useState<any>(null);
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 4;

  // Initialize form
  const form = useForm({
    resolver: zodResolver(creatorOnboardingSchema),
    defaultValues: {
      name: "",
      gender: "Female",
      email: "",
      bio: "",
      telegramUsername: "",
      whatsappNumber: "",
      instagram: "",
      tiktok: "",
      twitter: "",
      reddit: "",
      youtube: "",
      customSocialLinks: [],
      termsAccepted: false
    }
  });

  // Check if token is valid
  useEffect(() => {
    const validateToken = async () => {
      if (!token) {
        toast({
          variant: "destructive",
          title: "Invalid invitation",
          description: "No invitation token provided"
        });
        navigate("/");
        return;
      }
      
      try {
        // Check if token exists and is not expired
        const { data, error } = await supabase
          .from("creator_invitations")
          .select("*")
          .eq("token", token)
          .gte("expires_at", new Date().toISOString())
          .eq("status", "pending")
          .single();
          
        if (error || !data) {
          throw new Error("Invitation not found or expired");
        }
        
        setInviteData(data);
        
        // Pre-fill email and name if available
        form.setValue("email", data.email);
        if (data.stage_name) {
          form.setValue("name", data.stage_name);
        }
        
      } catch (error: any) {
        toast({
          variant: "destructive",
          title: "Invalid invitation",
          description: error.message || "This invitation link is invalid or has expired"
        });
        navigate("/");
      } finally {
        setIsLoading(false);
      }
    };
    
    validateToken();
  }, [token, navigate, toast, form]);

  // Handle form submission
  const handleSubmit = async (data: any) => {
    if (!token) return;
    
    setIsSubmitting(true);
    
    try {
      // Upload form data to Supabase storage
      const { error } = await supabase.storage
        .from("onboard_submissions")
        .upload(`${token}.json`, new Blob([JSON.stringify(data)], { type: "application/json" }));
        
      if (error) {
        throw error;
      }
      
      // Update invitation status
      await supabase
        .from("creator_invitations")
        .update({ status: "completed" })
        .eq("token", token);
      
      toast({
        title: "Onboarding Complete",
        description: "Your profile has been submitted successfully! The team will review your submission."
      });
      
      // Redirect to thank you page or home
      navigate("/onboarding-success");
      
    } catch (error: any) {
      console.error("Submission error:", error);
      toast({
        variant: "destructive",
        title: "Submission Failed",
        description: error.message || "There was an error submitting your profile. Please try again."
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle step navigation
  const nextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-lg">Validating your invitation...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-3xl">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Complete Your Creator Profile</CardTitle>
          <CardDescription>
            Fill out the form below to complete your onboarding process
          </CardDescription>
          <div className="w-full bg-muted h-2 mt-4 rounded-full overflow-hidden">
            <div
              className="bg-primary h-full transition-all duration-300"
              style={{ width: `${(currentStep / totalSteps) * 100}%` }}
            />
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            Step {currentStep} of {totalSteps}
          </p>
        </CardHeader>
        
        <CardContent>
          <form id="onboardingForm" onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            {/* Step content will go here - we will implement this in the next step */}
            {currentStep === 1 && (
              <div className="space-y-4">
                <h2 className="text-xl font-semibold">Basic Information</h2>
                <p className="text-sm text-muted-foreground mb-4">
                  Let's start with some basic details about you
                </p>
                {/* Basic info fields will go here */}
                <p className="text-sm text-muted-foreground">
                  We'll implement the complete form fields in the next update.
                </p>
              </div>
            )}
            
            {currentStep === 2 && (
              <div className="space-y-4">
                <h2 className="text-xl font-semibold">Contact Information</h2>
                <p className="text-sm text-muted-foreground mb-4">
                  How can we reach you?
                </p>
                {/* Contact fields will go here */}
              </div>
            )}
            
            {currentStep === 3 && (
              <div className="space-y-4">
                <h2 className="text-xl font-semibold">Social Media</h2>
                <p className="text-sm text-muted-foreground mb-4">
                  Share your social media profiles
                </p>
                {/* Social media fields will go here */}
              </div>
            )}
            
            {currentStep === 4 && (
              <div className="space-y-4">
                <h2 className="text-xl font-semibold">Final Details</h2>
                <p className="text-sm text-muted-foreground mb-4">
                  Almost done! Just a few more details
                </p>
                {/* Final fields will go here */}
              </div>
            )}
          </form>
        </CardContent>
        
        <CardFooter className="flex justify-between">
          {currentStep > 1 ? (
            <Button variant="outline" onClick={prevStep}>
              Previous
            </Button>
          ) : (
            <div></div>
          )}
          
          {currentStep < totalSteps ? (
            <Button onClick={nextStep}>
              Next
            </Button>
          ) : (
            <Button 
              type="submit" 
              form="onboardingForm"
              disabled={isSubmitting}
              className="bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                "Submit Application"
              )}
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
};

export default CreatorInviteOnboarding;
