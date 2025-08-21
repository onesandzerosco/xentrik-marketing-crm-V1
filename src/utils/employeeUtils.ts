import { Employee, TeamMemberRole, EmployeeStatus, EmployeeRole } from "../types/employee";

type FilterRole = TeamMemberRole | "Active" | "Inactive";

// Mock creators data array for mapping IDs to names
const mockCreators = [
  { id: "c1", name: "Creator One" },
  { id: "c2", name: "Creator Two" },
  { id: "c3", name: "Creator Three" },
  { id: "c4", name: "Creator Four" },
  { id: "c5", name: "Creator Five" },
];

// Function to get creator names from IDs
export const getCreatorNames = (creatorIds: string[]) => {
  return creatorIds.map(id => {
    const creator = mockCreators.find(c => c.id === id);
    return creator ? creator.name : 'Unknown Creator';
  });
};

export const filterAndSortEmployees = (
  employees: Employee[],
  selectedRoles: FilterRole[],
  searchQuery: string,
  sortOption: string
): Employee[] => {
  // Filter employees
  const filteredEmployees = employees.filter((employee) => {
    // Role filter (Admin, Manager, Employee)
    const roleMatch = selectedRoles.length === 0 || 
      selectedRoles.some(role => {
        if (role === "Active") return employee.status === "Active";
        if (role === "Inactive") return employee.status === "Inactive";
        return employee.role === role;
      });
    
    // Search filter (name or email)
    const searchMatch = 
      searchQuery.trim() === "" || 
      employee.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      employee.email.toLowerCase().includes(searchQuery.toLowerCase());
    
    return roleMatch && searchMatch;
  });
  
  // Sort the filtered employees
  return [...filteredEmployees].sort((a, b) => {
    switch (sortOption) {
      case "nameAsc":
        return a.name.localeCompare(b.name);
      case "nameDesc":
        return b.name.localeCompare(a.name);
      case "recentActivity":
        // Sort by last login date - this would need to be improved with actual date objects
        return a.lastLogin === "Never" ? 1 : (b.lastLogin === "Never" ? -1 : b.lastLogin.localeCompare(a.lastLogin));
      case "role":
        // Sort by role "importance" (Admin > Manager > Employee)
        const roleOrder: Record<TeamMemberRole, number> = { 
          "Admin": 0, 
          "Manager": 1, 
          "Employee": 2,
          "Chatter": 3,
          "VA": 4,
          "Developer": 5,
          "Creator": 6,
          "HR / Work Force": 7
        };
        return (roleOrder[a.role] || 999) - (roleOrder[b.role] || 999);
      default:
        return 0;
    }
  });
};

// Keys for localStorage
export const FILTER_KEYS = {
  ROLE: 'employee_filter_role',
  SEARCH: 'employee_filter_search',
  SORT: 'employee_filter_sort'
};

// Helper function to get the mock creators data for component testing
export const getMockCreators = () => {
  return [...mockCreators];
};
