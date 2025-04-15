import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useCreators } from "../context/CreatorContext";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import StorageUsageDialog from "@/components/storage/StorageUsageDialog";
import ProfilePicture from "../components/profile/ProfilePicture";
import ProfileContent from "../components/profile/ProfileContent";
import ProfileActions from "../components/profile/ProfileActions";
import CreatorHeader from "@/components/creators/shared/CreatorHeader";
import { Employee } from "@/types/employee";

const CreatorProfile = () => {
  const { id } = useParams<{ id: string }>();
  const { getCreator, updateCreator, getCreatorStats } = useCreators();
  const { toast } = useToast();
  const creator = getCreator(id!);
  const stats = getCreatorStats(id!);
  const [name, setName] = useState(creator?.name || "");
  const [nameError, setNameError] = useState<string | null>(null);
  const [gender, setGender] = useState(creator?.gender || "Male");
  const [team, setTeam] = useState(creator?.team || "A Team");
  const [creatorType, setCreatorType] = useState(creator?.creatorType || "Real");
  const [profileImage, setProfileImage] = useState(creator?.profileImage || "");
  const [instagram, setInstagram] = useState(creator?.socialLinks.instagram || "");
  const [tiktok, setTiktok] = useState(creator?.socialLinks.tiktok || "");
  const [twitter, setTwitter] = useState(creator?.socialLinks.twitter || "");
  const [reddit, setReddit] = useState(creator?.socialLinks.reddit || "");
  const [chaturbate, setChaturbate] = useState(creator?.socialLinks.chaturbate || "");
  const [needsReview, setNeedsReview] = useState(creator?.needsReview || false);
  const [storageDialogOpen, setStorageDialogOpen] = useState(false);
  const [assignedMembers, setAssignedMembers] = useState<Employee[]>([]);

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

  const handleSave = () => {
    setNameError(null);
    if (!name.trim()) {
      setNameError("Creator name is required");
      setTimeout(() => setNameError(null), 3000);
      return;
    }
    if (!creator) return;
    
    const assignedTeamMembers = assignedMembers.map(member => member.id);
    
    updateCreator(creator.id, {
      name,
      gender,
      team,
      creatorType,
      profileImage,
      socialLinks: {
        instagram: instagram || undefined,
        tiktok: tiktok || undefined,
        twitter: twitter || undefined,
        reddit: reddit || undefined,
        chaturbate: chaturbate || undefined
      },
      tags: [gender, team, creatorType],
      needsReview,
      assignedTeamMembers
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
        showAnalytics
      />

      <StorageUsageDialog open={storageDialogOpen} onOpenChange={setStorageDialogOpen} />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2">
          <ProfileContent
            name={name}
            setName={setName}
            nameError={nameError}
            setNameError={setNameError}
            gender={gender}
            setGender={setGender}
            team={team}
            setTeam={setTeam}
            creatorType={creatorType}
            setCreatorType={setCreatorType}
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
            assignedMembers={assignedMembers}
            creatorId={creator.id}
            stats={stats}
          />
        </div>
        
        <div className="space-y-6">
          <ProfilePicture
            profileImage={profileImage}
            name={name}
            setProfileImage={setProfileImage}
          />
          
          <ProfileActions
            needsReview={needsReview}
            setNeedsReview={setNeedsReview}
            creatorId={creator.id}
            assignedMembers={assignedMembers}
            onAssignMembers={handleAssignTeamMembers}
          />
        </div>
      </div>
    </div>
  );
};

export default CreatorProfile;
