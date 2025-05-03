
import { TeamMemberRole } from "./employee";

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: TeamMemberRole; // Primary role
  roles: TeamMemberRole[]; // Additional roles
  status: "Active" | "Inactive" | "Paused";
  teams: ("A" | "B" | "C")[];
  telegram?: string;
  phoneNumber?: string;
  lastLogin?: string;
  profileImage?: string;
  department?: string;
  createdAt: string;
}

export type TeamMemberFormValues = {
  email: string;
  password?: string;
  confirmPassword?: string;
  name: string;
  role: TeamMemberRole; // Primary role
  roles?: TeamMemberRole[]; // Additional roles
  status?: "Active" | "Inactive" | "Paused";
  teams?: ("A" | "B" | "C")[];
  telegram?: string;
  phoneNumber?: string;
  department?: string;
  profileImage?: string;
  assignedCreators?: string[];
};

export interface TeamFilters {
  roles: TeamMemberRole[];
  teams: ("A" | "B" | "C")[];
  status: ("Active" | "Inactive" | "Paused")[];
  searchQuery: string;
}
