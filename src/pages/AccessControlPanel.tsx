
import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { useTeam } from "@/context/TeamContext";
import { TeamMember } from "@/types/team";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription 
} from "@/components/ui/card";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { Shield, Search, PlusCircle, X } from "lucide-react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Define available roles for the dropdown
const availableRoles = ["Admin", "VA", "Chatter", "Creator"];

const AccessControlPanel: React.FC = () => {
  const { user, userRole } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const { teamMembers, loading } = useTeam();
  
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredMembers, setFilteredMembers] = useState<TeamMember[]>([]);
  const [isAddRoleDialogOpen, setIsAddRoleDialogOpen] = useState(false);
  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null);
  const [selectedRole, setSelectedRole] = useState<string>("");

  // Check if user has admin role - redirect if not
  useEffect(() => {
    if (!loading && userRole !== "Admin") {
      toast({
        title: "Access Denied",
        description: "You don't have permission to view this page",
        variant: "destructive",
      });
      navigate("/dashboard");
    }
  }, [userRole, loading, navigate, toast]);

  // Filter team members based on search query
  useEffect(() => {
    if (teamMembers) {
      if (searchQuery.trim() === "") {
        setFilteredMembers(teamMembers);
      } else {
        const filtered = teamMembers.filter(
          (member) =>
            member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            member.email.toLowerCase().includes(searchQuery.toLowerCase())
        );
        setFilteredMembers(filtered);
      }
    }
  }, [teamMembers, searchQuery]);

  // Handle adding a role to a team member
  const handleAddRole = async () => {
    if (!selectedMemberId || !selectedRole) return;
    
    try {
      const memberToUpdate = teamMembers.find(m => m.id === selectedMemberId);
      if (!memberToUpdate) return;
      
      // Check if role already exists
      if (memberToUpdate.roles && memberToUpdate.roles.includes(selectedRole)) {
        toast({
          title: "Role Already Exists",
          description: `${memberToUpdate.name} already has the ${selectedRole} role`,
          variant: "destructive",
        });
        return;
      }
      
      // Create a new array with the existing roles plus the new one
      const updatedRoles = memberToUpdate.roles ? [...memberToUpdate.roles, selectedRole] : [selectedRole];
      
      // Update the roles in Supabase
      const { error } = await supabase
        .from('profiles')
        .update({ roles: updatedRoles })
        .eq('id', selectedMemberId);
      
      if (error) throw error;
      
      // Update local state
      const updatedMembers = teamMembers.map(member => 
        member.id === selectedMemberId 
          ? { ...member, roles: updatedRoles } 
          : member
      );
      
      toast({
        title: "Role Added",
        description: `Added ${selectedRole} role to ${memberToUpdate.name}`,
      });
      
      // Close dialog and reset selection
      setIsAddRoleDialogOpen(false);
      setSelectedRole("");
      setSelectedMemberId(null);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to add role",
        variant: "destructive",
      });
    }
  };

  // Handle removing a role from a team member
  const handleRemoveRole = async (memberId: string, roleToRemove: string) => {
    try {
      const memberToUpdate = teamMembers.find(m => m.id === memberId);
      if (!memberToUpdate || !memberToUpdate.roles) return;
      
      // Filter out the role to remove
      const updatedRoles = memberToUpdate.roles.filter(role => role !== roleToRemove);
      
      // Update the roles in Supabase
      const { error } = await supabase
        .from('profiles')
        .update({ roles: updatedRoles })
        .eq('id', memberId);
      
      if (error) throw error;
      
      toast({
        title: "Role Removed",
        description: `Removed ${roleToRemove} role from ${memberToUpdate.name}`,
      });
      
      // Update local state in team context (it will refresh automatically)
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to remove role",
        variant: "destructive",
      });
    }
  };

  // Handle updating a user's primary role
  const handleUpdatePrimaryRole = async (memberId: string, newRole: string) => {
    try {
      // Update the primary role in Supabase
      const { error } = await supabase
        .from('profiles')
        .update({ role: newRole })
        .eq('id', memberId);
      
      if (error) throw error;
      
      const memberToUpdate = teamMembers.find(m => m.id === memberId);
      
      toast({
        title: "Primary Role Updated",
        description: `Set ${memberToUpdate?.name}'s primary role to ${newRole}`,
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update primary role",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="flex justify-center items-center h-64">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-premium-border border-t-brand-yellow"></div>
          <p className="ml-3 text-muted-foreground">Loading access control data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Access Control Panel</h1>
          <p className="text-muted-foreground">
            Manage roles and permissions for team members
          </p>
        </div>
        <div className="flex items-center">
          <Shield className="mr-2 h-5 w-5 text-brand-yellow" />
          <span className="text-brand-yellow">Admin Access</span>
        </div>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>User Roles Management</CardTitle>
          <CardDescription>
            Assign or remove roles from team members
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between items-center mb-4">
            <div className="relative w-full max-w-sm">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search team members..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Primary Role</TableHead>
                <TableHead>Additional Roles</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredMembers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-10">
                    {searchQuery ? "No matching team members found." : "No team members available."}
                  </TableCell>
                </TableRow>
              ) : (
                filteredMembers.map((member) => (
                  <TableRow key={member.id}>
                    <TableCell className="font-medium">{member.name}</TableCell>
                    <TableCell>{member.email}</TableCell>
                    <TableCell>
                      <Select
                        defaultValue={member.role || "Employee"}
                        onValueChange={(value) => handleUpdatePrimaryRole(member.id, value)}
                      >
                        <SelectTrigger className="w-[140px]">
                          <SelectValue/>
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Admin">Admin</SelectItem>
                          <SelectItem value="Manager">Manager</SelectItem>
                          <SelectItem value="Employee">Employee</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {member.roles && member.roles.map((role) => (
                          <Badge key={role} variant="outline" className="flex items-center gap-1">
                            {role}
                            <button
                              onClick={() => handleRemoveRole(member.id, role)}
                              className="ml-1 rounded-full hover:bg-muted p-0.5"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </Badge>
                        ))}
                        {(!member.roles || member.roles.length === 0) && (
                          <span className="text-muted-foreground text-sm">No additional roles</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex items-center gap-1"
                        onClick={() => {
                          setSelectedMemberId(member.id);
                          setIsAddRoleDialogOpen(true);
                        }}
                      >
                        <PlusCircle className="h-4 w-4" />
                        Add Role
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Add Role Dialog */}
      <Dialog open={isAddRoleDialogOpen} onOpenChange={setIsAddRoleDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add Role</DialogTitle>
            <DialogDescription>
              Assign an additional role to the team member.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="role">Select Role</Label>
              <Select
                value={selectedRole}
                onValueChange={setSelectedRole}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent>
                  {availableRoles.map((role) => (
                    <SelectItem key={role} value={role}>
                      {role}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddRoleDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddRole} disabled={!selectedRole}>
              Add Role
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AccessControlPanel;
