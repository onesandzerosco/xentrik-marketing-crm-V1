
import { PrimaryRole } from "@/types/employee";

export const PRIMARY_ROLES: PrimaryRole[] = ["Admin", "Manager", "Employee"];

// Additional roles options
export const ADDITIONAL_ROLES: string[] = [
  "Chatters", 
  "VA", 
  "Admin", 
  "Developer",
  "Creator"
];

// Define exclusive roles that cannot be combined with other roles
export const EXCLUSIVE_ROLES = ["Creator", "Admin"];
