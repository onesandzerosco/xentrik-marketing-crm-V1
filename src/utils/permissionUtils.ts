
// File permission utility functions
import { useAuth } from '@/context/AuthContext';

/**
 * Determines if a user can edit file descriptions based on their role
 * - Admins, Creators, and VAs can edit descriptions
 */
export const canEditFileDescription = (userRole: string, userRoles: string[]): boolean => {
  return userRole === "Admin" || 
         userRole === "Creator" || 
         userRoles.includes("VA") || 
         userRoles.includes("Creator") ||
         userRole === "VA";
};

/**
 * Determines if a user can delete files based on their role
 * - Only Admins and Creators can delete files
 */
export const canDeleteFiles = (userRole: string, userRoles: string[]): boolean => {
  return userRole === "Admin" || 
         userRole === "Creator" ||
         userRoles.includes("Creator");
};

/**
 * Determines if a user can upload files based on their role
 * - Admins, Creators and VAs can upload files
 * - Chatters cannot upload files
 */
export const canUploadFiles = (userRole: string, userRoles: string[]): boolean => {
  return userRole === "Admin" || 
         userRole === "Creator" || 
         userRoles.includes("VA") || 
         userRoles.includes("Creator") ||
         userRole === "VA";
};

/**
 * Hook to get user permissions for file operations
 * @returns Object with permission flags
 */
export const useFilePermissions = () => {
  const { userRole, userRoles } = useAuth();

  return {
    canEdit: canEditFileDescription(userRole, userRoles),
    canDelete: canDeleteFiles(userRole, userRoles),
    canUpload: canUploadFiles(userRole, userRoles),
    // All authenticated users can download files
    canDownload: true
  };
};
