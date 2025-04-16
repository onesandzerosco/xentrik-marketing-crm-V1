
import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Plus, X } from "lucide-react";
import { v4 as uuidv4 } from "uuid";

interface CustomSocialLink {
  id: string;
  name: string;
  url: string;
}

interface SocialLinksSectionProps {
  instagram: string;
  setInstagram: (username: string) => void;
  tiktok: string;
  setTiktok: (username: string) => void;
  twitter: string;
  setTwitter: (username: string) => void;
  reddit: string;
  setReddit: (username: string) => void;
  chaturbate: string;
  setChaturbate: (username: string) => void;
  customSocialLinks: CustomSocialLink[];
  setCustomSocialLinks: (links: CustomSocialLink[]) => void;
  errors: {
    instagram?: string;
    tiktok?: string;
    twitter?: string;
    reddit?: string;
    chaturbate?: string;
    customSocialLinks?: string[];
  };
}

const SocialLinksSection: React.FC<SocialLinksSectionProps> = ({
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
  customSocialLinks,
  setCustomSocialLinks,
  errors = {}
}) => {
  const [newSocialName, setNewSocialName] = useState("");
  const [newSocialUrl, setNewSocialUrl] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);

  const addCustomSocialLink = () => {
    if (newSocialName.trim() && newSocialUrl.trim()) {
      const newLink: CustomSocialLink = {
        id: uuidv4(),
        name: newSocialName.trim(),
        url: newSocialUrl.trim()
      };
      
      setCustomSocialLinks([...customSocialLinks, newLink]);
      setNewSocialName("");
      setNewSocialUrl("");
      setShowAddForm(false);
    }
  };

  const removeCustomSocialLink = (id: string) => {
    setCustomSocialLinks(customSocialLinks.filter(link => link.id !== id));
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">Social Media Links</h2>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="instagram">
            Instagram
          </Label>
          <Input 
            id="instagram" 
            placeholder="Username"
            value={instagram}
            onChange={(e) => setInstagram(e.target.value)}
            className={errors.instagram ? "border-red-500" : ""}
          />
          {errors.instagram && (
            <p className="text-red-500 text-sm">{errors.instagram}</p>
          )}
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="tiktok">
            TikTok
          </Label>
          <Input 
            id="tiktok" 
            placeholder="Username"
            value={tiktok}
            onChange={(e) => setTiktok(e.target.value)}
            className={errors.tiktok ? "border-red-500" : ""}
          />
          {errors.tiktok && (
            <p className="text-red-500 text-sm">{errors.tiktok}</p>
          )}
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="twitter">
            Twitter
          </Label>
          <Input 
            id="twitter" 
            placeholder="Username"
            value={twitter}
            onChange={(e) => setTwitter(e.target.value)}
            className={errors.twitter ? "border-red-500" : ""}
          />
          {errors.twitter && (
            <p className="text-red-500 text-sm">{errors.twitter}</p>
          )}
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="reddit">
            Reddit
          </Label>
          <Input 
            id="reddit" 
            placeholder="Username"
            value={reddit}
            onChange={(e) => setReddit(e.target.value)}
            className={errors.reddit ? "border-red-500" : ""}
          />
          {errors.reddit && (
            <p className="text-red-500 text-sm">{errors.reddit}</p>
          )}
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="chaturbate">
            Chaturbate
          </Label>
          <Input 
            id="chaturbate" 
            placeholder="Username"
            value={chaturbate}
            onChange={(e) => setChaturbate(e.target.value)}
            className={errors.chaturbate ? "border-red-500" : ""}
          />
          {errors.chaturbate && (
            <p className="text-red-500 text-sm">{errors.chaturbate}</p>
          )}
        </div>
      </div>
      
      {/* Custom Social Links */}
      {customSocialLinks.length > 0 && (
        <div className="mt-4">
          <h3 className="text-lg font-semibold mb-2">Custom Social Links</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {customSocialLinks.map(link => (
              <div key={link.id} className="relative space-y-2 p-3 bg-[#1a1a33]/80 rounded-lg">
                <Label>{link.name}</Label>
                <div className="flex">
                  <Input 
                    value={link.url}
                    onChange={(e) => {
                      const updatedLinks = customSocialLinks.map(l => 
                        l.id === link.id ? { ...l, url: e.target.value } : l
                      );
                      setCustomSocialLinks(updatedLinks);
                    }}
                    placeholder="URL"
                  />
                  <Button 
                    type="button" 
                    variant="ghost" 
                    size="icon" 
                    className="ml-1 text-red-400 hover:text-red-500"
                    onClick={() => removeCustomSocialLink(link.id)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Add new social link form */}
      {showAddForm ? (
        <div className="mt-4 p-4 border border-dashed border-[#252538] rounded-lg">
          <h3 className="text-lg font-semibold mb-3">Add New Social Media</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div className="space-y-2">
              <Label htmlFor="newSocialName">Platform Name</Label>
              <Input 
                id="newSocialName" 
                placeholder="Platform name"
                value={newSocialName}
                onChange={(e) => setNewSocialName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="newSocialUrl">Profile URL/Username</Label>
              <Input 
                id="newSocialUrl" 
                placeholder="URL or username"
                value={newSocialUrl}
                onChange={(e) => setNewSocialUrl(e.target.value)}
              />
            </div>
          </div>
          <div className="flex space-x-2">
            <Button 
              type="button" 
              variant="default" 
              onClick={addCustomSocialLink}
              disabled={!newSocialName.trim() || !newSocialUrl.trim()}
            >
              Add
            </Button>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => {
                setShowAddForm(false);
                setNewSocialName("");
                setNewSocialUrl("");
              }}
            >
              Cancel
            </Button>
          </div>
        </div>
      ) : (
        <div className="mt-4">
          <Button 
            type="button" 
            variant="outline" 
            className="flex items-center"
            onClick={() => setShowAddForm(true)}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Another Social Media
          </Button>
        </div>
      )}
    </div>
  );
};

export default SocialLinksSection;
