
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
  PauseCircle,
  PlayCircle,
  MessageCircle,
  Mail
} from "lucide-react";
import { Employee, EmployeeStatus } from "../../types/employee";
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
  
  const getStatusBadgeColor = (status: EmployeeStatus) => {
    switch (status) {
      case "Active":
        return "bg-green-500 text-white";
      case "Inactive":
        return "bg-red-500 text-white";
      case "Paused":
        return "bg-amber-500 text-white";
      default:
        return "bg-secondary";
    }
  };
  
  const handleToggleStatus = () => {
    let newStatus: EmployeeStatus = "Active";
    
    if (employee.status === "Active") {
      newStatus = "Inactive";
    } else if (employee.status === "Inactive") {
      newStatus = "Active";
    } else if (employee.status === "Paused") {
      newStatus = "Active";
    }
    
    onUpdate(employee.id, { status: newStatus });
  };
  
  const handleTogglePause = () => {
    const newStatus: EmployeeStatus = employee.status === "Paused" ? "Active" : "Paused";
    onUpdate(employee.id, { status: newStatus });
  };
  
  // Determine if this card represents the current user
  const isCurrentUser = currentUserId === employee.id;
  
  // Disable certain actions if this is the current user and they're an admin
  const canEditRole = isAdmin && !isCurrentUser;
  const canChangeStatus = isAdmin && !isCurrentUser;
  
  return (
    <Card className="overflow-hidden border-none shadow-md">
      <CardHeader className="pb-2 bg-gray-50 dark:bg-gray-900">
        <div className="flex justify-between items-start">
          <div className="flex items-center">
            <Avatar className="h-12 w-12 mr-3 border-2 border-white shadow-sm">
              {employee.profileImage ? (
                <AvatarImage src={employee.profileImage} alt={employee.name} />
              ) : (
                <AvatarFallback className="bg-brand-yellow text-black">
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
              <div className="flex items-center text-sm text-muted-foreground">
                <Mail className="h-3 w-3 mr-1" />
                {employee.email}
              </div>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="py-4">
        <div className="flex flex-col gap-3">
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
            <Badge className={getStatusBadgeColor(employee.status)}>
              {employee.status}
            </Badge>
          </div>
          {employee.telegram && (
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <MessageCircle className="h-4 w-4" />
                <span>Telegram:</span>
              </div>
              <span>@{employee.telegram}</span>
            </div>
          )}
          {employee.department && (
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <User className="h-4 w-4" />
                <span>Department:</span>
              </div>
              <span>{employee.department}</span>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex gap-2 pt-2 bg-gray-50 dark:bg-gray-900">
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
        
        {canChangeStatus && (
          <Button 
            variant={employee.status === "Inactive" ? "outline" : "destructive"} 
            size="sm" 
            className="flex-1"
            onClick={handleToggleStatus}
          >
            <UserX className="h-4 w-4 mr-2" />
            {employee.status === "Inactive" ? "Activate" : "Deactivate"}
          </Button>
        )}
        
        {canChangeStatus && (
          <Button 
            variant="outline" 
            size="sm" 
            className="flex-1"
            onClick={handleTogglePause}
          >
            {employee.status === "Paused" ? (
              <>
                <PlayCircle className="h-4 w-4 mr-2" />
                Resume
              </>
            ) : (
              <>
                <PauseCircle className="h-4 w-4 mr-2" />
                Pause
              </>
            )}
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
