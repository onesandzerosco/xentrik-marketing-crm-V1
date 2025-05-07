
import React from "react";
import { useFormContext } from "react-hook-form";
import { FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { CreatorOnboardingFormValues } from "@/schemas/creatorOnboardingSchema";

export const PhysicalAttributesForm: React.FC = () => {
  const { control, watch } = useFormContext<CreatorOnboardingFormValues>();
  const hasTattoos = watch("physicalAttributes.hasTattoos");

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <FormField
          control={control}
          name="physicalAttributes.weight"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Weight</FormLabel>
              <FormControl>
                <Input {...field} placeholder="e.g., 68kg" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="physicalAttributes.height"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Height</FormLabel>
              <FormControl>
                <Input {...field} placeholder="e.g., 175cm" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="physicalAttributes.bodyType"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Body Type</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select body type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="slim">Slim</SelectItem>
                  <SelectItem value="athletic">Athletic</SelectItem>
                  <SelectItem value="average">Average</SelectItem>
                  <SelectItem value="curvy">Curvy</SelectItem>
                  <SelectItem value="muscular">Muscular</SelectItem>
                  <SelectItem value="plus_size">Plus Size</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormField
          control={control}
          name="physicalAttributes.favoriteColor"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Favorite Color</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Enter favorite color" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="physicalAttributes.dislikedColor"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Disliked Color</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Enter disliked color" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <FormField
        control={control}
        name="physicalAttributes.allergies"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Allergies</FormLabel>
            <FormControl>
              <Input {...field} placeholder="List any allergies" />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="physicalAttributes.hasTattoos"
        render={({ field }) => (
          <FormItem className="flex flex-row items-start space-x-3 space-y-0">
            <FormControl>
              <Checkbox 
                checked={field.value} 
                onCheckedChange={field.onChange} 
              />
            </FormControl>
            <div className="space-y-1 leading-none">
              <FormLabel>Do you have tattoos?</FormLabel>
            </div>
          </FormItem>
        )}
      />

      {hasTattoos && (
        <FormField
          control={control}
          name="physicalAttributes.tattooDetails"
          render={({ field }) => (
            <FormItem className="ml-7">
              <FormLabel>Tattoo details (how many and where)</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Describe your tattoos" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormField
          control={control}
          name="physicalAttributes.bustWaistHip"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Bust-Waist-Hip Measurement</FormLabel>
              <FormControl>
                <Input {...field} placeholder="e.g., 36-24-36" />
              </FormControl>
              <FormDescription>
                Measurements in inches, separated by hyphens
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="physicalAttributes.dickSize"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Dick Size</FormLabel>
              <FormControl>
                <Input {...field} placeholder="e.g., 7 inches" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormField
          control={control}
          name="physicalAttributes.isCircumcised"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0">
              <FormControl>
                <Checkbox 
                  checked={field.value} 
                  onCheckedChange={field.onChange} 
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>Circumcised</FormLabel>
              </div>
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="physicalAttributes.isTopOrBottom"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Top or Bottom?</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select preference" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="Top">Top</SelectItem>
                  <SelectItem value="Bottom">Bottom</SelectItem>
                  <SelectItem value="Versatile">Versatile</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
};
