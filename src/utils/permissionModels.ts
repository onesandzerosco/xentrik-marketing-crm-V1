
import { z } from "zod";

// Define the roles for which we can set permissions
export const PERMISSION_ROLES = ["Admin", "Developer", "Creator", "VA", "Chatter"];

// Define the module types for which we can set permissions
export const PERMISSION_MODULES = ["SharedFiles"] as const;

export type PermissionModuleType = (typeof PERMISSION_MODULES)[number];

// Define the permission types available
export type PermissionAction = "canUpload" | "canEditDescription" | "canDelete" | "canDownload" | "canPreview";

// Schema for a single permission
export const permissionSchema = z.object({
  id: z.string(),
  role: z.string(),
  module: z.enum(PERMISSION_MODULES),
  action: z.string(),
  allowed: z.boolean(),
});

export type Permission = z.infer<typeof permissionSchema>;

// Default permissions configuration
export const DEFAULT_PERMISSIONS: Permission[] = [
  // Admin permissions
  { id: "admin-upload", role: "Admin", module: "SharedFiles", action: "canUpload", allowed: true },
  { id: "admin-edit", role: "Admin", module: "SharedFiles", action: "canEditDescription", allowed: true },
  { id: "admin-delete", role: "Admin", module: "SharedFiles", action: "canDelete", allowed: true },
  { id: "admin-download", role: "Admin", module: "SharedFiles", action: "canDownload", allowed: true },
  { id: "admin-preview", role: "Admin", module: "SharedFiles", action: "canPreview", allowed: true },
  
  // Developer permissions
  { id: "developer-upload", role: "Developer", module: "SharedFiles", action: "canUpload", allowed: true },
  { id: "developer-edit", role: "Developer", module: "SharedFiles", action: "canEditDescription", allowed: true },
  { id: "developer-delete", role: "Developer", module: "SharedFiles", action: "canDelete", allowed: true },
  { id: "developer-download", role: "Developer", module: "SharedFiles", action: "canDownload", allowed: true },
  { id: "developer-preview", role: "Developer", module: "SharedFiles", action: "canPreview", allowed: true },
  
  // Creator permissions
  { id: "creator-upload", role: "Creator", module: "SharedFiles", action: "canUpload", allowed: true },
  { id: "creator-edit", role: "Creator", module: "SharedFiles", action: "canEditDescription", allowed: true },
  { id: "creator-delete", role: "Creator", module: "SharedFiles", action: "canDelete", allowed: true },
  { id: "creator-download", role: "Creator", module: "SharedFiles", action: "canDownload", allowed: true },
  { id: "creator-preview", role: "Creator", module: "SharedFiles", action: "canPreview", allowed: true },
  
  // VA permissions
  { id: "va-upload", role: "VA", module: "SharedFiles", action: "canUpload", allowed: false },
  { id: "va-edit", role: "VA", module: "SharedFiles", action: "canEditDescription", allowed: true },
  { id: "va-delete", role: "VA", module: "SharedFiles", action: "canDelete", allowed: false },
  { id: "va-download", role: "VA", module: "SharedFiles", action: "canDownload", allowed: true },
  { id: "va-preview", role: "VA", module: "SharedFiles", action: "canPreview", allowed: true },
  
  // Chatter permissions
  { id: "chatter-upload", role: "Chatter", module: "SharedFiles", action: "canUpload", allowed: false },
  { id: "chatter-edit", role: "Chatter", module: "SharedFiles", action: "canEditDescription", allowed: false },
  { id: "chatter-delete", role: "Chatter", module: "SharedFiles", action: "canDelete", allowed: false },
  { id: "chatter-download", role: "Chatter", module: "SharedFiles", action: "canDownload", allowed: true },
  { id: "chatter-preview", role: "Chatter", module: "SharedFiles", action: "canPreview", allowed: true },
];
