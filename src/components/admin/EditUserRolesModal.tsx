
import React, { useEffect, useMemo } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Employee, PrimaryRole } from "@/types/employee";
import { useRolesManagement } from "./users/useRolesManagement";
import PrimaryRoleSelector from "./users/PrimaryRoleSelector";
import AdditionalRolesSelector from "./users/AdditionalRolesSelector";
import AdminRoleConfirmationDialog from "./users/AdminRoleConfirmationDialog";

interface EditUserRolesModalProps {
  user: Employee | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdate: (userId: string, primaryRole: PrimaryRole, additionalRoles: string[]) => Promise<boolean>;
}

const EditUserRolesModal: React.FC<EditUserRolesModalProps> = ({
  user,
  open,
  onOpenChange,
  onUpdate
}) => {
  const defaultPrimaryRole: PrimaryRole = "Employee"; 
  const defaultAdditionalRoles: string[] = [];
  
  // Memoize these values to prevent infinite re-renders and handle circular references
  const userPrimaryRole = useMemo(() => user?.role || defaultPrimaryRole, [user?.role]);
  const userAdditionalRoles = useMemo(() => {
    if (!user?.roles || !Array.isArray(user.roles)) return defaultAdditionalRoles;
    // Create a clean copy to avoid circular references
    return [...user.roles];
  }, [user?.roles]);
  
  const {
    primaryRole,
    additionalRoles,
    pendingRoleChange,
    showAdminAlert,
    setShowAdminAlert,
    handlePrimaryRoleChange,
    handleConfirmAdminChange,
    handleCancelAdminChange,
    toggleAdditionalRole
  } = useRolesManagement(userPrimaryRole, userAdditionalRoles);

  // Log for debugging when user or modal state changes
  useEffect(() => {
    if (user && open) {
      console.log("EditUserRolesModal opened for user:", { 
        name: user.name,
        role: user.role, 
        roles: user.roles,
        userPrimaryRole,
        userAdditionalRoles: userAdditionalRoles.length
      });
    }
  }, [user?.id, open]); // Only depend on user ID and open state

  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const handleSubmit = async () => {
    console.log("=== handleSubmit START ===");
    if (user && !isSubmitting) {
      console.log("handleSubmit called for user:", user.id);
      console.log("Current state:", { 
        primaryRole, 
        additionalRoles,
        showAdminAlert,
        pendingRoleChange
      });
      
      // Prevent multiple simultaneous submissions
      if (isSubmitting) {
        console.log("Already submitting, ignoring submit");
        return;
      }
      
      setIsSubmitting(true);
      console.log("Calling onUpdate...");
      
      try {
        const result = await onUpdate(user.id, primaryRole, additionalRoles);
        console.log("onUpdate result:", result);
        
        if (result) {
          console.log("Closing modal after successful update");
          onOpenChange(false);
        } else {
          console.log("Update failed, keeping modal open");
        }
      } finally {
        setIsSubmitting(false);
      }
    }
    console.log("=== handleSubmit END ===");
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
            <PrimaryRoleSelector 
              primaryRole={primaryRole} 
              onPrimaryRoleChange={handlePrimaryRoleChange} 
            />

            <AdditionalRolesSelector 
              additionalRoles={additionalRoles}
              toggleAdditionalRole={toggleAdditionalRole}
            />
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

      <AdminRoleConfirmationDialog 
        open={showAdminAlert}
        onOpenChange={setShowAdminAlert}
        pendingRole={pendingRoleChange}
        onConfirm={handleConfirmAdminChange}
        onCancel={handleCancelAdminChange}
      />
    </>
  );
};

export default EditUserRolesModal;
