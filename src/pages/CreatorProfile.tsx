
import React, { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useCreatorProfile } from "@/hooks/useCreatorProfile";
import CreatorHeader from "@/components/creators/shared/CreatorHeader";
import ProfileActions from "@/components/profile/ProfileActions";
import OnboardingFormSections from "@/components/creators/onboarding/OnboardingFormSections";
import CreatorNotFound from "@/components/creators/profile/CreatorNotFound";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";

const CreatorProfile = () => {
  const { id } = useParams<{ id: string }>();
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
    // If user doesn't have permission, redirect them to the creators list
    if (!hasPermission && !formState.isLoading) {
      toast({
        title: "Access denied",
        description: "You don't have permission to edit creator profiles",
        variant: "destructive"
      });
      navigate('/creators');
    }
  }, [hasPermission, navigate, formState.isLoading, toast]);

  if (!creator) {
    return <CreatorNotFound />;
  }
  
  // If still checking permissions, don't render anything yet
  if (!hasPermission && !formState.isLoading) {
    return null;
  }

  return (
    <div className="p-8 w-full min-h-screen bg-background">
      <CreatorHeader
        title={`${creator.name}'s Profile`}
        onSave={handleSave}
        badges={{
          gender: creator.gender,
          team: creator.team,
          creatorType: creator.creatorType,
          needsReview: formState.needsReview
        }}
        showAnalytics={false}
      />

      <div className="space-y-8 max-w-7xl mx-auto">
        {/* Actions Section - As the first row */}
        <div className="bg-[#1a1a33]/50 backdrop-blur-sm p-6 rounded-xl border border-[#252538]/50">
          <ProfileActions
            needsReview={formState.needsReview}
            setNeedsReview={formActions.setNeedsReview}
            creatorId={creator.id}
            creatorName={creator.name}
            assignedMembers={formState.assignedMembers}
            onAssignMembers={handleAssignTeamMembers}
          />
        </div>

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
          errors={formState.errors}
        />
      </div>
    </div>
  );
};

export default CreatorProfile;
