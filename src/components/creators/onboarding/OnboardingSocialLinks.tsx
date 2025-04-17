
import React from "react";
import { Control } from "react-hook-form";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { OnboardingFormValues } from "./OnboardingForm";
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

interface OnboardingSocialLinksProps {
  control: Control<OnboardingFormValues>;
}

const OnboardingSocialLinks: React.FC<OnboardingSocialLinksProps> = ({ control }) => {
  return (
    <div className="rounded-xl bg-gradient-to-br from-[#1a1a33]/50 to-[#1a1a33]/30 backdrop-blur-sm p-6 border border-[#252538]/50 shadow-lg">
      <h2 className="text-lg font-semibold mb-4 text-white">Social Media Links</h2>
      <div className="grid gap-4">
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={control}
            name="instagram"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-1.5">
                  <Instagram className="h-4 w-4 text-pink-500" /> Instagram
                </FormLabel>
                <FormControl>
                  <Input placeholder="https://instagram.com/profile" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={control}
            name="tiktok"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-1.5">
                  <TiktokIcon /> <span className="ml-1">TikTok</span>
                </FormLabel>
                <FormControl>
                  <Input placeholder="https://tiktok.com/@username" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={control}
            name="twitter"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-1.5">
                  <Twitter className="h-4 w-4 text-blue-500" /> Twitter
                </FormLabel>
                <FormControl>
                  <Input placeholder="https://twitter.com/username" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={control}
            name="reddit"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-1.5">
                  <RedditIcon /> <span className="ml-1">Reddit</span>
                </FormLabel>
                <FormControl>
                  <Input placeholder="https://reddit.com/user/username" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </div>
    </div>
  );
};

export default OnboardingSocialLinks;
