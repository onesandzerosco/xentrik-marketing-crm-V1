
import { useState, useEffect } from "react";
import { Creator, Gender, Team, CreatorType } from "@/types";
import { Employee } from "@/types/employee";
import { CustomSocialLink } from "@/components/onboarding/social/CustomSocialLinkItem";
import { CreatorProfileState, CreatorProfileActions } from "./types";

export function useCreatorProfileState(creator?: Creator | null): {
  state: CreatorProfileState;
  actions: CreatorProfileActions;
} {
  const [name, setName] = useState(creator?.name || "");
  const [nameError, setNameError] = useState<string | null>(null);
  const [gender, setGender] = useState<Gender>(creator?.gender || "Male");
  const [team, setTeam] = useState<Team>(creator?.team || "A Team");
  const [creatorType, setCreatorType] = useState<CreatorType>(creator?.creatorType || "Real");
  const [profileImage, setProfileImage] = useState(creator?.profileImage || "");
  const [telegramUsername, setTelegramUsername] = useState(creator?.telegramUsername || "");
  const [whatsappNumber, setWhatsappNumber] = useState(creator?.whatsappNumber || "");
  
  // Initialize social media links with proper URL format
  const [instagram, setInstagram] = useState(creator?.socialLinks.instagram || "");
  const [tiktok, setTiktok] = useState(creator?.socialLinks.tiktok || "");
  const [twitter, setTwitter] = useState(creator?.socialLinks.twitter || "");
  const [reddit, setReddit] = useState(creator?.socialLinks.reddit || "");
  const [chaturbate, setChaturbate] = useState(creator?.socialLinks.chaturbate || "");
  const [youtube, setYoutube] = useState(creator?.socialLinks.youtube || "");
  
  const [customSocialLinks, setCustomSocialLinks] = useState<CustomSocialLink[]>([]);
  const [notes, setNotes] = useState(creator?.notes || "");
  const [needsReview, setNeedsReview] = useState(creator?.needsReview || false);
  const [assignedMembers, setAssignedMembers] = useState<Employee[]>([]);
  const [marketingStrategy, setMarketingStrategy] = useState<string[]>(creator?.marketingStrategy || []);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Extract custom social links
  useEffect(() => {
    if (creator?.socialLinks) {
      const standardLinks = ['instagram', 'tiktok', 'twitter', 'reddit', 'chaturbate', 'youtube'];
      const custom: CustomSocialLink[] = [];
      
      Object.entries(creator.socialLinks).forEach(([key, value]) => {
        if (!standardLinks.includes(key) && value) {
          custom.push({
            id: key,
            name: key.charAt(0).toUpperCase() + key.slice(1),
            url: value
          });
        }
      });
      
      setCustomSocialLinks(custom);
    }
  }, [creator]);

  return {
    state: {
      name,
      nameError,
      gender,
      team,
      creatorType,
      profileImage,
      telegramUsername,
      whatsappNumber,
      instagram,
      tiktok,
      twitter,
      reddit,
      chaturbate,
      youtube,
      customSocialLinks,
      notes,
      needsReview,
      assignedMembers,
      marketingStrategy,
      errors
    },
    actions: {
      setName,
      setNameError,
      setGender,
      setTeam,
      setCreatorType,
      setProfileImage,
      setTelegramUsername,
      setWhatsappNumber,
      setInstagram,
      setTiktok,
      setTwitter,
      setReddit,
      setChaturbate,
      setYoutube,
      setCustomSocialLinks,
      setNotes,
      setNeedsReview,
      setAssignedMembers,
      setMarketingStrategy
    }
  };
}
