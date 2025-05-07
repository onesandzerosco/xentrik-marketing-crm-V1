
import { useState } from "react";
import { PrimaryRole } from "@/types/employee";
import { EXCLUSIVE_ROLES } from "./constants";
import { useToast } from "@/hooks/use-toast";

export const useRolesManagement = (
  initialPrimaryRole: PrimaryRole,
  initialAdditionalRoles: string[]
) => {
  const [primaryRole, setPrimaryRole] = useState<PrimaryRole>(initialPrimaryRole);
  const [additionalRoles, setAdditionalRoles] = useState<string[]>(initialAdditionalRoles);
  const [showAdminAlert, setShowAdminAlert] = useState(false);
  const [pendingRoleChange, setPendingRoleChange] = useState<PrimaryRole | null>(null);
  const { toast } = useToast();

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
      // Create a copy of the current roles
      let updatedRoles = [...prev];
      
      // If role is being added
      if (!prev.includes(role)) {
        // Check if the role to add is an exclusive role
        if (EXCLUSIVE_ROLES.includes(role)) {
          // If adding an exclusive role, clear all other roles and only add this one
          return [role];
        } else {
          // If adding a non-exclusive role, remove any exclusive roles first
          updatedRoles = updatedRoles.filter(r => !EXCLUSIVE_ROLES.includes(r));
          // Then add the new role
          updatedRoles.push(role);
        }
      } else {
        // If removing a role, just filter it out
        updatedRoles = updatedRoles.filter(r => r !== role);
      }
      
      return updatedRoles;
    });
  };

  return {
    primaryRole,
    additionalRoles,
    pendingRoleChange,
    showAdminAlert,
    setShowAdminAlert,
    handlePrimaryRoleChange,
    handleConfirmAdminChange,
    handleCancelAdminChange,
    toggleAdditionalRole
  };
};
