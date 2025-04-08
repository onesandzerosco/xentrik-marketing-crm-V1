
import { Employee } from "../types/employee";

export const mockEmployees: Employee[] = [
  {
    id: "1",
    name: "John Admin",
    email: "john.admin@example.com",
    role: "Admin",
    active: true,
    profileImage: "/avatar1.png",
    lastLogin: "Today at 9:30 AM"
  },
  {
    id: "2",
    name: "Sarah Manager",
    email: "sarah.manager@example.com",
    role: "Manager",
    active: true,
    profileImage: "/avatar2.png",
    lastLogin: "Yesterday at 5:15 PM"
  },
  {
    id: "3",
    name: "Mike Employee",
    email: "mike.employee@example.com",
    role: "Employee",
    active: true,
    profileImage: "/avatar3.png",
    lastLogin: "2 days ago"
  },
  {
    id: "4",
    name: "Lisa Designer",
    email: "lisa.designer@example.com",
    role: "Employee",
    active: true,
    profileImage: "/avatar4.png", 
    lastLogin: "Last week"
  },
  {
    id: "5",
    name: "David Developer",
    email: "david.developer@example.com",
    role: "Employee",
    active: false,
    profileImage: "/avatar5.png",
    lastLogin: "1 month ago"
  },
  {
    id: "6",
    name: "Rachel Manager",
    email: "rachel.manager@example.com",
    role: "Manager",
    active: true,
    profileImage: "/avatar6.png",
    lastLogin: "Today at 11:45 AM"
  }
];
