
import React, { useEffect } from "react";
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
import { Switch } from "@/components/ui/switch";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
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
import { Employee } from "../../types/employee";
import ProfilePicture from "../profile/ProfilePicture";

interface EditEmployeeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  employee: Employee;
  onUpdateEmployee: (id: string, updates: Partial<Employee>) => void;
  currentUserId?: string;
}

const formSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  email: z.string().email({ message: "Please enter a valid email address." }),
  role: z.enum(["Admin", "Manager", "Employee"]),
  active: z.boolean(),
  profileImage: z.string().optional()
});

const EditEmployeeModal: React.FC<EditEmployeeModalProps> = ({ 
  open, 
  onOpenChange,
  employee,
  onUpdateEmployee,
  currentUserId
}) => {
  const isCurrentUser = currentUserId === employee.id;
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: employee.name,
      email: employee.email,
      role: employee.role,
      active: employee.active,
      profileImage: employee.profileImage || ""
    }
  });
  
  // Reset form when employee changes
  useEffect(() => {
    if (open) {
      form.reset({
        name: employee.name,
        email: employee.email,
        role: employee.role,
        active: employee.active,
        profileImage: employee.profileImage || ""
      });
    }
  }, [employee, open, form]);
  
  const handleSubmit = (values: z.infer<typeof formSchema>) => {
    // For current users who are admins, prevent changing their own role
    if (isCurrentUser && values.role !== employee.role) {
      // Reset role to original value
      values.role = employee.role;
    }
    
    onUpdateEmployee(employee.id, values);
    onOpenChange(false);
  };
  
  const handleProfileImageChange = (url: string) => {
    form.setValue("profileImage", url);
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Edit Team Member</DialogTitle>
          <DialogDescription>
            Update information for {employee.name}
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
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
                  name="active"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                      <div className="space-y-0.5">
                        <FormLabel>Active Status</FormLabel>
                        <FormDescription>
                          {field.value ? "User can currently log in" : "User cannot log in"}
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          disabled={isCurrentUser}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
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
              <Button type="submit">Save Changes</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default EditEmployeeModal;
