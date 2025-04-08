
import React, { useState, useEffect } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Save } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Employee, EmployeeRole, EmployeeStatus, EmployeeTeam } from "../types/employee";
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage,
  FormDescription 
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import ProfilePicture from "../components/profile/ProfilePicture";

// Storage key for employees data
const EMPLOYEES_STORAGE_KEY = 'team_employees_data';

// Mock data for creators that could be assigned to team members
const mockCreators = [
  { id: "c1", name: "Creator One" },
  { id: "c2", name: "Creator Two" },
  { id: "c3", name: "Creator Three" },
  { id: "c4", name: "Creator Four" },
  { id: "c5", name: "Creator Five" },
];

const formSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  email: z.string().email({ message: "Please enter a valid email address." }),
  role: z.enum(["Admin", "Manager", "Employee"]),
  status: z.enum(["Active", "Inactive", "Paused"]),
  telegram: z.string().optional(),
  department: z.string().optional(),
  permissions: z.array(z.string()).optional(),
  profileImage: z.string().optional(),
  teams: z.array(z.enum(["A", "B", "C"])).optional(),
  assignedCreators: z.array(z.string()).optional()
});

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
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
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
  const handleSubmit = (values: z.infer<typeof formSchema>) => {
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
                <div className="flex-shrink-0 flex flex-col items-center">
                  <ProfilePicture 
                    profileImage={form.watch("profileImage") || ""}
                    name={form.watch("name") || employee.name}
                    setProfileImage={handleProfileImageChange}
                  />
                </div>
                
                <div className="flex-1 space-y-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Name</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email Address</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="role"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Role</FormLabel>
                          {isCurrentUser && (
                            <FormDescription>
                              You cannot change your own role.
                            </FormDescription>
                          )}
                          <Select 
                            onValueChange={field.onChange} 
                            defaultValue={field.value}
                            disabled={isCurrentUser}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select a role" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="Admin">Admin</SelectItem>
                              <SelectItem value="Manager">Manager</SelectItem>
                              <SelectItem value="Employee">Employee</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="status"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Status</FormLabel>
                          {isCurrentUser && (
                            <FormDescription>
                              You cannot change your own status.
                            </FormDescription>
                          )}
                          <Select 
                            onValueChange={field.onChange} 
                            defaultValue={field.value}
                            disabled={isCurrentUser}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select a status" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="Active">Active</SelectItem>
                              <SelectItem value="Paused">Paused</SelectItem>
                              <SelectItem value="Inactive">Inactive</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="telegram"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Telegram Username</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="username (without @)" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="department"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Department</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="Department" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div>
                    <FormLabel className="block mb-2">Team Assignment</FormLabel>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {["A", "B", "C"].map((team) => (
                        <Button
                          key={team}
                          type="button"
                          variant={selectedTeams.includes(team as EmployeeTeam) ? "default" : "outline"}
                          onClick={() => toggleTeam(team as EmployeeTeam)}
                          className="flex-1"
                        >
                          Team {team}
                        </Button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <FormLabel className="block mb-2">Assigned Creators</FormLabel>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto p-2 border rounded-md">
                      {mockCreators.map((creator) => (
                        <div key={creator.id} className="flex items-center space-x-2">
                          <Checkbox 
                            id={`creator-${creator.id}`}
                            checked={selectedCreators.includes(creator.id)}
                            onCheckedChange={() => toggleCreator(creator.id)}
                          />
                          <label
                            htmlFor={`creator-${creator.id}`}
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                          >
                            {creator.name}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end space-x-4 mt-6">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={handleBack}
                >
                  Cancel
                </Button>
                <Button type="submit" className="bg-brand-yellow text-black hover:bg-brand-highlight">
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </Button>
              </div>
            </form>
          </Form>
        </div>
      )}
    </div>
  );
};

export default TeamMemberProfile;
