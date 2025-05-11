
import { z } from "zod";

// Define the roles for which we can set permissions
export const PERMISSION_ROLES = ["Admin", "Developer", "Creator", "VA", "Chatter"];

// Schema for a single role permission
export const rolePermissionSchema = z.object({
  rolename: z.string(),
  preview: z.boolean().default(true),
  edit: z.boolean().default(false),
  upload: z.boolean().default(false),
  download: z.boolean().default(true),
  delete: z.boolean().default(false),
});

export type RolePermission = z.infer<typeof rolePermissionSchema>;

// Default permissions configuration
export const DEFAULT_PERMISSIONS: RolePermission[] = [
  // Admin permissions
  { rolename: "Admin", preview: true, edit: true, upload: true, download: true, delete: true },
  
  // Developer permissions
  { rolename: "Developer", preview: true, edit: true, upload: true, download: true, delete: true },
  
  // Creator permissions
  { rolename: "Creator", preview: true, edit: true, upload: true, download: true, delete: true },
  
  // VA permissions
  { rolename: "VA", preview: true, edit: true, upload: false, download: true, delete: false },
  
  // Chatter permissions
  { rolename: "Chatter", preview: true, edit: false, upload: false, download: true, delete: false },
];
