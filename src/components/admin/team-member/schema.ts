
import { z } from "zod";
import { PrimaryRole } from "@/types/employee";

// Form validation schema
export const teamMemberFormSchema = z.object({
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
  primaryRole: z.enum(["Admin", "Manager", "Employee"] as [PrimaryRole, ...PrimaryRole[]]),
  additionalRoles: z.array(z.string())
});

export type TeamMemberFormData = z.infer<typeof teamMemberFormSchema>;
