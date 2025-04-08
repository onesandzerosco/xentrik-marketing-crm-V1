
import React from "react";
import { Link } from "react-router-dom";
import { 
  Card,
  CardContent,
  CardFooter
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Edit, 
  User,
  UserX,
  PauseCircle,
  PlayCircle
} from "lucide-react";
import { Employee, EmployeeStatus } from "../../types/employee";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

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
  const handleTogglePause = () => {
    const newStatus: EmployeeStatus = employee.status === "Paused" ? "Active" : "Paused";
    onUpdate(employee.id, { status: newStatus });
  };
  
  const isCurrentUser = currentUserId === employee.id;
  const canChangeStatus = isAdmin && !isCurrentUser;

  // Get initials for avatar fallback
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase();
  };
  
  return (
    <Card className="overflow-hidden flex flex-col h-full rounded-lg border border-[#333333] bg-[#161618] hover:bg-[#1e1e20] shadow-md">
      <div className="p-6 flex-grow space-y-6">
        {/* Header with email and role */}
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="text-muted-foreground">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
                <rect width="20" height="16" x="2" y="4" rx="2" />
                <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
              </svg>
            </div>
            <span className="text-sm">{employee.email}</span>
          </div>
          <Badge 
            className={employee.role === "Admin" ? "bg-red-500" : 
              employee.role === "Manager" ? "bg-blue-500" : "bg-gray-500"}
          >
            {employee.role}
          </Badge>
        </div>

        {/* Profile Image and Name */}
        <div className="flex flex-col items-center space-y-3">
          <Avatar className="h-24 w-24">
            <AvatarImage src={employee.profileImage} alt={employee.name} />
            <AvatarFallback className="text-lg">{getInitials(employee.name)}</AvatarFallback>
          </Avatar>
          <h3 className="font-medium text-xl">{employee.name}</h3>
        </div>
        
        {/* Info sections */}
        <div className="space-y-3">
          {/* Last Login */}
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2 text-muted-foreground">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
              <span className="text-sm">Last login:</span>
            </div>
            <span className="text-sm">{employee.lastLogin}</span>
          </div>
          
          {/* Status */}
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2 text-muted-foreground">
              <User className="h-5 w-5" />
              <span className="text-sm">Status:</span>
            </div>
            <Badge 
              className={employee.status === "Active" ? "bg-green-500" : 
                employee.status === "Inactive" ? "bg-red-500" : "bg-amber-500"}
            >
              {employee.status}
            </Badge>
          </div>
          
          {/* Department (if available) */}
          {employee.department && (
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2 text-muted-foreground">
                <User className="h-5 w-5" />
                <span className="text-sm">Department:</span>
              </div>
              <span className="text-sm">{employee.department}</span>
            </div>
          )}
          
          {/* Teams (if available) */}
          {employee.teams && employee.teams.length > 0 && (
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2 text-muted-foreground">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                  <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
                <span className="text-sm">Teams:</span>
              </div>
              <div className="flex gap-1 flex-wrap justify-end">
                {employee.teams.map(team => (
                  <Badge 
                    key={team} 
                    className={team === "A" ? "bg-purple-500" : 
                      team === "B" ? "bg-indigo-500" : "bg-teal-500"}
                  >
                    Team {team}
                  </Badge>
                ))}
              </div>
            </div>
          )}
          
          {/* Assigned Creators (if available) */}
          {employee.assignedCreators && employee.assignedCreators.length > 0 && (
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2 text-muted-foreground">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
                  <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                  <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
                <span className="text-sm">Assigned:</span>
              </div>
              <Badge variant="outline" className="cursor-help">
                {employee.assignedCreators.length} {employee.assignedCreators.length === 1 ? 'Creator' : 'Creators'}
              </Badge>
            </div>
          )}
        </div>
      </div>
      
      <CardFooter className="mt-auto border-t border-[#333333] p-0">
        <div className="grid grid-cols-1 w-full">
          <Link to={`/team/${employee.id}`} state={{ returnToTeam: true }} className="w-full">
            <Button 
              variant="ghost" 
              className="rounded-none h-14 flex items-center justify-center text-sm hover:bg-[#222] w-full"
            >
              <Edit className="h-5 w-5 mr-2" />
              Edit
            </Button>
          </Link>
          
          {canChangeStatus && (
            <div className="grid grid-cols-2 w-full">
              {onDeactivateClick && (
                <Button 
                  variant="ghost" 
                  className="rounded-none h-14 flex items-center justify-center text-sm hover:bg-[#222] border-t border-[#333333] text-red-400 hover:text-red-300"
                  onClick={() => onDeactivateClick(employee)}
                >
                  <UserX className="h-5 w-5 mr-2" />
                  Deactivate
                </Button>
              )}
              
              <Button 
                variant="ghost" 
                className="rounded-none h-14 flex items-center justify-center text-sm hover:bg-[#222] border-t border-l border-[#333333]"
                onClick={handleTogglePause}
              >
                {employee.status === "Paused" ? (
                  <>
                    <PlayCircle className="h-5 w-5 mr-2" />
                    Resume
                  </>
                ) : (
                  <>
                    <PauseCircle className="h-5 w-5 mr-2" />
                    Pause
                  </>
                )}
              </Button>
            </div>
          )}
        </div>
      </CardFooter>
    </Card>
  );
};

export default EmployeeCard;
