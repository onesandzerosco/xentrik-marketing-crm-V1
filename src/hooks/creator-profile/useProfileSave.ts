
import { Creator } from "@/types";
import { useCreators } from "@/context/creator";
import { useToast } from "@/hooks/use-toast";
import { CreatorProfileState } from "./types";
import { Employee } from "@/types/employee";

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
    
    // Create socialLinks object from state
    const socialLinksObj: Record<string, string | undefined> = {
      instagram: state.instagram || undefined,
      tiktok: state.tiktok || undefined,
      twitter: state.twitter || undefined,
      reddit: state.reddit || undefined,
      chaturbate: state.chaturbate || undefined,
      youtube: state.youtube || undefined,
    };
    
    // Add custom social links
    state.customSocialLinks.forEach(link => {
      if (link.url) {
        socialLinksObj[link.name.toLowerCase()] = link.url;
      }
    });
    
    const assignedTeamMembers = state.assignedMembers.map(member => member.id);
    
    updateCreator(creator.id, {
      name: state.name,
      gender: state.gender,
      team: state.team,
      creatorType: state.creatorType,
      profileImage: state.profileImage,
      telegramUsername: state.telegramUsername || undefined,
      whatsappNumber: state.whatsappNumber || undefined,
      socialLinks: socialLinksObj,
      tags: [state.gender, state.team, state.creatorType],
      needsReview: state.needsReview,
      assignedTeamMembers,
      notes: state.notes
    });
    
    toast({
      title: "Profile Updated",
      description: "Creator profile has been successfully updated"
    });
  };

  return { handleSave };
}
