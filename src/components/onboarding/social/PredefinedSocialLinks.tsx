
import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface PredefinedSocialLinksProps {
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
  errors: {
    instagram?: string;
    tiktok?: string;
    twitter?: string;
    reddit?: string;
    chaturbate?: string;
  };
}

const PredefinedSocialLinks: React.FC<PredefinedSocialLinksProps> = ({
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
  errors = {}
}) => {
  return (
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
  );
};

export default PredefinedSocialLinks;
