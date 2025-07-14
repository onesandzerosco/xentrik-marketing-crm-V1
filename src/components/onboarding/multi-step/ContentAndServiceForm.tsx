
import React, { useState } from "react";
import { useFormContext } from "react-hook-form";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Plus, Trash } from "lucide-react";
import { CreatorOnboardingFormValues } from "@/schemas/creatorOnboardingSchema";
import SocialMediaSection from "./SocialMediaSection";

export const ContentAndServiceForm: React.FC = () => {
  const { control, watch } = useFormContext<CreatorOnboardingFormValues>();
  
  const hasFetish = watch("contentAndService.hasFetish");

  return (
    <div className="space-y-4 sm:space-y-6">
      <SocialMediaSection />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
        <FormField
          control={control}
          name="contentAndService.bodyCount"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Body Count</FormLabel>
              <FormControl>
                <Input 
                  type="number" 
                  min={0}
                  {...field} 
                  value={field.value || ""}
                  onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                  className="min-h-[44px]"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="contentAndService.craziestSexPlace"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Craziest place you've had sex in</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Enter location" className="min-h-[44px]" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <div className="space-y-4">
        <FormField
          control={control}
          name="contentAndService.hasFetish"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-3 sm:p-4 min-h-[44px]">
              <FormControl>
                <Checkbox 
                  checked={field.value} 
                  onCheckedChange={field.onChange}
                  className="mt-1"
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel className="text-sm sm:text-base">Any fetish?</FormLabel>
              </div>
            </FormItem>
          )}
        />

        {hasFetish && (
          <FormField
            control={control}
            name="contentAndService.fetishDetails"
            render={({ field }) => (
              <FormItem className="ml-7">
                <FormLabel>Describe your fetishes</FormLabel>
                <FormControl>
                  <Textarea 
                    {...field} 
                    placeholder="Describe your fetishes" 
                    className="min-h-[100px]"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
        <div className="space-y-4">
          <FormField
            control={control}
            name="contentAndService.doesAnal"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-3 sm:p-4 min-h-[44px]">
                <FormControl>
                  <Checkbox 
                    checked={field.value} 
                    onCheckedChange={field.onChange}
                    className="mt-1"
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel className="text-sm sm:text-base">Do you do anal?</FormLabel>
                </div>
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name="contentAndService.hasTriedOrgy"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-3 sm:p-4 min-h-[44px]">
                <FormControl>
                  <Checkbox 
                    checked={field.value} 
                    onCheckedChange={field.onChange}
                    className="mt-1"
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel className="text-sm sm:text-base">Have you tried orgy?</FormLabel>
                </div>
              </FormItem>
            )}
          />
        </div>

        <div className="space-y-4">
          <FormField
            control={control}
            name="contentAndService.lovesThreesomes"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-3 sm:p-4 min-h-[44px]">
                <FormControl>
                  <Checkbox 
                    checked={field.value} 
                    onCheckedChange={field.onChange}
                    className="mt-1"
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel className="text-sm sm:text-base">Do you love threesomes?</FormLabel>
                </div>
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name="contentAndService.sellsUnderwear"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-3 sm:p-4 min-h-[44px]">
                <FormControl>
                  <Checkbox 
                    checked={field.value} 
                    onCheckedChange={field.onChange}
                    className="mt-1"
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel className="text-sm sm:text-base">Open to selling underwear?</FormLabel>
                </div>
              </FormItem>
            )}
          />
        </div>
      </div>

      <FormField
        control={control}
        name="contentAndService.sexToysCount"
        render={({ field }) => (
          <FormItem>
            <FormLabel>How many sex toys do you have?</FormLabel>
            <FormControl>
              <Input 
                type="number" 
                min={0}
                {...field} 
                value={field.value || ""}
                onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                className="min-h-[44px]"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="contentAndService.favoritePosition"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Favorite sex position</FormLabel>
            <FormControl>
              <Input {...field} placeholder="Enter favorite position" className="min-h-[44px]" />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="contentAndService.fanHandlingPreference"
        render={({ field }) => (
          <FormItem>
            <FormLabel>How do you like to handle your fans?</FormLabel>
            <FormControl>
              <Textarea 
                {...field} 
                placeholder="Describe your fan interaction style" 
                className="min-h-[100px]"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
        <div className="space-y-4">
          <FormField
            control={control}
            name="contentAndService.pricePerMinute"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Price per minute in custom vids</FormLabel>
                <FormControl>
                  <div className="relative">
                    <span className="absolute left-2 top-1/2 -translate-y-1/2">$</span>
                    <Input 
                      type="number" 
                      min={0}
                      step="0.01"
                      className="pl-6"
                      {...field} 
                      value={field.value || ""}
                      onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name="contentAndService.customVideoNotes"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Additional Notes for Custom Videos</FormLabel>
                <FormControl>
                  <Textarea 
                    {...field} 
                    placeholder="Any additional notes about custom video pricing or preferences..."
                    className="min-h-[80px]"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="space-y-4">
          <FormField
            control={control}
            name="contentAndService.videoCallPrice"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Price for video call</FormLabel>
                <FormControl>
                  <div className="relative">
                    <span className="absolute left-2 top-1/2 -translate-y-1/2">$</span>
                    <Input 
                      type="number" 
                      min={0}
                      step="0.01"
                      className="pl-6"
                      {...field} 
                      value={field.value || ""}
                      onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name="contentAndService.videoCallNotes"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Additional Notes for Video Calls</FormLabel>
                <FormControl>
                  <Textarea 
                    {...field} 
                    placeholder="Any additional notes about video call pricing or preferences..."
                    className="min-h-[80px]"
                  />
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
