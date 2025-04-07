
import React, { useState } from "react";
import { useCreators } from "../context/CreatorContext";
import { useToast } from "@/components/ui/use-toast";
import { Team, Gender, CreatorType } from "../types";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Checkbox } from "@/components/ui/checkbox";

interface OnboardingModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const OnboardingModal: React.FC<OnboardingModalProps> = ({ open, onOpenChange }) => {
  const { addCreator } = useCreators();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [name, setName] = useState("");
  const [gender, setGender] = useState<Gender>("Male");
  const [creatorType, setCreatorType] = useState<CreatorType>("Real");
  const [team, setTeam] = useState<Team>("A Team");
  const [profileImage, setProfileImage] = useState("/avatar1.png"); // Default avatar
  const [instagram, setInstagram] = useState("");
  const [tiktok, setTiktok] = useState("");
  const [twitter, setTwitter] = useState("");
  const [reddit, setReddit] = useState("");
  const [chaturbate, setChaturbate] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  // Available tags
  const availableTags = ["OnlyFans", "New", "Fitness", "Gaming", "Cosplay"];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Create tags array from gender, team, creatorType and selected tags
    const tags = [gender, team, creatorType, ...selectedTags];

    // Simulate API call
    setTimeout(() => {
      addCreator({
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
          chaturbate: chaturbate || undefined,
        },
        tags,
      });

      toast({
        title: "Creator Added Successfully",
        description: "Creator has been added and is awaiting chat setup",
      });

      // Reset form
      setName("");
      setGender("Male");
      setCreatorType("Real");
      setTeam("A Team");
      setProfileImage("/avatar1.png");
      setInstagram("");
      setTiktok("");
      setTwitter("");
      setReddit("");
      setChaturbate("");
      setSelectedTags([]);
      
      setIsSubmitting(false);
      onOpenChange(false);
    }, 1500);
  };

  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter((t) => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  // Preset avatars to choose from
  const avatars = [
    "/avatar1.png",
    "/avatar2.png",
    "/avatar3.png",
    "/avatar4.png",
    "/avatar5.png",
    "/avatar6.png",
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Onboard New Creator</DialogTitle>
          <DialogDescription>
            Fill out the details to add a new creator to your CRM
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Creator Name</Label>
                <Input
                  id="name"
                  placeholder="Enter creator name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="gender">Gender</Label>
                <Select 
                  value={gender} 
                  onValueChange={(value: Gender) => setGender(value)}
                >
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
                <Select 
                  value={creatorType} 
                  onValueChange={(value: CreatorType) => setCreatorType(value)}
                >
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
                <Select 
                  value={team} 
                  onValueChange={(value: Team) => setTeam(value)}
                >
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
            
            <div>
              <Label>Profile Picture</Label>
              <div className="grid grid-cols-3 gap-3 mt-2">
                {avatars.map((avatar, index) => (
                  <div 
                    key={index} 
                    className={`
                      cursor-pointer rounded-lg p-1 border-2 transition-all
                      ${profileImage === avatar ? 'border-brand' : 'border-transparent hover:border-muted'}
                    `}
                    onClick={() => setProfileImage(avatar)}
                  >
                    <img 
                      src={avatar} 
                      alt={`Avatar option ${index + 1}`} 
                      className="w-full h-auto rounded-lg"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          <Accordion type="single" collapsible defaultValue="social-links">
            <AccordionItem value="social-links">
              <AccordionTrigger>Social Media Links</AccordionTrigger>
              <AccordionContent>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="instagram">Instagram URL</Label>
                    <Input
                      id="instagram"
                      placeholder="https://instagram.com/username"
                      value={instagram}
                      onChange={(e) => setInstagram(e.target.value)}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="tiktok">TikTok URL</Label>
                    <Input
                      id="tiktok"
                      placeholder="https://tiktok.com/@username"
                      value={tiktok}
                      onChange={(e) => setTiktok(e.target.value)}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="twitter">Twitter URL</Label>
                    <Input
                      id="twitter"
                      placeholder="https://twitter.com/username"
                      value={twitter}
                      onChange={(e) => setTwitter(e.target.value)}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="reddit">Reddit URL</Label>
                    <Input
                      id="reddit"
                      placeholder="https://reddit.com/user/username"
                      value={reddit}
                      onChange={(e) => setReddit(e.target.value)}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="chaturbate">Chaturbate URL</Label>
                    <Input
                      id="chaturbate"
                      placeholder="https://chaturbate.com/username"
                      value={chaturbate}
                      onChange={(e) => setChaturbate(e.target.value)}
                    />
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="tags">
              <AccordionTrigger>Additional Tags</AccordionTrigger>
              <AccordionContent>
                <div className="space-y-4">
                  <Label>Select Tags</Label>
                  <div className="flex flex-wrap gap-3">
                    {availableTags.map((tag) => (
                      <div
                        key={tag}
                        className="flex items-center space-x-2"
                      >
                        <Checkbox
                          id={`tag-${tag}`}
                          checked={selectedTags.includes(tag)}
                          onCheckedChange={() => toggleTag(tag)}
                        />
                        <Label htmlFor={`tag-${tag}`} className="cursor-pointer">{tag}</Label>
                      </div>
                    ))}
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
          
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button 
              type="submit"
              className="bg-brand text-black hover:bg-brand/80"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Submitting..." : "Submit & Onboard"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default OnboardingModal;
