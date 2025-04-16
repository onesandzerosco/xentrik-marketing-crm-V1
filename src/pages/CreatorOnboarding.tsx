
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCreators } from "../context/creator";
import { useToast } from "@/hooks/use-toast";
import ProfilePicture from "../components/profile/ProfilePicture";
import BasicInfoSection from "../components/onboarding/BasicInfoSection";
import ContactInfoSection from "../components/onboarding/ContactInfoSection";
import SocialLinksSection from "../components/onboarding/SocialLinksSection";
import NotesSection from "../components/onboarding/NotesSection";
import { Button } from "@/components/ui/button";
import { Save } from "lucide-react";
import { Gender, Team, CreatorType } from "@/types";

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

const CreatorOnboarding = () => {
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

  return (
    <div className="min-h-screen bg-[#141428] p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-white">Onboard New Creator</h1>
          <Button 
            onClick={handleSubmit}
            disabled={isSubmitting}
            variant="premium"
            className="rounded-[15px] px-4 py-2 flex items-center"
          >
            <Save className="h-4 w-4 mr-2" />
            {isSubmitting ? "Saving..." : "Save Creator"}
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left Column: Profile Picture */}
          <div className="lg:col-span-1">
            <div className="sticky top-4">
              <div className="bg-[#1a1a33]/50 backdrop-blur-sm p-6 rounded-xl border border-[#252538]/50">
                <ProfilePicture
                  profileImage={profileImage}
                  name={name || "New Creator"}
                  setProfileImage={setProfileImage}
                />
              </div>
            </div>
          </div>

          {/* Right Column: Creator Information Form */}
          <div className="lg:col-span-3 space-y-6">
            {/* Basic Information */}
            <div className="bg-[#1a1a33]/50 backdrop-blur-sm p-6 rounded-xl border border-[#252538]/50">
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
            </div>

            {/* Notes Section */}
            <div className="bg-[#1a1a33]/50 backdrop-blur-sm p-6 rounded-xl border border-[#252538]/50">
              <NotesSection 
                notes={notes}
                setNotes={setNotes}
              />
            </div>

            {/* Contact Info and Social Links Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Contact Information */}
              <div className="bg-[#1a1a33]/50 backdrop-blur-sm p-6 rounded-xl border border-[#252538]/50">
                <ContactInfoSection
                  telegramUsername={telegramUsername}
                  setTelegramUsername={setTelegramUsername}
                  whatsappNumber={whatsappNumber}
                  setWhatsappNumber={setWhatsappNumber}
                  errors={errors}
                />
              </div>
              
              {/* Social Media Links */}
              <div className="bg-[#1a1a33]/50 backdrop-blur-sm p-6 rounded-xl border border-[#252538]/50">
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
            </div>
            
            <div className="mt-4 mb-8 text-sm text-gray-400">
              <span className="text-red-500">*</span> Required fields
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreatorOnboarding;
