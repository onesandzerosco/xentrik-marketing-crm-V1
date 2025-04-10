
import React from "react";
import { Link } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { ExternalLink, Lock } from "lucide-react";

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
  creatorId?: string;
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
  creatorId,
}) => {
  return (
    <div className="bg-card rounded-xl p-6 shadow-sm">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Social Media Links</h2>
        {creatorId && (
          <Link to={`/secure-logins/${creatorId}`}>
            <Button variant="outline" size="sm" className="gap-1">
              <Lock className="h-3.5 w-3.5" />
              Manage Login Details
            </Button>
          </Link>
        )}
      </div>
      <div className="space-y-4">
        <div>
          <Label htmlFor="instagram">Instagram</Label>
          <div className="flex gap-2">
            <Input 
              id="instagram" 
              placeholder="https://instagram.com/username" 
              value={instagram} 
              onChange={e => setInstagram(e.target.value)} 
              className="flex-1"
            />
            {instagram && (
              <Button 
                variant="outline" 
                size="icon"
                onClick={() => window.open(instagram, '_blank')}
                title="Open Instagram"
              >
                <ExternalLink className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
        
        <div>
          <Label htmlFor="tiktok">TikTok</Label>
          <div className="flex gap-2">
            <Input 
              id="tiktok" 
              placeholder="https://tiktok.com/@username" 
              value={tiktok} 
              onChange={e => setTiktok(e.target.value)} 
              className="flex-1"
            />
            {tiktok && (
              <Button 
                variant="outline" 
                size="icon"
                onClick={() => window.open(tiktok, '_blank')}
                title="Open TikTok"
              >
                <ExternalLink className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
        
        <div>
          <Label htmlFor="twitter">Twitter</Label>
          <div className="flex gap-2">
            <Input 
              id="twitter" 
              placeholder="https://twitter.com/username" 
              value={twitter} 
              onChange={e => setTwitter(e.target.value)} 
              className="flex-1"
            />
            {twitter && (
              <Button 
                variant="outline" 
                size="icon"
                onClick={() => window.open(twitter, '_blank')}
                title="Open Twitter"
              >
                <ExternalLink className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
        
        <div>
          <Label htmlFor="reddit">Reddit</Label>
          <div className="flex gap-2">
            <Input 
              id="reddit" 
              placeholder="https://reddit.com/user/username" 
              value={reddit} 
              onChange={e => setReddit(e.target.value)} 
              className="flex-1"
            />
            {reddit && (
              <Button 
                variant="outline" 
                size="icon"
                onClick={() => window.open(reddit, '_blank')}
                title="Open Reddit"
              >
                <ExternalLink className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
        
        <div>
          <Label htmlFor="chaturbate">Chaturbate</Label>
          <div className="flex gap-2">
            <Input 
              id="chaturbate" 
              placeholder="https://chaturbate.com/username" 
              value={chaturbate} 
              onChange={e => setChaturbate(e.target.value)} 
              className="flex-1"
            />
            {chaturbate && (
              <Button 
                variant="outline" 
                size="icon"
                onClick={() => window.open(chaturbate, '_blank')}
                title="Open Chaturbate"
              >
                <ExternalLink className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SocialLinks;
