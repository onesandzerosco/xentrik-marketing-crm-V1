import React, { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useCreators } from "../context/CreatorContext";
import Sidebar from "../components/Sidebar";
import { Team, Gender, CreatorType } from "../types";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { BarChart2, Save, ArrowLeft } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { Badge } from "@/components/ui/badge";

// Import new component files
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
  const [isInactive, setIsInactive] = useState(false);
  const [needsReview, setNeedsReview] = useState(creator?.needsReview || false);

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
    return <div className="flex">
        <Sidebar />
        <div className="ml-60 p-8 w-full">
          <div className="text-center py-12">
            <h3 className="text-lg font-medium mb-2">Creator not found</h3>
            <p className="text-muted-foreground mb-4">The creator you're looking for doesn't exist</p>
            <Link to="/creators">
              <Button>Return to creators</Button>
            </Link>
          </div>
        </div>
      </div>;
  }

  return <div className="flex">
      <Sidebar />
      <div className="ml-60 p-8 w-full">
        <Link to="/creators" className="inline-flex items-center text-muted-foreground hover:text-foreground mb-6">
          <Button variant="ghost" className="h-8 px-2 gap-1">
            <ArrowLeft className="h-4 w-4" />
            Back to Creators
          </Button>
        </Link>

        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">{creator.name}'s Profile</h1>
            <div className="flex gap-2">
              <Badge variant="outline">{creator.gender}</Badge>
              <Badge variant="outline">{creator.team}</Badge>
              <Badge variant="outline">{creator.creatorType}</Badge>
              {needsReview && <Badge variant="outline" className="bg-red-900/40 text-red-200">Needs Review</Badge>}
            </div>
          </div>
          <div className="flex gap-3">
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
              isInactive={isInactive}
              setIsInactive={setIsInactive}
              needsReview={needsReview}
              setNeedsReview={setNeedsReview}
            />
          </div>
        </div>
      </div>
    </div>;
};

export default CreatorProfile;
