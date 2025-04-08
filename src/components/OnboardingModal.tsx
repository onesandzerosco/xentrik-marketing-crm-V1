import React, { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Gender, Team, CreatorType } from "../types";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCreators } from "../context/CreatorContext";
import { useToast } from "@/components/ui/use-toast";

interface OnboardingModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const OnboardingModal: React.FC<OnboardingModalProps> = ({ open, onOpenChange }) => {
  const [name, setName] = useState("");
  const [profileImage, setProfileImage] = useState("");
  const [gender, setGender] = useState<Gender>("Male");
  const [team, setTeam] = useState<Team>("A Team");
  const [creatorType, setCreatorType] = useState<CreatorType>("Real");
  const { addCreator } = useCreators();
  const { toast } = useToast();

  const handleSubmit = () => {
    if (name.trim() === "") {
      toast({
        title: "Error",
        description: "Creator name is required.",
        variant: "destructive",
      });
      return;
    }

    const newCreator = {
      name,
      profileImage,
      gender,
      team,
      creatorType,
      socialLinks: {},
      tags: [gender, team, creatorType],
      needsReview: true,
    };

    addCreator(newCreator);
    toast({
      title: "Success",
      description: `${name} onboarded successfully!`,
    });
    onOpenChange(false);
    clearForm();
  };

  const clearForm = () => {
    setName("");
    setProfileImage("");
    setGender("Male");
    setTeam("A Team");
    setCreatorType("Real");
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Onboard New Creator</SheetTitle>
          <SheetDescription>
            Fill in the details to add a new creator to the platform.
          </SheetDescription>
        </SheetHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Name
            </Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="image" className="text-right">
              Profile Image URL
            </Label>
            <Input
              id="image"
              value={profileImage}
              onChange={(e) => setProfileImage(e.target.value)}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="gender" className="text-right">
              Gender
            </Label>
            <Select onValueChange={(value) => setGender(value as Gender)}>
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
            <Select onValueChange={(value) => setTeam(value as Team)}>
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
            <Select onValueChange={(value) => setCreatorType(value as CreatorType)}>
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
        <Button onClick={handleSubmit}>Submit</Button>
      </SheetContent>
    </Sheet>
  );
};

export default OnboardingModal;
