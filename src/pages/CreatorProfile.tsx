
import React, { useState } from "react";
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
import ProfilePicture from "../components/profile/ProfilePicture";
import ActionsPanel from "../components/profile/ActionsPanel";

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

  const handleSave = () => {
    setNameError(null);
    
    if (!name.trim()) {
      setNameError("Creator name is required");
      setTimeout(() => setNameError(null), 3000);
      return;
    }

    if (!creator) return;
    
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
      needsReview: needsReview
    });
    
    toast({
      title: "Profile Updated",
      description: "Creator profile has been successfully updated"
    });
  };

  if (!creator) {
    return <div className="p-8 w-full">
          <div className="text-center py-12">
            <h3 className="text-lg font-medium mb-2">Creator not found</h3>
            <p className="text-muted-foreground mb-4">The creator you're looking for doesn't exist</p>
            <Link to="/creators">
              <Button>Return to creators</Button>
            </Link>
          </div>
        </div>;
  }

  return <div className="p-8 w-full">
        <Link to="/creators" className="inline-flex items-center text-muted-foreground hover:text-foreground mb-6">
          <Button variant="ghost" className="h-8 px-2 gap-1">
            <ArrowLeft className="h-4 w-4" />
            Back to Creators
          </Button>
        </Link>

        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">{creator.name}'s Profile</h1>
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline">{creator.gender}</Badge>
              {creator.creatorType === "AI" && (
                <Badge variant="outline" className="bg-gray-100/10 text-gray-100">AI</Badge>
              )}
              <Badge variant="outline">{creator.team}</Badge>
              {needsReview && <Badge variant="outline" className="bg-red-900/40 text-red-200">Needs Review</Badge>}
            </div>
          </div>
          <div className="flex gap-3">
            <Button 
              variant="outline" 
              size="icon" 
              className="h-10 w-10"
              onClick={() => setStorageDialogOpen(true)}
              title="Check Storage Usage"
            >
              <Database className="h-4 w-4" />
            </Button>
            <Link to={`/creators/${creator.id}/analytics`}>
              <Button variant="outline">
                <BarChart2 className="h-4 w-4 mr-2" />
                Analytics
              </Button>
            </Link>
            <Button onClick={handleSave} className="bg-brand text-black hover:bg-brand/80">
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
            />
            
            <EngagementStats creatorId={creator.id} stats={stats} />
          </div>
          
          <div className="space-y-6">
            <ProfilePicture 
              profileImage={profileImage}
              name={name}
              setProfileImage={setProfileImage}
            />
            
            <ActionsPanel 
              needsReview={needsReview}
              setNeedsReview={setNeedsReview}
            />
          </div>
        </div>
      </div>;
};

export default CreatorProfile;
