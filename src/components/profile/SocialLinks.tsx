import React from "react";
import { Link } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { ExternalLink, Lock, Instagram, Twitter, Youtube, Video } from "lucide-react";

// Custom TikTok icon
const TiktokIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-brand-tiktok">
    <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" />
  </svg>
);

// Custom Reddit icon
const RedditIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1" className="lucide lucide-reddit">
    <path fill="currentColor" d="M7 9c-1.148 0-2-.851-2-2s.852-2 2-2c1.147 0 2 .851 2 2s-.853 2-2 2zm5.707-3.707c.188.188.293.442.293.707 0 .255-.105.52-.293.707a.999.999 0 0 1-1.414 0 1 1 0 0 1 0-1.414c.188-.188.442-.293.707-.293s.52.105.707.293zM7 0C3.14 0 0 3.14 0 7s3.14 7 7 7 7-3.14 7-7-3.14-7-7-7zm4.365 7.4c.022.15.035.302.035.457 0 2.43-2.835 4.4-6.325 4.4-3.49 0-6.325-1.97-6.325-4.4 0-.155.013-.307.035-.457A1.501 1.501 0 0 1 0 5.5c0-.829.672-1.5 1.5-1.5.348 0 .668.12.926.32C3.194 3.543 4.965 3 7 3c2.035 0 3.806.543 4.574 1.32.258-.2.578-.32.926-.32.828 0 1.5.671 1.5 1.5 0 .513-.258.97-.635 1.2z"/>
  </svg>
);

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
          <Label htmlFor="instagram" className="flex items-center gap-1.5">
            <Instagram className="h-4 w-4 text-pink-500" /> Instagram
          </Label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">https://instagram.com/</span>
            <Input 
              id="instagram" 
              placeholder="username" 
              value={instagram?.replace('https://instagram.com/', '') || ''} 
              onChange={e => setInstagram(`https://instagram.com/${e.target.value.replace('https://instagram.com/', '')}`)} 
              className="pl-[150px]"
            />
            {instagram && (
              <Button 
                variant="outline" 
                size="icon"
                onClick={() => window.open(instagram, '_blank')}
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
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">https://tiktok.com/@</span>
            <Input 
              id="tiktok" 
              placeholder="username" 
              value={tiktok?.replace('https://tiktok.com/@', '') || ''} 
              onChange={e => setTiktok(`https://tiktok.com/@${e.target.value.replace('https://tiktok.com/@', '')}`)} 
              className="pl-[150px]"
            />
            {tiktok && (
              <Button 
                variant="outline" 
                size="icon"
                onClick={() => window.open(tiktok, '_blank')}
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
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">https://twitter.com/</span>
            <Input 
              id="twitter" 
              placeholder="username" 
              value={twitter?.replace('https://twitter.com/', '') || ''} 
              onChange={e => setTwitter(`https://twitter.com/${e.target.value.replace('https://twitter.com/', '')}`)} 
              className="pl-[150px]"
            />
            {twitter && (
              <Button 
                variant="outline" 
                size="icon"
                onClick={() => window.open(twitter, '_blank')}
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
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">https://reddit.com/user/</span>
            <Input 
              id="reddit" 
              placeholder="username" 
              value={reddit?.replace('https://reddit.com/user/', '') || ''} 
              onChange={e => setReddit(`https://reddit.com/user/${e.target.value.replace('https://reddit.com/user/', '')}`)} 
              className="pl-[170px]"
            />
            {reddit && (
              <Button 
                variant="outline" 
                size="icon"
                onClick={() => window.open(reddit, '_blank')}
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
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">https://chaturbate.com/</span>
            <Input 
              id="chaturbate" 
              placeholder="username" 
              value={chaturbate?.replace('https://chaturbate.com/', '') || ''} 
              onChange={e => setChaturbate(`https://chaturbate.com/${e.target.value.replace('https://chaturbate.com/', '')}`)} 
              className="pl-[170px]"
            />
            {chaturbate && (
              <Button 
                variant="outline" 
                size="icon"
                onClick={() => window.open(chaturbate, '_blank')}
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
