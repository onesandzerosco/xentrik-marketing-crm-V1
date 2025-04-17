import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Instagram, Twitter, Video, Youtube } from "lucide-react";

// Custom TikTok icon since it's not available in lucide-react
const TiktokIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-brand-tiktok">
    <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" />
  </svg>
);

// Update RedditIcon component
const RedditIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1" className="lucide lucide-reddit">
    <path fill="currentColor" d="M7 9c-1.148 0-2-.851-2-2s.852-2 2-2c1.147 0 2 .851 2 2s-.853 2-2 2zm5.707-3.707c.188.188.293.442.293.707 0 .255-.105.52-.293.707a.999.999 0 0 1-1.414 0 1 1 0 0 1 0-1.414c.188-.188.442-.293.707-.293s.52.105.707.293zM7 0C3.14 0 0 3.14 0 7s3.14 7 7 7 7-3.14 7-7-3.14-7-7-7zm4.365 7.4c.022.15.035.302.035.457 0 2.43-2.835 4.4-6.325 4.4-3.49 0-6.325-1.97-6.325-4.4 0-.155.013-.307.035-.457A1.501 1.501 0 0 1 0 5.5c0-.829.672-1.5 1.5-1.5.348 0 .668.12.926.32C3.194 3.543 4.965 3 7 3c2.035 0 3.806.543 4.574 1.32.258-.2.578-.32.926-.32.828 0 1.5.671 1.5 1.5 0 .513-.258.97-.635 1.2z"/>
  </svg>
);

interface PredefinedSocialLinksProps {
  instagram: string;
  setInstagram: (value: string) => void;
  tiktok: string;
  setTiktok: (value: string) => void;
  twitter: string;
  setTwitter: (value: string) => void;
  reddit: string;
  setReddit: (value: string) => void;
  chaturbate: string;
  setChaturbate: (value: string) => void;
  youtube: string;
  setYoutube: (value: string) => void;
  errors: {
    instagram?: string;
    tiktok?: string;
    twitter?: string;
    reddit?: string;
    chaturbate?: string;
    youtube?: string;
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
  youtube,
  setYoutube,
  errors = {}
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Instagram */}
      <div className="space-y-2">
        <Label htmlFor="instagram" className="flex items-center">
          <Instagram className="h-4 w-4 mr-2" />
          Instagram
        </Label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">https://instagram.com/</span>
          <Input 
            id="instagram" 
            placeholder="username" 
            className={`pl-[150px] ${errors.instagram ? "border-red-500" : ""}`}
            value={instagram?.replace('https://instagram.com/', '') || ''}
            onChange={(e) => setInstagram(e.target.value ? `https://instagram.com/${e.target.value.replace('https://instagram.com/', '')}` : '')}
          />
        </div>
        {errors.instagram && (
          <p className="text-red-500 text-sm">{errors.instagram}</p>
        )}
      </div>
      
      {/* TikTok */}
      <div className="space-y-2">
        <Label htmlFor="tiktok" className="flex items-center">
          <TiktokIcon />
          <span className="ml-2">TikTok</span>
        </Label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">https://tiktok.com/@</span>
          <Input 
            id="tiktok" 
            placeholder="username" 
            className={`pl-[150px] ${errors.tiktok ? "border-red-500" : ""}`}
            value={tiktok?.replace('https://tiktok.com/@', '') || ''}
            onChange={(e) => setTiktok(e.target.value ? `https://tiktok.com/@${e.target.value.replace('https://tiktok.com/@', '')}` : '')}
          />
        </div>
        {errors.tiktok && (
          <p className="text-red-500 text-sm">{errors.tiktok}</p>
        )}
      </div>
      
      {/* Twitter */}
      <div className="space-y-2">
        <Label htmlFor="twitter" className="flex items-center">
          <Twitter className="h-4 w-4 mr-2" />
          Twitter
        </Label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">https://twitter.com/</span>
          <Input 
            id="twitter" 
            placeholder="username" 
            className={`pl-[150px] ${errors.twitter ? "border-red-500" : ""}`}
            value={twitter?.replace('https://twitter.com/', '') || ''}
            onChange={(e) => setTwitter(e.target.value ? `https://twitter.com/${e.target.value.replace('https://twitter.com/', '')}` : '')}
          />
        </div>
        {errors.twitter && (
          <p className="text-red-500 text-sm">{errors.twitter}</p>
        )}
      </div>
      
      {/* Reddit */}
      <div className="space-y-2">
        <Label htmlFor="reddit" className="flex items-center">
          <RedditIcon />
          <span className="ml-2">Reddit</span>
        </Label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">https://reddit.com/user/</span>
          <Input 
            id="reddit" 
            placeholder="username" 
            className={`pl-[170px] ${errors.reddit ? "border-red-500" : ""}`}
            value={reddit?.replace('https://reddit.com/user/', '') || ''}
            onChange={(e) => setReddit(e.target.value ? `https://reddit.com/user/${e.target.value.replace('https://reddit.com/user/', '')}` : '')}
          />
        </div>
        {errors.reddit && (
          <p className="text-red-500 text-sm">{errors.reddit}</p>
        )}
      </div>
      
      {/* Chaturbate */}
      <div className="space-y-2">
        <Label htmlFor="chaturbate" className="flex items-center">
          <Video className="h-4 w-4 mr-2" />
          Chaturbate
        </Label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">https://chaturbate.com/</span>
          <Input 
            id="chaturbate" 
            placeholder="username" 
            className={`pl-[170px] ${errors.chaturbate ? "border-red-500" : ""}`}
            value={chaturbate?.replace('https://chaturbate.com/', '') || ''}
            onChange={(e) => setChaturbate(e.target.value ? `https://chaturbate.com/${e.target.value.replace('https://chaturbate.com/', '')}` : '')}
          />
        </div>
        {errors.chaturbate && (
          <p className="text-red-500 text-sm">{errors.chaturbate}</p>
        )}
      </div>
      
      {/* YouTube */}
      <div className="space-y-2">
        <Label htmlFor="youtube" className="flex items-center">
          <Youtube className="h-4 w-4 mr-2" />
          YouTube
        </Label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">https://youtube.com/</span>
          <Input 
            id="youtube" 
            placeholder="channel or username" 
            className={`pl-[150px] ${errors.youtube ? "border-red-500" : ""}`}
            value={youtube?.replace('https://youtube.com/', '') || ''}
            onChange={(e) => setYoutube(e.target.value ? `https://youtube.com/${e.target.value.replace('https://youtube.com/', '')}` : '')}
          />
        </div>
        {errors.youtube && (
          <p className="text-red-500 text-sm">{errors.youtube}</p>
        )}
      </div>
    </div>
  );
};

export default PredefinedSocialLinks;
