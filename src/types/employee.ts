
export type EmployeeRole = "Admin" | "Manager" | "Employee";
export type EmployeeStatus = "Active" | "Inactive" | "Paused";
export type EmployeeTeam = "A" | "B" | "C";

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
  teams?: EmployeeTeam[];
  assignedCreators?: string[]; // IDs of creators assigned to this team member
}

export type EmployeeFilters = {
  roles: EmployeeRole[];
  statuses: EmployeeStatus[];
  searchQuery: string;
  sortOption: string;
};

// This is the type needed for the filter components
export type FilterRole = EmployeeRole | "Active" | "Inactive";
