
import React, { useState, useEffect } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter 
} from "@/components/ui/dialog";
import { 
  RadioGroup, 
  RadioGroupItem 
} from "@/components/ui/radio-group";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { CheckboxGroup } from "@/components/ui/checkbox-group";
import { Employee, PrimaryRole } from "@/types/employee";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface EditUserRolesModalProps {
  user: Employee | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdate: (userId: string, primaryRole: PrimaryRole, additionalRoles: string[]) => void;
}

const PRIMARY_ROLES: PrimaryRole[] = ["Admin", "Manager", "Employee"];

// Updated additional roles options
const ADDITIONAL_ROLES: string[] = [
  "Chatters", 
  "VA", 
  "Admin", 
  "Developer",
  "Creator"
];

const EditUserRolesModal: React.FC<EditUserRolesModalProps> = ({
  user,
  open,
  onOpenChange,
  onUpdate
}) => {
  const [primaryRole, setPrimaryRole] = useState<PrimaryRole>("Employee");
  const [additionalRoles, setAdditionalRoles] = useState<string[]>([]);
  const [showAdminAlert, setShowAdminAlert] = useState(false);
  const [pendingRoleChange, setPendingRoleChange] = useState<PrimaryRole | null>(null);
  const { toast } = useToast();

  // Reset state when user or open state changes
  useEffect(() => {
    if (user && open) {
      console.log("Setting initial roles from user:", { role: user.role, roles: user.roles });
      // Set primary role from user.role
      setPrimaryRole(user.role as PrimaryRole);
      // Set additional roles from user.roles (if it exists) or empty array
      setAdditionalRoles(user.roles || []);
    }
  }, [user, open]);

  const handlePrimaryRoleChange = (role: PrimaryRole) => {
    // If changing to or from Admin, show confirmation
    if (role === "Admin" || primaryRole === "Admin") {
      setPendingRoleChange(role);
      setShowAdminAlert(true);
    } else {
      setPrimaryRole(role);
    }
  };

  const handleConfirmAdminChange = () => {
    if (pendingRoleChange) {
      setPrimaryRole(pendingRoleChange);
      setPendingRoleChange(null);
    }
    setShowAdminAlert(false);
  };

  const handleCancelAdminChange = () => {
    setPendingRoleChange(null);
    setShowAdminAlert(false);
  };

  const toggleAdditionalRole = (role: string) => {
    setAdditionalRoles(prev => {
      if (prev.includes(role)) {
        return prev.filter(r => r !== role);
      } else {
        return [...prev, role];
      }
    });
  };

  // Create creator record if user is assigned Creator role
  const createCreatorRecord = async (userId: string, userName: string) => {
    try {
      // Generate a unique ID for the creator
      const creatorId = userId;
      
      // Check if creator record already exists
      const { data: existingCreator } = await supabase
        .from('creators')
        .select('id')
        .eq('id', creatorId)
        .single();
      
      if (existingCreator) {
        console.log("Creator record already exists for user:", creatorId);
        // Update the creator to ensure it's active
        const { error: updateError } = await supabase
          .from('creators')
          .update({ active: true })
          .eq('id', creatorId);
          
        if (updateError) {
          console.error("Error updating creator active status:", updateError);
        } else {
          console.log("Updated creator active status to true");
        }
        return;
      }
      
      // Insert new creator record with minimal info
      const { error: creatorError } = await supabase
        .from('creators')
        .insert({
          id: creatorId,
          name: userName,
          gender: 'Male', // Default value required by the schema
          team: 'A Team', // Default value required by the schema
          creator_type: 'Real', // Default value required by the schema
          active: true // Explicitly set to active
        });
      
      if (creatorError) {
        throw creatorError;
      }
      
      // Create empty social links record
      const { error: socialLinksError } = await supabase
        .from('creator_social_links')
        .insert({
          creator_id: creatorId
        });
      
      if (socialLinksError) {
        throw socialLinksError;
      }
      
      console.log("Successfully created creator record for user:", creatorId);
      
    } catch (error) {
      console.error("Error creating creator record:", error);
      toast({
        title: "Error creating creator record",
        description: "Please try again or contact support.",
        variant: "destructive"
      });
    }
  };

  const handleSubmit = async () => {
    if (user) {
      console.log("Submitting role update:", { 
        userId: user.id,
        primaryRole, 
        additionalRoles 
      });
      
      // Check if Creator role was added
      const hadCreatorRole = user.roles && user.roles.includes("Creator");
      const hasCreatorRole = additionalRoles.includes("Creator");
      
      // Create creator record if Creator role was added
      if (!hadCreatorRole && hasCreatorRole) {
        await createCreatorRecord(user.id, user.name);
      }
      
      onUpdate(user.id, primaryRole, additionalRoles);
    }
  };

  if (!user) return null;

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit User Roles for {user.name}</DialogTitle>
          </DialogHeader>

          <div className="grid gap-6 py-4">
            <div className="space-y-2">
              <h3 className="text-lg font-medium">Primary Role</h3>
              <p className="text-sm text-muted-foreground">
                Select the main role for this user
              </p>
              
              <RadioGroup 
                value={primaryRole} 
                className="grid grid-cols-3 gap-2 pt-2"
                onValueChange={(value) => handlePrimaryRoleChange(value as PrimaryRole)}
              >
                {PRIMARY_ROLES.map(role => (
                  <div key={role} className="flex items-center space-x-2">
                    <RadioGroupItem 
                      value={role} 
                      id={`role-${role}`}
                    />
                    <Label htmlFor={`role-${role}`} className="cursor-pointer">{role}</Label>
                  </div>
                ))}
              </RadioGroup>
            </div>

            <div className="space-y-2">
              <h3 className="text-lg font-medium">Additional Roles</h3>
              <p className="text-sm text-muted-foreground">
                Select all roles that apply to this user
              </p>
              
              <CheckboxGroup className="grid grid-cols-2 gap-2 pt-2">
                {ADDITIONAL_ROLES.map(role => (
                  <div key={role} className="flex items-center space-x-2">
                    <Checkbox 
                      id={`additional-role-${role}`}
                      checked={additionalRoles.includes(role)}
                      onCheckedChange={() => toggleAdditionalRole(role)}
                    />
                    <Label 
                      htmlFor={`additional-role-${role}`}
                      className="cursor-pointer"
                    >
                      {role}
                    </Label>
                  </div>
                ))}
              </CheckboxGroup>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button 
              className="bg-brand-yellow text-black hover:bg-brand-yellow/90"
              onClick={handleSubmit}
            >
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={showAdminAlert} onOpenChange={setShowAdminAlert}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Admin Role Change</AlertDialogTitle>
            <AlertDialogDescription>
              {pendingRoleChange === "Admin" 
                ? "You are about to grant administrator privileges to this user. This will give them full access to the system."
                : "You are about to remove administrator privileges from this user. They will lose access to administrative features."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleCancelAdminChange}>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleConfirmAdminChange}
              className="bg-brand-yellow text-black hover:bg-brand-yellow/90"
            >
              Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default EditUserRolesModal;
