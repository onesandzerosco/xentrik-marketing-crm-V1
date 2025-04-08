
import React, { useState } from "react";
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
  
  const handleTogglePause = () => {
    const newStatus: EmployeeStatus = employee.status === "Paused" ? "Active" : "Paused";
    onUpdate(employee.id, { status: newStatus });
  };
  
  const isCurrentUser = currentUserId === employee.id;
  const canEditRole = isAdmin && !isCurrentUser;
  const canChangeStatus = isAdmin && !isCurrentUser;
  
  return (
    <Card className="overflow-hidden flex flex-col h-full rounded-lg border border-[#333333] bg-[#161618] hover:bg-[#1e1e20] shadow-md">
      <div className="p-4 flex-grow">
        {/* Role Badge - Top Right */}
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2">
            <Mail className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">{employee.email}</span>
          </div>
          <Badge 
            className={employee.role === "Admin" ? "bg-red-500" : 
              employee.role === "Manager" ? "bg-blue-500" : "bg-gray-500"}
          >
            {employee.role}
          </Badge>
        </div>
        
        {/* Employee Information */}
        <div className="space-y-3 mb-4">
          {/* Last Login */}
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span className="text-sm">Last login:</span>
            </div>
            <span className="text-sm">{employee.lastLogin}</span>
          </div>
          
          {/* Status and Team */}
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2 text-muted-foreground">
              <User className="h-4 w-4" />
              <span className="text-sm">Status:</span>
            </div>
            <div className="flex gap-1 flex-wrap justify-end">
              <Badge 
                className={employee.status === "Active" ? "bg-green-500" : 
                  employee.status === "Inactive" ? "bg-red-500" : "bg-amber-500"}
              >
                {employee.status}
              </Badge>
              
              {employee.teams && employee.teams.map(team => (
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
          
          {/* Telegram (if available) */}
          {employee.telegram && (
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2 text-muted-foreground">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                  <path d="M21.73 2.27a2 2 0 0 0-2.83 0L4.06 17.1a2 2 0 0 0 0 2.83a2 2 0 0 0 2.83 0L21.73 5.1a2 2 0 0 0 0-2.83Z" />
                  <path d="m4.1 17.1 15.8-15.8" />
                  <path d="M8 15H2v5a2 2 0 0 0 2 2h5v-6" />
                  <path d="M17 9h6V4a2 2 0 0 0-2-2h-5v6" />
                </svg>
                <span className="text-sm">Telegram:</span>
              </div>
              <span className="text-sm">@{employee.telegram}</span>
            </div>
          )}
          
          {/* Department (if available) */}
          {employee.department && (
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2 text-muted-foreground">
                <User className="h-4 w-4" />
                <span className="text-sm">Department:</span>
              </div>
              <span className="text-sm">{employee.department}</span>
            </div>
          )}
          
          {/* Assigned Creators (if available) */}
          {employee.assignedCreators && employee.assignedCreators.length > 0 && (
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Users className="h-4 w-4" />
                <span className="text-sm">Assigned Creators:</span>
              </div>
              <Badge variant="outline">
                {employee.assignedCreators.length}
              </Badge>
            </div>
          )}
        </div>
      </div>
      
      {/* Action Buttons - Always at the bottom */}
      <CardFooter className="mt-auto border-t border-[#333333] p-0">
        <div className="grid grid-cols-1 w-full">
          <Button 
            variant="ghost" 
            className="rounded-none h-12 flex items-center justify-center text-sm hover:bg-[#222]"
            onClick={() => setEditModalOpen(true)}
          >
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Button>
          
          {canChangeStatus && (
            <div className="grid grid-cols-2 w-full">
              {onDeactivateClick && (
                <Button 
                  variant="ghost" 
                  className="rounded-none h-12 flex items-center justify-center text-sm hover:bg-[#222] border-t border-[#333333] text-red-400 hover:text-red-300"
                  onClick={() => onDeactivateClick(employee)}
                >
                  <UserX className="h-4 w-4 mr-2" />
                  Deactivate
                </Button>
              )}
              
              <Button 
                variant="ghost" 
                className="rounded-none h-12 flex items-center justify-center text-sm hover:bg-[#222] border-t border-l border-[#333333]"
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
            </div>
          )}
        </div>
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
