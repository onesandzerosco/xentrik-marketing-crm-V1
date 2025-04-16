
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
import { useCreators } from "../context/creator";
import { useToast } from "@/components/ui/use-toast";
import ProfilePicture from "../components/profile/ProfilePicture";

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
      <SheetContent className="overflow-y-auto">
        <SheetHeader className="mb-4">
          <SheetTitle>Onboard New Creator</SheetTitle>
          <SheetDescription>
            Fill in the details to add a new creator to the platform.
          </SheetDescription>
        </SheetHeader>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Form Fields - Left Side */}
          <div className="md:col-span-2 space-y-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Name
              </Label>
              <Input 
                id="name" 
                value={name} 
                onChange={(e) => setName(e.target.value)} 
                className="col-span-3" 
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
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Real">Real</SelectItem>
                  <SelectItem value="AI">AI</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          {/* Profile Picture - Right Side */}
          <div className="flex items-center justify-center">
            <div className="w-full">
              <ProfilePicture 
                profileImage={profileImage}
                name={name || "New Creator"}
                setProfileImage={setProfileImage}
              />
            </div>
          </div>
        </div>
        
        <Button 
          onClick={handleSubmit} 
          variant="premium"
          className="w-full mt-8 shadow-premium-yellow"
        >
          Submit
        </Button>
      </SheetContent>
    </Sheet>
  );
};

export default OnboardingModal;
