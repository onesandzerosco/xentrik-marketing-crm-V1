
import { Creator } from "@/types";
import { useCreators } from "@/context/creator";
import { useToast } from "@/hooks/use-toast";
import { CreatorProfileState } from "./types";

export function useProfileSave(creator: Creator | null | undefined) {
  const { updateCreator } = useCreators();
  const { toast } = useToast();

  const handleSave = (
    state: CreatorProfileState, 
    setNameError: (error: string | null) => void
  ) => {
    setNameError(null);
    if (!state.name.trim()) {
      setNameError("Creator name is required");
      setTimeout(() => setNameError(null), 3000);
      toast({
        title: "Error",
        description: "Creator name is required",
        variant: "destructive",
      });
      return;
    }
    
    if (!creator) return;
    
    console.log("Saving creator profile with state:", state);
    
    // Build properly typed socialLinks object
    const socialLinks = {
      instagram: state.instagram || "",
      tiktok: state.tiktok || "",
      twitter: state.twitter || "",
      reddit: state.reddit || "",
      chaturbate: state.chaturbate || "",
      youtube: state.youtube
    };
    
    // Add custom social links if any
    if (state.customSocialLinks && state.customSocialLinks.length > 0) {
      state.customSocialLinks.forEach(link => {
        if (link.url) {
          (socialLinks as any)[link.name.toLowerCase()] = link.url;
        }
      });
    }
    
    const assignedTeamMembers = state.assignedMembers.map(member => member.id);
    
    // Include all fields in the update
    updateCreator(creator.id, {
      name: state.name,
      gender: state.gender,
      team: state.team,
      creatorType: state.creatorType,
      profileImage: state.profileImage,
      telegramUsername: state.telegramUsername || undefined,
      whatsappNumber: state.whatsappNumber || undefined,
      socialLinks: socialLinks,
      tags: [state.gender, state.team, state.creatorType],
      needsReview: state.needsReview,
      marketingStrategy: state.marketingStrategy,
      assignedTeamMembers,
      notes: state.notes
    });
    
    toast({
      title: "Success!",
      description: "You've successfully updated the Creator's profile"
    });
  };

  return { handleSave };
}
