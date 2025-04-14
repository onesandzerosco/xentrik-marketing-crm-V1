import React from "react";
import { FormField, FormItem, FormLabel, FormControl, FormMessage, FormDescription } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Control, useWatch } from "react-hook-form";
import { z } from "zod";

const formSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  email: z.string().email({ message: "Please enter a valid email address." }),
  role: z.enum(["Admin", "Manager", "Employee"]),
  status: z.enum(["Active", "Inactive", "Paused"]),
  telegram: z.string().optional(),
  pendingTelegram: z.boolean().optional(),
  department: z.string().optional(),
});

interface BasicInfoSectionProps {
  control: Control<z.infer<typeof formSchema>>;
  isCurrentUser: boolean;
}

const BasicInfoSection: React.FC<BasicInfoSectionProps> = ({
  control,
  isCurrentUser,
}) => {
  const pendingTelegram = useWatch({
    control,
    name: "pendingTelegram",
    defaultValue: false
  });

  return (
    <div className="flex-1 space-y-4">
      <FormField
        control={control}
        name="name"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Full Name</FormLabel>
            <FormControl>
              <Input {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      
      <FormField
        control={control}
        name="email"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Email Address</FormLabel>
            <FormControl>
              <Input {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FormField
          control={control}
          name="role"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Role</FormLabel>
              {isCurrentUser && (
                <FormDescription>
                  You cannot change your own role.
                </FormDescription>
              )}
              <Select 
                onValueChange={field.onChange} 
                defaultValue={field.value}
                disabled={isCurrentUser}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a role" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="Admin">Admin</SelectItem>
                  <SelectItem value="Manager">Manager</SelectItem>
                  <SelectItem value="Employee">Employee</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={control}
          name="status"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Status</FormLabel>
              {isCurrentUser && (
                <FormDescription>
                  You cannot change your own status.
                </FormDescription>
              )}
              <Select 
                onValueChange={field.onChange} 
                defaultValue={field.value}
                disabled={isCurrentUser}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a status" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Paused">Paused</SelectItem>
                  <SelectItem value="Inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
      
      <FormField
        control={control}
        name="telegram"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Telegram Username</FormLabel>
            <div className="flex items-center space-x-2">
              <div className="flex-1 flex items-center">
                <span className="mr-2 text-muted-foreground">@</span>
                <FormControl>
                  <Input 
                    {...field} 
                    placeholder="username" 
                    value={field.value || ''}
                    disabled={pendingTelegram}
                  />
                </FormControl>
              </div>
              <FormField
                control={control}
                name="pendingTelegram"
                render={({ field: checkboxField }) => (
                  <FormItem className="flex items-center space-x-2">
                    <FormControl>
                      <Checkbox
                        checked={checkboxField.value}
                        onCheckedChange={(checked) => {
                          checkboxField.onChange(checked);
                          if (checked) {
                            field.onChange('');
                          }
                        }}
                      />
                    </FormControl>
                    <FormLabel>Pending</FormLabel>
                  </FormItem>
                )}
              />
            </div>
            <FormDescription>
              {pendingTelegram 
                ? "Telegram handle will be added later" 
                : "Enter Telegram username without @"}
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
      
      <FormField
        control={control}
        name="department"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Department</FormLabel>
            <FormControl>
              <Input {...field} placeholder="Department" />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};

export default BasicInfoSection;
