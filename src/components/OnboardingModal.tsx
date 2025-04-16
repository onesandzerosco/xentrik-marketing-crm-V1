
import React, { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Gender, Team, CreatorType } from "../types";
import { useCreators } from "../context/creator";
import { useToast } from "@/components/ui/use-toast";
import ProfilePicture from "../components/profile/ProfilePicture";
import BasicInfoSection from "./onboarding/BasicInfoSection";
import ContactInfoSection from "./onboarding/ContactInfoSection";
import SocialLinksSection from "./onboarding/SocialLinksSection";
import NotesSection from "./onboarding/NotesSection";

interface OnboardingModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface ValidationErrors {
  name?: string;
  gender?: string;
  team?: string;
  creatorType?: string;
  telegramUsername?: string;
  whatsappNumber?: string;
  instagram?: string;
  tiktok?: string;
  twitter?: string;
  reddit?: string;
}

const OnboardingModal: React.FC<OnboardingModalProps> = ({ open, onOpenChange }) => {
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
  const [notes, setNotes] = useState("");
  const [errors, setErrors] = useState<ValidationErrors>({});
  
  const { addCreator } = useCreators();
  const { toast } = useToast();

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

  const handleSubmit = () => {
    if (!validateForm()) {
      toast({
        title: "Validation Error",
        description: "Please fix the errors in the form.",
        variant: "destructive",
      });
      return;
    }

    const newCreator = {
      name,
      profileImage,
      gender,
      team,
      creatorType,
      socialLinks: {
        instagram: instagram || undefined,
        tiktok: tiktok || undefined,
        twitter: twitter || undefined,
        reddit: reddit || undefined,
      },
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
    onOpenChange(false);
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
    setNotes("");
    setErrors({});
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="overflow-y-auto">
        <SheetHeader className="mb-4">
          <SheetTitle>Onboard New Creator</SheetTitle>
        </SheetHeader>
        
        {/* Basic Information + Profile Picture Row */}
        <div className="flex flex-col md:flex-row gap-6 mb-6">
          {/* Basic Information - Left */}
          <BasicInfoSection
            name={name}
            setName={setName}
            gender={gender}
            setGender={setGender}
            team={team}
            setTeam={setTeam}
            creatorType={creatorType}
            setCreatorType={setCreatorType}
            errors={errors}
          />
          
          {/* Profile Picture - Right */}
          <div className="flex items-center justify-center">
            <ProfilePicture 
              profileImage={profileImage}
              name={name || "New Creator"}
              setProfileImage={setProfileImage}
            />
          </div>
        </div>
        
        {/* Additional Notes Section */}
        <NotesSection notes={notes} setNotes={setNotes} />
        
        {/* Contact Information and Social Media Links Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Contact Information */}
          <ContactInfoSection
            telegramUsername={telegramUsername}
            setTelegramUsername={setTelegramUsername}
            whatsappNumber={whatsappNumber}
            setWhatsappNumber={setWhatsappNumber}
            errors={errors}
          />
          
          {/* Social Media Links */}
          <SocialLinksSection
            instagram={instagram}
            setInstagram={setInstagram}
            tiktok={tiktok}
            setTiktok={setTiktok}
            twitter={twitter}
            setTwitter={setTwitter}
            reddit={reddit}
            setReddit={setReddit}
            errors={errors}
          />
        </div>
        
        <div className="mt-4 mb-2 text-sm text-gray-400">
          <span className="text-red-500">*</span> Required fields
        </div>
        
        <Button 
          onClick={handleSubmit} 
          variant="premium"
          className="w-full mt-4 shadow-premium-yellow"
        >
          Submit
        </Button>
      </SheetContent>
    </Sheet>
  );
};

export default OnboardingModal;
