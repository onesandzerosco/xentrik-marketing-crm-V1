
import React, { useState } from "react";
import { useFormContext } from "react-hook-form";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, Trash } from "lucide-react";
import { CreatorOnboardingFormValues } from "@/schemas/creatorOnboardingSchema";

const SocialMediaSection: React.FC = () => {
  const { control, watch, setValue } = useFormContext<CreatorOnboardingFormValues>();
  
  const otherSocialMedia = watch("contentAndService.socialMediaHandles.other") || [];
  
  const addSocialMedia = () => {
    setValue("contentAndService.socialMediaHandles.other", [
      ...(otherSocialMedia || []),
      { platform: "", handle: "" }
    ]);
  };
  
  const removeSocialMedia = (index: number) => {
    setValue(
      "contentAndService.socialMediaHandles.other",
      otherSocialMedia.filter((_, i) => i !== index)
    );
  };
  
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-medium">Social Media Handles</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormField
          control={control}
          name="contentAndService.socialMediaHandles.instagram"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Instagram</FormLabel>
              <FormControl>
                <div className="relative">
                  <span className="absolute left-2 top-1/2 -translate-y-1/2">@</span>
                  <Input {...field} className="pl-6" placeholder="username" />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={control}
          name="contentAndService.socialMediaHandles.twitter"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Twitter</FormLabel>
              <FormControl>
                <div className="relative">
                  <span className="absolute left-2 top-1/2 -translate-y-1/2">@</span>
                  <Input {...field} className="pl-6" placeholder="username" />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormField
          control={control}
          name="contentAndService.socialMediaHandles.tiktok"
          render={({ field }) => (
            <FormItem>
              <FormLabel>TikTok</FormLabel>
              <FormControl>
                <div className="relative">
                  <span className="absolute left-2 top-1/2 -translate-y-1/2">@</span>
                  <Input {...field} className="pl-6" placeholder="username" />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={control}
          name="contentAndService.socialMediaHandles.onlyfans"
          render={({ field }) => (
            <FormItem>
              <FormLabel>OnlyFans</FormLabel>
              <FormControl>
                <div className="relative">
                  <span className="absolute left-2 top-1/2 -translate-y-1/2">@</span>
                  <Input {...field} className="pl-6" placeholder="username" />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
      
      <FormField
        control={control}
        name="contentAndService.socialMediaHandles.snapchat"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Snapchat</FormLabel>
            <FormControl>
              <div className="relative">
                <span className="absolute left-2 top-1/2 -translate-y-1/2">@</span>
                <Input {...field} className="pl-6" placeholder="username" />
              </div>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-medium">Other Social Media</h4>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addSocialMedia}
            className="flex items-center gap-1"
          >
            <Plus className="h-4 w-4" /> Add
          </Button>
        </div>
        
        {otherSocialMedia.map((_, index) => (
          <div key={index} className="flex items-center gap-4">
            <FormField
              control={control}
              name={`contentAndService.socialMediaHandles.other.${index}.platform`}
              render={({ field }) => (
                <FormItem className="flex-1">
                  <FormControl>
                    <Input {...field} placeholder="Platform" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={control}
              name={`contentAndService.socialMediaHandles.other.${index}.handle`}
              render={({ field }) => (
                <FormItem className="flex-1">
                  <FormControl>
                    <div className="relative">
                      <span className="absolute left-2 top-1/2 -translate-y-1/2">@</span>
                      <Input {...field} className="pl-6" placeholder="username" />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => removeSocialMedia(index)}
            >
              <Trash className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SocialMediaSection;
