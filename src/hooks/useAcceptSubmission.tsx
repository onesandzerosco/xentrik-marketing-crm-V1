
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { OnboardSubmission } from "./useOnboardingSubmissions";
import CreatorService from "@/services/creator";
import type { Database } from "@/integrations/supabase/types";

// Define the enum types from Supabase
type TeamEnum = Database["public"]["Enums"]["team"];
type CreatorTypeEnum = Database["public"]["Enums"]["creator_type"];

// Define the type for creator data
interface CreatorData {
  name: string;
  team: TeamEnum;
  creatorType: CreatorTypeEnum;
}

export const useAcceptSubmission = (
  deleteSubmission: (token: string) => Promise<void>,
  setProcessingTokens: (fn: (prev: string[]) => string[]) => void
) => {
  const [acceptModalOpen, setAcceptModalOpen] = useState(false);
  const [selectedSubmission, setSelectedSubmission] = useState<OnboardSubmission | null>(null);
  const { toast } = useToast();

  const openAcceptModal = (submission: OnboardSubmission) => {
    setSelectedSubmission(submission);
    setAcceptModalOpen(true);
  };

  // Update the function signature to match what AcceptSubmissionModal expects
  const handleAcceptSubmission = async (creatorData: CreatorData) => {
    if (!selectedSubmission) return;
    
    try {
      setProcessingTokens(prev => [...prev, selectedSubmission.token]);
      
      // Validate submission data
      if (!selectedSubmission.email) {
        throw new Error("Missing email in submission data");
      }
      
      console.log("Processing submission for email:", selectedSubmission.email);
      
      // 1. First, call the service to create a creator user
      const creatorId = await CreatorService.acceptOnboardingSubmission(
        selectedSubmission.data,
        creatorData
      );
      
      if (!creatorId) {
        throw new Error("Failed to create creator account");
      }
      
      console.log("Creator account created with ID:", creatorId);
      
      // 2. Update the submission status in the database
      const { error } = await supabase
        .from('onboarding_submissions')
        .update({ status: 'approved' })
        .eq('token', selectedSubmission.token);
      
      if (error) {
        console.error("Error updating submission status:", error);
        throw error;
      }

      toast({
        title: "Creator account created",
        description: `${creatorData.name} has been added as a creator.`,
      });
      
      // 3. Close the modal and refresh the list
      setAcceptModalOpen(false);
      
      // Don't call deleteSubmission as it marks the submission as declined
      // Instead, fetch the submissions again to refresh the list
      const { data: updatedData, error: fetchError } = await supabase
        .from('onboarding_submissions')
        .select('*')
        .eq('status', 'pending');
        
      if (fetchError) {
        console.error("Error refreshing submissions:", fetchError);
      }
      
    } catch (error: any) {
      console.error("Error accepting submission:", error);
      
      // Provide more specific error messages based on error content
      let errorMessage = "Failed to create creator account.";
      
      // Check for common error patterns
      if (error.message?.includes("User already registered")) {
        errorMessage = "This email is already registered. Please use a different email.";
      } else if (error.message?.includes("Invalid email format")) {
        errorMessage = "Invalid email format. Please check the email address.";
      } else if (error.message?.includes("already exists")) {
        errorMessage = "This email is already associated with an account.";
      }
      
      toast({
        title: "Error accepting submission",
        description: errorMessage,
        variant: "destructive"
      });
      
      setProcessingTokens(prev => prev.filter(t => t !== selectedSubmission.token));
    }
  };

  return {
    acceptModalOpen,
    selectedSubmission,
    openAcceptModal,
    setAcceptModalOpen,
    handleAcceptSubmission
  };
};
