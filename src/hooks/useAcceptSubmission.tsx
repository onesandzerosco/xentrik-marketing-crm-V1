
import { useState, useRef, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
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
  const [isProcessing, setIsProcessing] = useState(false);
  const [processedTokens, setProcessedTokens] = useState<Set<string>>(new Set());
  
  // Use refs to maintain values across renders and async operations
  const isProcessingRef = useRef(false);
  const currentTokenRef = useRef<string | null>(null);
  
  const { toast } = useToast();

  // Use useCallback to ensure the function reference is stable
  const openAcceptModal = useCallback((submission: OnboardSubmission) => {
    const token = submission.token;
    console.log("Opening accept modal for submission:", token);
    
    // Don't open the modal if the token is already being processed or was processed
    if (processedTokens.has(token) || isProcessingRef.current || currentTokenRef.current === token) {
      console.log("This token is being or has been processed, not opening modal:", token);
      return;
    }
    
    setSelectedSubmission(submission);
    setAcceptModalOpen(true);
  }, [processedTokens]);

  const closeModal = useCallback(() => {
    setAcceptModalOpen(false);
    setSelectedSubmission(null);
    currentTokenRef.current = null;
  }, []);

  const handleAcceptSubmission = useCallback(async (creatorData: CreatorData) => {
    if (!selectedSubmission) {
      console.log("No submission selected, cannot proceed");
      return;
    }
    
    const token = selectedSubmission.token;
    
    // Multiple safeguards against duplicate processing
    if (isProcessingRef.current || isProcessing || currentTokenRef.current === token || processedTokens.has(token)) {
      console.log("Already processing or processed, ignoring duplicate call:", token);
      return;
    }
    
    try {
      // Set processing flags to prevent duplicate calls
      console.log("Setting processing flags for token:", token);
      setIsProcessing(true);
      isProcessingRef.current = true;
      currentTokenRef.current = token;
      
      // Track this token as being processed
      setProcessingTokens(prev => {
        // Ensure the token isn't already in the array
        if (!prev.includes(token)) {
          return [...prev, token];
        }
        return prev;
      });
      
      // Add the token to processed set immediately
      console.log("Adding token to processed set:", token);
      setProcessedTokens(prev => {
        const newSet = new Set(prev);
        newSet.add(token);
        return newSet;
      });
      
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
      closeModal();
      await deleteSubmission(token);
      
    } catch (error) {
      console.error("Error accepting submission:", error);
      toast({
        title: "Error accepting submission",
        description: "Failed to create creator account.",
        variant: "destructive"
      });
      
      // If there was an error, remove the token from processed set
      // to allow retrying
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
      isProcessingRef.current = false;
      // Don't clear currentTokenRef here to prevent immediate reprocessing
    }
  }, [selectedSubmission, closeModal, deleteSubmission, isProcessing, processedTokens, setProcessingTokens, toast]);

  return {
    acceptModalOpen,
    selectedSubmission,
    openAcceptModal,
    setAcceptModalOpen: closeModal, // Export the closeModal function as setAcceptModalOpen
    handleAcceptSubmission,
    isProcessing,
    processedTokens
  };
};
