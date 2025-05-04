
import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Employee, PrimaryRole } from "@/types/employee";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface EditUserRolesModalProps {
  user: Employee | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdate: (userId: string, primaryRole: PrimaryRole, additionalRoles: string[]) => Promise<void>;
}

// Available roles for the application
const availableRoles = ["Chatter", "Creator", "VA"];
const primaryRoleOptions: PrimaryRole[] = ["Admin", "Manager", "Employee"];

const EditUserRolesModal: React.FC<EditUserRolesModalProps> = ({
  user,
  open,
  onOpenChange,
  onUpdate,
}) => {
  const [primaryRole, setPrimaryRole] = useState<PrimaryRole>("Employee");
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCreatingCreator, setIsCreatingCreator] = useState(false);

  useEffect(() => {
    if (user) {
      setPrimaryRole(user.role);
      setSelectedRoles(user.roles || []);
    }
  }, [user]);

  const handleSubmit = async () => {
    if (!user) return;
    
    setIsSubmitting(true);
    
    try {
      // Check if we're adding Creator role and user didn't have it before
      const hadCreatorRole = user.roles?.includes("Creator") || false;
      const willHaveCreatorRole = selectedRoles.includes("Creator");
      const needsCreatorEntry = willHaveCreatorRole && !hadCreatorRole;
      
      // If we need to create a creator entry
      if (needsCreatorEntry) {
        setIsCreatingCreator(true);
        
        // First check if this user already has a creator record
        const { data: existingCreator } = await supabase
          .from('creators')
          .select('id')
          .eq('id', user.id)
          .maybeSingle();
          
        if (!existingCreator) {
          // Create a new creator record
          await supabase.from('creators').insert({
            id: user.id,
            name: user.name,
            email: user.email,
            gender: 'Other', // Default value
            team: 'A',       // Default team
            creator_type: 'Standard' // Default type
          });
          
          // Create empty social links record
          await supabase.from('creator_social_links').insert({
            creator_id: user.id
          });
        }
        
        setIsCreatingCreator(false);
      }
      
      // Update roles
      await onUpdate(user.id, primaryRole, selectedRoles);
      
    } catch (error) {
      console.error("Error updating user roles:", error);
    } finally {
      setIsSubmitting(false);
      onOpenChange(false);
    }
  };

  const handleRoleToggle = (role: string) => {
    if (selectedRoles.includes(role)) {
      setSelectedRoles(selectedRoles.filter((r) => r !== role));
    } else {
      setSelectedRoles([...selectedRoles, role]);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Edit User Roles</DialogTitle>
          <DialogDescription>
            Update roles for {user?.name}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-medium mb-2">Primary Role</h3>
            <RadioGroup
              value={primaryRole}
              onValueChange={(value: PrimaryRole) => setPrimaryRole(value)}
              className="flex flex-col space-y-1"
            >
              {primaryRoleOptions.map((role) => (
                <div key={role} className="flex items-center space-x-2">
                  <RadioGroupItem value={role} id={`role-${role}`} />
                  <Label htmlFor={`role-${role}`}>{role}</Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          <div>
            <h3 className="text-sm font-medium mb-2">Additional Roles</h3>
            <div className="grid grid-cols-2 gap-2">
              {availableRoles.map((role) => (
                <div key={role} className="flex items-center space-x-2">
                  <Checkbox
                    id={`role-${role}`}
                    checked={selectedRoles.includes(role)}
                    onCheckedChange={() => handleRoleToggle(role)}
                  />
                  <Label htmlFor={`role-${role}`}>{role}</Label>
                </div>
              ))}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                {isCreatingCreator ? "Creating Creator..." : "Saving..."}
                <Loader2 className="ml-2 h-4 w-4 animate-spin" />
              </>
            ) : (
              "Save Changes"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EditUserRolesModal;
