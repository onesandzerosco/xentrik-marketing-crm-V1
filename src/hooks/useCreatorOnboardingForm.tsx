
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
  
  // Form state
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

    // Basic validation
    if (!name.trim()) {
      newErrors.name = "Creator name is required";
      isValid = false;
    }

    // At least one contact method is required
    if (!telegramUsername.trim() && !whatsappNumber.trim()) {
      newErrors.contactRequired = "At least one contact method is required";
      isValid = false;
    }

    // Format validation
    if (telegramUsername && telegramUsername.trim() !== '') {
      if (!telegramUsername.startsWith('@') || telegramUsername === '@') {
        newErrors.telegramUsername = "Telegram username should start with @";
        isValid = false;
      }
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async () => {
    console.log("Starting form submission");
    
    if (!validateForm()) {
      toast({
        title: "Form Validation Error",
        description: "Please fix the errors in the form",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Prepare social links
      const socialLinks: Record<string, string> = {};
      if (instagram) socialLinks.instagram = instagram;
      if (tiktok) socialLinks.tiktok = tiktok;
      if (twitter) socialLinks.twitter = twitter;
      if (reddit) socialLinks.reddit = reddit;
      if (chaturbate) socialLinks.chaturbate = chaturbate;
      if (youtube) socialLinks.youtube = youtube;
      
      // Add custom social links
      customSocialLinks.forEach(link => {
        if (link.url) {
          socialLinks[link.name.toLowerCase()] = link.url;
        }
      });
      
      // Create new creator object
      const newCreator = {
        name,
        profileImage,
        gender,
        team,
        creatorType,
        socialLinks,
        tags: [gender, team, creatorType], // Default tags
        needsReview: true,
        telegramUsername,
        whatsappNumber,
        notes
      };
      
      console.log("Submitting new creator:", newCreator);
      
      // Submit to context
      const creatorId = await addCreator(newCreator);
      
      if (creatorId) {
        toast({
          title: "Creator Added Successfully",
          description: `${name} was added to your creators`,
        });
        
        // Navigate back to creators list
        setTimeout(() => {
          navigate("/creators");
        }, 500);
      }
    } catch (error: any) {
      console.error("Error during creator onboarding:", error);
      toast({
        title: "Creator Onboarding Failed",
        description: error.message || "An error occurred while adding the creator",
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
