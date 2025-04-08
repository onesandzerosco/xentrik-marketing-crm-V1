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
  Mail,
  Users
} from "lucide-react";
import { Employee, EmployeeStatus } from "../../types/employee";
import EditEmployeeModal from "./EditEmployeeModal";

interface EmployeeCardProps {
  employee: Employee;
  onUpdate: (id: string, updates: Partial<Employee>) => void;
  isAdmin: boolean;
  currentUserId?: string;
  onDeactivateClick?: (employee: Employee) => void;
}

const EmployeeCard: React.FC<EmployeeCardProps> = ({ 
  employee, 
  onUpdate,
  isAdmin,
  currentUserId,
  onDeactivateClick
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
  
  const getTeamBadgeColor = (team: string) => {
    switch (team) {
      case "A":
        return "bg-purple-500 text-white";
      case "B":
        return "bg-indigo-500 text-white";
      case "C":
        return "bg-teal-500 text-white";
      default:
        return "bg-gray-500 text-white";
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
  
  const isCurrentUser = currentUserId === employee.id;
  
  const canEditRole = isAdmin && !isCurrentUser;
  const canChangeStatus = isAdmin && !isCurrentUser;
  
  return (
    <Card className="overflow-hidden border-none shadow-md flex flex-col h-full">
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
              <h3 className="font-medium text-lg">{employee.name}</h3>
              <div className="flex items-center text-sm text-muted-foreground">
                <Mail className="h-3 w-3 mr-1" />
                {employee.email}
              </div>
            </div>
          </div>
          <Badge className={`${getRoleBadgeColor(employee.role)}`}>
            {employee.role}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="py-4 flex-grow">
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>Last login:</span>
            </div>
            <span>{employee.lastLogin || "Never"}</span>
          </div>
          
          <div className="flex flex-wrap items-center gap-2 text-sm">
            <div className="flex items-center mr-1 text-muted-foreground">
              <User className="h-4 w-4 mr-1" />
              <span>Status:</span>
            </div>
            <div className="flex flex-wrap gap-1">
              <Badge className={getStatusBadgeColor(employee.status)}>
                {employee.status}
              </Badge>
              
              {employee.teams && employee.teams.length > 0 && (
                employee.teams.map(team => (
                  <Badge key={team} className={getTeamBadgeColor(team)}>
                    Team {team}
                  </Badge>
                ))
              )}
            </div>
          </div>
          
          {employee.telegram && (
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                  <path d="M21.73 2.27a2 2 0 0 0-2.83 0L4.06 17.1a2 2 0 0 0 0 2.83a2 2 0 0 0 2.83 0L21.73 5.1a2 2 0 0 0 0-2.83Z" />
                  <path d="m4.1 17.1 15.8-15.8" />
                  <path d="M8 15H2v5a2 2 0 0 0 2 2h5v-6" />
                  <path d="M17 9h6V4a2 2 0 0 0-2-2h-5v6" />
                </svg>
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
          
          {employee.assignedCreators && employee.assignedCreators.length > 0 && (
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <Users className="h-4 w-4" />
                <span>Assigned Creators:</span>
              </div>
              <Badge variant="outline">
                {employee.assignedCreators.length}
              </Badge>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex gap-2 pt-2 bg-gray-50 dark:bg-gray-900 mt-auto">
        <Button 
          variant="outline" 
          size="sm" 
          className="flex-1"
          onClick={() => setEditModalOpen(true)}
        >
          <Edit className="h-4 w-4 mr-2" />
          Edit
        </Button>
        
        {canChangeStatus && onDeactivateClick && (
          <Button 
            variant="destructive" 
            size="sm" 
            className="flex-1"
            onClick={() => onDeactivateClick(employee)}
          >
            <UserX className="h-4 w-4 mr-2" />
            Deactivate
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
