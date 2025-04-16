
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
}

const SocialLinksSection: React.FC<SocialLinksSectionProps> = ({
  instagram,
  setInstagram,
  tiktok,
  setTiktok,
  twitter,
  setTwitter,
  reddit,
  setReddit
}) => {
  return (
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
            value={instagram}
            onChange={(e) => setInstagram(e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="tiktok">
            TikTok
          </Label>
          <Input 
            id="tiktok" 
            placeholder="Username"
            value={tiktok}
            onChange={(e) => setTiktok(e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="twitter">
            Twitter
          </Label>
          <Input 
            id="twitter" 
            placeholder="Username"
            value={twitter}
            onChange={(e) => setTwitter(e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="reddit">
            Reddit
          </Label>
          <Input 
            id="reddit" 
            placeholder="Username"
            value={reddit}
            onChange={(e) => setReddit(e.target.value)}
          />
        </div>
      </div>
    </div>
  );
};

export default SocialLinksSection;
