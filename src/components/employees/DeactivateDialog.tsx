
import React from 'react';
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

interface DeactivateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDeactivate: () => void;
  employeeName?: string;
}

const DeactivateDialog: React.FC<DeactivateDialogProps> = ({
  open,
  onOpenChange,
  onDeactivate,
  employeeName
}) => {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Deactivate Team Member</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to deactivate {employeeName}? They will no longer have access to the system.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction 
            onClick={onDeactivate}
            className="bg-destructive text-destructive-foreground"
          >
            Deactivate
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DeactivateDialog;
