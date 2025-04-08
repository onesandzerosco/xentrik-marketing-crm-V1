
import React, { useState, useEffect } from 'react';
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import { v4 as uuidv4 } from 'uuid';
import { Edit, Clock, Mail, Users, Pause, Play, Plus } from "lucide-react";

import { Employee, EmployeeRole, EmployeeStatus } from '../types/employee';
import { mockEmployees } from '../data/mockEmployees';
import { filterAndSortEmployees, FILTER_KEYS } from '../utils/employeeUtils';

import EmployeeSearchAndSort from '../components/employees/EmployeeSearchAndSort';
import EmployeeCard from '../components/employees/EmployeeCard';
import AddEmployeeModal from '../components/employees/AddEmployeeModal';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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

const Team = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const isAdmin = user?.role === "Admin";
  
  // State for employees and filters
  const [employees, setEmployees] = useState<Employee[]>(mockEmployees);
  const [selectedRoles, setSelectedRoles] = useState<EmployeeRole[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOption, setSortOption] = useState("nameAsc");
  
  // State for modals
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [addEmployeeOpen, setAddEmployeeOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [deactivateDialogOpen, setDeactivateDialogOpen] = useState(false);
  
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
  
  const handleEdit = (employee: Employee) => {
    setSelectedEmployee(employee);
    setEditModalOpen(true);
  };
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Team Management</h1>
          <p className="text-muted-foreground">
            Manage team members with access to the CRM
          </p>
        </div>
        
        {isAdmin && (
          <Button 
            onClick={() => setAddEmployeeOpen(true)} 
            className="bg-brand-yellow text-black hover:bg-brand-highlight rounded-full px-6 py-2 font-medium"
          >
            <Plus className="h-5 w-5 mr-2" />
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
      
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredEmployees.map((employee) => (
          <EmployeeCard
            key={employee.id}
            employee={employee}
            onUpdate={handleUpdateEmployee}
            isAdmin={isAdmin}
            currentUserId={user?.id}
            onDeactivateClick={(emp) => {
              setSelectedEmployee(emp);
              setDeactivateDialogOpen(true);
            }}
          />
        ))}
      </div>
      
      {filteredEmployees.length === 0 && (
        <div className="text-center py-12">
          <h3 className="text-lg font-medium mb-2">No team members found</h3>
          <p className="text-muted-foreground mb-4">Try changing your filters or add a new team member</p>
          {isAdmin && (
            <Button 
              onClick={() => setAddEmployeeOpen(true)}
              className="bg-brand-yellow text-black hover:bg-brand-highlight rounded-full px-6 py-2 font-medium"
            >
              <Plus className="h-5 w-5 mr-2" />
              Add Team Member
            </Button>
          )}
        </div>
      )}
      
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
      
      <AddEmployeeModal 
        open={addEmployeeOpen}
        onOpenChange={setAddEmployeeOpen}
        onAddEmployee={handleAddEmployee}
      />
    </div>
  );
};

export default Team;
