
export type EmployeeRole = "Admin" | "Manager" | "Employee";
export type EmployeeStatus = "Active" | "Inactive" | "Paused";

export interface Employee {
  id: string;
  name: string;
  email: string;
  role: EmployeeRole;
  status: EmployeeStatus;
  telegram?: string;
  permissions?: string[];
  profileImage?: string;
  lastLogin: string;
  createdAt: string;
  department?: string;
}

export type EmployeeFilters = {
  roles: EmployeeRole[];
  statuses: EmployeeStatus[];
  searchQuery: string;
  sortOption: string;
};
