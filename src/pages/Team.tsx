
import React, { useState, useEffect } from 'react';
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import { v4 as uuidv4 } from 'uuid';
import { Plus } from "lucide-react";
import { Employee, EmployeeRole } from '../types/employee';
import { mockEmployees } from '../data/mockEmployees';
import { filterAndSortEmployees, FILTER_KEYS } from '../utils/employeeUtils';
import EmployeeSearchAndSort from '../components/employees/EmployeeSearchAndSort';
import EmployeeList from '../components/employees/EmployeeList';
import AddEmployeeModal from '../components/employees/AddEmployeeModal';
import DeactivateDialog from '../components/employees/DeactivateDialog';
import { Button } from "@/components/ui/button";

// Storage key for employees data
const EMPLOYEES_STORAGE_KEY = 'team_employees_data';

const Team = () => {
  const {
    toast
  } = useToast();
  const {
    user
  } = useAuth();
  const isAdmin = user?.role === "Admin";

  // State for employees and filters
  const [employees, setEmployees] = useState<Employee[]>(() => {
    // Try to load from localStorage first
    const savedEmployees = localStorage.getItem(EMPLOYEES_STORAGE_KEY);
    if (savedEmployees) {
      try {
        return JSON.parse(savedEmployees);
      } catch (error) {
        console.error("Error parsing saved employees:", error);
        return mockEmployees;
      }
    }
    return mockEmployees;
  });
  
  const [selectedRoles, setSelectedRoles] = useState<EmployeeRole[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOption, setSortOption] = useState("nameAsc");

  // State for modals
  const [addEmployeeOpen, setAddEmployeeOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [deactivateDialogOpen, setDeactivateDialogOpen] = useState(false);

  // Save employees to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem(EMPLOYEES_STORAGE_KEY, JSON.stringify(employees));
  }, [employees]);

  // Load saved filters from localStorage
  useEffect(() => {
    const savedSearch = localStorage.getItem(FILTER_KEYS.SEARCH);
    const savedSort = localStorage.getItem(FILTER_KEYS.SORT);
    if (savedSearch) setSearchQuery(savedSearch);
    if (savedSort) setSortOption(savedSort);
  }, []);

  // Save filters to localStorage when they change
  useEffect(() => {
    localStorage.setItem(FILTER_KEYS.SEARCH, searchQuery);
    localStorage.setItem(FILTER_KEYS.SORT, sortOption);
  }, [searchQuery, sortOption]);

  // Filter and sort employees
  const filteredEmployees = filterAndSortEmployees(employees, selectedRoles, searchQuery, sortOption);

  // Handle adding a new employee
  const handleAddEmployee = (newEmployee: Omit<Employee, "id">) => {
    const employeeWithId = {
      ...newEmployee,
      id: uuidv4()
    };
    setEmployees([...employees, employeeWithId]);
    toast({
      title: "Team member added",
      description: `${newEmployee.name} has been added to the team`
    });
  };

  // Handle updating an employee
  const handleUpdateEmployee = (id: string, updates: Partial<Employee>) => {
    setEmployees(employees.map(employee => employee.id === id ? {
      ...employee,
      ...updates
    } : employee));
    toast({
      title: "Team member updated",
      description: "The team member has been updated successfully"
    });
  };

  // Handle deactivating an employee
  const handleDeactivate = () => {
    if (selectedEmployee) {
      handleUpdateEmployee(selectedEmployee.id, {
        status: "Inactive"
      });
      setDeactivateDialogOpen(false);
      setSelectedEmployee(null);
      toast({
        title: "Team member deactivated",
        description: `${selectedEmployee.name} has been deactivated`
      });
    }
  };

  return <div className="container mx-auto px-4 py-8 min-h-screen bg-background">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Team Management</h1>
          <p className="text-muted-foreground">
            Manage team members with access to the CRM
          </p>
        </div>
        
        {isAdmin && <Button onClick={() => setAddEmployeeOpen(true)} className="bg-brand-yellow text-black hover:bg-brand-highlight rounded-md px-6 py-2">
            <Plus className="h-4 w-4 mr-2" />
            Add Team Member
          </Button>}
      </div>
      
      <EmployeeSearchAndSort searchQuery={searchQuery} setSearchQuery={setSearchQuery} sortOption={sortOption} setSortOption={setSortOption} />
      
      <EmployeeList employees={filteredEmployees} onUpdate={handleUpdateEmployee} isAdmin={isAdmin} currentUserId={user?.id} onAddEmployeeClick={() => setAddEmployeeOpen(true)} onDeactivateClick={emp => {
      setSelectedEmployee(emp);
      setDeactivateDialogOpen(true);
    }} />
      
      <DeactivateDialog open={deactivateDialogOpen} onOpenChange={setDeactivateDialogOpen} onDeactivate={handleDeactivate} employeeName={selectedEmployee?.name} />
      
      <AddEmployeeModal open={addEmployeeOpen} onOpenChange={setAddEmployeeOpen} onAddEmployee={handleAddEmployee} />
    </div>;
};

export default Team;
