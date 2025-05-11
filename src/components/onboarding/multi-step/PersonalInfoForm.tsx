import React from 'react';
import { useFormContext } from 'react-hook-form';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { 
  Select,
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import PetsSection from './PetsSection';
import { CreatorOnboardingFormValues } from "@/schemas/creatorOnboardingSchema";

export const PersonalInfoForm = () => {
  const { control, watch } = useFormContext<CreatorOnboardingFormValues>();
  const hasPets = watch('personalInfo.hasPets');
  const hasKids = watch('personalInfo.hasKids');

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          control={control}
          name="personalInfo.fullName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Full Name</FormLabel>
              <FormControl>
                <Input placeholder="Your full name" {...field} />
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
              <FormLabel>Nickname (Optional)</FormLabel>
              <FormControl>
                <Input placeholder="Preferred name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={control}
          name="personalInfo.email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email Address</FormLabel>
              <FormControl>
                <Input type="email" placeholder="Email address" {...field} />
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
              <FormLabel>Date of Birth</FormLabel>
              <FormControl>
                <Input type="date" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={control}
          name="personalInfo.sex"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Sex/Gender</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="Female">Female</SelectItem>
                  <SelectItem value="Male">Male</SelectItem>
                  <SelectItem value="Transgender">Transgender</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="personalInfo.location"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Location</FormLabel>
              <FormControl>
                <Input placeholder="City, Country" {...field} />
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
                <Input placeholder="Ethnicity" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="personalInfo.religion"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Religion (Optional)</FormLabel>
              <FormControl>
                <Input placeholder="Religion" {...field} />
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
              <FormControl>
                <Input placeholder="e.g. Single, Married, etc." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="personalInfo.handedness"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Handedness</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Left or Right handed" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="Left">Left</SelectItem>
                  <SelectItem value="Right">Right</SelectItem>
                  <SelectItem value="Ambidextrous">Ambidextrous</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="personalInfo.hasPets"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>Do you have pets?</FormLabel>
              </div>
            </FormItem>
          )}
        />

        {hasPets && <PetsSection />}

        <FormField
          control={control}
          name="personalInfo.hasKids"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
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

        {hasKids && (
          <FormField
            control={control}
            name="personalInfo.numberOfKids"
            render={({ field }) => (
              <FormItem>
                <FormLabel>How many kids?</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    min={1} 
                    {...field} 
                    onChange={(e) => field.onChange(Number(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}
      </div>

      <div className="grid grid-cols-1 gap-4">
        <FormField
          control={control}
          name="personalInfo.occupation"
          render={({ field }) => (
            <FormItem>
              <FormLabel>What do you do for work?</FormLabel>
              <FormControl>
                <Input placeholder="Occupation" {...field} />
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
              <FormLabel>Where do you work? (Optional)</FormLabel>
              <FormControl>
                <Input placeholder="Workplace" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="personalInfo.placesVisited"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Places/Countries you've visited (comma separated)</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="E.g. France, Italy, Japan"
                  onChange={(e) => {
                    // Split on commas and trim, allowing spaces and commas
                    const placesText = e.target.value;
                    const places = placesText.split(',').map(place => place.trim()).filter(Boolean);
                    field.onChange(places);
                  }}
                  value={field.value?.join(', ') || ''}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
};

export default PersonalInfoForm;
