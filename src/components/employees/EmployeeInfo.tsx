
import React from 'react';
import { Badge } from "@/components/ui/badge";
import { Clock, User, Users, MessageSquare } from "lucide-react";
import { Employee } from "@/types/employee";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { getCreatorNames } from "@/utils/employeeUtils";

interface EmployeeInfoProps {
  employee: Employee;
}

const EmployeeInfo: React.FC<EmployeeInfoProps> = ({ employee }) => {
  return (
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
      
      {/* Telegram (always display) */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2 text-muted-foreground">
          <MessageSquare className="h-4 w-4" />
          <span className="text-sm">Telegram:</span>
        </div>
        <span className="text-sm">{employee.telegram ? `@${employee.telegram}` : "Not set"}</span>
      </div>
      
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
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Badge variant="outline" className="cursor-help">
                  {employee.assignedCreators.length} {employee.assignedCreators.length === 1 ? 'Creator' : 'Creators'}
                </Badge>
              </TooltipTrigger>
              <TooltipContent>
                <ul className="list-disc pl-4 text-sm">
                  {getCreatorNames(employee.assignedCreators).map((name, idx) => (
                    <li key={idx}>{name}</li>
                  ))}
                </ul>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      )}
    </div>
  );
};

export default EmployeeInfo;
