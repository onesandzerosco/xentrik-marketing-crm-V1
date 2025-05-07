
import React from "react";
import { useFormContext } from "react-hook-form";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { CreatorOnboardingFormValues } from "@/schemas/creatorOnboardingSchema";

export const PersonalPreferencesForm: React.FC = () => {
  const { control } = useFormContext<CreatorOnboardingFormValues>();

  return (
    <div className="space-y-6">
      <FormField
        control={control}
        name="personalPreferences.hobbies"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Hobbies</FormLabel>
            <FormControl>
              <Input 
                placeholder="Enter hobbies separated by commas" 
                value={field.value?.join(", ") || ""} 
                onChange={(e) => {
                  const value = e.target.value;
                  field.onChange(
                    value ? value.split(",").map(item => item.trim()) : []
                  );
                }}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="personalPreferences.favoriteDrink"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Favorite Drink</FormLabel>
            <FormControl>
              <Input {...field} placeholder="Enter favorite drink" />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <FormField
            control={control}
            name="personalPreferences.canSing"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                <FormControl>
                  <Checkbox 
                    checked={field.value} 
                    onCheckedChange={field.onChange} 
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>Do you sing?</FormLabel>
                </div>
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name="personalPreferences.smokes"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                <FormControl>
                  <Checkbox 
                    checked={field.value} 
                    onCheckedChange={field.onChange} 
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>Do you smoke?</FormLabel>
                </div>
              </FormItem>
            )}
          />
        </div>

        <div className="space-y-4">
          <FormField
            control={control}
            name="personalPreferences.drinks"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                <FormControl>
                  <Checkbox 
                    checked={field.value} 
                    onCheckedChange={field.onChange} 
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>Do you drink?</FormLabel>
                </div>
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name="personalPreferences.isSexual"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                <FormControl>
                  <Checkbox 
                    checked={field.value} 
                    onCheckedChange={field.onChange} 
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>Are you a sexual person?</FormLabel>
                </div>
              </FormItem>
            )}
          />
        </div>
      </div>

      <FormField
        control={control}
        name="personalPreferences.homeActivities"
        render={({ field }) => (
          <FormItem>
            <FormLabel>What do you do when you're at home?</FormLabel>
            <FormControl>
              <Textarea 
                {...field} 
                placeholder="Describe your home activities" 
                className="min-h-[100px]"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="personalPreferences.morningRoutine"
        render={({ field }) => (
          <FormItem>
            <FormLabel>First thing you do in the morning</FormLabel>
            <FormControl>
              <Input {...field} placeholder="Describe your morning routine" />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormField
          control={control}
          name="personalPreferences.likeInPerson"
          render={({ field }) => (
            <FormItem>
              <FormLabel>What do you like best in a person?</FormLabel>
              <FormControl>
                <Textarea 
                  {...field} 
                  placeholder="Describe what you like in a person" 
                  className="min-h-[100px]"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="personalPreferences.dislikeInPerson"
          render={({ field }) => (
            <FormItem>
              <FormLabel>What do you hate most about a person?</FormLabel>
              <FormControl>
                <Textarea 
                  {...field} 
                  placeholder="Describe what you dislike in a person" 
                  className="min-h-[100px]"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <FormField
        control={control}
        name="personalPreferences.turnOffs"
        render={({ field }) => (
          <FormItem>
            <FormLabel>What turns you off?</FormLabel>
            <FormControl>
              <Textarea 
                {...field} 
                placeholder="Describe your turn-offs" 
                className="min-h-[100px]"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="personalPreferences.favoriteExpression"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Favorite Expression</FormLabel>
            <FormControl>
              <Input {...field} placeholder="Your favorite expression or saying" />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};
