
import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useCreators } from "../context/creator";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import OnboardingFormSections from "@/components/creators/onboarding/OnboardingFormSections";
import { CustomSocialLink } from "@/components/onboarding/social/CustomSocialLinkItem";
import CreatorHeader from "@/components/creators/shared/CreatorHeader";
import ProfileActions from "@/components/profile/ProfileActions";
import { Employee } from "@/types/employee";

const CreatorProfile = () => {
  const { id } = useParams<{ id: string }>();
  const { getCreator, updateCreator } = useCreators();
  const { toast } = useToast();
  const creator = getCreator(id!);
  
  const [name, setName] = useState(creator?.name || "");
  const [nameError, setNameError] = useState<string | null>(null);
  const [gender, setGender] = useState(creator?.gender || "Male");
  const [team, setTeam] = useState(creator?.team || "A Team");
  const [creatorType, setCreatorType] = useState(creator?.creatorType || "Real");
  const [profileImage, setProfileImage] = useState(creator?.profileImage || "");
  const [telegramUsername, setTelegramUsername] = useState(creator?.telegramUsername || "");
  const [whatsappNumber, setWhatsappNumber] = useState(creator?.whatsappNumber || "");
  const [instagram, setInstagram] = useState(creator?.socialLinks.instagram || "");
  const [tiktok, setTiktok] = useState(creator?.socialLinks.tiktok || "");
  const [twitter, setTwitter] = useState(creator?.socialLinks.twitter || "");
  const [reddit, setReddit] = useState(creator?.socialLinks.reddit || "");
  const [chaturbate, setChaturbate] = useState(creator?.socialLinks.chaturbate || "");
  const [youtube, setYoutube] = useState(creator?.socialLinks.youtube || "");
  const [customSocialLinks, setCustomSocialLinks] = useState<CustomSocialLink[]>([]);
  const [notes, setNotes] = useState(creator?.notes || "");
  const [needsReview, setNeedsReview] = useState(creator?.needsReview || false);
  const [assignedMembers, setAssignedMembers] = useState<Employee[]>([]);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (creator?.assignedTeamMembers && creator.assignedTeamMembers.length > 0) {
      try {
        const savedEmployees = localStorage.getItem('team_employees_data');
        if (savedEmployees) {
          const employeesData = JSON.parse(savedEmployees) as Employee[];
          const members = employeesData.filter(emp => 
            creator.assignedTeamMembers?.includes(emp.id)
          );
          setAssignedMembers(members);
        }
      } catch (error) {
        console.error("Error loading team members:", error);
      }
    } else {
      setAssignedMembers([]);
    }
  }, [creator]);

  // Extract custom social links from creator's socialLinks object
  useEffect(() => {
    if (creator?.socialLinks) {
      const standardLinks = ['instagram', 'tiktok', 'twitter', 'reddit', 'chaturbate', 'youtube'];
      const custom: CustomSocialLink[] = [];
      
      Object.entries(creator.socialLinks).forEach(([key, value]) => {
        if (!standardLinks.includes(key) && value) {
          custom.push({
            id: key,
            name: key.charAt(0).toUpperCase() + key.slice(1),
            url: value
          });
        }
      });
      
      setCustomSocialLinks(custom);
    }
  }, [creator]);

  const handleSave = () => {
    setNameError(null);
    if (!name.trim()) {
      setNameError("Creator name is required");
      setTimeout(() => setNameError(null), 3000);
      toast({
        title: "Error",
        description: "Creator name is required",
        variant: "destructive",
      });
      return;
    }
    
    if (!creator) return;
    
    const socialLinksObj: Record<string, string | undefined> = {
      instagram: instagram || undefined,
      tiktok: tiktok || undefined,
      twitter: twitter || undefined,
      reddit: reddit || undefined,
      chaturbate: chaturbate || undefined,
      youtube: youtube || undefined,
    };
    
    // Add custom social links
    customSocialLinks.forEach(link => {
      if (link.url) {
        socialLinksObj[link.name.toLowerCase()] = link.url;
      }
    });
    
    const assignedTeamMembers = assignedMembers.map(member => member.id);
    
    updateCreator(creator.id, {
      name,
      gender,
      team,
      creatorType,
      profileImage,
      telegramUsername: telegramUsername || undefined,
      whatsappNumber: whatsappNumber || undefined,
      socialLinks: socialLinksObj,
      tags: [gender, team, creatorType],
      needsReview,
      assignedTeamMembers,
      notes
    });
    
    toast({
      title: "Profile Updated",
      description: "Creator profile has been successfully updated"
    });
  };

  const handleAssignTeamMembers = (members: Employee[]) => {
    setAssignedMembers(members);
    if (creator) {
      const memberIds = members.map(member => member.id);
      updateCreator(creator.id, {
        assignedTeamMembers: memberIds
      });
      toast({
        title: "Team Members Assigned",
        description: `${members.length} team members assigned to ${creator.name}`
      });
    }
  };

  if (!creator) {
    return (
      <div className="p-8 w-full min-h-screen bg-background">
        <div className="text-center py-12">
          <h3 className="text-lg font-medium mb-2">Creator not found</h3>
          <p className="text-muted-foreground mb-4">The creator you're looking for doesn't exist</p>
          <Link to="/creators">
            <Button>Return to creators</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 w-full min-h-screen bg-background">
      <CreatorHeader
        title={`${creator?.name}'s Profile`}
        onSave={handleSave}
        badges={{
          gender: creator?.gender,
          team: creator?.team,
          creatorType: creator?.creatorType,
          needsReview
        }}
        showAnalytics={false}
      />

      <div className="space-y-8 max-w-7xl mx-auto">
        {/* Actions Section - Now as the first row */}
        <div className="bg-[#1a1a33]/50 backdrop-blur-sm p-6 rounded-xl border border-[#252538]/50">
          <ProfileActions
            needsReview={needsReview}
            setNeedsReview={setNeedsReview}
            creatorId={creator.id}
            assignedMembers={assignedMembers}
            onAssignMembers={handleAssignTeamMembers}
          />
        </div>

        {/* Form Sections - Matching Onboarding Layout */}
        <OnboardingFormSections
          name={name}
          setName={setName}
          profileImage={profileImage}
          setProfileImage={setProfileImage}
          gender={gender}
          setGender={setGender}
          team={team}
          setTeam={setTeam}
          creatorType={creatorType}
          setCreatorType={setCreatorType}
          telegramUsername={telegramUsername}
          setTelegramUsername={setTelegramUsername}
          whatsappNumber={whatsappNumber}
          setWhatsappNumber={setWhatsappNumber}
          instagram={instagram}
          setInstagram={setInstagram}
          tiktok={tiktok}
          setTiktok={setTiktok}
          twitter={twitter}
          setTwitter={setTwitter}
          reddit={reddit}
          setReddit={setReddit}
          chaturbate={chaturbate}
          setChaturbate={setChaturbate}
          youtube={youtube}
          setYoutube={setYoutube}
          customSocialLinks={customSocialLinks}
          setCustomSocialLinks={setCustomSocialLinks}
          notes={notes}
          setNotes={setNotes}
          errors={errors}
        />
      </div>
    </div>
  );
};

export default CreatorProfile;
