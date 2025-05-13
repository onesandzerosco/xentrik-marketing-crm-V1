
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { PrimaryRole } from "@/types/employee";
import { PRIMARY_ROLES, ADDITIONAL_ROLES, EXCLUSIVE_ROLES } from "../admin/users/constants";
import { useToast } from "@/hooks/use-toast";
import { CardTitle, CardDescription } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

const formSchema = z.object({
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
  primaryRole: z.enum(["Admin", "Manager", "Employee"] as [PrimaryRole, ...PrimaryRole[]]),
  additionalRoles: z.array(z.string())
});

type FormData = z.infer<typeof formSchema>;

const AddTeamMemberForm: React.FC = () => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Filter out "Creator" from the displayed options
  const availableAdditionalRoles = ADDITIONAL_ROLES.filter(role => role !== "Creator");
  
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      primaryRole: "Employee",
      additionalRoles: []
    }
  });

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    
    try {
      // Call the stored procedure to create a team member with default password
      const { data: newUser, error } = await supabase.rpc('create_team_member', {
        email: data.email,
        password: 'XentrikBananas', // Set default password as requested
        name: data.email.split('@')[0], // Use first part of email as name
        phone: '', // Empty optional fields
        telegram: '',
        roles: data.additionalRoles,
      });

      if (error) {
        throw new Error(error.message);
      }

      // Update the primary role
      const { error: updateError } = await supabase.rpc('admin_update_user_roles', {
        user_id: newUser,
        new_primary_role: data.primaryRole,
        new_additional_roles: data.additionalRoles
      });

      if (updateError) {
        throw new Error(updateError.message);
      }

      toast({
        title: "Success",
        description: `New team member created with email ${data.email}`,
      });

      // Reset form
      form.reset({
        email: "",
        primaryRole: "Employee",
        additionalRoles: []
      });
    } catch (error: any) {
      console.error("Error creating team member:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to create team member",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Check if an additional role should be disabled based on selected roles
  const isRoleDisabled = (role: string): boolean => {
    const selectedRoles = form.watch("additionalRoles");
    // If current roles include any exclusive role and this isn't that role
    return selectedRoles.some(r => 
      EXCLUSIVE_ROLES.includes(r) && r !== role
    );
  };

  // Handle checkbox change for additional roles
  const handleAdditionalRoleChange = (checked: boolean | string, role: string) => {
    const currentRoles = form.getValues("additionalRoles");
    
    if (checked) {
      // If adding an exclusive role, clear all other roles
      if (EXCLUSIVE_ROLES.includes(role)) {
        form.setValue("additionalRoles", [role]);
      } else {
        // If adding a non-exclusive role, remove any exclusive roles first
        const filteredRoles = currentRoles.filter(r => !EXCLUSIVE_ROLES.includes(r));
        form.setValue("additionalRoles", [...filteredRoles, role]);
      }
    } else {
      // If removing a role, just filter it out
      form.setValue(
        "additionalRoles", 
        currentRoles.filter(r => r !== role)
      );
    }
  };

  return (
    <div>
      <CardTitle className="text-xl mb-2">Add Team Member</CardTitle>
      <CardDescription className="mb-6">
        Create a new authenticated account for a team member
      </CardDescription>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email Address</FormLabel>
                <FormControl>
                  <Input placeholder="name@example.com" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
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

          <div className="space-y-3">
            <FormLabel>Additional Roles</FormLabel>
            <p className="text-sm text-muted-foreground">
              Select all roles that apply to this user
            </p>
            <p className="text-xs text-amber-500">
              Note: Admin is an exclusive role and cannot be combined with other roles
            </p>
            
            <div className="grid grid-cols-2 gap-2 pt-2">
              {availableAdditionalRoles.map((role) => (
                <div key={role} className="flex items-center space-x-2">
                  <Checkbox 
                    id={`role-${role}`}
                    checked={form.watch("additionalRoles").includes(role)}
                    onCheckedChange={(checked) => handleAdditionalRoleChange(checked, role)}
                    disabled={isRoleDisabled(role)}
                    className={isRoleDisabled(role) ? "opacity-50" : ""}
                  />
                  <label 
                    htmlFor={`role-${role}`}
                    className={`text-sm cursor-pointer ${isRoleDisabled(role) ? "text-muted-foreground" : ""}`}
                  >
                    {role}
                  </label>
                </div>
              ))}
            </div>
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating Account...
              </>
            ) : (
              "Create Team Member"
            )}
          </Button>
          
          <p className="text-xs text-muted-foreground text-center mt-4">
            New account will be created with default password: XentrikBananas
          </p>
        </form>
      </Form>
    </div>
  );
};

export default AddTeamMemberForm;
