import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Gender, Team, CreatorType } from "@/types";

interface BasicInformationProps {
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
}

const BasicInformation: React.FC<BasicInformationProps> = ({
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
}) => {
  return (
    <div className="bg-card rounded-xl p-6 shadow-sm">
      <h2 className="text-xl font-bold mb-4">Basic Information</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <Label htmlFor="name" className={nameError ? "text-red-500" : ""}>Creator Name</Label>
          <Input 
            id="name" 
            value={name} 
            onChange={e => {
              setName(e.target.value);
              if (nameError) setNameError(null);
            }} 
            className={nameError ? "border-red-500 focus-visible:ring-red-500" : ""}
          />
          {nameError && (
            <p className="text-red-500 text-sm mt-1">{nameError}</p>
          )}
        </div>
        
        <div>
          <Label htmlFor="gender">Gender</Label>
          <Select value={gender} onValueChange={(value: Gender) => setGender(value)}>
            <SelectTrigger id="gender">
              <SelectValue placeholder="Select gender" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Male">Male</SelectItem>
              <SelectItem value="Female">Female</SelectItem>
              <SelectItem value="Trans">Trans</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <Label htmlFor="creatorType">Creator Type</Label>
          <Select value={creatorType} onValueChange={(value: CreatorType) => setCreatorType(value)}>
            <SelectTrigger id="creatorType">
              <SelectValue placeholder="Select creator type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Real">Real</SelectItem>
              <SelectItem value="AI">AI</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <Label htmlFor="team">Team</Label>
          <Select value={team} onValueChange={(value: Team) => setTeam(value)}>
            <SelectTrigger id="team">
              <SelectValue placeholder="Select team" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="A Team">A Team</SelectItem>
              <SelectItem value="B Team">B Team</SelectItem>
              <SelectItem value="C Team">C Team</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
};

export default BasicInformation;
