
import React from "react";
import { Card } from "@/components/ui/card";
import BasicInformation from "./BasicInformation";
import SocialLinks from "./SocialLinks";
import ProfileStats from "./ProfileStats";
import AssignedTeamMembers from "./AssignedTeamMembers";
import { Employee } from "@/types/employee";
import { Gender, Team, CreatorType, EngagementStats } from "@/types";

interface ProfileContentProps {
  name: string;
  setName: (name: string) => void;
  nameError: string | null;
  setNameError: (error: string | null) => void;
  gender: Gender;
  setGender: (gender: Gender) => void;
  team: Team;
  setTeam: (team: Team) => void;
  creatorType: CreatorType;
  setCreatorType: (type: CreatorType) => void;
  instagram: string;
  setInstagram: (value: string) => void;
  tiktok: string;
  setTiktok: (value: string) => void;
  twitter: string;
  setTwitter: (value: string) => void;
  reddit: string;
  setReddit: (value: string) => void;
  chaturbate: string;
  setChaturbate: (value: string) => void;
  youtube: string;
  setYoutube: (value: string) => void;
  assignedMembers: Employee[];
  creatorId: string;
  stats?: EngagementStats;
}

const ProfileContent: React.FC<ProfileContentProps> = ({
  name,
  setName,
  nameError,
  setNameError,
  gender,
  setGender,
  team,
  setTeam,
  creatorType,
  setCreatorType,
  instagram,
  setInstagram,
  tiktok,
  setTiktok,
  twitter,
  setTwitter,
  reddit,
  setReddit,
  chaturbate,
  setChaturbate,
  youtube,
  setYoutube,
  assignedMembers,
  creatorId,
  stats,
}) => {
  return (
    <div className="space-y-6">
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
        youtube={youtube}
        setYoutube={setYoutube}
        creatorId={creatorId}
      />

      <AssignedTeamMembers members={assignedMembers} />

      <ProfileStats creatorId={creatorId} stats={stats} />
    </div>
  );
};

export default ProfileContent;
