
import React, { useState, useEffect } from 'react';
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import { v4 as uuidv4 } from 'uuid';

import { Employee, EmployeeRole, EmployeeStatus } from '../types/employee';
import { mockEmployees } from '../data/mockEmployees';
import { filterAndSortEmployees, FILTER_KEYS } from '../utils/employeeUtils';

import EmployeeList from '../components/employees/EmployeeList';
import EmployeeSearchAndSort from '../components/employees/EmployeeSearchAndSort';
import EmployeeFiltersBar from '../components/employees/EmployeeFiltersBar';
import AddEmployeeModal from '../components/employees/AddEmployeeModal';
import { 
  AlertDialog, 
  AlertDialogAction, 
  AlertDialogCancel, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle 
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";

const Team = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const isAdmin = user?.role === "Admin";
  
  // State for employees and filters
  const [employees, setEmployees] = useState<Employee[]>(mockEmployees);
  const [selectedRoles, setSelectedRoles] = useState<EmployeeRole[]>([]);
  const [selectedStatuses, setSelectedStatuses] = useState<EmployeeStatus[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOption, setSortOption] = useState("nameAsc");
  
  // State for modals
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [deactivateDialogOpen, setDeactivateDialogOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  
  // Load saved filters from localStorage
  useEffect(() => {
    const savedRoles = localStorage.getItem(FILTER_KEYS.ROLE);
    const savedSearch = localStorage.getItem(FILTER_KEYS.SEARCH);
    const savedSort = localStorage.getItem(FILTER_KEYS.SORT);
    
    if (savedRoles) setSelectedRoles(JSON.parse(savedRoles));
    if (savedSearch) setSearchQuery(savedSearch);
    if (savedSort) setSortOption(savedSort);
  }, []);
  
  // Save filters to localStorage when they change
  useEffect(() => {
    localStorage.setItem(FILTER_KEYS.ROLE, JSON.stringify(selectedRoles));
    localStorage.setItem(FILTER_KEYS.SEARCH, searchQuery);
    localStorage.setItem(FILTER_KEYS.SORT, sortOption);
  }, [selectedRoles, searchQuery, sortOption]);
  
  // Filter and sort employees
  const filteredEmployees = filterAndSortEmployees(
    employees,
    selectedRoles,
    searchQuery,
    sortOption
  );
  
  // Handle adding a new employee
  const handleAddEmployee = (newEmployee: Omit<Employee, "id">) => {
    const employeeWithId = {
      ...newEmployee,
      id: uuidv4(),
    };
    
    setEmployees([...employees, employeeWithId]);
    
    toast({
      title: "Team member added",
      description: `${newEmployee.name} has been added to the team`,
    });
  };
  
  // Handle updating an employee
  const handleUpdateEmployee = (id: string, updates: Partial<Employee>) => {
    setEmployees(
      employees.map((employee) =>
        employee.id === id ? { ...employee, ...updates } : employee
      )
    );
    
    toast({
      title: "Team member updated",
      description: "The team member has been updated successfully",
    });
  };
  
  // Handle deactivating an employee
  const handleDeactivate = () => {
    if (selectedEmployee) {
      handleUpdateEmployee(selectedEmployee.id, { status: "Inactive" });
      setDeactivateDialogOpen(false);
      setSelectedEmployee(null);
      
      toast({
        title: "Team member deactivated",
        description: `${selectedEmployee.name} has been deactivated`,
      });
    }
  };
  
  // Clear all filters
  const handleClearFilters = () => {
    setSelectedRoles([]);
    setSelectedStatuses([]);
    setSearchQuery("");
  };
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Team Management</h1>
          <p className="text-muted-foreground">
            Manage team members with access to the CRM
          </p>
        </div>
        
        {isAdmin && (
          <Button 
            onClick={() => setAddModalOpen(true)}
            className="bg-brand-yellow text-black hover:bg-brand-highlight"
          >
            <PlusCircle className="h-4 w-4 mr-2" />
            Add Team Member
          </Button>
        )}
      </div>
      
      <EmployeeSearchAndSort
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        sortOption={sortOption}
        setSortOption={setSortOption}
      />
      
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
        onAddEmployeeClick={() => setAddModalOpen(true)}
        onDeactivateClick={(employee) => {
          setSelectedEmployee(employee);
          setDeactivateDialogOpen(true);
        }}
      />
      
      <AddEmployeeModal
        open={addModalOpen}
        onOpenChange={setAddModalOpen}
        onAddEmployee={handleAddEmployee}
      />
      
      <AlertDialog open={deactivateDialogOpen} onOpenChange={setDeactivateDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Deactivate Team Member</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to deactivate {selectedEmployee?.name}? They will no longer have access to the system.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeactivate}
              className="bg-destructive text-destructive-foreground"
            >
              Deactivate
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Team;
