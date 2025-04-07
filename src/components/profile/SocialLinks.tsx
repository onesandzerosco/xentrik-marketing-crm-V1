
import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface SocialLinksProps {
  instagram: string;
  setInstagram: (url: string) => void;
  tiktok: string;
  setTiktok: (url: string) => void;
  twitter: string;
  setTwitter: (url: string) => void;
  reddit: string;
  setReddit: (url: string) => void;
  chaturbate: string;
  setChaturbate: (url: string) => void;
}

const SocialLinks: React.FC<SocialLinksProps> = ({
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
}) => {
  return (
    <div className="bg-card rounded-xl p-6 shadow-sm">
      <h2 className="text-xl font-bold mb-4">Social Media Links</h2>
      <div className="space-y-4">
        <div>
          <Label htmlFor="instagram">Instagram</Label>
          <Input 
            id="instagram" 
            placeholder="https://instagram.com/username" 
            value={instagram} 
            onChange={e => setInstagram(e.target.value)} 
          />
        </div>
        
        <div>
          <Label htmlFor="tiktok">TikTok</Label>
          <Input 
            id="tiktok" 
            placeholder="https://tiktok.com/@username" 
            value={tiktok} 
            onChange={e => setTiktok(e.target.value)} 
          />
        </div>
        
        <div>
          <Label htmlFor="twitter">Twitter</Label>
          <Input 
            id="twitter" 
            placeholder="https://twitter.com/username" 
            value={twitter} 
            onChange={e => setTwitter(e.target.value)} 
          />
        </div>
        
        <div>
          <Label htmlFor="reddit">Reddit</Label>
          <Input 
            id="reddit" 
            placeholder="https://reddit.com/user/username" 
            value={reddit} 
            onChange={e => setReddit(e.target.value)} 
          />
        </div>
        
        <div>
          <Label htmlFor="chaturbate">Chaturbate</Label>
          <Input 
            id="chaturbate" 
            placeholder="https://chaturbate.com/username" 
            value={chaturbate} 
            onChange={e => setChaturbate(e.target.value)} 
          />
        </div>
      </div>
    </div>
  );
};

export default SocialLinks;
