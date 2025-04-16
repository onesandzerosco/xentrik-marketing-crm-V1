
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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

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
        
        {/* Basic Information + Profile Picture Row */}
        <div className="flex gap-6 mb-6">
          {/* Basic Information - Left */}
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
                <Label className="text-right">
                  Creator Type
                </Label>
                <div className="col-span-3">
                  <RadioGroup
                    defaultValue={creatorType}
                    value={creatorType}
                    onValueChange={(value) => setCreatorType(value as CreatorType)}
                    className="flex space-x-4"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="Real" id="creatorType-real" />
                      <Label htmlFor="creatorType-real">Real</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="AI" id="creatorType-ai" />
                      <Label htmlFor="creatorType-ai">AI</Label>
                    </div>
                  </RadioGroup>
                </div>
              </div>
            </div>
          </div>
          
          {/* Profile Picture - Right */}
          <div className="flex items-center justify-center">
            <ProfilePicture 
              profileImage={profileImage}
              name={name || "New Creator"}
              setProfileImage={setProfileImage}
            />
          </div>
        </div>
        
        {/* Additional Notes Section */}
        <div className="mb-6">
          <h2 className="text-xl font-bold mb-4">Additional Notes</h2>
          <textarea 
            className="w-full min-h-[100px] rounded-md border border-input bg-secondary/5 px-3 py-2 text-base"
            placeholder="Add any additional notes about this creator"
          />
        </div>
        
        {/* Contact Information and Social Media Links Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Contact Information */}
          <div className="space-y-4">
            <h2 className="text-xl font-bold">Contact Information</h2>
            <div className="space-y-4">
              <div>
                <Label htmlFor="telegramUsername">
                  Telegram Username
                </Label>
                <Input 
                  id="telegramUsername" 
                  placeholder="@username"
                />
              </div>
              <div>
                <Label htmlFor="whatsappNumber">
                  WhatsApp Number
                </Label>
                <Input 
                  id="whatsappNumber" 
                  placeholder="+1234567890"
                />
              </div>
            </div>
          </div>
          
          {/* Social Media Links */}
          <div className="space-y-4">
            <h2 className="text-xl font-bold">Social Media Links</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="instagram">
                  Instagram
                </Label>
                <Input 
                  id="instagram" 
                  placeholder="Username"
                />
              </div>
              <div>
                <Label htmlFor="tiktok">
                  TikTok
                </Label>
                <Input 
                  id="tiktok" 
                  placeholder="Username"
                />
              </div>
              <div>
                <Label htmlFor="twitter">
                  Twitter
                </Label>
                <Input 
                  id="twitter" 
                  placeholder="Username"
                />
              </div>
              <div>
                <Label htmlFor="reddit">
                  Reddit
                </Label>
                <Input 
                  id="reddit" 
                  placeholder="Username"
                />
              </div>
            </div>
          </div>
        </div>
        
        <Button 
          onClick={handleSubmit} 
          variant="premium"
          className="w-full mt-4 shadow-premium-yellow"
        >
          Submit
        </Button>
      </SheetContent>
    </Sheet>
  );
};

export default OnboardingModal;
