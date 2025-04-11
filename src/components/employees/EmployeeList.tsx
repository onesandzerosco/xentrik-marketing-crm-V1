
import React from "react";
import { Employee } from "../../types/employee";
import EmployeeCard from "./EmployeeCard";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface EmployeeListProps {
  employees: Employee[];
  onUpdate: (id: string, updates: Partial<Employee>) => void;
  isAdmin: boolean;
  currentUserId?: string;
  onAddEmployeeClick: () => void;
  onDeactivateClick?: (employee: Employee) => void;
}

const EmployeeList: React.FC<EmployeeListProps> = ({
  employees,
  onUpdate,
  isAdmin,
  currentUserId,
  onAddEmployeeClick,
  onDeactivateClick,
}) => {
  if (employees.length === 0) {
    return (
      <div className="text-center py-12 bg-background">
        <h3 className="text-lg font-medium mb-2">No team members found</h3>
        <p className="text-muted-foreground mb-4">Try changing your filters or add a new team member</p>
        {isAdmin && (
          <Button 
            onClick={onAddEmployeeClick}
            className="bg-brand-yellow text-black hover:bg-brand-highlight rounded-md px-6 py-2"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Team Member
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
      {employees.map((employee) => (
        <EmployeeCard 
          key={employee.id} 
          employee={employee} 
          onUpdate={onUpdate}
          isAdmin={isAdmin}
          currentUserId={currentUserId}
          onDeactivateClick={onDeactivateClick}
        />
      ))}
    </div>
  );
};

export default EmployeeList;
