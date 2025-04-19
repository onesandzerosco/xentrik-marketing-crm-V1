
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCreators } from "@/context/creator";
import { useToast } from "@/components/ui/use-toast";
import { FormState } from "./types";

export function useSubmission() {
  const navigate = useNavigate();
  const { addCreator } = useCreators();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleSubmit = async (formState: FormState) => {
    console.log("Starting form submission");
    setIsSubmitting(true);
    
    try {
      // Prepare social links
      const socialLinks: Record<string, string> = {};
      if (formState.instagram) socialLinks.instagram = formState.instagram;
      if (formState.tiktok) socialLinks.tiktok = formState.tiktok;
      if (formState.twitter) socialLinks.twitter = formState.twitter;
      if (formState.reddit) socialLinks.reddit = formState.reddit;
      if (formState.chaturbate) socialLinks.chaturbate = formState.chaturbate;
      if (formState.youtube) socialLinks.youtube = formState.youtube;
      
      // Add custom social links
      formState.customSocialLinks.forEach(link => {
        if (link.url) {
          socialLinks[link.name.toLowerCase()] = link.url;
        }
      });
      
      // Create new creator object
      const newCreator = {
        name: formState.name,
        profileImage: formState.profileImage || '',
        gender: formState.gender,
        team: formState.team,
        creatorType: formState.creatorType,
        socialLinks,
        tags: [formState.gender, formState.team, formState.creatorType], // Default tags
        needsReview: false, // Explicitly set to false
        telegramUsername: formState.telegramUsername,
        whatsappNumber: formState.whatsappNumber,
        notes: formState.notes
      };
      
      console.log("Submitting new creator:", newCreator);
      
      // Submit to context
      const creatorId = await addCreator(newCreator);
      
      console.log("Response from addCreator:", creatorId);
      
      if (creatorId) {
        toast({
          title: "Creator Added Successfully",
          description: `${formState.name} was added to your creators with ID: ${creatorId}`,
        });
        
        return creatorId;
      } else {
        throw new Error("Failed to add creator. No ID was returned.");
      }
    } catch (error: any) {
      console.error("Error during creator onboarding:", error);
      toast({
        title: "Creator Onboarding Failed",
        description: error.message || "An error occurred while adding the creator",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    isSubmitting,
    handleSubmit
  };
}
