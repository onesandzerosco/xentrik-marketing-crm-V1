
import React from "react";
import { Input } from "@/components/ui/input";
import { Search, ArrowDownUp } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";

interface EmployeeSearchAndSortProps {
  searchQuery: string;
  setSearchQuery: React.Dispatch<React.SetStateAction<string>>;
  sortOption: string;
  setSortOption: React.Dispatch<React.SetStateAction<string>>;
}

const EmployeeSearchAndSort: React.FC<EmployeeSearchAndSortProps> = ({
  searchQuery,
  setSearchQuery,
  sortOption,
  setSortOption,
}) => {
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleSortChange = (value: string) => {
    setSortOption(value);
  };

  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-6">
      <div className="relative w-full sm:w-auto">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search team members..."
          className="pl-9 w-full sm:w-[350px] bg-background border-[#333] text-foreground"
          value={searchQuery}
          onChange={handleSearchChange}
        />
      </div>
      
      <div className="flex gap-2 w-full sm:w-auto">
        <Select value={sortOption} onValueChange={handleSortChange}>
          <SelectTrigger className="w-[180px] border-[#333]">
            <div className="flex items-center">
              <ArrowDownUp className="h-4 w-4 mr-2" />
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
    </div>
  );
};

export default EmployeeSearchAndSort;
