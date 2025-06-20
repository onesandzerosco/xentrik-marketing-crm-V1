
import React from "react";
import { Control } from "react-hook-form";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import { TeamMemberFormData } from "./schema";

interface GeographicRestrictionsFieldProps {
  control: Control<TeamMemberFormData>;
}

const GeographicRestrictionsField: React.FC<GeographicRestrictionsFieldProps> = ({
  control,
}) => {
  const restrictions = [
    { id: "south_africa", label: "South Africa" },
    // Add more countries/regions as needed
  ];

  return (
    <FormField
      control={control}
      name="geographicRestrictions"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Geographic Restrictions</FormLabel>
          <FormControl>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                Select regions this team member should NOT have access to:
              </p>
              {restrictions.map((restriction) => (
                <div key={restriction.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={restriction.id}
                    checked={field.value?.includes(restriction.id) || false}
                    onCheckedChange={(checked) => {
                      const currentValue = field.value || [];
                      if (checked) {
                        field.onChange([...currentValue, restriction.id]);
                      } else {
                        field.onChange(
                          currentValue.filter((item) => item !== restriction.id)
                        );
                      }
                    }}
                  />
                  <label
                    htmlFor={restriction.id}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    {restriction.label}
                  </label>
                </div>
              ))}
            </div>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export default GeographicRestrictionsField;
