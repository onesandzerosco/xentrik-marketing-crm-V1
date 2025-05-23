
import { useState, useRef } from "react";
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
  const [isProcessing, setIsProcessing] = useState(false); // Flag to prevent double submission
  const [processedTokens, setProcessedTokens] = useState<Set<string>>(new Set()); // Track already processed tokens
  const processingRef = useRef(false); // Ref to track processing state across renders
  const { toast } = useToast();

  const openAcceptModal = (submission: OnboardSubmission) => {
    console.log("Opening accept modal for submission:", submission.token);
    // Don't open the modal if the token is already being processed
    if (processedTokens.has(submission.token)) {
      console.log("This token has already been processed, not opening modal:", submission.token);
      return;
    }
    setSelectedSubmission(submission);
    setAcceptModalOpen(true);
  };

  // Update the function signature to match what AcceptSubmissionModal expects
  const handleAcceptSubmission = async (creatorData: CreatorData) => {
    if (!selectedSubmission) {
      console.log("No submission selected, cannot proceed");
      return;
    }
    
    const token = selectedSubmission.token;
    
    // Multiple safeguards against duplicate processing
    if (isProcessing || processingRef.current) {
      console.log("Already processing a submission, ignoring duplicate call");
      return;
    }
    
    if (processedTokens.has(token)) {
      console.log("Token already processed, ignoring duplicate call:", token);
      return;
    }
    
    try {
      // Set processing flags to prevent duplicate calls
      console.log("Setting processing flags for token:", token);
      setIsProcessing(true);
      processingRef.current = true;
      setProcessingTokens(prev => [...prev, token]);
      
      // Add the token to processed set immediately
      console.log("Adding token to processed set:", token);
      setProcessedTokens(prev => new Set(prev).add(token));
      
      console.log("Processing submission:", token);
      
      // 1. First, call the service to create a creator user
      const creatorId = await CreatorService.acceptOnboardingSubmission(
        selectedSubmission.data,
        creatorData
      );
      
      if (!creatorId) {
        throw new Error("Failed to create creator account");
      }
      
      // 2. Update the submission status in the database to "accepted" instead of "approved"
      const { error } = await supabase
        .from('onboarding_submissions')
        .update({ status: 'accepted' })
        .eq('token', token);
      
      if (error) {
        throw error;
      }

      toast({
        title: "Creator account created",
        description: `${creatorData.name} has been added as a creator.`,
      });
      
      // 3. Close the modal and refresh the list
      setAcceptModalOpen(false);
      deleteSubmission(token);
      
    } catch (error) {
      console.error("Error accepting submission:", error);
      toast({
        title: "Error accepting submission",
        description: "Failed to create creator account.",
        variant: "destructive"
      });
      
      // If there was an error, remove the token from processed set
      setProcessedTokens(prev => {
        const newSet = new Set(prev);
        newSet.delete(token);
        return newSet;
      });
      
      setProcessingTokens(prev => prev.filter(t => t !== token));
    } finally {
      // Reset processing flags
      console.log("Resetting processing flags for token:", token);
      setIsProcessing(false);
      processingRef.current = false;
    }
  };

  return {
    acceptModalOpen,
    selectedSubmission,
    openAcceptModal,
    setAcceptModalOpen,
    handleAcceptSubmission,
    isProcessing,
    processedTokens // Export this to check in other components
  };
};
