
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { OnboardSubmission } from "./useOnboardingSubmissions";
import CreatorService from "@/services/creator";

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

  const handleAcceptSubmission = async (name: string, team: any, creatorType: any) => {
    if (!selectedSubmission) return;
    
    try {
      setProcessingTokens(prev => [...prev, selectedSubmission.token]);
      
      // 1. First, call the service to create a creator user
      const creatorId = await CreatorService.acceptOnboardingSubmission(
        selectedSubmission.data,
        {
          name,
          team,
          creatorType
        }
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
        description: `${name} has been added as a creator.`,
      });
      
      // 3. Close the modal and refresh the list
      setAcceptModalOpen(false);
      deleteSubmission(selectedSubmission.token);
      
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
