import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Users, Filter, SlidersHorizontal, AlertCircle, Menu, X } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuCheckboxItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

interface CreatorsHeaderProps {
  isLoading: boolean;
  creatorCount: number;
  selectedGenders: string[];
  selectedTeams: string[];
  selectedClasses: string[];
  setSelectedGenders: React.Dispatch<React.SetStateAction<string[]>>;
  setSelectedTeams: React.Dispatch<React.SetStateAction<string[]>>;
  setSelectedClasses: React.Dispatch<React.SetStateAction<string[]>>;
  handleClearFilters: () => void;
  searchQuery: string;
  setSearchQuery: React.Dispatch<React.SetStateAction<string>>;
}

const genderTags = ["Male", "Female", "Trans"];
const teamTags = ["A Team", "B Team", "C Team"];
const classTags = ["Real", "AI"];

const CreatorsHeader: React.FC<CreatorsHeaderProps> = ({
  isLoading,
  creatorCount,
  selectedGenders,
  selectedTeams,
  selectedClasses,
  setSelectedGenders,
  setSelectedTeams,
  setSelectedClasses,
  handleClearFilters,
  searchQuery,
  setSearchQuery
}) => {
  const isMobile = useIsMobile();
  const [isFilterMenuOpen, setIsFilterMenuOpen] = useState(false);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const toggleGender = (g: string) => {
    setSelectedGenders(selectedGenders.includes(g) ? selectedGenders.filter(x => x !== g) : [...selectedGenders, g]);
  };

  const toggleTeam = (t: string) => {
    setSelectedTeams(selectedTeams.includes(t) ? selectedTeams.filter(x => x !== t) : [...selectedTeams, t]);
  };

  const toggleClass = (c: string) => {
    setSelectedClasses(selectedClasses.includes(c) ? selectedClasses.filter(x => x !== c) : [...selectedClasses, c]);
  };

  const FilterButtons = () => (
    <div className="space-y-4">
      {/* Gender Filter */}
      <div>
        <h3 className="text-sm font-medium text-white mb-2">Gender</h3>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="outline" 
              className="w-full justify-between border-white/20 text-white"
            >
              Gender
              {selectedGenders.length > 0 && 
                <span className="ml-1 bg-white/10 text-xs px-2 py-0.5 rounded-full text-white">
                  {selectedGenders.length}
                </span>
              }
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="z-50 w-44 bg-background border-white/20">
            <DropdownMenuLabel className="text-white">Filter by gender</DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-white/20" />
            {genderTags.map(g => (
              <DropdownMenuCheckboxItem 
                key={g} 
                checked={selectedGenders.includes(g)} 
                onCheckedChange={() => toggleGender(g)} 
                className="text-white"
              >
                {g}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Team Filter */}
      <div>
        <h3 className="text-sm font-medium text-white mb-2">Team</h3>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="outline" 
              className="w-full justify-between border-white/20 text-white"
            >
              Teams
              {selectedTeams.length > 0 && 
                <span className="ml-1 bg-white/10 text-xs px-2 py-0.5 rounded-full text-white">
                  {selectedTeams.length}
                </span>
              }
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="z-50 w-44 bg-background border-white/20">
            <DropdownMenuLabel className="text-white">Filter by team</DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-white/20" />
            {teamTags.map(t => (
              <DropdownMenuCheckboxItem 
                key={t} 
                checked={selectedTeams.includes(t)} 
                onCheckedChange={() => toggleTeam(t)} 
                className="text-white"
              >
                {t}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Class Filter */}
      <div>
        <h3 className="text-sm font-medium text-white mb-2">Class</h3>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="outline" 
              className="w-full justify-between border-white/20 text-white"
            >
              Class
              {selectedClasses.length > 0 && 
                <span className="ml-1 bg-white/10 text-xs px-2 py-0.5 rounded-full text-white">
                  {selectedClasses.length}
                </span>
              }
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="z-50 w-44 bg-background border-white/20">
            <DropdownMenuLabel className="text-white">Filter by class</DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-white/20" />
            {classTags.map(c => (
              <DropdownMenuCheckboxItem 
                key={c} 
                checked={selectedClasses.includes(c)} 
                onCheckedChange={() => toggleClass(c)} 
                className="text-white"
              >
                {c}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Clear button */}
      {(selectedGenders.length > 0 || selectedTeams.length > 0 || selectedClasses.length > 0) && (
        <Button 
          variant="ghost" 
          className="w-full text-white hover:text-white/80" 
          onClick={() => {
            handleClearFilters();
            if (isMobile) setIsFilterMenuOpen(false);
          }}
        >
          <Filter className="h-4 w-4 mr-2 text-white" />
          Clear Filters
        </Button>
      )}
    </div>
  );

  if (isMobile) {
    return (
      <div className="mb-6 space-y-4">
        {/* Header with Creator Count */}
        <div className="text-center">
          <h1 className="text-xl font-bold flex items-center justify-center text-white">
            <Users className="h-5 w-5 mr-2 text-white" /> 
            Creators: <span className="ml-2 text-brand-yellow">{isLoading ? "..." : creatorCount}</span>
          </h1>
        </div>
        
        {/* Search and Filter Toggle */}
        <div className="flex gap-2">
          {/* Search field */}
          <div className="relative flex-1">
            <Input 
              placeholder="Search creators..." 
              className="pl-10 h-12 w-full bg-background border-white/20 text-white" 
              value={searchQuery} 
              onChange={handleSearchChange} 
            />
            <span className="absolute left-3 top-1/2 transform -translate-y-1/2">
              <SlidersHorizontal className="h-5 w-5 text-white" />
            </span>
          </div>

          {/* Filter Menu Toggle */}
          <Sheet open={isFilterMenuOpen} onOpenChange={setIsFilterMenuOpen}>
            <SheetTrigger asChild>
              <Button 
                variant="outline" 
                size="icon"
                className="h-12 w-12 border-white/20 text-white"
              >
                <Menu className="h-5 w-5" />
                {(selectedGenders.length > 0 || selectedTeams.length > 0 || selectedClasses.length > 0) && (
                  <span className="absolute -top-1 -right-1 bg-brand-yellow text-black text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {selectedGenders.length + selectedTeams.length + selectedClasses.length}
                  </span>
                )}
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-80 bg-background">
              <SheetHeader>
                <SheetTitle className="text-white">Filters</SheetTitle>
              </SheetHeader>
              <div className="mt-6">
                <FilterButtons />
              </div>
            </SheetContent>
          </Sheet>
        </div>

        {/* Clear button if search is active */}
        {searchQuery && (
          <Button 
            variant="ghost" 
            size="sm" 
            className="w-full text-white hover:text-white/80" 
            onClick={handleClearFilters}
          >
            <X className="h-4 w-4 mr-2" />
            Clear Search
          </Button>
        )}
      </div>
    );
  }

  // Desktop layout (unchanged)
  return (
    <div className="mb-8">
      {/* Header with Creator Count */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold flex items-center text-white">
          <Users className="h-6 w-6 mr-2 text-white" /> 
          Total Creators: <span className="ml-2 text-brand-yellow">{isLoading ? "..." : creatorCount}</span>
        </h1>
      </div>
      
      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row gap-3">
        {/* Search field */}
        <div className="relative flex-1">
          <Input 
            placeholder="Search by name or email..." 
            className="pl-10 h-12 w-full bg-background border-white/20 text-white" 
            value={searchQuery} 
            onChange={handleSearchChange} 
          />
          <span className="absolute left-3 top-1/2 transform -translate-y-1/2">
            <SlidersHorizontal className="h-5 w-5 text-white" />
          </span>
        </div>

        {/* Gender Filter */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="outline" 
              className="rounded-full flex gap-2 items-center min-w-[120px] h-12 border-white/20 text-white"
            >
              <SlidersHorizontal className="h-5 w-5 text-white" />
              Gender
              {selectedGenders.length > 0 && 
                <span className="ml-1 bg-white/10 text-xs px-2 py-0.5 rounded-full text-white">
                  {selectedGenders.length}
                </span>
              }
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="z-50 w-44 bg-background border-white/20">
            <DropdownMenuLabel className="text-white">Filter by gender</DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-white/20" />
            {genderTags.map(g => (
              <DropdownMenuCheckboxItem 
                key={g} 
                checked={selectedGenders.includes(g)} 
                onCheckedChange={() => toggleGender(g)} 
                className="text-white"
              >
                {g}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Team Filter */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="outline" 
              className="rounded-full flex gap-2 items-center min-w-[120px] h-12 border-white/20 text-white"
            >
              <Users className="h-5 w-5 text-white" />
              Teams
              {selectedTeams.length > 0 && 
                <span className="ml-1 bg-white/10 text-xs px-2 py-0.5 rounded-full text-white">
                  {selectedTeams.length}
                </span>
              }
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="z-50 w-44 bg-background border-white/20">
            <DropdownMenuLabel className="text-white">Filter by team</DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-white/20" />
            {teamTags.map(t => (
              <DropdownMenuCheckboxItem 
                key={t} 
                checked={selectedTeams.includes(t)} 
                onCheckedChange={() => toggleTeam(t)} 
                className="text-white"
              >
                {t}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Class Filter */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="outline" 
              className="rounded-full flex gap-2 items-center min-w-[120px] h-12 border-white/20 text-white"
            >
              <AlertCircle className="h-5 w-5 text-white" />
              Class
              {selectedClasses.length > 0 && 
                <span className="ml-1 bg-white/10 text-xs px-2 py-0.5 rounded-full text-white">
                  {selectedClasses.length}
                </span>
              }
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="z-50 w-44 bg-background border-white/20">
            <DropdownMenuLabel className="text-white">Filter by class</DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-white/20" />
            {classTags.map(c => (
              <DropdownMenuCheckboxItem 
                key={c} 
                checked={selectedClasses.includes(c)} 
                onCheckedChange={() => toggleClass(c)} 
                className="text-white"
              >
                {c}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Clear button if any filters are active */}
        {(selectedGenders.length > 0 || selectedTeams.length > 0 || selectedClasses.length > 0 || searchQuery) && (
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-12 text-white hover:text-white/80" 
            onClick={handleClearFilters}
          >
            <span className="mr-1">Clear</span>
            <Filter className="h-4 w-4 text-white" />
          </Button>
        )}
      </div>
    </div>
  );
};

export default CreatorsHeader;
