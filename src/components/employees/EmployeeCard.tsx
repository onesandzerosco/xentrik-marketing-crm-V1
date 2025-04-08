
import React, { useState } from "react";
import { 
  Card, 
  CardContent, 
  CardFooter, 
  CardHeader
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { 
  Edit, 
  User, 
  Clock, 
  UserX,
  Cog,
} from "lucide-react";
import { Employee } from "../../types/employee";
import EditEmployeeModal from "./EditEmployeeModal";

interface EmployeeCardProps {
  employee: Employee;
  onUpdate: (id: string, updates: Partial<Employee>) => void;
  isAdmin: boolean;
  currentUserId?: string;
}

const EmployeeCard: React.FC<EmployeeCardProps> = ({ 
  employee, 
  onUpdate,
  isAdmin,
  currentUserId
}) => {
  const [editModalOpen, setEditModalOpen] = useState(false);
  
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part.charAt(0))
      .join('')
      .toUpperCase();
  };
  
  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "Admin":
        return "bg-red-500 text-white";
      case "Manager":
        return "bg-blue-500 text-white";
      case "Employee":
        return "bg-gray-500 text-white";
      default:
        return "bg-secondary";
    }
  };
  
  const getStatusBadgeColor = (status: boolean) => {
    return status 
      ? "bg-green-500 text-white" 
      : "bg-red-500 text-white";
  };
  
  const handleToggleStatus = () => {
    onUpdate(employee.id, { active: !employee.active });
  };
  
  // Determine if this card represents the current user
  const isCurrentUser = currentUserId === employee.id;
  
  // Disable certain actions if this is the current user and they're an admin
  const canEditRole = isAdmin && !isCurrentUser;
  const canDeactivate = isAdmin && !isCurrentUser;
  
  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div className="flex items-center">
            <Avatar className="h-12 w-12 mr-3">
              {employee.profileImage ? (
                <AvatarImage src={employee.profileImage} alt={employee.name} />
              ) : (
                <AvatarFallback>
                  {getInitials(employee.name)}
                </AvatarFallback>
              )}
            </Avatar>
            <div>
              <h3 className="font-medium text-lg flex items-center">
                {employee.name}
                <Badge 
                  className={`ml-2 text-xs ${getRoleBadgeColor(employee.role)}`}
                >
                  {employee.role}
                </Badge>
              </h3>
              <p className="text-sm text-muted-foreground">{employee.email}</p>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pb-2">
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>Last login:</span>
            </div>
            <span>{employee.lastLogin || "Never"}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <User className="h-4 w-4" />
              <span>Status:</span>
            </div>
            <Badge className={getStatusBadgeColor(employee.active)}>
              {employee.active ? "Active" : "Inactive"}
            </Badge>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex gap-2 pt-4">
        {isAdmin && (
          <Button 
            variant="outline" 
            size="sm" 
            className="flex-1"
            onClick={() => setEditModalOpen(true)}
          >
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Button>
        )}
        
        {canDeactivate && (
          <Button 
            variant={employee.active ? "destructive" : "outline"} 
            size="sm" 
            className="flex-1"
            onClick={handleToggleStatus}
          >
            <UserX className="h-4 w-4 mr-2" />
            {employee.active ? "Deactivate" : "Activate"}
          </Button>
        )}
      </CardFooter>
      
      <EditEmployeeModal
        open={editModalOpen}
        onOpenChange={setEditModalOpen}
        employee={employee}
        onUpdateEmployee={onUpdate}
        currentUserId={currentUserId}
      />
    </Card>
  );
};

export default EmployeeCard;
