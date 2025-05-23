
import { Employee, PrimaryRole } from "../types/employee";

export const mockEmployees: Employee[] = [
  {
    id: "1",
    name: "John Admin",
    email: "john.admin@example.com",
    role: "Admin" as PrimaryRole,
    status: "Active",
    telegram: "johnadmin",
    department: "Executive",
    profileImage: "/avatar1.png",
    lastLogin: "Today at 9:30 AM",
    createdAt: "2023-01-15T12:00:00Z",
    teams: ["A"],
    assignedCreators: ["c1", "c2", "c3"]
  },
  {
    id: "2",
    name: "Sarah Manager",
    email: "sarah.manager@example.com",
    role: "Manager" as PrimaryRole,
    status: "Active",
    telegram: "sarahmanager",
    department: "Marketing",
    profileImage: "/avatar2.png",
    lastLogin: "Yesterday at 5:15 PM",
    createdAt: "2023-02-10T14:30:00Z",
    teams: ["B", "C"],
    assignedCreators: ["c4", "c5"]
  },
  {
    id: "3",
    name: "Mike Employee",
    email: "mike.employee@example.com",
    role: "Employee" as PrimaryRole,
    status: "Active",
    telegram: "mikeemployee",
    department: "Sales",
    profileImage: "/avatar3.png",
    lastLogin: "2 days ago",
    createdAt: "2023-03-05T09:15:00Z",
    teams: ["A"]
  },
  {
    id: "4",
    name: "Lisa Designer",
    email: "lisa.designer@example.com",
    role: "Employee" as PrimaryRole,
    status: "Paused",
    telegram: "lisadesigner",
    department: "Design",
    profileImage: "/avatar4.png", 
    lastLogin: "Last week",
    createdAt: "2023-04-20T11:45:00Z",
    teams: ["C"]
  },
  {
    id: "5",
    name: "David Developer",
    email: "david.developer@example.com",
    role: "Employee" as PrimaryRole,
    status: "Inactive",
    department: "Engineering",
    profileImage: "/avatar5.png",
    lastLogin: "1 month ago",
    createdAt: "2023-05-12T15:20:00Z"
  },
  {
    id: "6",
    name: "Rachel Manager",
    email: "rachel.manager@example.com",
    role: "Manager" as PrimaryRole,
    status: "Active",
    telegram: "rachelmanager",
    department: "Customer Support",
    profileImage: "/avatar6.png",
    lastLogin: "Today at 11:45 AM",
    createdAt: "2023-06-08T10:10:00Z",
    teams: ["A", "B"],
    assignedCreators: ["c1"]
  }
];
