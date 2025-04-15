import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useCreators } from "../context/CreatorContext";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Save, Send } from "lucide-react";
import { Gender, Team, CreatorType } from "../types";
import ProfilePicture from "../components/profile/ProfilePicture";
import TeamMemberSelectionDialog from "../components/creators/TeamMemberSelectionDialog";
import OnboardingForm, { OnboardingFormValues } from "../components/creators/onboarding/OnboardingForm";

const CreatorOnboarding = () => {
  const navigate = useNavigate();
  const { addCreator } = useCreators();
  const { toast } = useToast();
  const [profileImage, setProfileImage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showTeamMemberDialog, setShowTeamMemberDialog] = useState(false);
  const [selectedTeamMembers, setSelectedTeamMembers] = useState<string[]>([]);

  const handleSubmit = async (values: OnboardingFormValues) => {
    setIsSubmitting(true);
    
    try {
      const newCreator = {
        name: values.name,
        email: values.email,
        profileImage,
        gender: values.gender as Gender,
        team: values.team as Team,
        creatorType: values.creatorType as CreatorType,
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
      
      const creatorId = await addCreator(newCreator);
      
      toast({
        title: "Creator Onboarded Successfully",
        description: selectedTeamMembers.length > 0 
          ? "The creator has been added and the Telegram group is being set up."
          : "The creator profile has been created successfully.",
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
    <div className="min-h-screen bg-[#141428]">
      <div className="container max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3 mb-6">
          <Link to="/creators">
            <Button variant="ghost" size="icon" className="rounded-full">
              <ArrowLeft className="h-5 w-5" />
              <span className="sr-only">Back to Creators</span>
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
              <div className="rounded-2xl bg-gradient-to-br from-[#1a1a33]/50 to-[#1a1a33]/30 backdrop-blur-sm p-6 border border-[#252538]/50 shadow-lg">
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
            
            <div className="flex justify-end gap-3 mt-6">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => navigate("/creators")}
              >
                Cancel
              </Button>
              
              <Button 
                type="submit"
                onClick={() => handleSubmit}
                variant="outline"
              >
                <Save className="h-4 w-4 mr-2" />
                Create Profile Only
              </Button>
              
              <Button 
                type="button"
                onClick={() => setShowTeamMemberDialog(true)}
                className="bg-brand-yellow text-black hover:bg-brand-highlight"
              >
                <Send className="h-4 w-4 mr-2" />
                Create & Setup Telegram
              </Button>
            </div>
          </div>
        </div>

        <TeamMemberSelectionDialog
          open={showTeamMemberDialog}
          onOpenChange={setShowTeamMemberDialog}
          onConfirm={(members) => {
            setSelectedTeamMembers(members);
            handleSubmit;
          }}
          teamMembers={[]}
        />
      </div>
    </div>
  );
};

export default CreatorOnboarding;
