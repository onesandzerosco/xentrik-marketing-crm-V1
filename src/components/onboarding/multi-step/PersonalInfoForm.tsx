
import React from "react";
import { useFormContext } from "react-hook-form";
import { FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { CreatorOnboardingFormValues } from "@/schemas/creatorOnboardingSchema";
import PetsSection from "./PetsSection";

export const PersonalInfoForm: React.FC = () => {
  const { control } = useFormContext<CreatorOnboardingFormValues>();

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormField
          control={control}
          name="personalInfo.fullName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Full Name <span className="text-red-500">*</span></FormLabel>
              <FormControl>
                <Input {...field} placeholder="Enter full name" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="personalInfo.nickname"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nickname</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Enter nickname" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <FormField
        control={control}
        name="personalInfo.email"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Email Address <span className="text-red-500">*</span></FormLabel>
            <FormControl>
              <Input {...field} type="email" placeholder="Enter email address" />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="personalInfo.dateOfBirth"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Date of Birth <span className="text-red-500">*</span></FormLabel>
            <FormControl>
              <Input {...field} type="date" placeholder="YYYY-MM-DD" />
            </FormControl>
            <FormDescription>
              Age will be calculated automatically
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormField
          control={control}
          name="personalInfo.location"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Location</FormLabel>
              <FormControl>
                <Input {...field} placeholder="City, Country" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="personalInfo.ethnicity"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Ethnicity</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Enter ethnicity" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormField
          control={control}
          name="personalInfo.religion"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Religion</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Enter religion" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="personalInfo.relationshipStatus"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Relationship Status</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select relationship status" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="single">Single</SelectItem>
                  <SelectItem value="in_relationship">In a Relationship</SelectItem>
                  <SelectItem value="engaged">Engaged</SelectItem>
                  <SelectItem value="married">Married</SelectItem>
                  <SelectItem value="divorced">Divorced</SelectItem>
                  <SelectItem value="widowed">Widowed</SelectItem>
                  <SelectItem value="complicated">It's Complicated</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <FormField
        control={control}
        name="personalInfo.handedness"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Lefty or Righty</FormLabel>
            <Select onValueChange={field.onChange} value={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select handedness" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="Left">Left-handed</SelectItem>
                <SelectItem value="Right">Right-handed</SelectItem>
                <SelectItem value="Ambidextrous">Ambidextrous</SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      <PetsSection />

      <div className="space-y-4">
        <FormField
          control={control}
          name="personalInfo.hasKids"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0">
              <FormControl>
                <Checkbox 
                  checked={field.value} 
                  onCheckedChange={field.onChange} 
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>Do you have kids?</FormLabel>
              </div>
            </FormItem>
          )}
        />

        {/* Show number of kids field if hasKids is true */}
        <FormField
          control={control}
          name="personalInfo.numberOfKids"
          render={({ field }) => (
            <FormItem className="ml-7">
              <FormLabel>How many kids?</FormLabel>
              <FormControl>
                <Input 
                  type="number" 
                  min={0}
                  {...field} 
                  value={field.value || ""}
                  onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)} 
                  disabled={!control._formValues.personalInfo.hasKids}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormField
          control={control}
          name="personalInfo.occupation"
          render={({ field }) => (
            <FormItem>
              <FormLabel>What do you do for work?</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Enter occupation" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="personalInfo.workplace"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Where do you work?</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Enter workplace" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <FormField
        control={control}
        name="personalInfo.placesVisited"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Places/Countries you've visited</FormLabel>
            <FormControl>
              <Input 
                placeholder="Enter places separated by commas" 
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
    </div>
  );
};
