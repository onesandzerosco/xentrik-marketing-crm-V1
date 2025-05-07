
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import OnboardingForm from "@/components/onboarding/OnboardingForm";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { CreatorOnboardingFormValues } from "@/components/onboarding/schema/creatorOnboardingSchema";

const CreatorInviteOnboarding: React.FC = () => {
  const { token } = useParams<{token: string}>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isValid, setIsValid] = useState(false);
  const [inviteData, setInviteData] = useState<{email?: string, stageName?: string} | null>(null);

  useEffect(() => {
    const validateToken = async () => {
      if (!token) {
        setIsLoading(false);
        return;
      }

      try {
        // Check if token exists and is not expired
        const { data, error } = await supabase
          .from("creator_invitations")
          .select("email, stage_name, expires_at, status")
          .eq("token", token)
          .single();

        if (error || !data) {
          console.error("Token validation error:", error);
          setIsValid(false);
          toast({
            variant: "destructive",
            title: "Invalid invitation link",
            description: "This invitation link is invalid or has been revoked.",
          });
          return;
        }

        if (data.status !== "pending") {
          setIsValid(false);
          toast({
            variant: "destructive",
            title: "Invitation already used",
            description: "This invitation has already been used or revoked.",
          });
          return;
        }

        if (new Date(data.expires_at) < new Date()) {
          setIsValid(false);
          toast({
            variant: "destructive",
            title: "Invitation expired",
            description: "This invitation link has expired.",
          });
          return;
        }

        setInviteData({
          email: data.email,
          stageName: data.stage_name || undefined
        });
        setIsValid(true);
      } catch (err) {
        console.error("Error validating token:", err);
        setIsValid(false);
        toast({
          variant: "destructive",
          title: "Error",
          description: "An error occurred while validating your invitation.",
        });
      } finally {
        setIsLoading(false);
      }
    };

    validateToken();
  }, [token, toast]);

  const handleSubmit = async (formData: CreatorOnboardingFormValues) => {
    if (!token) return;

    setIsSubmitting(true);
    try {
      // Add email from the invitation to the form data
      const completeData = {
        ...formData,
        email: inviteData?.email || formData.email,
        token
      };

      // Save the form data to the onboard_submissions bucket
      const { error: uploadError } = await supabase
        .storage
        .from("onboard_submissions")
        .upload(`${token}.json`, new Blob([JSON.stringify(completeData)], {
          type: "application/json",
        }));

      if (uploadError) {
        throw uploadError;
      }

      // Update the invitation status to completed and add submission path
      const { error: updateError } = await supabase
        .from("creator_invitations")
        .update({
          status: "completed",
          submission_path: `${token}.json`
        })
        .eq("token", token);

      if (updateError) {
        throw updateError;
      }

      toast({
        title: "Submission successful",
        description: "Your profile has been submitted for review.",
      });

      // Redirect to a thank you page or display a success message
      setTimeout(() => {
        navigate("/");
      }, 2000);

    } catch (error: any) {
      console.error("Submission error:", error);
      toast({
        variant: "destructive",
        title: "Submission failed",
        description: error.message || "An error occurred while submitting your profile.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Loading Invitation...</CardTitle>
          </CardHeader>
          <CardContent className="flex justify-center py-6">
            <Loader2 className="h-8 w-8 animate-spin text-brand-yellow" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!isValid) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Invalid Invitation</CardTitle>
            <CardDescription>
              This invitation link is invalid, expired, or has already been used.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center pt-4">
            <Button onClick={() => navigate("/")}>Return to Homepage</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 p-4">
      <Card className="w-full max-w-4xl">
        <CardHeader>
          <CardTitle className="text-2xl">Complete Your Creator Profile</CardTitle>
          <CardDescription>
            Please provide the following information to complete your profile. This information will be reviewed by our team.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <OnboardingForm onCloseModal={() => {}} />
        </CardContent>
      </Card>
    </div>
  );
};

export default CreatorInviteOnboarding;
