
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { OnboardSubmission } from "./useOnboardingSubmissions";
import CreatorService from "@/services/creator";
import type { Database } from "@/integrations/supabase/types";

// Define the enum types from Supabase
type TeamEnum = Database["public"]["Enums"]["team"];
type CreatorTypeEnum = Database["public"]["Enums"]["creator_type"];

export const useAcceptSubmission = (
  deleteSubmission: (token: string) => Promise<void>,
  setProcessingTokens: React.Dispatch<React.SetStateAction<string[]>>,
  refreshSubmissions: () => Promise<void> // Add refreshSubmissions parameter
) => {
  const [acceptModalOpen, setAcceptModalOpen] = useState(false);
  const [selectedSubmission, setSelectedSubmission] = useState<OnboardSubmission | null>(null);
  const { toast } = useToast();

  const openAcceptModal = (submission: OnboardSubmission) => {
    setSelectedSubmission(submission);
    setAcceptModalOpen(true);
  };

  const handleAcceptSubmission = async (creatorData: {
    name: string;
    team: TeamEnum;
    creatorType: CreatorTypeEnum;
  }) => {
    if (!selectedSubmission) return;
    
    try {
      const token = selectedSubmission.token;
      setProcessingTokens(prev => [...prev, token]);
      
      // Process the submission using the CreatorService
      const creatorId = await CreatorService.acceptOnboardingSubmission(
        selectedSubmission.data, 
        creatorData
      );
      
      if (!creatorId) {
        throw new Error("Failed to create creator record");
      }
      
      console.log("Creator created with ID:", creatorId);
      
      // Delete the submission file after successful approval
      await deleteSubmission(token);
      
      toast({
        title: "Creator approved",
        description: `${creatorData.name} has been approved and added as a creator with account credentials.`,
      });
      
      // Close the modal
      setAcceptModalOpen(false);
      
    } catch (error) {
      console.error("Error accepting submission:", error);
      toast({
        title: "Error approving submission",
        description: error instanceof Error ? error.message : "Failed to approve the creator.",
        variant: "destructive"
      });
    } finally {
      if (selectedSubmission) {
        setProcessingTokens(prev => prev.filter(t => t !== selectedSubmission.token));
      }
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
