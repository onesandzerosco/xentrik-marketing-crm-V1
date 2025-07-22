
import { z } from "zod";
import { PrimaryRole } from "@/types/employee";

// Form validation schema
export const teamMemberFormSchema = z.object({
  name: z.string().min(1, {
    message: "Name is required.",
  }).min(2, {
    message: "Name must be at least 2 characters.",
  }),
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
  primaryRole: z.enum(["Admin", "Manager", "Employee"] as [PrimaryRole, ...PrimaryRole[]]),
  additionalRoles: z.array(z.string()),
  geographicRestrictions: z.array(z.string()).optional()
});

export type TeamMemberFormData = z.infer<typeof teamMemberFormSchema>;
