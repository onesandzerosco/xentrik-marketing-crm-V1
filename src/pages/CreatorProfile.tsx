import React, { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useCreators } from "../context/CreatorContext";
import Sidebar from "../components/Sidebar";
import { Team, Gender, CreatorType } from "../types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { BarChart2, MessageSquare, Save, Tag } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { Badge } from "@/components/ui/badge";
import ImageUploader from "../components/ImageUploader";

const CreatorProfile = () => {
  const { id } = useParams<{ id: string }>();
  const { getCreator, updateCreator, getCreatorStats } = useCreators();
  const { toast } = useToast();
  
  const creator = getCreator(id!);
  const stats = getCreatorStats(id!);
  
  const [name, setName] = useState(creator?.name || "");
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
  const [reviewDone, setReviewDone] = useState(false);

  const handleSave = () => {
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
        chaturbate: chaturbate || undefined,
      },
      tags: [gender, team, creatorType],
    });
    
    toast({
      title: "Profile Updated",
      description: "Creator profile has been successfully updated",
    });
  };

  if (!creator) {
    return (
      <div className="flex">
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
      </div>
    );
  }

  return (
    <div className="flex">
      <Sidebar />
      <div className="ml-60 p-8 w-full">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">{creator.name}'s Profile</h1>
            <div className="flex gap-2">
              <Badge variant="outline">{creator.gender}</Badge>
              <Badge variant="outline">{creator.team}</Badge>
              <Badge variant="outline">{creator.creatorType}</Badge>
            </div>
          </div>
          <div className="flex gap-3">
            <Link to={`/creators/${creator.id}/analytics`}>
              <Button variant="outline">
                <BarChart2 className="h-4 w-4 mr-2" />
                Analytics
              </Button>
            </Link>
            <Button 
              onClick={handleSave}
              className="bg-brand text-black hover:bg-brand/80"
            >
              <Save className="h-4 w-4 mr-2" />
              Save Changes
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-6">
            <div className="bg-card rounded-xl p-6 shadow-sm">
              <h2 className="text-xl font-bold mb-4">Basic Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="name">Creator Name</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
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
            </div>
            
            <div className="bg-card rounded-xl p-6 shadow-sm">
              <h2 className="text-xl font-bold mb-4">Social Media Links</h2>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="instagram">Instagram</Label>
                  <Input
                    id="instagram"
                    placeholder="https://instagram.com/username"
                    value={instagram}
                    onChange={(e) => setInstagram(e.target.value)}
                  />
                </div>
                
                <div>
                  <Label htmlFor="tiktok">TikTok</Label>
                  <Input
                    id="tiktok"
                    placeholder="https://tiktok.com/@username"
                    value={tiktok}
                    onChange={(e) => setTiktok(e.target.value)}
                  />
                </div>
                
                <div>
                  <Label htmlFor="twitter">Twitter</Label>
                  <Input
                    id="twitter"
                    placeholder="https://twitter.com/username"
                    value={twitter}
                    onChange={(e) => setTwitter(e.target.value)}
                  />
                </div>
                
                <div>
                  <Label htmlFor="reddit">Reddit</Label>
                  <Input
                    id="reddit"
                    placeholder="https://reddit.com/user/username"
                    value={reddit}
                    onChange={(e) => setReddit(e.target.value)}
                  />
                </div>
                
                <div>
                  <Label htmlFor="chaturbate">Chaturbate</Label>
                  <Input
                    id="chaturbate"
                    placeholder="https://chaturbate.com/username"
                    value={chaturbate}
                    onChange={(e) => setChaturbate(e.target.value)}
                  />
                </div>
              </div>
            </div>
            
            <div className="bg-card rounded-xl p-6 shadow-sm">
              <h2 className="text-xl font-bold mb-4">Engagement Stats This Week</h2>
              
              {stats && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="p-4 border border-border rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="font-medium">Instagram</h3>
                      <div className={`flex items-center ${stats.instagram.trend > 0 ? "text-green-500" : "text-red-500"}`}>
                        {stats.instagram.trend > 0 ? "↑" : "↓"} {Math.abs(stats.instagram.trend)}%
                      </div>
                    </div>
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>Followers</span>
                      <span>{stats.instagram.followers.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>Engagement</span>
                      <span>{stats.instagram.engagement}%</span>
                    </div>
                  </div>
                  
                  <div className="p-4 border border-border rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="font-medium">TikTok</h3>
                      <div className={`flex items-center ${stats.tiktok.trend > 0 ? "text-green-500" : "text-red-500"}`}>
                        {stats.tiktok.trend > 0 ? "↑" : "↓"} {Math.abs(stats.tiktok.trend)}%
                      </div>
                    </div>
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>Views</span>
                      <span>{stats.tiktok.views.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>Followers</span>
                      <span>{stats.tiktok.followers.toLocaleString()}</span>
                    </div>
                  </div>
                  
                  <div className="p-4 border border-border rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="font-medium">Twitter</h3>
                      <div className={`flex items-center ${stats.twitter.trend > 0 ? "text-green-500" : "text-red-500"}`}>
                        {stats.twitter.trend > 0 ? "↑" : "↓"} {Math.abs(stats.twitter.trend)}%
                      </div>
                    </div>
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>Impressions</span>
                      <span>{stats.twitter.impressions.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>Followers</span>
                      <span>{stats.twitter.followers.toLocaleString()}</span>
                    </div>
                  </div>
                  
                  <div className="p-4 border border-border rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="font-medium">Reddit</h3>
                      <div className={`flex items-center ${stats.reddit.trend > 0 ? "text-green-500" : "text-red-500"}`}>
                        {stats.reddit.trend > 0 ? "↑" : "↓"} {Math.abs(stats.reddit.trend)}%
                      </div>
                    </div>
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>Upvotes</span>
                      <span>{stats.reddit.upvotes.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>Subscribers</span>
                      <span>{stats.reddit.subscribers.toLocaleString()}</span>
                    </div>
                  </div>
                  
                  <div className="p-4 border border-border rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="font-medium">Chaturbate</h3>
                      <div className={`flex items-center ${stats.chaturbate.trend > 0 ? "text-green-500" : "text-red-500"}`}>
                        {stats.chaturbate.trend > 0 ? "↑" : "↓"} {Math.abs(stats.chaturbate.trend)}%
                      </div>
                    </div>
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>Viewers</span>
                      <span>{stats.chaturbate.viewers.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>Followers</span>
                      <span>{stats.chaturbate.followers.toLocaleString()}</span>
                    </div>
                  </div>
                  
                  <div className="md:col-span-2">
                    <Link to={`/creators/${creator.id}/analytics`}>
                      <Button className="w-full">
                        <BarChart2 className="h-4 w-4 mr-2" />
                        Open Full Analytics
                      </Button>
                    </Link>
                  </div>
                </div>
              )}
              
              {!stats && (
                <div className="text-center py-6">
                  <p className="text-muted-foreground">No stats available for this creator</p>
                </div>
              )}
            </div>
          </div>
          
          <div className="space-y-6">
            <div className="bg-card rounded-xl p-6 shadow-sm">
              <h2 className="text-xl font-bold mb-4">Profile Picture</h2>
              <div className="flex items-center justify-center py-4">
                <ImageUploader
                  currentImage={profileImage}
                  name={name}
                  onImageChange={setProfileImage}
                  size="xl"
                />
              </div>
            </div>
            
            <div className="bg-card rounded-xl p-6 shadow-sm">
              <h2 className="text-xl font-bold mb-4">Actions</h2>
              <div className="space-y-4">
                <Button className="w-full">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Create Telegram Chat
                </Button>
                
                <Button variant="outline" className="w-full">
                  Send Manager Note
                </Button>
                
                <Separator />
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="inactive" className="font-medium">Tag as Inactive</Label>
                    <p className="text-xs text-muted-foreground">
                      Temporarily pause management
                    </p>
                  </div>
                  <Switch
                    id="inactive"
                    checked={isInactive}
                    onCheckedChange={setIsInactive}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="review" className="font-medium">Manual Review Done</Label>
                    <p className="text-xs text-muted-foreground">
                      Mark profile as reviewed
                    </p>
                  </div>
                  <Switch
                    id="review"
                    checked={reviewDone}
                    onCheckedChange={setReviewDone}
                  />
                </div>
                
                <Separator />
                
                <Button 
                  variant="destructive" 
                  className="w-full"
                  onClick={() => {
                    toast({
                      title: "Feature not implemented",
                      description: "This feature is not yet available",
                    });
                  }}
                >
                  <Tag className="h-4 w-4 mr-2" />
                  Remove Creator
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreatorProfile;
