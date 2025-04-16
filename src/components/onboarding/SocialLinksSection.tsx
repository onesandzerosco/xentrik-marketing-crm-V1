
import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface SocialLinksSectionProps {
  instagram: string;
  setInstagram: (username: string) => void;
  tiktok: string;
  setTiktok: (username: string) => void;
  twitter: string;
  setTwitter: (username: string) => void;
  reddit: string;
  setReddit: (username: string) => void;
  errors: {
    instagram?: string;
    tiktok?: string;
    twitter?: string;
    reddit?: string;
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
  errors = {}
}) => {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">Social Media Links</h2>
      <div className="grid grid-cols-2 gap-4">
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
      </div>
    </div>
  );
};

export default SocialLinksSection;
