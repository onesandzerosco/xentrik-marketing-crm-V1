
import React, { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import { useAuth } from "../context/AuthContext";
import EmployeeCard from "../components/employees/EmployeeCard";
import { Button } from "@/components/ui/button";
import { Filter, Plus, X, Search, SortAsc } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import AddEmployeeModal from "../components/employees/AddEmployeeModal";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Employee, EmployeeRole } from "../types/employee";
import { mockEmployees } from "../data/mockEmployees";

// Keys for localStorage
const FILTER_KEYS = {
  ROLE: 'employee_filter_role',
  SEARCH: 'employee_filter_search',
  SORT: 'employee_filter_sort'
};

const TeamManagement = () => {
  const { user } = useAuth();
  const [addEmployeeOpen, setAddEmployeeOpen] = useState(false);
  const [employees, setEmployees] = useState<Employee[]>(() => {
    const saved = localStorage.getItem('employees');
    return saved ? JSON.parse(saved) : mockEmployees;
  });
  
  // Initialize filters with values from localStorage or defaults
  const [selectedRoles, setSelectedRoles] = useState<EmployeeRole[]>(() => {
    const saved = localStorage.getItem(FILTER_KEYS.ROLE);
    return saved ? JSON.parse(saved) : [];
  });
  
  const [searchQuery, setSearchQuery] = useState<string>(() => {
    const saved = localStorage.getItem(FILTER_KEYS.SEARCH);
    return saved || "";
  });

  const [sortOption, setSortOption] = useState<string>(() => {
    const saved = localStorage.getItem(FILTER_KEYS.SORT);
    return saved || "nameAsc";
  });
  
  const { toast } = useToast();
  
  // Determine if current user is admin
  const isAdmin = user?.role === "Admin";

  // Save employees to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('employees', JSON.stringify(employees));
  }, [employees]);

  // Save filters to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem(FILTER_KEYS.ROLE, JSON.stringify(selectedRoles));
  }, [selectedRoles]);
  
  useEffect(() => {
    localStorage.setItem(FILTER_KEYS.SEARCH, searchQuery);
  }, [searchQuery]);
  
  useEffect(() => {
    localStorage.setItem(FILTER_KEYS.SORT, sortOption);
  }, [sortOption]);

  // Add a new employee
  const handleAddEmployee = (newEmployee: Omit<Employee, "id">) => {
    const employeeWithId = {
      ...newEmployee,
      id: Date.now().toString(),
      lastLogin: "Never" 
    };
    
    setEmployees([...employees, employeeWithId]);
    
    toast({
      title: "Employee Added",
      description: `${newEmployee.name} has been added as a ${newEmployee.role}`,
    });
  };

  // Update an existing employee
  const handleUpdateEmployee = (id: string, updates: Partial<Employee>) => {
    setEmployees(
      employees.map((employee) =>
        employee.id === id ? { ...employee, ...updates } : employee
      )
    );
    
    const employee = employees.find(e => e.id === id);
    
    toast({
      title: "Employee Updated",
      description: `${employee?.name}'s information has been updated`,
    });
  };

  // Filter and sort employees
  const filteredEmployees = employees.filter((employee) => {
    const roleMatch = selectedRoles.length === 0 || selectedRoles.includes(employee.role);
    const searchMatch = 
      searchQuery.trim() === "" || 
      employee.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      employee.email.toLowerCase().includes(searchQuery.toLowerCase());
    
    return roleMatch && searchMatch;
  });
  
  // Sort the filtered employees
  const sortedEmployees = [...filteredEmployees].sort((a, b) => {
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

  const handleRoleFilter = (role: EmployeeRole) => {
    setSelectedRoles(
      selectedRoles.includes(role)
        ? selectedRoles.filter(r => r !== role)
        : [...selectedRoles, role]
    );
  };

  const handleClearFilters = () => {
    setSelectedRoles([]);
    setSearchQuery("");
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleSortChange = (value: string) => {
    setSortOption(value);
  };

  return (
    <div className="flex">
      <Sidebar />
      <div className="ml-60 p-8 w-full">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Team Management</h1>
            <p className="text-muted-foreground">
              {sortedEmployees.length} team members in your organization
            </p>
          </div>
          <div className="flex gap-3">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline">
                  <Filter className="h-4 w-4 mr-2" />
                  Filter
                </Button>
              </SheetTrigger>
              <SheetContent>
                <SheetHeader>
                  <SheetTitle>Filter Team Members</SheetTitle>
                  <SheetDescription>
                    Filter team members by role and other attributes
                  </SheetDescription>
                </SheetHeader>
                <div className="py-6 space-y-6">
                  <div>
                    <h3 className="text-lg font-medium mb-3">Role</h3>
                    <div className="flex flex-wrap gap-2">
                      {(["Admin", "Manager", "Employee"] as EmployeeRole[]).map((role) => (
                        <Badge
                          key={role}
                          className={`cursor-pointer ${
                            selectedRoles.includes(role)
                              ? getRoleBadgeColor(role)
                              : "bg-secondary text-secondary-foreground"
                          }`}
                          onClick={() => handleRoleFilter(role)}
                        >
                          {role}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-medium mb-3">Status</h3>
                    <div className="flex flex-wrap gap-2">
                      <Badge
                        className={`cursor-pointer ${
                          selectedRoles.includes("Active" as EmployeeRole)
                            ? "bg-green-500 hover:bg-green-600 text-white"
                            : "bg-secondary text-secondary-foreground"
                        }`}
                        onClick={() => handleRoleFilter("Active" as EmployeeRole)}
                      >
                        Active
                      </Badge>
                      <Badge
                        className={`cursor-pointer ${
                          selectedRoles.includes("Inactive" as EmployeeRole)
                            ? "bg-red-500 hover:bg-red-600 text-white"
                            : "bg-secondary text-secondary-foreground"
                        }`}
                        onClick={() => handleRoleFilter("Inactive" as EmployeeRole)}
                      >
                        Inactive
                      </Badge>
                    </div>
                  </div>
                  {(selectedRoles.length > 0 || searchQuery) && (
                    <Button
                      variant="ghost"
                      className="mt-4"
                      onClick={handleClearFilters}
                    >
                      <X className="h-4 w-4 mr-2" />
                      Clear all filters
                    </Button>
                  )}
                </div>
              </SheetContent>
            </Sheet>
            
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search team members..."
                className="pl-9 w-[200px] md:w-[260px]"
                value={searchQuery}
                onChange={handleSearchChange}
              />
            </div>
            
            <Select value={sortOption} onValueChange={handleSortChange}>
              <SelectTrigger className="w-[180px]">
                <div className="flex items-center">
                  <SortAsc className="h-4 w-4 mr-2" />
                  <span>Sort by</span>
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="nameAsc">Name A–Z</SelectItem>
                <SelectItem value="nameDesc">Name Z–A</SelectItem>
                <SelectItem value="recentActivity">Recent Activity</SelectItem>
                <SelectItem value="role">Role</SelectItem>
              </SelectContent>
            </Select>
            
            {isAdmin && (
              <Button 
                onClick={() => setAddEmployeeOpen(true)}
                className="bg-brand text-black hover:bg-brand/80"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Team Member
              </Button>
            )}
          </div>
        </div>

        {(selectedRoles.length > 0 || searchQuery) && (
          <div className="mb-6 flex items-center">
            <span className="text-sm text-muted-foreground mr-2">Active filters:</span>
            <div className="flex flex-wrap gap-2">
              {selectedRoles.map((role) => (
                <div key={role} className="bg-secondary text-foreground text-xs px-3 py-1 rounded-full flex items-center">
                  {role}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-4 w-4 ml-1 p-0"
                    onClick={() => setSelectedRoles(selectedRoles.filter(r => r !== role))}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ))}
              {searchQuery && (
                <div className="bg-secondary text-foreground text-xs px-3 py-1 rounded-full flex items-center">
                  Search: {searchQuery}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-4 w-4 ml-1 p-0"
                    onClick={() => setSearchQuery("")}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              )}
              <Button
                variant="ghost"
                size="sm"
                className="text-xs h-6"
                onClick={handleClearFilters}
              >
                Clear all
              </Button>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedEmployees.map((employee) => (
            <EmployeeCard 
              key={employee.id} 
              employee={employee} 
              onUpdate={handleUpdateEmployee}
              isAdmin={isAdmin}
              currentUserId={user?.id}
            />
          ))}
        </div>

        {sortedEmployees.length === 0 && (
          <div className="text-center py-12">
            <h3 className="text-lg font-medium mb-2">No team members found</h3>
            <p className="text-muted-foreground mb-4">Try changing your filters or add a new team member</p>
            {isAdmin && (
              <Button 
                onClick={() => setAddEmployeeOpen(true)}
                className="bg-brand text-black hover:bg-brand/80"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Team Member
              </Button>
            )}
          </div>
        )}
      </div>
      
      <AddEmployeeModal 
        open={addEmployeeOpen} 
        onOpenChange={setAddEmployeeOpen}
        onAddEmployee={handleAddEmployee}
      />
    </div>
  );
};

// Helper function to get the right color for role badges
function getRoleBadgeColor(role: EmployeeRole): string {
  switch (role) {
    case "Admin":
      return "bg-red-500 hover:bg-red-600 text-white";
    case "Manager":
      return "bg-blue-500 hover:bg-blue-600 text-white";
    case "Employee":
      return "bg-gray-500 hover:bg-gray-600 text-white";
    case "Active":
      return "bg-green-500 hover:bg-green-600 text-white";
    case "Inactive":
      return "bg-red-500 hover:bg-red-600 text-white";
    default:
      return "bg-secondary text-secondary-foreground";
  }
}

export default TeamManagement;
