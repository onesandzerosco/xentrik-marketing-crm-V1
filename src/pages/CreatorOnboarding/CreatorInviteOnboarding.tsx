
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import OnboardingForm from '@/components/onboarding/OnboardingForm';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { AlertCircle, Clock, CheckCircle } from 'lucide-react';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';

const CreatorInviteOnboarding: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const [loading, setLoading] = useState(true);
  const [invitation, setInvitation] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchInvitation = async () => {
      try {
        if (!token) {
          throw new Error("Invalid invitation token");
        }

        const { data, error } = await supabase
          .from('creator_invitations')
          .select('*')
          .eq('token', token)
          .single();

        if (error) throw error;

        if (!data) {
          throw new Error("Invitation not found");
        }

        // Check if invitation is expired
        const expiryDate = new Date(data.expires_at);
        if (expiryDate < new Date()) {
          throw new Error("This invitation has expired");
        }

        // Check if already completed
        if (data.status === 'completed') {
          throw new Error("This invitation has already been used");
        }

        setInvitation(data);
      } catch (err: any) {
        console.error("Error fetching invitation:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchInvitation();
  }, [token]);

  const handleFormSubmit = async (formData: any) => {
    try {
      setSubmitting(true);

      // Upload form data to Supabase storage
      const submissionData = {
        ...formData,
        invitationId: invitation.id,
        email: invitation.email,
        stageName: invitation.stage_name,
        submittedAt: new Date().toISOString(),
        role: 'Employee', // Setting primary role as Employee
        roles: ['Creator'] // Setting additional role as Creator
      };

      // Convert data to JSON
      const jsonData = JSON.stringify(submissionData, null, 2);
      const fileName = `${token}.json`;
      
      // Ensure the storage bucket exists
      await supabase.functions.invoke("create-onboard-submissions-bucket", {});
      
      // Upload the JSON to storage
      const { error: uploadError } = await supabase.storage
        .from('onboard_submissions')
        .upload(fileName, jsonData, {
          contentType: 'application/json',
          cacheControl: '3600'
        });

      if (uploadError) throw uploadError;

      // Update invitation status
      const { error: updateError } = await supabase
        .from('creator_invitations')
        .update({ 
          status: 'completed',
          completed_at: new Date().toISOString(),
          submission_path: fileName
        })
        .eq('id', invitation.id);

      if (updateError) throw updateError;

      toast({
        title: "Submission successful",
        description: "Your profile has been submitted for review",
      });

      setSubmitted(true);

      // Redirect to success page after a short delay
      setTimeout(() => {
        navigate('/');
      }, 5000);

    } catch (err: any) {
      console.error("Error submitting form:", err);
      toast({
        variant: "destructive",
        title: "Submission failed",
        description: err.message,
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="container max-w-4xl mx-auto p-6">
        <Card>
          <CardContent className="p-12">
            <div className="flex justify-center">
              <Clock className="h-12 w-12 text-muted-foreground animate-pulse" />
            </div>
            <p className="text-center mt-4">Verifying invitation...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container max-w-4xl mx-auto p-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Invitation Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="container max-w-4xl mx-auto p-6">
        <Card>
          <CardContent className="p-12 text-center">
            <CheckCircle className="h-16 w-16 mx-auto text-green-500 mb-4" />
            <h2 className="text-2xl font-bold mb-2">Submission Complete</h2>
            <p className="text-muted-foreground mb-4">
              Thank you for completing your profile. Our team will review your submission shortly.
            </p>
            <p className="text-sm text-muted-foreground">
              Redirecting you to the home page...
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container max-w-4xl mx-auto p-4 md:p-6">
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-2xl">Complete Your Profile</CardTitle>
          <CardDescription>
            {invitation.stage_name 
              ? `Welcome ${invitation.stage_name}! Please complete your profile information below.`
              : 'Welcome! Please complete your profile information below.'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <OnboardingForm onCloseModal={handleFormSubmit} />
        </CardContent>
      </Card>
    </div>
  );
};

export default CreatorInviteOnboarding;
