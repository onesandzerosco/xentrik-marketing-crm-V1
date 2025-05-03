

export type TeamMemberRole = "Admin" | "Manager" | "Employee";
export type EmployeeStatus = "Active" | "Inactive" | "Paused";
export type EmployeeTeam = "A" | "B" | "C";

// Alias for backward compatibility with existing code
export type EmployeeRole = TeamMemberRole;

// New type for additional roles that can be assigned
export type AdditionalRole = "Chatters" | "Creative Director" | "Developer" | "Editor" | "VA" | "Chatter" | "Creator";

export interface Employee {
  id: string;
  name: string;
  email: string;
  role: TeamMemberRole;
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
  roles: TeamMemberRole[];
  statuses: EmployeeStatus[];
  searchQuery: string;
  sortOption: string;
};

// This is the type needed for the filter components
export type FilterRole = TeamMemberRole | "Active" | "Inactive";

