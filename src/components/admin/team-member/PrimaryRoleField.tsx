
import React from "react";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PRIMARY_ROLES } from "../users/constants";
import { Control } from "react-hook-form";
import { TeamMemberFormData } from "./schema";

interface PrimaryRoleFieldProps {
  control: Control<TeamMemberFormData>;
}

const PrimaryRoleField: React.FC<PrimaryRoleFieldProps> = ({ control }) => {
  return (
    <FormField
      control={control}
      name="primaryRole"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Primary Role</FormLabel>
          <FormControl>
            <Select
              onValueChange={field.onChange}
              defaultValue={field.value}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select primary role" />
              </SelectTrigger>
              <SelectContent>
                {PRIMARY_ROLES.map((role) => (
                  <SelectItem key={role} value={role}>
                    {role}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export default PrimaryRoleField;
