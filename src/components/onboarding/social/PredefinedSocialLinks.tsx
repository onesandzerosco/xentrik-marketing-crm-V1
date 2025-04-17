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

// Update RedditIcon component with smaller, more proportionate SVG
const RedditIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="lucide lucide-reddit">
    <path d="M14.5 9a1.5 1.5 0 1 0-1.5 1.5A1.5 1.5 0 0 0 14.5 9zm-5 0A1.5 1.5 0 1 0 8 10.5 1.5 1.5 0 0 0 9.5 9zm5.61 2.36c.4-.4.4-1.04 0-1.44a1.016 1.016 0 0 0-1.44 0c-1.13 1.13-3.09 1.13-4.22 0a1.016 1.016 0 0 0-1.44 0c-.4.4-.4 1.04 0 1.44a3.62 3.62 0 0 0 5.1 0zM12 22c-5.47 0-10-4.53-10-10S6.53 2 12 2s10 4.53 10 10-4.53 10-10 10zm7.35-11.14a5.74 5.74 0 0 0-11.1 0 1 1 0 1 0 1.9.62 3.74 3.74 0 0 1 7.3 0 1 1 0 1 0 1.9-.62z"/>
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
