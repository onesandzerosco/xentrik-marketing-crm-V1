
import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { supabase } from '@/integrations/supabase/client';
import { Employee, TeamMemberRole } from "@/types/employee";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Shield, Search } from "lucide-react";

const AccessControlPanel = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [filteredEmployees, setFilteredEmployees] = useState<Employee[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  
  // Available roles for assignment
  const availableRoles = ["Admin", "VA", "Chatter", "Creator", "Employee", "Manager"];
  
  // Check if current user is admin
  const isAdmin = user?.role === "Admin";
  
  // Fetch employees from Supabase
  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .order('name');
          
        if (error) {
          throw error;
        }
        
        // Transform data to match Employee type
        const employeeData = data.map(profile => ({
          id: profile.id,
          name: profile.name,
          email: profile.email,
          role: profile.role as TeamMemberRole,
          status: profile.status as "Active" | "Inactive" | "Paused",
          telegram: profile.telegram,
          permissions: [],
          profileImage: profile.profile_image,
          lastLogin: profile.last_login ? new Date(profile.last_login).toLocaleString() : 'Never',
          createdAt: profile.created_at ? new Date(profile.created_at).toLocaleString() : '',
          department: profile.department,
          userRoles: profile.roles || []
        }));
        
        setEmployees(employeeData);
        setFilteredEmployees(employeeData);
      } catch (error) {
        console.error("Error fetching employees:", error);
        toast({
          variant: "destructive",
          title: "Failed to load employees",
          description: "Please try again later."
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    if (isAdmin) {
      fetchEmployees();
    }
  }, [isAdmin, toast]);
  
  // Filter employees based on search query
  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredEmployees(employees);
    } else {
      const filtered = employees.filter(
        emp => 
          emp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          emp.email.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredEmployees(filtered);
    }
  }, [searchQuery, employees]);
  
  // Handle role change
  const handleRoleChange = async (employeeId: string, role: string) => {
    try {
      // Check if removing Admin role from self
      if (employeeId === user?.id && user?.role === "Admin" && role !== "Admin") {
        toast({
          variant: "destructive",
          title: "Cannot remove admin",
          description: "You cannot remove your own Admin role."
        });
        return;
      }
      
      // Get current employee
      const employee = employees.find(emp => emp.id === employeeId);
      if (!employee) return;
      
      // Update role in profiles table
      const { error: roleError } = await supabase
        .from('profiles')
        .update({ role })
        .eq('id', employeeId);
        
      if (roleError) {
        throw roleError;
      }
      
      // Update local state
      setEmployees(prev => 
        prev.map(emp => 
          emp.id === employeeId ? { ...emp, role: role as TeamMemberRole } : emp
        )
      );
      
      toast({
        title: "Role updated",
        description: `${employee.name}'s role has been set to ${role}`
      });
    } catch (error) {
      console.error("Error updating role:", error);
      toast({
        variant: "destructive",
        title: "Failed to update role",
        description: "Please try again later."
      });
    }
  };
  
  // Handle adding role to user's roles array
  const handleAddRole = async (employeeId: string, roleToAdd: string) => {
    try {
      // Get current employee
      const employee = employees.find(emp => emp.id === employeeId);
      if (!employee) return;
      
      // Check if role already exists
      if (employee.userRoles?.includes(roleToAdd)) {
        toast({
          variant: "default",
          title: "Role already assigned",
          description: `${employee.name} already has the ${roleToAdd} role`
        });
        return;
      }
      
      // Add role to roles array
      const updatedRoles = [...(employee.userRoles || []), roleToAdd];
      
      // Update roles in profiles table
      const { error } = await supabase
        .from('profiles')
        .update({ roles: updatedRoles })
        .eq('id', employeeId);
        
      if (error) {
        throw error;
      }
      
      // Update local state
      setEmployees(prev => 
        prev.map(emp => 
          emp.id === employeeId ? { ...emp, userRoles: updatedRoles } : emp
        )
      );
      
      toast({
        title: "Role added",
        description: `${roleToAdd} role has been added to ${employee.name}`
      });
    } catch (error) {
      console.error("Error adding role:", error);
      toast({
        variant: "destructive",
        title: "Failed to add role",
        description: "Please try again later."
      });
    }
  };
  
  // Handle removing role from user's roles array
  const handleRemoveRole = async (employeeId: string, roleToRemove: string) => {
    try {
      // Get current employee
      const employee = employees.find(emp => emp.id === employeeId);
      if (!employee) return;
      
      // Check if trying to remove last role
      if ((employee.userRoles?.length || 0) <= 1) {
        toast({
          variant: "destructive",
          title: "Cannot remove role",
          description: "Users must have at least one role"
        });
        return;
      }
      
      // Remove role from roles array
      const updatedRoles = (employee.userRoles || []).filter(role => role !== roleToRemove);
      
      // Update roles in profiles table
      const { error } = await supabase
        .from('profiles')
        .update({ roles: updatedRoles })
        .eq('id', employeeId);
        
      if (error) {
        throw error;
      }
      
      // Update local state
      setEmployees(prev => 
        prev.map(emp => 
          emp.id === employeeId ? { ...emp, userRoles: updatedRoles } : emp
        )
      );
      
      toast({
        title: "Role removed",
        description: `${roleToRemove} role has been removed from ${employee.name}`
      });
    } catch (error) {
      console.error("Error removing role:", error);
      toast({
        variant: "destructive",
        title: "Failed to remove role",
        description: "Please try again later."
      });
    }
  };

  if (!isAdmin) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
        <p>You don't have permission to access this page.</p>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Access Control Panel</h1>
          <p className="text-muted-foreground">
            Manage user roles and permissions
          </p>
        </div>
        
        <div className="flex items-center gap-3 w-full max-w-xs">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input 
              placeholder="Search by name or email" 
              value={searchQuery} 
              onChange={e => setSearchQuery(e.target.value)} 
              className="w-full pl-10"
            />
          </div>
        </div>
      </div>
      
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-premium-border border-t-brand-yellow"></div>
        </div>
      ) : (
        <div className="bg-premium-card shadow-md rounded-lg border border-premium-border overflow-hidden">
          <Table>
            <TableCaption>List of team members and their roles</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[200px]">Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Primary Role</TableHead>
                <TableHead>Additional Roles</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredEmployees.map((employee) => (
                <TableRow key={employee.id}>
                  <TableCell className="font-medium flex items-center gap-3">
                    {employee.profileImage ? (
                      <img 
                        src={employee.profileImage} 
                        alt={employee.name} 
                        className="h-8 w-8 rounded-full object-cover"
                      />
                    ) : (
                      <div className="h-8 w-8 rounded-full bg-premium-highlight flex items-center justify-center">
                        {employee.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                    {employee.name}
                  </TableCell>
                  <TableCell>{employee.email}</TableCell>
                  <TableCell>
                    <Select 
                      defaultValue={employee.role} 
                      onValueChange={(value) => handleRoleChange(employee.id, value)}
                    >
                      <SelectTrigger className="w-[140px]">
                        <SelectValue placeholder="Select role" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableRoles.map(role => (
                          <SelectItem key={role} value={role}>{role}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-2">
                      {employee.userRoles && employee.userRoles.map(role => (
                        <Badge 
                          key={role} 
                          variant="secondary"
                          className="flex gap-1 items-center"
                        >
                          {role}
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-4 w-4 p-0 hover:bg-transparent"
                            onClick={() => handleRemoveRole(employee.id, role)}
                          >
                            ×
                          </Button>
                        </Badge>
                      ))}
                      {(!employee.userRoles || employee.userRoles.length === 0) && (
                        <span className="text-muted-foreground text-sm italic">No additional roles</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <Select 
                      onValueChange={(value) => handleAddRole(employee.id, value)}
                    >
                      <SelectTrigger className="w-[140px]">
                        <SelectValue placeholder="Add role" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableRoles.map(role => (
                          <SelectItem key={role} value={role}>{role}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
};

export default AccessControlPanel;
