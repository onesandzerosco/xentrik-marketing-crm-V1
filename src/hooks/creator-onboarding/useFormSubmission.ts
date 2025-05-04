
import { useCreators } from "@/context/creator";
import { useToast } from "@/components/ui/use-toast";
import { FormState } from "./types";

export function useFormSubmission() {
  const { addCreator } = useCreators();
  const { toast } = useToast();

  const handleSubmit = (formState: FormState) => {
    const socialLinksObj: Record<string, string | undefined> = {
      instagram: formState.instagram || undefined,
      tiktok: formState.tiktok || undefined,
      twitter: formState.twitter || undefined,
      reddit: formState.reddit || undefined,
      chaturbate: formState.chaturbate || undefined,
      youtube: formState.youtube || undefined,
    };
    
    formState.customSocialLinks.forEach(link => {
      if (link.url) {
        socialLinksObj[link.name.toLowerCase()] = link.url;
      }
    });

    const newCreator = {
      name: formState.name,
      profileImage: formState.profileImage,
      gender: formState.gender,
      team: formState.team,
      creatorType: formState.creatorType,
      socialLinks: socialLinksObj,
      tags: [formState.gender, formState.team, formState.creatorType],
      needsReview: false,
      active: true, // Add active property
      telegramUsername: formState.telegramUsername || undefined,
      whatsappNumber: formState.whatsappNumber || undefined,
      notes: formState.notes || undefined,
    };

    addCreator(newCreator);
    toast({
      title: "Success",
      description: `${formState.name} onboarded successfully!`,
    });
  };

  return { handleSubmit };
}
