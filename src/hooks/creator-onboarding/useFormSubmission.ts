
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { FormState } from "./types";

export function useFormSubmission() {
  const { toast } = useToast();

  const handleSubmit = async (formState: FormState) => {
    try {
      const token = window.location.pathname.split('/').pop();
      
      if (!token) {
        throw new Error("Invalid token");
      }
      
      // Format the data for submission
      const formData = {
        name: formState.name,
        gender: formState.gender,
        creator_type: formState.creatorType,
        team: formState.team,
        profile_image: formState.profileImage,
        telegram_username: formState.telegramUsername,
        whatsapp_number: formState.whatsappNumber,
        social_links: {
          instagram: formState.instagram,
          tiktok: formState.tiktok,
          twitter: formState.twitter,
          reddit: formState.reddit,
          chaturbate: formState.chaturbate,
          youtube: formState.youtube,
          custom: formState.customSocialLinks
        },
        notes: formState.notes,
        submitted_at: new Date().toISOString()
      };
      
      // Upload form data to Supabase storage
      const { error } = await supabase.storage
        .from("onboard_submissions")
        .upload(`${token}.json`, new Blob([JSON.stringify(formData)], { type: "application/json" }));
      
      if (error) {
        throw error;
      }
      
      // Update invitation status
      await supabase
        .from("creator_invitations")
        .update({ status: "completed" })
        .eq("token", token);
      
      toast({
        title: "Onboarding Complete",
        description: "Your profile has been submitted successfully!"
      });
      
      return true;
      
    } catch (error: any) {
      console.error("Submission error:", error);
      toast({
        variant: "destructive",
        title: "Submission Failed",
        description: error.message || "There was an error submitting your profile"
      });
      return false;
    }
  };

  return { handleSubmit };
}
