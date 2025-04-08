
import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Employee, EmployeeRole, EmployeeStatus, EmployeeTeam } from "@/types/employee";
import { Input } from "@/components/ui/input";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowLeft, Save } from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage,
  FormDescription 
} from "@/components/ui/form";
import { Badge } from "@/components/ui/badge";
import ProfilePicture from "../components/profile/ProfilePicture";
import { mockEmployees } from "../data/mockEmployees";

// Mock data for creators that could be assigned to team members (same as in EditEmployeeModal)
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
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const isAdmin = user?.role === "Admin";
  const [selectedTeams, setSelectedTeams] = useState<EmployeeTeam[]>([]);
  const [selectedCreators, setSelectedCreators] = useState<string[]>([]);
  
  // Get employee data from mockEmployees using the ID from the URL
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [loading, setLoading] = useState(true);

  // Find the employee by ID when the component mounts
  useEffect(() => {
    if (id) {
      const foundEmployee = mockEmployees.find(emp => emp.id === id);
      if (foundEmployee) {
        setEmployee(foundEmployee);
        setSelectedTeams(foundEmployee.teams || []);
        setSelectedCreators(foundEmployee.assignedCreators || []);
      }
      setLoading(false);
    }
  }, [id]);

  const isCurrentUser = user?.id === id;

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      role: "Employee", 
      status: "Active",
      telegram: "",
      department: "",
      permissions: [],
      profileImage: "",
      teams: [],
      assignedCreators: []
    }
  });

  // Initialize form values once employee data is loaded
  useEffect(() => {
    if (employee) {
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
    }
  }, [employee, form]);

  if (loading) {
    return <div className="container mx-auto px-4 py-8">Loading...</div>;
  }

  if (!employee) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <h3 className="text-lg font-medium mb-2">Team member not found</h3>
          <p className="text-muted-foreground mb-4">The team member you're looking for doesn't exist</p>
          <Link to="/team">
            <Button>Return to Team</Button>
          </Link>
        </div>
      </div>
    );
  }

  const handleSubmit = (values: z.infer<typeof formSchema>) => {
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
    
    // Update employee data in mockEmployees (in a real app, this would be an API call)
    const updatedEmployees = mockEmployees.map(emp => 
      emp.id === employee.id ? { ...emp, ...values } : emp
    );
    
    // In a real application, you would update your data source here
    console.log("Updated employee:", { ...employee, ...values });
    
    toast({
      title: "Profile Updated",
      description: `${employee.name}'s profile has been successfully updated`
    });
    
    // Navigate back to the team page
    navigate("/team");
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
    <div className="container mx-auto px-4 py-8">
      <Link to="/team" className="inline-flex items-center text-muted-foreground hover:text-foreground mb-6">
        <Button variant="ghost" className="h-8 px-2 gap-1">
          <ArrowLeft className="h-4 w-4" />
          Back to Team
        </Button>
      </Link>

      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">{employee.name}'s Profile</h1>
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline">{employee.role}</Badge>
            <Badge variant="outline">{employee.status}</Badge>
            {employee.department && <Badge variant="outline">{employee.department}</Badge>}
          </div>
        </div>
        <Button 
          onClick={form.handleSubmit(handleSubmit)} 
          className="bg-brand-yellow text-black hover:bg-brand-highlight rounded-md px-6 py-2"
        >
          <Save className="h-4 w-4 mr-2" />
          Save Changes
        </Button>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-2 space-y-6">
              <div className="grid gap-6 p-6 border rounded-lg">
                <h2 className="text-xl font-semibold">Basic Information</h2>
                
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
                
                <div className="grid grid-cols-2 gap-4">
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
                
                <div className="grid grid-cols-2 gap-4">
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
              </div>

              <div className="grid gap-6 p-6 border rounded-lg">
                <h2 className="text-xl font-semibold">Team Assignment</h2>
                <div className="flex gap-2 mb-4">
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

              <div className="grid gap-6 p-6 border rounded-lg">
                <h2 className="text-xl font-semibold">Assigned Creators</h2>
                <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto p-2 border rounded-md">
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
            
            <div className="space-y-6">
              <div className="grid gap-6 p-6 border rounded-lg">
                <h2 className="text-xl font-semibold">Profile Image</h2>
                <div className="flex justify-center mb-4">
                  <ProfilePicture 
                    profileImage={form.watch("profileImage") || ""}
                    name={form.watch("name") || employee.name}
                    setProfileImage={handleProfileImageChange}
                  />
                </div>
              </div>
              
              <div className="grid gap-6 p-6 border rounded-lg">
                <h2 className="text-xl font-semibold">Account Information</h2>
                <div className="space-y-3">
                  <div>
                    <span className="text-sm text-muted-foreground">Created:</span>
                    <p>{new Date(employee.createdAt).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <span className="text-sm text-muted-foreground">Last Login:</span>
                    <p>{employee.lastLogin}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default TeamMemberProfile;
