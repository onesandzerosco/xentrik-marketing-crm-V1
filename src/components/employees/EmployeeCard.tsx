
import React, { useState } from "react";
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
  Clock, 
  UserX,
  PauseCircle,
  PlayCircle,
  Mail,
  Users
} from "lucide-react";
import { Employee, EmployeeStatus } from "../../types/employee";
import EmployeeHeader from "./EmployeeHeader";
import EmployeeInfo from "./EmployeeInfo";

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
  
  return (
    <Card className="overflow-hidden flex flex-col h-full rounded-lg border border-[#333333] bg-[#161618] hover:bg-[#1e1e20] shadow-md">
      <div className="p-4 flex-grow">
        <EmployeeHeader employee={employee} />
        <EmployeeInfo employee={employee} />
      </div>
      
      <CardFooter className="mt-auto border-t border-[#333333] p-0">
        <div className="grid grid-cols-1 w-full">
          <Link to={`/team/${employee.id}`} state={{ returnToTeam: true }} className="w-full">
            <Button 
              variant="ghost" 
              className="rounded-none h-12 flex items-center justify-center text-sm hover:bg-[#222] w-full"
            >
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
          </Link>
          
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
    </Card>
  );
};

export default EmployeeCard;
