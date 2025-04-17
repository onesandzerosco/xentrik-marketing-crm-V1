
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

// Reddit icon component
const RedditIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="lucide lucide-reddit">
    <path d="M14.5 9a1.5 1.5 0 1 0-1.5 1.5A1.5 1.5 0 0 0 14.5 9zm-5 0A1.5 1.5 0 1 0 8 10.5 1.5 1.5 0 0 0 9.5 9zm5.61 2.36c.4-.4.4-1.04 0-1.44a1.016 1.016 0 0 0-1.44 0c-1.13 1.13-3.09 1.13-4.22 0a1.016 1.016 0 0 0-1.44 0c-.4.4-.4 1.04 0 1.44a3.62 3.62 0 0 0 5.1 0zM12 22c-5.47 0-10-4.53-10-10S6.53 2 12 2s10 4.53 10 10-4.53 10-10 10zm7.35-11.14a5.74 5.74 0 0 0-11.1 0 1 1 0 1 0 1.9.62 3.74 3.74 0 0 1 7.3 0 1 1 0 1 0 1.9-.62z"/>
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
