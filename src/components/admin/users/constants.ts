
import { PrimaryRole } from "@/types/employee";

export const PRIMARY_ROLES: PrimaryRole[] = ["Admin", "Manager", "Employee"];

// Additional roles options - removing "Creator" from this array
export const ADDITIONAL_ROLES: string[] = [
  "Chatter", 
  "VA", 
  "Admin", 
  "Developer",
  "Creator"
];

// Define exclusive roles that cannot be combined with other roles
export const EXCLUSIVE_ROLES = ["Admin", "Creator"];
