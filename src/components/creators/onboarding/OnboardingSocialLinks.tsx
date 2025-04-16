
import React from "react";
import { Control } from "react-hook-form";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { OnboardingFormValues } from "./OnboardingForm";

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
                <FormLabel>Instagram</FormLabel>
                <FormControl>
                  <Input placeholder="https://www.instagram.com/username" {...field} />
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
                <FormLabel>TikTok</FormLabel>
                <FormControl>
                  <Input placeholder="https://www.tiktok.com/@username" {...field} />
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
                <FormLabel>Twitter</FormLabel>
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
                <FormLabel>Reddit</FormLabel>
                <FormControl>
                  <Input placeholder="https://www.reddit.com/user/username" {...field} />
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
