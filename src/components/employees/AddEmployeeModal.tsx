import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Employee, EmployeeStatus, EmployeeTeam, PrimaryRole } from "@/types/employee";

interface AddEmployeeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddEmployee: (employee: Omit<Employee, "id">) => void;
}

const AddEmployeeModal: React.FC<AddEmployeeModalProps> = ({
  open,
  onOpenChange,
  onAddEmployee,
}) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<PrimaryRole>("Employee");
  const [isActive, setIsActive] = useState(true);
  const [telegram, setTelegram] = useState("");
  const [department, setDepartment] = useState("");
  const [selectedTeams, setSelectedTeams] = useState<EmployeeTeam[]>([]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!name.trim() || !email.trim() || !role) {
      return;
    }
    
    // Create employee object with required fields
    const newEmployee: Omit<Employee, "id"> = {
      name: name.trim(),
      email: email.trim(),
      role,
      status: isActive ? "Active" : "Inactive",
      telegram: telegram.trim() || undefined,
      department: department.trim() || undefined,
      teams: selectedTeams.length > 0 ? selectedTeams : undefined,
      lastLogin: "Never",
      createdAt: new Date().toISOString()
    };
    
    onAddEmployee(newEmployee);
    resetForm();
    onOpenChange(false);
  };
  
  const resetForm = () => {
    setName("");
    setEmail("");
    setRole("Employee");
    setIsActive(true);
    setTelegram("");
    setDepartment("");
    setSelectedTeams([]);
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Add Team Member</DialogTitle>
            <DialogDescription>
              Add a new team member to your organization.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="John Doe"
                required
                className="w-full"
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="john.doe@example.com"
                type="email"
                required
                className="w-full"
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="role">Role</Label>
              <Select 
                value={role} 
                onValueChange={(value: PrimaryRole) => setRole(value)}
              >
                <SelectTrigger id="role">
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Admin">Admin</SelectItem>
                  <SelectItem value="Manager">Manager</SelectItem>
                  <SelectItem value="Employee">Employee</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="telegram">Telegram Username</Label>
              <Input
                id="telegram"
                value={telegram}
                onChange={(e) => setTelegram(e.target.value)}
                placeholder="username (without @)"
                className="w-full"
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="department">Department</Label>
              <Input
                id="department"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                placeholder="e.g. Marketing, Sales, etc."
                className="w-full"
              />
            </div>
            
            <div className="grid gap-2">
              <Label className="mb-2">Team Assignment</Label>
              <div className="flex gap-2">
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
            
            <div className="flex items-center justify-between">
              <Label htmlFor="status">Active Status</Label>
              <Switch 
                id="status"
                checked={isActive}
                onCheckedChange={setIsActive}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => {
                resetForm();
                onOpenChange(false);
              }}
            >
              Cancel
            </Button>
            <Button 
              type="submit"
              variant="premium"
              className="shadow-premium-yellow"
            >
              Add Team Member
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddEmployeeModal;
