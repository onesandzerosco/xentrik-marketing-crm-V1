import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useCreators } from "../context/CreatorContext";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import ProfilePicture from "../components/profile/ProfilePicture";
import OnboardingForm, { OnboardingFormValues } from "../components/creators/onboarding/OnboardingForm";

const CreatorOnboarding = () => {
  const navigate = useNavigate();
  const { addCreator } = useCreators();
  const { toast } = useToast();
  const [profileImage, setProfileImage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (values: OnboardingFormValues) => {
    setIsSubmitting(true);
    
    try {
      const newCreator = {
        name: values.name,
        email: values.email,
        profileImage,
        gender: values.gender,
        team: values.team,
        creatorType: values.creatorType,
        socialLinks: {
          instagram: values.instagram || undefined,
          tiktok: values.tiktok || undefined,
          twitter: values.twitter || undefined,
          reddit: values.reddit || undefined,
          chaturbate: values.chaturbate || undefined,
        },
        tags: [values.gender, values.team, values.creatorType],
        needsReview: true,
        telegramUsername: values.telegramUsername,
        whatsappNumber: values.whatsappNumber,
        notes: values.notes,
      };
      
      await addCreator(newCreator);
      
      toast({
        title: "Creator Onboarded Successfully",
        description: "The creator profile has been created successfully.",
        variant: "default",
      });
      
      setTimeout(() => {
        navigate("/creators");
      }, 2000);
      
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
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <Link to="/creators">
            <Button variant="ghost" size="icon" className="rounded-full">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-white">Onboard New Creator</h1>
            <p className="text-muted-foreground">Fill in the details to add a new creator to the platform</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1">
            <div className="sticky top-4">
              <div className="bg-[#1a1a33]/50 backdrop-blur-sm p-6 rounded-xl border border-[#252538]/50">
                <ProfilePicture
                  profileImage={profileImage}
                  name="New Creator"
                  setProfileImage={setProfileImage}
                />
              </div>
            </div>
          </div>

          <div className="lg:col-span-3">
            <OnboardingForm onSubmit={handleSubmit} isSubmitting={isSubmitting} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreatorOnboarding;
