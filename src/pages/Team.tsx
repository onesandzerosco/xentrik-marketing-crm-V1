
import React, { useState, useEffect } from 'react';
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import { v4 as uuidv4 } from 'uuid';
import { Edit, Clock, Mail, Users, Pause, Play } from "lucide-react";

import { Employee, EmployeeRole, EmployeeStatus } from '../types/employee';
import { mockEmployees } from '../data/mockEmployees';
import { filterAndSortEmployees, FILTER_KEYS } from '../utils/employeeUtils';

import EmployeeSearchAndSort from '../components/employees/EmployeeSearchAndSort';
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
  
  // Handle toggling pause status of an employee
  const handleTogglePause = (employee: Employee) => {
    const newStatus: EmployeeStatus = employee.status === "Paused" ? "Active" : "Paused";
    handleUpdateEmployee(employee.id, { status: newStatus });
    
    toast({
      title: `Team member ${newStatus === "Paused" ? "paused" : "resumed"}`,
      description: `${employee.name} has been ${newStatus === "Paused" ? "paused" : "resumed"}`,
    });
  };

  const handleEdit = (employee: Employee) => {
    setSelectedEmployee(employee);
    setEditModalOpen(true);
  };
  
  const getRoleBadgeStyle = (role: EmployeeRole) => {
    switch (role) {
      case "Admin":
        return "bg-red-500 text-white";
      case "Manager":
        return "bg-blue-500 text-white";
      case "Employee":
        return "bg-gray-600 text-white";
      default:
        return "";
    }
  };

  const getStatusBadgeStyle = (status: EmployeeStatus) => {
    switch (status) {
      case "Active":
        return "bg-green-500 text-white";
      case "Inactive":
        return "bg-red-500 text-white";
      case "Paused":
        return "bg-yellow-500 text-white";
      default:
        return "";
    }
  };

  const getTeamBadgeStyle = (team: string) => {
    switch (team) {
      case "A":
        return "bg-purple-500 text-white";
      case "B":
        return "bg-blue-500 text-white";
      case "C":
        return "bg-teal-500 text-white";
      default:
        return "";
    }
  };
  
  const formatLoginTime = (lastLogin: string) => {
    if (lastLogin.includes("Today")) return lastLogin;
    if (lastLogin.includes("Yesterday")) return lastLogin;
    if (lastLogin.includes("week")) return "Last week";
    if (lastLogin.includes("month")) return `1 month ago`;
    if (lastLogin.includes("days")) return `2 days ago`;
    return lastLogin;
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
            onClick={() => {}} 
            className="bg-yellow-400 text-black hover:bg-yellow-500 rounded-full font-medium"
          >
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
          <div key={employee.id} className="bg-[#111] rounded-lg overflow-hidden border border-[#333] hover:border-[#444] transition-colors">
            <div className="p-4">
              <div className="flex justify-between items-start mb-3">
                <h3 className="text-lg font-medium">{employee.name}</h3>
                <Badge className={`${getRoleBadgeStyle(employee.role)}`}>
                  {employee.role}
                </Badge>
              </div>
              
              <div className="flex items-center mb-3 text-sm text-muted-foreground">
                <Mail className="h-4 w-4 mr-2" />
                <span>{employee.email}</span>
              </div>
              
              <div className="space-y-3 mb-4">
                <div className="flex justify-between items-center text-sm">
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span className="text-muted-foreground">Last login:</span>
                  </div>
                  <span>{formatLoginTime(employee.lastLogin)}</span>
                </div>
                
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">Status:</span>
                  <Badge className={getStatusBadgeStyle(employee.status)}>
                    {employee.status}
                  </Badge>
                </div>
                
                {employee.telegram && (
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">Telegram:</span>
                    <span>@{employee.telegram}</span>
                  </div>
                )}
                
                {employee.department && (
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">Department:</span>
                    <span>{employee.department}</span>
                  </div>
                )}
                
                {employee.teams && employee.teams.length > 0 && (
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">Teams:</span>
                    <div className="flex gap-1">
                      {employee.teams.map((team) => (
                        <Badge key={team} className={getTeamBadgeStyle(team)}>
                          Team {team}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                
                {employee.assignedCreators && employee.assignedCreators.length > 0 && (
                  <div className="flex justify-between items-center text-sm">
                    <div className="flex items-center">
                      <Users className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span className="text-muted-foreground">Assigned Creators:</span>
                    </div>
                    <span>{employee.assignedCreators.length}</span>
                  </div>
                )}
              </div>
            </div>
            
            <div className="bg-[#1a1a1a] flex border-t border-[#333] divide-x divide-[#333]">
              <Button 
                variant="ghost" 
                onClick={() => handleEdit(employee)} 
                className="flex-1 rounded-none h-12 text-sm text-muted-foreground hover:text-white hover:bg-[#222]"
              >
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Button>
              
              {isAdmin && employee.id !== user?.id && (
                <Button 
                  variant="ghost" 
                  onClick={() => {
                    setSelectedEmployee(employee);
                    setDeactivateDialogOpen(true);
                  }} 
                  className="flex-1 rounded-none h-12 text-sm text-red-400 hover:text-red-300 hover:bg-[#222]"
                >
                  Deactivate
                </Button>
              )}
              
              {isAdmin && employee.id !== user?.id && (
                <Button 
                  variant="ghost" 
                  onClick={() => handleTogglePause(employee)}
                  className="flex-1 rounded-none h-12 text-sm text-muted-foreground hover:text-white hover:bg-[#222]"
                >
                  {employee.status === "Paused" ? (
                    <>
                      <Play className="h-4 w-4 mr-2" />
                      Resume
                    </>
                  ) : (
                    <>
                      <Pause className="h-4 w-4 mr-2" />
                      Pause
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>
      
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
