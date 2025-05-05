
import React from "react";
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
import { PrimaryRole } from "@/types/employee";

interface AdminRoleConfirmationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  pendingRole: PrimaryRole | null;
  onConfirm: () => void;
  onCancel: () => void;
}

const AdminRoleConfirmationDialog: React.FC<AdminRoleConfirmationDialogProps> = ({
  open,
  onOpenChange,
  pendingRole,
  onConfirm,
  onCancel
}) => {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Confirm Admin Role Change</AlertDialogTitle>
          <AlertDialogDescription>
            {pendingRole === "Admin" 
              ? "You are about to grant administrator privileges to this user. This will give them full access to the system."
              : "You are about to remove administrator privileges from this user. They will lose access to administrative features."}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onCancel}>Cancel</AlertDialogCancel>
          <AlertDialogAction 
            onClick={onConfirm}
            className="bg-brand-yellow text-black hover:bg-brand-yellow/90"
          >
            Confirm
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default AdminRoleConfirmationDialog;
