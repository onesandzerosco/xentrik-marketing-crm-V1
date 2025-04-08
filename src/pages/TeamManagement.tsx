
import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import AddEmployeeModal from "../components/employees/AddEmployeeModal";
import { Employee, EmployeeRole } from "../types/employee";
import { mockEmployees } from "../data/mockEmployees";
import EmployeeFilterSheet from "../components/employees/EmployeeFilterSheet";
import EmployeeSearchAndSort from "../components/employees/EmployeeSearchAndSort";
import EmployeeFilterBadges from "../components/employees/EmployeeFilterBadges";
import EmployeeList from "../components/employees/EmployeeList";
import { filterAndSortEmployees, FILTER_KEYS } from "../utils/employeeUtils";

type FilterRole = EmployeeRole | "Active" | "Inactive";

const TeamManagement = () => {
  const { user } = useAuth();
  const [addEmployeeOpen, setAddEmployeeOpen] = useState(false);
  const [employees, setEmployees] = useState<Employee[]>(() => {
    const saved = localStorage.getItem('employees');
    return saved ? JSON.parse(saved) : mockEmployees;
  });
  
  // Initialize filters with values from localStorage or defaults
  const [selectedRoles, setSelectedRoles] = useState<FilterRole[]>(() => {
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

  // Filter and sort employees
  const sortedEmployees = filterAndSortEmployees(
    employees,
    selectedRoles,
    searchQuery,
    sortOption
  );

  // Add a new employee
  const handleAddEmployee = (newEmployee: Omit<Employee, "id">) => {
    const employeeWithId = {
      ...newEmployee,
      id: Date.now().toString(),
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

  const handleRoleFilter = (role: FilterRole) => {
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
    <div className="p-8 w-full">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Team Management</h1>
          <p className="text-muted-foreground">
            {sortedEmployees.length} team members in your organization
          </p>
        </div>
        <div className="flex gap-3">
          <EmployeeFilterSheet
            selectedRoles={selectedRoles}
            handleRoleFilter={handleRoleFilter}
            handleClearFilters={handleClearFilters}
            searchQuery={searchQuery}
          />
          
          <EmployeeSearchAndSort
            searchQuery={searchQuery}
            handleSearchChange={handleSearchChange}
            sortOption={sortOption}
            handleSortChange={handleSortChange}
          />
          
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

      <EmployeeFilterBadges
        selectedRoles={selectedRoles}
        setSelectedRoles={setSelectedRoles}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        handleClearFilters={handleClearFilters}
      />

      <EmployeeList
        employees={sortedEmployees}
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
