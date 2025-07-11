
import React, { useEffect } from "react";
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
  onUpdate: (userId: string, primaryRole: PrimaryRole, additionalRoles: string[]) => void;
}

const EditUserRolesModal: React.FC<EditUserRolesModalProps> = ({
  user,
  open,
  onOpenChange,
  onUpdate
}) => {
  const defaultPrimaryRole: PrimaryRole = "Employee"; 
  const defaultAdditionalRoles: string[] = [];
  
  // Use the user's actual roles, or fallback to defaults
  const userPrimaryRole = user?.role || defaultPrimaryRole;
  const userAdditionalRoles = user?.roles || defaultAdditionalRoles;
  
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
        userAdditionalRoles
      });
    }
  }, [user, open, userPrimaryRole, userAdditionalRoles]);

  const handleSubmit = async () => {
    if (user) {
      console.log("Submitting role update:", { 
        userId: user.id,
        primaryRole, 
        additionalRoles 
      });
      
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
