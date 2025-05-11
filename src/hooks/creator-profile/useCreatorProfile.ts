
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import CreatorService from "@/services/CreatorService";

export const useCreatorProfile = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  /**
   * Save onboarding form data to both storage bucket and creators table
   * @param token The onboarding token
   * @param formData The complete form data
   */
  const saveOnboardingData = async (token: string, formData: any) => {
    setIsLoading(true);
    
    try {
      // First save to storage bucket for review
      const fileName = `${token}.json`;
      const jsonData = JSON.stringify(formData, null, 2);
      const blob = new Blob([jsonData], { type: 'application/json' });
      
      // Upload to storage bucket
      const { error: uploadError } = await supabase.storage
        .from('onboard_submissions')
        .upload(fileName, blob, { contentType: 'application/json', upsert: true });
      
      if (uploadError) {
        throw uploadError;
      }
      
      // Also save to creators table with model_profile column
      const creatorId = await CreatorService.saveOnboardingData(token, formData);
      
      if (!creatorId) {
        throw new Error("Failed to save creator data");
      }
      
      // Update the invitation status if token exists
      if (token) {
        await supabase
          .from('creator_invitations')
          .update({
            status: 'completed',
            submission_path: fileName
          })
          .eq('token', token);
      }
      
      toast({
        title: "Submission Successful",
        description: "Your profile information has been submitted for review.",
      });
      
      // Navigate home or to success page
      setTimeout(() => {
        navigate("/");
      }, 2000);
      
      return creatorId;
    } catch (error: any) {
      console.error("Error saving onboarding data:", error);
      toast({
        title: "Submission Failed",
        description: error.message || "An unexpected error occurred",
        variant: "destructive",
      });
      return undefined;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    saveOnboardingData
  };
};
