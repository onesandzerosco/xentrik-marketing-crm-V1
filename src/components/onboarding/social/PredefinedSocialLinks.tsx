
import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Instagram, Twitter, Video, Youtube } from "lucide-react";

// Custom TikTok icon since it's not available in lucide-react
const TiktokIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-brand-tiktok">
    <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" />
  </svg>
);

// Reddit icon component with proper SVG path
const RedditIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide">
    <circle cx="12" cy="12" r="9" />
    <circle cx="16.5" cy="8.5" r="1.5" />
    <circle cx="7.5" cy="8.5" r="1.5" />
    <path d="M12 16c1.2 0 3-1 3-2.5C15 13 12 13 12 13s-3 0-3 .5c0 1.5 1.8 2.5 3 2.5z" />
    <path d="M18 9.66a5 5 0 0 0-8.66-3.39 12 12 0 0 0-6.47 3" />
    <line x1="17.73" y1="13" x2="19" y2="14.27" />
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
          <Input 
            id="instagram" 
            placeholder="https://instagram.com/profile" 
            className={`${errors.instagram ? "border-red-500" : ""}`}
            value={instagram || ''}
            onChange={(e) => setInstagram(e.target.value)}
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
          <Input 
            id="tiktok" 
            placeholder="https://tiktok.com/@username" 
            className={`${errors.tiktok ? "border-red-500" : ""}`}
            value={tiktok || ''}
            onChange={(e) => setTiktok(e.target.value)}
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
          <Input 
            id="twitter" 
            placeholder="https://twitter.com/username" 
            className={`${errors.twitter ? "border-red-500" : ""}`}
            value={twitter || ''}
            onChange={(e) => setTwitter(e.target.value)}
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
          <Input 
            id="reddit" 
            placeholder="https://reddit.com/user/username" 
            className={`${errors.reddit ? "border-red-500" : ""}`}
            value={reddit || ''}
            onChange={(e) => setReddit(e.target.value)}
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
          <Input 
            id="chaturbate" 
            placeholder="https://chaturbate.com/username" 
            className={`${errors.chaturbate ? "border-red-500" : ""}`}
            value={chaturbate || ''}
            onChange={(e) => setChaturbate(e.target.value)}
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
          <Input 
            id="youtube" 
            placeholder="https://youtube.com/c/channel" 
            className={`${errors.youtube ? "border-red-500" : ""}`}
            value={youtube || ''}
            onChange={(e) => setYoutube(e.target.value)}
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
