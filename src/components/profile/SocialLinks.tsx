import React from "react";
import { Link } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { ExternalLink, Lock, Instagram, Twitter, Youtube, Video } from "lucide-react";
import { RedditIcon } from "@/components/icons/RedditIcon";

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
  const openSocialLink = (url: string) => {
    if (!url) return;
    window.open(url, '_blank');
  };

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
          <Label htmlFor="instagram" className="flex items-center gap-1.5">
            <Instagram className="h-4 w-4 text-pink-500" /> Instagram
          </Label>
          <div className="relative">
            <Input 
              id="instagram" 
              placeholder="https://instagram.com/profile" 
              value={instagram || ''} 
              onChange={e => setInstagram(e.target.value)} 
            />
            {instagram && (
              <Button 
                variant="outline" 
                size="icon"
                onClick={() => openSocialLink(instagram)}
                title="Open Instagram"
                className="absolute right-1 top-1/2 -translate-y-1/2"
              >
                <ExternalLink className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
        
        <div>
          <Label htmlFor="tiktok" className="flex items-center gap-1.5">
            <TiktokIcon /> <span className="ml-1">TikTok</span>
          </Label>
          <div className="relative">
            <Input 
              id="tiktok" 
              placeholder="https://tiktok.com/@username" 
              value={tiktok || ''} 
              onChange={e => setTiktok(e.target.value)} 
            />
            {tiktok && (
              <Button 
                variant="outline" 
                size="icon"
                onClick={() => openSocialLink(tiktok)}
                title="Open TikTok"
                className="absolute right-1 top-1/2 -translate-y-1/2"
              >
                <ExternalLink className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
        
        <div>
          <Label htmlFor="twitter" className="flex items-center gap-1.5">
            <Twitter className="h-4 w-4 text-blue-500" /> Twitter
          </Label>
          <div className="relative">
            <Input 
              id="twitter" 
              placeholder="https://twitter.com/username" 
              value={twitter || ''} 
              onChange={e => setTwitter(e.target.value)} 
            />
            {twitter && (
              <Button 
                variant="outline" 
                size="icon"
                onClick={() => openSocialLink(twitter)}
                title="Open Twitter"
                className="absolute right-1 top-1/2 -translate-y-1/2"
              >
                <ExternalLink className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
        
        <div>
          <Label htmlFor="reddit" className="flex items-center gap-1.5">
            <RedditIcon /> <span className="ml-1">Reddit</span>
          </Label>
          <div className="relative">
            <Input 
              id="reddit" 
              placeholder="https://reddit.com/user/username" 
              value={reddit || ''} 
              onChange={e => setReddit(e.target.value)} 
            />
            {reddit && (
              <Button 
                variant="outline" 
                size="icon"
                onClick={() => openSocialLink(reddit)}
                title="Open Reddit"
                className="absolute right-1 top-1/2 -translate-y-1/2"
              >
                <ExternalLink className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
        
        <div>
          <Label htmlFor="chaturbate" className="flex items-center gap-1.5">
            <Video className="h-4 w-4 text-red-500" /> Chaturbate
          </Label>
          <div className="relative">
            <Input 
              id="chaturbate" 
              placeholder="https://chaturbate.com/username" 
              value={chaturbate || ''} 
              onChange={e => setChaturbate(e.target.value)} 
            />
            {chaturbate && (
              <Button 
                variant="outline" 
                size="icon"
                onClick={() => openSocialLink(chaturbate)}
                title="Open Chaturbate"
                className="absolute right-1 top-1/2 -translate-y-1/2"
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

// Custom TikTok icon
const TiktokIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-brand-tiktok">
    <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" />
  </svg>
);
