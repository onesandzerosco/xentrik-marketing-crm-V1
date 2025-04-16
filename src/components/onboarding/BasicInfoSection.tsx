
import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Gender, Team, CreatorType } from "@/types";

interface BasicInfoSectionProps {
  name: string;
  setName: (name: string) => void;
  gender: Gender;
  setGender: (gender: Gender) => void;
  team: Team;
  setTeam: (team: Team) => void;
  creatorType: CreatorType;
  setCreatorType: (type: CreatorType) => void;
}

const BasicInfoSection: React.FC<BasicInfoSectionProps> = ({
  name,
  setName,
  gender,
  setGender,
  team,
  setTeam,
  creatorType,
  setCreatorType
}) => {
  return (
    <div className="space-y-4 flex-1">
      <h2 className="text-xl font-bold">Basic Information</h2>
      <div className="grid grid-cols-1 gap-4">
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="name" className="text-right">
            Name
          </Label>
          <Input 
            id="name" 
            value={name} 
            onChange={(e) => setName(e.target.value)} 
            className="col-span-3" 
            placeholder="Enter creator name"
          />
        </div>
        
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="gender" className="text-right">
            Gender
          </Label>
          <Select onValueChange={(value) => setGender(value as Gender)} value={gender}>
            <SelectTrigger className="col-span-3">
              <SelectValue placeholder="Select gender" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Male">Male</SelectItem>
              <SelectItem value="Female">Female</SelectItem>
              <SelectItem value="Trans">Trans</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="team" className="text-right">
            Team
          </Label>
          <Select onValueChange={(value) => setTeam(value as Team)} value={team}>
            <SelectTrigger className="col-span-3">
              <SelectValue placeholder="Select team" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="A Team">A Team</SelectItem>
              <SelectItem value="B Team">B Team</SelectItem>
              <SelectItem value="C Team">C Team</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="creatorType" className="text-right">
            Creator Type
          </Label>
          <Select onValueChange={(value) => setCreatorType(value as CreatorType)} value={creatorType}>
            <SelectTrigger className="col-span-3">
              <SelectValue placeholder="Select creator type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Real">Real</SelectItem>
              <SelectItem value="AI">AI</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
};

export default BasicInfoSection;
