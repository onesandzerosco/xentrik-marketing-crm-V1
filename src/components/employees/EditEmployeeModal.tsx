
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
import { Employee, EmployeeRole, EmployeeStatus, EmployeeTeam } from "../../types/employee";
import ProfilePicture from "../profile/ProfilePicture";

interface EditEmployeeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  employee: Employee;
  onUpdateEmployee: (id: string, updates: Partial<Employee>) => void;
  currentUserId?: string;
}

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
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
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
              <div className="flex-shrink-0">
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

                <div>
                  <FormLabel className="block mb-2">Team Assignment</FormLabel>
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

                <div>
                  <FormLabel className="block mb-2">Assigned Creators</FormLabel>
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
            </div>
            
            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit" className="bg-brand-yellow text-black hover:bg-brand-highlight">Save Changes</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default EditEmployeeModal;
