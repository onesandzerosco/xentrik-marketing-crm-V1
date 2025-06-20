
import { z } from "zod";

export const teamMemberSchema = z.object({
  email: z.string().email("Invalid email address"),
  name: z.string().min(2, "Name must be at least 2 characters"),
  primaryRole: z.enum(["Admin", "Manager", "Employee"]),
  additionalRoles: z.array(z.string()).default([]),
  geographicRestrictions: z.array(z.string()).default([]), // New field for geographic restrictions
});

export type TeamMemberFormData = z.infer<typeof teamMemberSchema>;
