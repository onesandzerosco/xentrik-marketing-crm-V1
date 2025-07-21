
import { useState } from "react";
import { Gender, Team, CreatorType } from "@/types";
import { CustomSocialLink, FormState, FormActions, ValidationErrors } from "./types";

export function useFormState() {
  // Form state
  const [name, setName] = useState("");
  const [profileImage, setProfileImage] = useState("");
  const [gender, setGender] = useState<Gender>("Male");
  const [team, setTeam] = useState<Team>("A Team");
  const [creatorType, setCreatorType] = useState<CreatorType>("Real");
  const [telegramUsername, setTelegramUsername] = useState("");
  const [whatsappNumber, setWhatsappNumber] = useState("");
  
  // Using full URL format for social media links
  const [instagram, setInstagram] = useState("");
  const [tiktok, setTiktok] = useState("");
  const [twitter, setTwitter] = useState("");
  const [reddit, setReddit] = useState("");
  const [chaturbate, setChaturbate] = useState("");
  const [youtube, setYoutube] = useState("");
  
  const [customSocialLinks, setCustomSocialLinks] = useState<CustomSocialLink[]>([]);
  const [notes, setNotes] = useState("");
  const [marketingStrategy, setMarketingStrategy] = useState("");
  const [errors, setErrors] = useState<ValidationErrors>({});

  return {
    formState: {
      name,
      profileImage,
      gender,
      team,
      creatorType,
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
      marketingStrategy,
      errors
    } as FormState,
    formActions: {
      setName,
      setProfileImage,
      setGender,
      setTeam,
      setCreatorType,
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
      setMarketingStrategy
    } as FormActions,
    setErrors
  };
}
