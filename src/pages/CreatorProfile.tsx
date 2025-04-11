
import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useCreators } from "../context/CreatorContext";
import { Team, Gender, CreatorType } from "../types";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { BarChart2, Save, ArrowLeft, Database } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { Badge } from "@/components/ui/badge";
import StorageUsageDialog from "@/components/storage/StorageUsageDialog";
import BasicInformation from "../components/profile/BasicInformation";
import SocialLinks from "../components/profile/SocialLinks";
import EngagementStats from "../components/profile/EngagementStats";
import AssignedTeamMembers from "../components/profile/AssignedTeamMembers";
import ProfilePicture from "../components/profile/ProfilePicture";
import ActionsPanel from "../components/profile/ActionsPanel";
import { Employee } from "@/types/employee";

const CreatorProfile = () => {
  const { id } = useParams<{ id: string }>();
  const { getCreator, updateCreator, getCreatorStats } = useCreators();
  const { toast } = useToast();
  const creator = getCreator(id!);
  const stats = getCreatorStats(id!);
  const [name, setName] = useState(creator?.name || "");
  const [nameError, setNameError] = useState<string | null>(null);
  const [gender, setGender] = useState<Gender>(creator?.gender || "Male");
  const [team, setTeam] = useState<Team>(creator?.team || "A Team");
  const [creatorType, setCreatorType] = useState<CreatorType>(creator?.creatorType || "Real");
  const [profileImage, setProfileImage] = useState(creator?.profileImage || "");
  const [instagram, setInstagram] = useState(creator?.socialLinks.instagram || "");
  const [tiktok, setTiktok] = useState(creator?.socialLinks.tiktok || "");
  const [twitter, setTwitter] = useState(creator?.socialLinks.twitter || "");
  const [reddit, setReddit] = useState(creator?.socialLinks.reddit || "");
  const [chaturbate, setChaturbate] = useState(creator?.socialLinks.chaturbate || "");
  const [needsReview, setNeedsReview] = useState(creator?.needsReview || false);
  const [storageDialogOpen, setStorageDialogOpen] = useState(false);
  const [assignedMembers, setAssignedMembers] = useState<Employee[]>([]);

  // Load assigned team members when the creator loads
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
    
    // Get the IDs of assigned team members
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
      needsReview: needsReview,
      assignedTeamMembers: assignedTeamMembers
    });
    
    toast({
      title: "Profile Updated",
      description: "Creator profile has been successfully updated"
    });
  };

  // Function to handle team member assignments from ActionsPanel
  const handleAssignTeamMembers = (members: Employee[]) => {
    setAssignedMembers(members);
    
    // Immediately save the changes to ensure persistence
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
      <div className="flex items-center gap-3 mb-8">
        <Link to="/creators">
          <Button 
            variant="ghost" 
            size="icon" 
            className="rounded-full hover:bg-secondary/20"
          >
            <ArrowLeft className="h-5 w-5" />
            <span className="sr-only">Back to Creators</span>
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">{creator?.name}'s Profile</h1>
          <div className="flex flex-wrap gap-2 mt-1">
            <Badge variant="outline">{creator?.gender}</Badge>
            {creator?.creatorType === "AI" && <Badge variant="outline" className="bg-gray-100/10 text-gray-100">AI</Badge>}
            <Badge variant="outline">{creator?.team}</Badge>
            {needsReview && <Badge variant="outline" className="bg-red-900/40 text-red-200">Needs Review</Badge>}
          </div>
        </div>
        <div className="flex gap-3 ml-auto">
          <Button variant="outline" size="icon" className="h-10 w-10" onClick={() => setStorageDialogOpen(true)} title="Check Storage Usage">
            <Database className="h-4 w-4" />
          </Button>
          <Link to={`/creators/${creator?.id}/analytics`}>
            <Button variant="outline">
              <BarChart2 className="h-4 w-4 mr-2" />
              Analytics
            </Button>
          </Link>
          <Button 
            onClick={handleSave} 
            className="text-black rounded-[15px] px-3 py-2 transition-all hover:bg-gradient-premium-yellow hover:text-black hover:-translate-y-0.5 hover:shadow-premium-yellow hover:opacity-90 bg-gradient-premium-yellow shadow-premium-yellow"
            variant="default"
          >
            <Save className="h-4 w-4 mr-2" />
            Save Changes
          </Button>
        </div>
      </div>

      <StorageUsageDialog open={storageDialogOpen} onOpenChange={setStorageDialogOpen} />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-6">
          <BasicInformation 
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
          />
          
          <SocialLinks 
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
            creatorId={creator?.id}
          />
          
          <AssignedTeamMembers members={assignedMembers} />
          
          <EngagementStats creatorId={creator?.id} stats={stats} />
        </div>
        
        <div className="space-y-6">
          <ProfilePicture profileImage={profileImage} name={name} setProfileImage={setProfileImage} />
          
          <ActionsPanel 
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
