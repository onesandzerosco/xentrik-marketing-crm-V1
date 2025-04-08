
import React from "react";
import { Input } from "@/components/ui/input";
import { Search, SortAsc } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface EmployeeSearchAndSortProps {
  searchQuery: string;
  handleSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  sortOption: string;
  handleSortChange: (value: string) => void;
}

const EmployeeSearchAndSort: React.FC<EmployeeSearchAndSortProps> = ({
  searchQuery,
  handleSearchChange,
  sortOption,
  handleSortChange,
}) => {
  return (
    <div className="flex gap-3">
      <div className="relative">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search team members..."
          className="pl-9 w-[200px] md:w-[260px]"
          value={searchQuery}
          onChange={handleSearchChange}
        />
      </div>
      
      <Select value={sortOption} onValueChange={handleSortChange}>
        <SelectTrigger className="w-[180px]">
          <div className="flex items-center">
            <SortAsc className="h-4 w-4 mr-2" />
            <span>Sort by</span>
          </div>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="nameAsc">Name A–Z</SelectItem>
          <SelectItem value="nameDesc">Name Z–A</SelectItem>
          <SelectItem value="recentActivity">Recent Activity</SelectItem>
          <SelectItem value="role">Role</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};

export default EmployeeSearchAndSort;
