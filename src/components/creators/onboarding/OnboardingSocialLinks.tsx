
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
    <div className="bg-[#1a1a33] text-card-foreground rounded-lg border border-[#252538] shadow-sm p-6 space-y-6">
      <h2 className="text-lg font-semibold">Social Media Links</h2>
      <div className="grid gap-4 sm:grid-cols-2">
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
