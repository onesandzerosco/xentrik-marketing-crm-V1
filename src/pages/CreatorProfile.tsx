
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useCreatorProfile } from "@/hooks/useCreatorProfile";
import CreatorHeader from "@/components/creators/shared/CreatorHeader";
import OnboardingFormSections from "@/components/creators/onboarding/OnboardingFormSections";
import CreatorNotFound from "@/components/creators/profile/CreatorNotFound";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";

const CreatorProfile = () => {
  const { id } = useParams<{ id: string }>();
  const [isLoading, setIsLoading] = useState(true);
  const {
    creator,
    formState,
    formActions,
    handleSave,
    handleAssignTeamMembers
  } = useCreatorProfile(id!);
  const { userRole, isCreator, isCreatorSelf } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Check if the user has permission to edit this creator profile
  const isAdmin = userRole === "Admin";
  const hasPermission = isAdmin || (isCreator && isCreatorSelf);
  
  useEffect(() => {
    // Set loading to false once creator data is available or after a short timeout
    if (creator) {
      setIsLoading(false);
    } else {
      const timer = setTimeout(() => setIsLoading(false), 1500);
      return () => clearTimeout(timer);
    }
  }, [creator]);
  
  useEffect(() => {
    // If user doesn't have permission, redirect them to the creators list
    if (!hasPermission && !isLoading) {
      toast({
        title: "Access denied",
        description: "You don't have permission to edit creator profiles",
        variant: "destructive"
      });
      navigate('/creators');
    }
  }, [hasPermission, navigate, isLoading, toast]);

  if (!creator) {
    return <CreatorNotFound />;
  }
  
  // If still checking permissions, don't render anything yet
  if (!hasPermission && !isLoading) {
    return null;
  }

  return (
    <div className="p-8 w-full min-h-screen bg-background">
      <CreatorHeader
        title={`${creator.modelName || creator.name}'s Profile`}
        onSave={handleSave}
        badges={{
          gender: creator.gender,
          team: creator.team,
          creatorType: creator.creatorType,
          needsReview: formState.needsReview
        }}
        showAnalytics={true}
        creatorId={creator.id}
      />

      <div className="space-y-8 max-w-7xl mx-auto">
        {/* Form Sections - Matching Onboarding Layout */}
        <OnboardingFormSections
          name={formState.name}
          setName={formActions.setName}
          profileImage={formState.profileImage}
          setProfileImage={formActions.setProfileImage}
          gender={formState.gender}
          setGender={formActions.setGender}
          team={formState.team}
          setTeam={formActions.setTeam}
          creatorType={formState.creatorType}
          setCreatorType={formActions.setCreatorType}
          telegramUsername={formState.telegramUsername}
          setTelegramUsername={formActions.setTelegramUsername}
          whatsappNumber={formState.whatsappNumber}
          setWhatsappNumber={formActions.setWhatsappNumber}
          instagram={formState.instagram}
          setInstagram={formActions.setInstagram}
          tiktok={formState.tiktok}
          setTiktok={formActions.setTiktok}
          twitter={formState.twitter}
          setTwitter={formActions.setTwitter}
          reddit={formState.reddit}
          setReddit={formActions.setReddit}
          chaturbate={formState.chaturbate}
          setChaturbate={formActions.setChaturbate}
          youtube={formState.youtube}
          setYoutube={formActions.setYoutube}
          customSocialLinks={formState.customSocialLinks}
          setCustomSocialLinks={formActions.setCustomSocialLinks}
          notes={formState.notes}
          setNotes={formActions.setNotes}
          marketingStrategy={formState.marketingStrategy}
          setMarketingStrategy={formActions.setMarketingStrategy}
          errors={formState.errors}
        />
      </div>
    </div>
  );
};

export default CreatorProfile;
