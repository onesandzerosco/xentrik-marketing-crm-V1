
import React from "react";
import { Badge } from "@/components/ui/badge";
import { User, MessageSquare } from "lucide-react";
import { Employee } from "@/types/employee";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

// Mock creators data array for mapping IDs to names
const mockCreators = [
  { id: "c1", name: "Creator One" },
  { id: "c2", name: "Creator Two" },
  { id: "c3", name: "Creator Three" },
  { id: "c4", name: "Creator Four" },
  { id: "c5", name: "Creator Five" },
];

interface EmployeeCardInfoProps {
  employee: Employee;
}

const EmployeeCardInfo: React.FC<EmployeeCardInfoProps> = ({ employee }) => {
  return (
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
      
      {/* Telegram (always display) */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2 text-muted-foreground">
          <MessageSquare className="h-5 w-5" />
          <span className="text-sm">Telegram:</span>
        </div>
        <span className="text-sm">{employee.telegram ? `@${employee.telegram}` : "Not set"}</span>
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
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Badge variant="outline" className="cursor-help">
                  {employee.assignedCreators.length} {employee.assignedCreators.length === 1 ? 'Creator' : 'Creators'}
                </Badge>
              </TooltipTrigger>
              <TooltipContent>
                <ul className="list-disc pl-4 text-sm">
                  {employee.assignedCreators.map((creatorId, idx) => {
                    const creator = mockCreators.find(c => c.id === creatorId);
                    return <li key={idx}>{creator ? creator.name : 'Unknown Creator'}</li>;
                  })}
                </ul>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      )}
    </div>
  );
};

export default EmployeeCardInfo;
