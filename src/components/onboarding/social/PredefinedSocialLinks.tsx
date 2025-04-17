
import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Instagram, TiktokIcon, Twitter, Reddit, Video, Youtube } from "lucide-react";

// Using lucide-react components directly for icons
const TiktokIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-brand-tiktok">
    <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" />
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
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">@</span>
          <Input 
            id="instagram" 
            placeholder="username" 
            className={`pl-7 ${errors.instagram ? "border-red-500" : ""}`}
            value={instagram?.replace('@', '') || ''}
            onChange={(e) => setInstagram(e.target.value ? `@${e.target.value.replace('@', '')}` : '')}
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
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">@</span>
          <Input 
            id="tiktok" 
            placeholder="username" 
            className={`pl-7 ${errors.tiktok ? "border-red-500" : ""}`}
            value={tiktok?.replace('@', '') || ''}
            onChange={(e) => setTiktok(e.target.value ? `@${e.target.value.replace('@', '')}` : '')}
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
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">@</span>
          <Input 
            id="twitter" 
            placeholder="username" 
            className={`pl-7 ${errors.twitter ? "border-red-500" : ""}`}
            value={twitter?.replace('@', '') || ''}
            onChange={(e) => setTwitter(e.target.value ? `@${e.target.value.replace('@', '')}` : '')}
          />
        </div>
        {errors.twitter && (
          <p className="text-red-500 text-sm">{errors.twitter}</p>
        )}
      </div>
      
      {/* Reddit */}
      <div className="space-y-2">
        <Label htmlFor="reddit" className="flex items-center">
          <Reddit className="h-4 w-4 mr-2" />
          Reddit
        </Label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">u/</span>
          <Input 
            id="reddit" 
            placeholder="username" 
            className={`pl-7 ${errors.reddit ? "border-red-500" : ""}`}
            value={reddit?.replace('u/', '') || ''}
            onChange={(e) => setReddit(e.target.value ? `u/${e.target.value.replace('u/', '')}` : '')}
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
        <Input 
          id="chaturbate" 
          placeholder="username" 
          className={errors.chaturbate ? "border-red-500" : ""}
          value={chaturbate || ''}
          onChange={(e) => setChaturbate(e.target.value)}
        />
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
        <Input 
          id="youtube" 
          placeholder="channel or username" 
          className={errors.youtube ? "border-red-500" : ""}
          value={youtube || ''}
          onChange={(e) => setYoutube(e.target.value)}
        />
        {errors.youtube && (
          <p className="text-red-500 text-sm">{errors.youtube}</p>
        )}
      </div>
    </div>
  );
};

export default PredefinedSocialLinks;
