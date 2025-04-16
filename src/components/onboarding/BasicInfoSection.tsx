
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
  errors: {
    name?: string;
    gender?: string;
    team?: string;
    creatorType?: string;
  };
}

const BasicInfoSection: React.FC<BasicInfoSectionProps> = ({
  name,
  setName,
  gender,
  setGender,
  team,
  setTeam,
  creatorType,
  setCreatorType,
  errors = {}
}) => {
  return (
    <div className="space-y-4 flex-1">
      <h2 className="text-xl font-bold">Basic Information</h2>
      <div className="grid grid-cols-1 gap-4">
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="name" className="text-right flex items-center">
            Name <span className="text-red-500 ml-1">*</span>
          </Label>
          <Input 
            id="name" 
            value={name} 
            onChange={(e) => setName(e.target.value)} 
            className={`col-span-3 ${errors.name ? "border-red-500" : ""}`} 
            placeholder="Enter creator name"
            required
          />
          {errors.name && (
            <div className="col-span-3 col-start-2">
              <p className="text-red-500 text-sm">{errors.name}</p>
            </div>
          )}
        </div>
        
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="gender" className="text-right flex items-center">
            Gender <span className="text-red-500 ml-1">*</span>
          </Label>
          <Select 
            onValueChange={(value) => setGender(value as Gender)} 
            value={gender}
            required
          >
            <SelectTrigger className={`col-span-3 ${errors.gender ? "border-red-500" : ""}`}>
              <SelectValue placeholder="Select gender" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Male">Male</SelectItem>
              <SelectItem value="Female">Female</SelectItem>
              <SelectItem value="Trans">Trans</SelectItem>
              <SelectItem value="AI">AI</SelectItem>
            </SelectContent>
          </Select>
          {errors.gender && (
            <div className="col-span-3 col-start-2">
              <p className="text-red-500 text-sm">{errors.gender}</p>
            </div>
          )}
        </div>
        
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="team" className="text-right flex items-center">
            Team <span className="text-red-500 ml-1">*</span>
          </Label>
          <Select 
            onValueChange={(value) => setTeam(value as Team)} 
            value={team}
            required
          >
            <SelectTrigger className={`col-span-3 ${errors.team ? "border-red-500" : ""}`}>
              <SelectValue placeholder="Select team" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="A Team">A Team</SelectItem>
              <SelectItem value="B Team">B Team</SelectItem>
              <SelectItem value="C Team">C Team</SelectItem>
            </SelectContent>
          </Select>
          {errors.team && (
            <div className="col-span-3 col-start-2">
              <p className="text-red-500 text-sm">{errors.team}</p>
            </div>
          )}
        </div>
        
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="creatorType" className="text-right flex items-center">
            Creator Type <span className="text-red-500 ml-1">*</span>
          </Label>
          <Select 
            onValueChange={(value) => setCreatorType(value as CreatorType)} 
            value={creatorType}
            required
          >
            <SelectTrigger className={`col-span-3 ${errors.creatorType ? "border-red-500" : ""}`}>
              <SelectValue placeholder="Select creator type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Real">Real</SelectItem>
              <SelectItem value="AI">AI</SelectItem>
            </SelectContent>
          </Select>
          {errors.creatorType && (
            <div className="col-span-3 col-start-2">
              <p className="text-red-500 text-sm">{errors.creatorType}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BasicInfoSection;
