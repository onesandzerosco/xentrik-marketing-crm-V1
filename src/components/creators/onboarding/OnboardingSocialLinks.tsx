
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
    <div className="space-y-6 rounded-2xl bg-gradient-to-br from-[#1a1a33]/50 to-[#1a1a33]/30 backdrop-blur-sm p-8 border border-[#252538]/50 shadow-lg">
      <h2 className="text-xl font-semibold mb-6">Social Media Links</h2>
      <div className="grid gap-6 sm:grid-cols-2">
        <FormField
          control={control}
          name="instagram"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Instagram</FormLabel>
              <FormControl>
                <Input placeholder="Instagram username" {...field} />
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
                <Input placeholder="TikTok username" {...field} />
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
                <Input placeholder="Twitter username" {...field} />
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
                <Input placeholder="Reddit username" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name="chaturbate"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Chaturbate</FormLabel>
              <FormControl>
                <Input placeholder="Chaturbate username" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
};

export default OnboardingSocialLinks;
