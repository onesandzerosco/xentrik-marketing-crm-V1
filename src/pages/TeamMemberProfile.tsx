
import React, { useState, useEffect } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Employee, EmployeeRole, EmployeeStatus, EmployeeTeam } from "../types/employee";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { teamMemberFormSchema, TeamMemberFormValues } from "@/schemas/teamMemberSchema";

// Import the refactored components
import ProfileHeader from "@/components/team/ProfileHeader";
import ProfileFormContainer from "@/components/team/ProfileFormContainer";
import LoadingState from "@/components/team/LoadingState";

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
    return <LoadingState />;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <ProfileHeader 
        name={employee?.name || "Team Member Profile"} 
        handleBack={handleBack} 
      />

      {employee && (
        <ProfileFormContainer
          form={form}
          handleSubmit={handleSubmit}
          handleBack={handleBack}
          isCurrentUser={isCurrentUser}
          selectedTeams={selectedTeams}
          toggleTeam={toggleTeam}
          selectedCreators={selectedCreators}
          toggleCreator={toggleCreator}
          handleProfileImageChange={handleProfileImageChange}
          employeeName={employee.name}
        />
      )}
    </div>
  );
};

export default TeamMemberProfile;
