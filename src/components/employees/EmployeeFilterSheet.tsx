
import React from "react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Filter, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { FilterRole, EmployeeRole } from "../../types/employee";

interface EmployeeFilterSheetProps {
  selectedRoles: FilterRole[];
  handleRoleFilter: (role: FilterRole) => void;
  handleClearFilters: () => void;
  searchQuery: string;
}

const EmployeeFilterSheet: React.FC<EmployeeFilterSheetProps> = ({
  selectedRoles,
  handleRoleFilter,
  handleClearFilters,
  searchQuery,
}) => {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline">
          <Filter className="h-4 w-4 mr-2" />
          Filter
        </Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Filter Team Members</SheetTitle>
          <SheetDescription>
            Filter team members by role and other attributes
          </SheetDescription>
        </SheetHeader>
        <div className="py-6 space-y-6">
          <div>
            <h3 className="text-lg font-medium mb-3">Role</h3>
            <div className="flex flex-wrap gap-2">
              {(["Admin", "Manager", "Employee"] as EmployeeRole[]).map((role) => (
                <Badge
                  key={role}
                  className={`cursor-pointer ${
                    selectedRoles.includes(role)
                      ? getRoleBadgeColor(role)
                      : "bg-secondary text-secondary-foreground"
                  }`}
                  onClick={() => handleRoleFilter(role)}
                >
                  {role}
                </Badge>
              ))}
            </div>
          </div>
          <div>
            <h3 className="text-lg font-medium mb-3">Status</h3>
            <div className="flex flex-wrap gap-2">
              <Badge
                className={`cursor-pointer ${
                  selectedRoles.includes("Active")
                    ? "bg-green-500 hover:bg-green-600 text-white"
                    : "bg-secondary text-secondary-foreground"
                }`}
                onClick={() => handleRoleFilter("Active")}
              >
                Active
              </Badge>
              <Badge
                className={`cursor-pointer ${
                  selectedRoles.includes("Inactive")
                    ? "bg-red-500 hover:bg-red-600 text-white"
                    : "bg-secondary text-secondary-foreground"
                }`}
                onClick={() => handleRoleFilter("Inactive")}
              >
                Inactive
              </Badge>
            </div>
          </div>
          {(selectedRoles.length > 0 || searchQuery) && (
            <Button
              variant="ghost"
              className="mt-4"
              onClick={handleClearFilters}
            >
              <X className="h-4 w-4 mr-2" />
              Clear all filters
            </Button>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};

// Helper function to get the right color for role badges
function getRoleBadgeColor(role: FilterRole): string {
  switch (role) {
    case "Admin":
      return "bg-red-500 hover:bg-red-600 text-white";
    case "Manager":
      return "bg-blue-500 hover:bg-blue-600 text-white";
    case "Employee":
      return "bg-gray-500 hover:bg-gray-600 text-white";
    case "Active":
      return "bg-green-500 hover:bg-green-600 text-white";
    case "Inactive":
      return "bg-red-500 hover:bg-red-600 text-white";
    default:
      return "bg-secondary text-secondary-foreground";
  }
}

export default EmployeeFilterSheet;
