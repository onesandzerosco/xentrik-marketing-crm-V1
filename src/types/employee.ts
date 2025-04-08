
export type EmployeeRole = "Admin" | "Manager" | "Employee";
export type EmployeeStatus = "Active" | "Inactive";

export interface Employee {
  id: string;
  name: string;
  email: string;
  role: EmployeeRole;
  active: boolean;
  profileImage?: string;
  lastLogin: string;
}
