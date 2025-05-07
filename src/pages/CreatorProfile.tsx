
import React, { useEffect, useState } from "react";
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
  const [isLoading, setIsLoading] = useState(true);
  const {
    creator,
    state,
    actions,
    handleSave,
    isSaving,
    handleAssignTeamMembers,
    assignedMembers
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
        title={`${creator.name}'s Profile`}
        onSave={handleSave}
        badges={{
          gender: creator.gender,
          team: creator.team,
          creatorType: creator.creatorType,
          needsReview: state.needsReview
        }}
        showAnalytics={false}
      />

      <div className="space-y-8 max-w-7xl mx-auto">
        {/* Actions Section - As the first row */}
        <div className="bg-[#1a1a33]/50 backdrop-blur-sm p-6 rounded-xl border border-[#252538]/50">
          <ProfileActions
            needsReview={state.needsReview}
            setNeedsReview={actions.setNeedsReview}
            creatorId={creator.id}
            creatorName={creator.name}
            assignedMembers={assignedMembers}
            onAssignMembers={handleAssignTeamMembers}
          />
        </div>

        {/* Form Sections - Matching Onboarding Layout */}
        <OnboardingFormSections
          name={state.name}
          setName={actions.setName}
          profileImage={state.profileImage}
          setProfileImage={actions.setProfileImage}
          gender={state.gender}
          setGender={actions.setGender}
          team={state.team}
          setTeam={actions.setTeam}
          creatorType={state.creatorType}
          setCreatorType={actions.setCreatorType}
          telegramUsername={state.telegramUsername}
          setTelegramUsername={actions.setTelegramUsername}
          whatsappNumber={state.whatsappNumber}
          setWhatsappNumber={actions.setWhatsappNumber}
          instagram={state.instagram}
          setInstagram={actions.setInstagram}
          tiktok={state.tiktok}
          setTiktok={actions.setTiktok}
          twitter={state.twitter}
          setTwitter={actions.setTwitter}
          reddit={state.reddit}
          setReddit={actions.setReddit}
          chaturbate={state.chaturbate}
          setChaturbate={actions.setChaturbate}
          youtube={state.youtube}
          setYoutube={actions.setYoutube}
          customSocialLinks={state.customSocialLinks}
          setCustomSocialLinks={actions.setCustomSocialLinks}
          notes={state.notes}
          setNotes={actions.setNotes}
          errors={state.errors}
        />
      </div>
    </div>
  );
};

export default CreatorProfile;
