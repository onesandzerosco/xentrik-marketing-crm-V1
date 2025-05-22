
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
      
      // 1. First, call the service to create a creator user
      const creatorId = await CreatorService.acceptOnboardingSubmission(
        selectedSubmission.data,
        creatorData
      );
      
      if (!creatorId) {
        throw new Error("Failed to create creator account");
      }
      
      // 2. Update the submission status in the database
      const { error } = await supabase
        .from('onboarding_submissions')
        .update({ status: 'approved' })
        .eq('token', selectedSubmission.token);
      
      if (error) {
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
      
    } catch (error) {
      console.error("Error accepting submission:", error);
      toast({
        title: "Error accepting submission",
        description: "Failed to create creator account.",
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
