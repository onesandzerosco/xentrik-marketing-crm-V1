
export type TeamMemberRole = "Chatter" | "VA" | "Manager" | "Developer" | "Admin" | "Employee" | "Creator";
export type EmployeeStatus = "Active" | "Inactive" | "Paused";
export type EmployeeTeam = "A" | "B" | "C";

// Alias for backward compatibility with existing code
export type EmployeeRole = TeamMemberRole;

// Define what is allowed as primary roles and additional roles
export type PrimaryRole = "Admin" | "Manager" | "Employee";

export interface Employee {
  id: string;
  name: string;
  email: string;
  role: PrimaryRole;
  roles?: string[];
  status: EmployeeStatus;
  telegram?: string;
  profileImage?: string;
  lastLogin: string;
  createdAt: string;
  department?: string;
  teams?: EmployeeTeam[];
  assignedCreators?: string[]; // IDs of creators assigned to this team member
  geographicRestrictions?: string[]; // Add this field
}

// Add missing TeamMember interface
export interface TeamMember {
  id: string;
  name: string;
  email: string;
  roles: string[];
  status: EmployeeStatus;
  teams?: EmployeeTeam[];
  telegram?: string;
  phoneNumber?: string;
  lastLogin: string;
  profileImage?: string;
  department?: string;
  createdAt: string;
  geographicRestrictions?: string[];
}

// Add missing TeamFilters interface
export interface TeamFilters {
  roles: TeamMemberRole[];
  teams: EmployeeTeam[];
  status: EmployeeStatus[];
  searchQuery: string;
}

export type EmployeeFilters = {
  roles: TeamMemberRole[];
  statuses: EmployeeStatus[];
  searchQuery: string;
  sortOption: string;
};

// This is the type needed for the filter components
export type FilterRole = TeamMemberRole | "Active" | "Inactive";
