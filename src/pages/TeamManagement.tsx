
import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { Button } from "@/components/ui/button";
import { Plus, Filter, Search, ArrowUpDown } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import AddEmployeeModal from "../components/employees/AddEmployeeModal";
import { Employee, EmployeeRole, EmployeeStatus } from "../types/employee";
import { mockEmployees } from "../data/mockEmployees";
import EmployeeList from "../components/employees/EmployeeList";
import EmployeeFiltersBar from "../components/employees/EmployeeFiltersBar";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger
} from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";

const FILTER_KEYS = {
  ROLES: 'employee_filter_roles',
  STATUSES: 'employee_filter_statuses',
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
    const saved = localStorage.getItem(FILTER_KEYS.ROLES);
    return saved ? JSON.parse(saved) : [];
  });
  
  const [selectedStatuses, setSelectedStatuses] = useState<EmployeeStatus[]>(() => {
    const saved = localStorage.getItem(FILTER_KEYS.STATUSES);
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
    localStorage.setItem(FILTER_KEYS.ROLES, JSON.stringify(selectedRoles));
  }, [selectedRoles]);
  
  useEffect(() => {
    localStorage.setItem(FILTER_KEYS.STATUSES, JSON.stringify(selectedStatuses));
  }, [selectedStatuses]);
  
  useEffect(() => {
    localStorage.setItem(FILTER_KEYS.SEARCH, searchQuery);
  }, [searchQuery]);
  
  useEffect(() => {
    localStorage.setItem(FILTER_KEYS.SORT, sortOption);
  }, [sortOption]);

  // Filter and sort employees
  const filteredEmployees = employees.filter(employee => {
    // Filter by role
    if (selectedRoles.length > 0 && !selectedRoles.includes(employee.role)) {
      return false;
    }
    
    // Filter by status
    if (selectedStatuses.length > 0 && !selectedStatuses.includes(employee.status)) {
      return false;
    }
    
    // Filter by search query
    if (searchQuery && !employee.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !employee.email.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !(employee.telegram && employee.telegram.toLowerCase().includes(searchQuery.toLowerCase()))) {
      return false;
    }
    
    return true;
  }).sort((a, b) => {
    switch (sortOption) {
      case "nameAsc":
        return a.name.localeCompare(b.name);
      case "nameDesc":
        return b.name.localeCompare(a.name);
      case "lastLoginAsc":
        return a.lastLogin.localeCompare(b.lastLogin);
      case "lastLoginDesc":
        return b.lastLogin.localeCompare(a.lastLogin);
      case "roleAsc":
        return a.role.localeCompare(b.role);
      case "roleDesc":
        return b.role.localeCompare(a.role);
      default:
        return 0;
    }
  });

  // Add a new employee
  const handleAddEmployee = (newEmployee: Omit<Employee, "id">) => {
    const employeeWithId = {
      ...newEmployee,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    };
    
    setEmployees([...employees, employeeWithId]);
    
    toast({
      title: "Team Member Added",
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
      title: "Team Member Updated",
      description: `${employee?.name}'s information has been updated`,
    });
  };

  const handleRoleFilter = (role: EmployeeRole) => {
    setSelectedRoles(
      selectedRoles.includes(role)
        ? selectedRoles.filter(r => r !== role)
        : [...selectedRoles, role]
    );
  };

  const handleStatusFilter = (status: EmployeeStatus) => {
    setSelectedStatuses(
      selectedStatuses.includes(status)
        ? selectedStatuses.filter(s => s !== status)
        : [...selectedStatuses, status]
    );
  };

  const handleClearFilters = () => {
    setSelectedRoles([]);
    setSelectedStatuses([]);
    setSearchQuery("");
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleSortChange = (value: string) => {
    setSortOption(value);
  };

  return (
    <div className="p-8 w-full">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Team Management</h1>
          <p className="text-muted-foreground">
            {filteredEmployees.length} team members in your organization
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
                  Filter by role, status, and more
                </SheetDescription>
              </SheetHeader>
              <div className="py-6 space-y-6">
                <div>
                  <h3 className="text-lg font-medium mb-3">Role</h3>
                  <div className="flex flex-wrap gap-2">
                    {["Admin", "Manager", "Employee"].map((role) => (
                      <Button
                        key={role}
                        variant={selectedRoles.includes(role as EmployeeRole) ? "default" : "outline"}
                        className="rounded-full"
                        onClick={() => handleRoleFilter(role as EmployeeRole)}
                      >
                        {role}
                      </Button>
                    ))}
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-medium mb-3">Status</h3>
                  <div className="flex flex-wrap gap-2">
                    {["Active", "Inactive", "Paused"].map((status) => (
                      <Button
                        key={status}
                        variant={selectedStatuses.includes(status as EmployeeStatus) ? "default" : "outline"}
                        className="rounded-full"
                        onClick={() => handleStatusFilter(status as EmployeeStatus)}
                      >
                        {status}
                      </Button>
                    ))}
                  </div>
                </div>
                {(selectedRoles.length > 0 || selectedStatuses.length > 0) && (
                  <Button
                    variant="ghost"
                    className="mt-4"
                    onClick={handleClearFilters}
                  >
                    Clear all filters
                  </Button>
                )}
              </div>
            </SheetContent>
          </Sheet>
          
          <div className="flex items-center relative">
            <Search className="h-4 w-4 absolute left-3 text-muted-foreground" />
            <Input
              placeholder="Search team members..."
              className="pl-9 w-[250px]"
              value={searchQuery}
              onChange={handleSearchChange}
            />
          </div>
          
          <Select value={sortOption} onValueChange={handleSortChange}>
            <SelectTrigger className="w-[180px]">
              <div className="flex items-center gap-2">
                <ArrowUpDown className="h-4 w-4" />
                <span>Sort by</span>
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="nameAsc">Name (A-Z)</SelectItem>
              <SelectItem value="nameDesc">Name (Z-A)</SelectItem>
              <SelectItem value="roleAsc">Role (A-Z)</SelectItem>
              <SelectItem value="roleDesc">Role (Z-A)</SelectItem>
              <SelectItem value="lastLoginAsc">Last login (Oldest)</SelectItem>
              <SelectItem value="lastLoginDesc">Last login (Newest)</SelectItem>
            </SelectContent>
          </Select>
          
          {isAdmin && (
            <Button 
              onClick={() => setAddEmployeeOpen(true)}
              className="bg-brand-yellow text-black hover:bg-brand-highlight"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Team Member
            </Button>
          )}
        </div>
      </div>

      {(selectedRoles.length > 0 || selectedStatuses.length > 0 || searchQuery) && (
        <EmployeeFiltersBar
          selectedRoles={selectedRoles}
          selectedStatuses={selectedStatuses}
          searchQuery={searchQuery}
          setSelectedRoles={setSelectedRoles}
          setSelectedStatuses={setSelectedStatuses}
          setSearchQuery={setSearchQuery}
          handleClearFilters={handleClearFilters}
        />
      )}

      <EmployeeList
        employees={filteredEmployees}
        onUpdate={handleUpdateEmployee}
        isAdmin={isAdmin}
        currentUserId={user?.id}
        onAddEmployeeClick={() => setAddEmployeeOpen(true)}
      />
      
      <AddEmployeeModal 
        open={addEmployeeOpen} 
        onOpenChange={setAddEmployeeOpen} 
        onAddEmployee={handleAddEmployee}
      />
    </div>
  );
};

export default TeamManagement;
