
import { TeamMemberRole, AdditionalRole } from "./employee";

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  roles: (TeamMemberRole | AdditionalRole)[];
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
  password: string;
  confirmPassword: string;
  name: string;
  roles: (TeamMemberRole | AdditionalRole)[];
  teams: ("A" | "B" | "C")[];
  telegram?: string;
  phoneNumber?: string;
  department?: string;
  profileImage?: string;
};

export interface TeamFilters {
  roles: (TeamMemberRole | AdditionalRole)[];
  teams: ("A" | "B" | "C")[];
  status: ("Active" | "Inactive" | "Paused")[];
  searchQuery: string;
}
