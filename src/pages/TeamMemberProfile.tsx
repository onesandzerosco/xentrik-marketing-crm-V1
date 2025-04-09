
import React, { useState, useEffect } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Employee, EmployeeRole, EmployeeStatus, EmployeeTeam } from "../types/employee";
import { Form } from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { teamMemberFormSchema, TeamMemberFormValues } from "@/schemas/teamMemberSchema";

// Import the refactored components
import ProfileImageSection from "@/components/team/ProfileImageSection";
import BasicInfoSection from "@/components/team/BasicInfoSection";
import TeamAssignmentSection from "@/components/team/TeamAssignmentSection";
import CreatorsAssignmentSection from "@/components/team/CreatorsAssignmentSection";
import FormActions from "@/components/team/FormActions";

// Storage key for employees data
const EMPLOYEES_STORAGE_KEY = 'team_employees_data';

const TeamMemberProfile = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const { toast } = useToast();
  const { user } = useAuth();
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedTeams, setSelectedTeams] = useState<EmployeeTeam[]>([]);
  const [selectedCreators, setSelectedCreators] = useState<string[]>([]);
  const returnToTeam = location.state?.returnToTeam || false;
  const isCurrentUser = user?.id === id;

  // Form setup
  const form = useForm<TeamMemberFormValues>({
    resolver: zodResolver(teamMemberFormSchema),
    defaultValues: {
      name: "",
      email: "",
      role: "Employee" as "Admin" | "Manager" | "Employee",
      status: "Active" as EmployeeStatus,
      telegram: "",
      department: "",
      permissions: [],
      profileImage: "",
      teams: [],
      assignedCreators: []
    }
  });

  // Load employee data on component mount
  useEffect(() => {
    const loadEmployee = () => {
      setLoading(true);
      try {
        const savedEmployees = localStorage.getItem(EMPLOYEES_STORAGE_KEY);
        if (savedEmployees) {
          const employeesData = JSON.parse(savedEmployees) as Employee[];
          const foundEmployee = employeesData.find(emp => emp.id === id);
          
          if (foundEmployee) {
            setEmployee(foundEmployee);
            setSelectedTeams(foundEmployee.teams || []);
            setSelectedCreators(foundEmployee.assignedCreators || []);
            
            // Reset form with employee data
            form.reset({
              name: foundEmployee.name,
              email: foundEmployee.email,
              role: foundEmployee.role as "Admin" | "Manager" | "Employee",
              status: foundEmployee.status,
              telegram: foundEmployee.telegram || "",
              department: foundEmployee.department || "",
              permissions: foundEmployee.permissions || [],
              profileImage: foundEmployee.profileImage || "",
              teams: foundEmployee.teams || [],
              assignedCreators: foundEmployee.assignedCreators || []
            });
          } else {
            toast({
              title: "Employee not found",
              description: "Could not find the requested team member",
              variant: "destructive"
            });
            navigate('/team');
          }
        } else {
          toast({
            title: "Data not available",
            description: "Could not load team member data",
            variant: "destructive"
          });
          navigate('/team');
        }
      } catch (error) {
        console.error("Error loading employee data:", error);
        toast({
          title: "Error",
          description: "An error occurred while loading the team member data",
          variant: "destructive"
        });
        navigate('/team');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      loadEmployee();
    } else {
      navigate('/team');
    }
  }, [id, navigate, toast, form]);

  // Handle form submission
  const handleSubmit = (values: TeamMemberFormValues) => {
    if (!employee) return;
    
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
    
    try {
      const savedEmployees = localStorage.getItem(EMPLOYEES_STORAGE_KEY);
      if (savedEmployees) {
        const employeesData = JSON.parse(savedEmployees) as Employee[];
        const updatedEmployees = employeesData.map(emp => 
          emp.id === id ? { ...emp, ...values } : emp
        );
        
        // Save updated employees back to localStorage
        localStorage.setItem(EMPLOYEES_STORAGE_KEY, JSON.stringify(updatedEmployees));
        
        // Update the local state
        setEmployee(prev => prev && { ...prev, ...values });
        
        toast({
          title: "Changes saved",
          description: "Team member information has been updated successfully"
        });
      }
    } catch (error) {
      console.error("Error updating employee:", error);
      toast({
        title: "Error saving changes",
        description: "An error occurred while saving changes",
        variant: "destructive"
      });
    }
  };

  // Handle profile image change
  const handleProfileImageChange = (url: string) => {
    form.setValue("profileImage", url);
  };
  
  // Toggle team selection
  const toggleTeam = (team: EmployeeTeam) => {
    setSelectedTeams(prev => {
      if (prev.includes(team)) {
        return prev.filter(t => t !== team);
      } else {
        return [...prev, team];
      }
    });
  };
  
  // Toggle creator selection
  const toggleCreator = (creatorId: string) => {
    setSelectedCreators(prev => {
      if (prev.includes(creatorId)) {
        return prev.filter(id => id !== creatorId);
      } else {
        return [...prev, creatorId];
      }
    });
  };

  // Handle going back
  const handleBack = () => {
    if (returnToTeam) {
      navigate('/team');
    } else {
      navigate(-1);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 flex justify-center items-center min-h-[300px]">
        <div className="text-center">
          <p className="text-muted-foreground">Loading team member information...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center mb-8">
        <Button
          variant="ghost"
          size="icon"
          onClick={handleBack}
          className="mr-4"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold">{employee?.name || "Team Member Profile"}</h1>
          <p className="text-muted-foreground">Edit team member information</p>
        </div>
      </div>

      {employee && (
        <div className="bg-[#161618] border border-[#333333] rounded-lg p-6 max-w-4xl mx-auto">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
              <div className="flex gap-6 flex-col sm:flex-row">
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
              
              <FormActions 
                handleBack={handleBack}
              />
            </form>
          </Form>
        </div>
      )}
    </div>
  );
};

export default TeamMemberProfile;
