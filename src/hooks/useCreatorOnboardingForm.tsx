
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCreators } from "@/context/creator";
import { useToast } from "@/components/ui/use-toast";
import { Gender, Team, CreatorType } from "@/types";
import { CustomSocialLink } from "@/components/onboarding/social/CustomSocialLinkItem";

interface ValidationErrors {
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

export function useCreatorOnboardingForm() {
  const navigate = useNavigate();
  const { addCreator } = useCreators();
  const { toast } = useToast();
  
  // State for form fields
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
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateForm = (): boolean => {
    const newErrors: ValidationErrors = {};
    let isValid = true;

    // Validate required fields
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

    // Validate format for optional fields
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

  const handleSubmit = async () => {
    if (!validateForm()) {
      toast({
        title: "Validation Error",
        description: "Please fix the errors in the form.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Prepare custom social links
      const socialLinksObj: Record<string, string> = {};
      
      if (instagram) socialLinksObj.instagram = instagram;
      if (tiktok) socialLinksObj.tiktok = tiktok;
      if (twitter) socialLinksObj.twitter = twitter;
      if (reddit) socialLinksObj.reddit = reddit;
      if (chaturbate) socialLinksObj.chaturbate = chaturbate;
      if (youtube) socialLinksObj.youtube = youtube;
      
      // Add custom social links
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
      
      await addCreator(newCreator);
      
      toast({
        title: "Creator Onboarded Successfully",
        description: "The creator profile has been created successfully.",
      });
      
      navigate("/creators");
    } catch (error) {
      console.error("Error during onboarding:", error);
      toast({
        title: "Onboarding Failed",
        description: "There was an error during the onboarding process. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
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
    isSubmitting,
    handleSubmit
  };
}
