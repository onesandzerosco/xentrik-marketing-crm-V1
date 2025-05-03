
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
import { Employee, TeamMemberRole } from "@/types/employee";
import { useToast } from "@/hooks/use-toast";

interface EditUserRolesModalProps {
  user: Employee | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdate: (userId: string, primaryRole: TeamMemberRole, additionalRoles: TeamMemberRole[]) => void;
}

const PRIMARY_ROLES: TeamMemberRole[] = ["Admin", "Manager", "Employee"];

const ADDITIONAL_ROLES: TeamMemberRole[] = [
  "Chatters", 
  "Creative Director", 
  "Developer",
  "Editor"
];

const EditUserRolesModal: React.FC<EditUserRolesModalProps> = ({
  user,
  open,
  onOpenChange,
  onUpdate
}) => {
  const [primaryRole, setPrimaryRole] = useState<TeamMemberRole>("Employee");
  const [additionalRoles, setAdditionalRoles] = useState<TeamMemberRole[]>([]);
  const [showAdminAlert, setShowAdminAlert] = useState(false);
  const [pendingRoleChange, setPendingRoleChange] = useState<TeamMemberRole | null>(null);
  const { toast } = useToast();

  // Reset state when user or open state changes
  useEffect(() => {
    if (user && open) {
      // Set primary role from user.role
      setPrimaryRole(user.role);
      // Set additional roles from user.roles (if it exists) or empty array
      setAdditionalRoles(user.roles || []);
    }
  }, [user, open]);

  const handlePrimaryRoleChange = (role: TeamMemberRole) => {
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

  const toggleAdditionalRole = (role: TeamMemberRole) => {
    setAdditionalRoles(prev => {
      if (prev.includes(role)) {
        return prev.filter(r => r !== role);
      } else {
        return [...prev, role];
      }
    });
  };

  const handleSubmit = () => {
    if (user) {
      onUpdate(user.id, primaryRole, additionalRoles);
      toast({
        title: "Roles updated",
        description: `Roles for ${user.name} have been updated successfully.`
      });
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
                onValueChange={(value) => handlePrimaryRoleChange(value as TeamMemberRole)}
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
