
import { Employee, EmployeeRole } from "../types/employee";

type FilterRole = EmployeeRole | "Active" | "Inactive";

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
        if (role === "Active") return employee.active;
        if (role === "Inactive") return !employee.active;
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
        const roleOrder = { "Admin": 0, "Manager": 1, "Employee": 2 };
        return roleOrder[a.role] - roleOrder[b.role];
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
