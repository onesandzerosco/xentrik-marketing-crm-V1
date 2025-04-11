
import React, { useEffect, useState } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription, 
  DialogFooter 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "@/components/ui/form";
import { Employee, EmployeeTeam } from "../../types/employee";
import { teamMemberFormSchema, TeamMemberFormValues } from "@/schemas/teamMemberSchema";

// Import the refactored components
import ProfileImageSection from "@/components/team/ProfileImageSection";
import BasicInfoSection from "@/components/team/BasicInfoSection";
import TeamAssignmentSection from "@/components/team/TeamAssignmentSection";
import CreatorsAssignmentSection from "@/components/team/CreatorsAssignmentSection";

interface EditEmployeeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  employee: Employee;
  onUpdateEmployee: (id: string, updates: Partial<Employee>) => void;
  currentUserId?: string;
}

const EditEmployeeModal: React.FC<EditEmployeeModalProps> = ({ 
  open, 
  onOpenChange,
  employee,
  onUpdateEmployee,
  currentUserId
}) => {
  const isCurrentUser = currentUserId === employee.id;
  const [selectedTeams, setSelectedTeams] = useState<EmployeeTeam[]>(employee.teams || []);
  const [selectedCreators, setSelectedCreators] = useState<string[]>(employee.assignedCreators || []);
  
  const form = useForm<TeamMemberFormValues>({
    resolver: zodResolver(teamMemberFormSchema),
    defaultValues: {
      name: employee.name,
      email: employee.email,
      role: employee.role as "Admin" | "Manager" | "Employee",
      status: employee.status || "Active",
      telegram: employee.telegram || "",
      department: employee.department || "",
      permissions: employee.permissions || [],
      profileImage: employee.profileImage || "",
      teams: employee.teams || [],
      assignedCreators: employee.assignedCreators || []
    }
  });
  
  // Reset form when employee changes
  useEffect(() => {
    if (open) {
      form.reset({
        name: employee.name,
        email: employee.email,
        role: employee.role as "Admin" | "Manager" | "Employee",
        status: employee.status || "Active",
        telegram: employee.telegram || "",
        department: employee.department || "",
        permissions: employee.permissions || [],
        profileImage: employee.profileImage || "",
        teams: employee.teams || [],
        assignedCreators: employee.assignedCreators || []
      });
      setSelectedTeams(employee.teams || []);
      setSelectedCreators(employee.assignedCreators || []);
    }
  }, [employee, open, form]);
  
  const handleSubmit = (values: TeamMemberFormValues) => {
    // For current users who are admins, prevent changing their own role
    if (isCurrentUser && values.role !== employee.role) {
      // Reset role to original value
      values.role = employee.role as "Admin" | "Manager" | "Employee";
    }
    
    // Prevent current users from deactivating themselves
    if (isCurrentUser && values.status !== "Active") {
      values.status = "Active";
    }
    
    // Add selected teams and creators to the form values
    values.teams = selectedTeams;
    values.assignedCreators = selectedCreators;
    
    onUpdateEmployee(employee.id, values);
    onOpenChange(false);
  };
  
  const handleProfileImageChange = (url: string) => {
    form.setValue("profileImage", url);
  };
  
  const toggleTeam = (team: EmployeeTeam) => {
    setSelectedTeams(prev => {
      if (prev.includes(team)) {
        return prev.filter(t => t !== team);
      } else {
        return [...prev, team];
      }
    });
  };
  
  const toggleCreator = (creatorId: string) => {
    setSelectedCreators(prev => {
      if (prev.includes(creatorId)) {
        return prev.filter(id => id !== creatorId);
      } else {
        return [...prev, creatorId];
      }
    });
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Edit Team Member</DialogTitle>
          <DialogDescription>
            Update information for {employee.name}
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <div className="flex gap-6">
              <ProfileImageSection 
                profileImage={form.watch("profileImage") || ""}
                name={form.watch("name") || employee.name}
                handleProfileImageChange={handleProfileImageChange}
              />
              
              <BasicInfoSection 
                control={form.control}
                isCurrentUser={isCurrentUser}
              />
            </div>

            <TeamAssignmentSection 
              selectedTeams={selectedTeams}
              toggleTeam={toggleTeam}
            />

            <CreatorsAssignmentSection 
              selectedCreators={selectedCreators}
              toggleCreator={toggleCreator}
            />
            
            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                variant="premium"
                className="shadow-premium-yellow"
              >
                Save Changes
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default EditEmployeeModal;
