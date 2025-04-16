
import { useState } from "react";
import { Gender, Team, CreatorType } from "@/types";
import { useToast } from "@/components/ui/use-toast";
import { useCreators } from "../context/creator";

export interface CustomSocialLink {
  id: string;
  name: string;
  url: string;
}

export interface ValidationErrors {
  name?: string;
  gender?: string;
  team?: string;
  creatorType?: string;
  telegramUsername?: string;
  whatsappNumber?: string;
  contactRequired?: string;
  instagram?: string;
  tiktok?: string;
  twitter?: string;
  reddit?: string;
  chaturbate?: string;
  youtube?: string;
  customSocialLinks?: string[];
}

export function useOnboardingForm(onSuccess?: () => void) {
  const { addCreator } = useCreators();
  const { toast } = useToast();

  const [name, setName] = useState("");
  const [profileImage, setProfileImage] = useState("");
  const [gender, setGender] = useState<Gender>("Male");
  const [team, setTeam] = useState<Team>("A Team");
  const [creatorType, setCreatorType] = useState<CreatorType>("Real");
  const [telegramUsername, setTelegramUsername] = useState("");
  const [whatsappNumber, setWhatsappNumber] = useState("");
  const [instagram, setInstagram] = useState("");
  const [tiktok, setTiktok] = useState("");
  const [twitter, setTwitter] = useState("");
  const [reddit, setReddit] = useState("");
  const [chaturbate, setChaturbate] = useState("");
  const [youtube, setYoutube] = useState("");
  const [customSocialLinks, setCustomSocialLinks] = useState<CustomSocialLink[]>([]);
  const [notes, setNotes] = useState("");
  const [errors, setErrors] = useState<ValidationErrors>({});

  const validateForm = (): boolean => {
    const newErrors: ValidationErrors = {};
    let isValid = true;

    if (!name.trim()) {
      newErrors.name = "Creator name is required";
      isValid = false;
    }

    if (!gender) {
      newErrors.gender = "Gender is required";
      isValid = false;
    }

    if (!team) {
      newErrors.team = "Team is required";
      isValid = false;
    }

    if (!creatorType) {
      newErrors.creatorType = "Creator type is required";
      isValid = false;
    }
    
    // Validate contact methods - at least one is required
    if (!telegramUsername.trim() && !whatsappNumber.trim()) {
      newErrors.contactRequired = "At least one contact method (Telegram or WhatsApp) is required";
      isValid = false;
    }

    if (telegramUsername && !telegramUsername.startsWith('@') && telegramUsername.trim() !== '') {
      newErrors.telegramUsername = "Telegram username should start with @";
      isValid = false;
    }

    if (whatsappNumber && !/^\+\d+$/.test(whatsappNumber) && whatsappNumber.trim() !== '') {
      newErrors.whatsappNumber = "WhatsApp number should start with + followed by numbers";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = () => {
    if (!validateForm()) {
      toast({
        title: "Validation Error",
        description: "Please fix the errors in the form.",
        variant: "destructive",
      });
      return;
    }

    const socialLinksObj: Record<string, string | undefined> = {
      instagram: instagram || undefined,
      tiktok: tiktok || undefined,
      twitter: twitter || undefined,
      reddit: reddit || undefined,
      chaturbate: chaturbate || undefined,
      youtube: youtube || undefined,
    };
    
    customSocialLinks.forEach(link => {
      if (link.url) {
        socialLinksObj[link.name.toLowerCase()] = link.url;
      }
    });

    const newCreator = {
      name,
      profileImage,
      gender,
      team,
      creatorType,
      socialLinks: socialLinksObj,
      tags: [gender, team, creatorType],
      needsReview: true,
      telegramUsername: telegramUsername || undefined,
      whatsappNumber: whatsappNumber || undefined,
      notes: notes || undefined,
    };

    addCreator(newCreator);
    toast({
      title: "Success",
      description: `${name} onboarded successfully!`,
    });
    
    if (onSuccess) {
      onSuccess();
    }
    
    clearForm();
  };

  const clearForm = () => {
    setName("");
    setProfileImage("");
    setGender("Male");
    setTeam("A Team");
    setCreatorType("Real");
    setTelegramUsername("");
    setWhatsappNumber("");
    setInstagram("");
    setTiktok("");
    setTwitter("");
    setReddit("");
    setChaturbate("");
    setYoutube("");
    setCustomSocialLinks([]);
    setNotes("");
    setErrors({});
  };

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
      errors
    },
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
      setNotes
    },
    handleSubmit,
    clearForm
  };
}
