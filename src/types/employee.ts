
export type EmployeeRole = "Admin" | "Manager" | "Employee" | "Active" | "Inactive";

export interface Employee {
  id: string;
  name: string;
  email: string;
  role: EmployeeRole;
  active: boolean;
  profileImage?: string;
  lastLogin: string;
}
