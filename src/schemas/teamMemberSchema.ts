
import { z } from "zod";

export const teamMemberFormSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  email: z.string().email({ message: "Please enter a valid email address." }),
  role: z.enum(["Admin", "Manager", "Employee"]),
  roles: z.array(z.string()).optional(),
  status: z.enum(["Active", "Inactive", "Paused"]),
  telegram: z.string().optional(),
  department: z.string().optional(),
  profileImage: z.string().optional(),
  teams: z.array(z.enum(["A", "B", "C"])).optional(),
  assignedCreators: z.array(z.string()).optional()
});

export type TeamMemberFormValues = z.infer<typeof teamMemberFormSchema>;
