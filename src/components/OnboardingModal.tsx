
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
  
  const { addCreator } = useCreators();
  const { toast } = useToast();

  const handleSubmit = () => {
    if (name.trim() === "") {
      toast({
        title: "Error",
        description: "Creator name is required.",
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
          />
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
