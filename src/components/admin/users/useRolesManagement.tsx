
import { useState, useEffect } from "react";
import { PrimaryRole } from "@/types/employee";

export const useRolesManagement = (
  initialPrimaryRole: PrimaryRole,
  initialAdditionalRoles: string[]
) => {
  const [primaryRole, setPrimaryRole] = useState<PrimaryRole>(initialPrimaryRole);
  const [additionalRoles, setAdditionalRoles] = useState<string[]>(initialAdditionalRoles);
  const [pendingRoleChange, setPendingRoleChange] = useState<PrimaryRole | null>(null);
  const [showAdminAlert, setShowAdminAlert] = useState(false);

  // Update state when initial values change (when modal opens with new user)
  useEffect(() => {
    setPrimaryRole(initialPrimaryRole);
    setAdditionalRoles([...initialAdditionalRoles]); // Create fresh copy
  }, [initialPrimaryRole, initialAdditionalRoles.length]); // Only depend on array length, not contents

  const handlePrimaryRoleChange = (newRole: PrimaryRole) => {
    // If changing to Admin, show confirmation dialog
    if (newRole === "Admin") {
      setPendingRoleChange(newRole);
      setShowAdminAlert(true);
    } else {
      setPrimaryRole(newRole);
    }
  };

  const handleConfirmAdminChange = () => {
    if (pendingRoleChange) {
      setPrimaryRole(pendingRoleChange);
      // Clear additional roles when becoming Admin (exclusive role)
      setAdditionalRoles([]);
    }
    setShowAdminAlert(false);
    setPendingRoleChange(null);
  };

  const handleCancelAdminChange = () => {
    setShowAdminAlert(false);
    setPendingRoleChange(null);
  };

  const toggleAdditionalRole = (role: string) => {
    setAdditionalRoles(prev => {
      if (prev.includes(role)) {
        // Remove role
        return prev.filter(r => r !== role);
      } else {
        // Add role - but first check if it's an exclusive role
        if (role === "Admin") {
          // Admin is exclusive - replace all roles
          return [role];
        } else {
          // Regular role - add to existing roles (but remove Admin if present)
          const filteredRoles = prev.filter(r => r !== "Admin");
          return [...filteredRoles, role];
        }
      }
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
