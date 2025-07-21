
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Users, Filter, SlidersHorizontal, AlertCircle, Menu, X } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuCheckboxItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { useIsMobile } from "@/hooks/use-mobile";
import { useAuth } from "@/context/AuthContext";
import { CreateMarketingStructureButton } from "@/components/admin/CreateMarketingStructureButton";

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
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const { userRole, userRoles } = useAuth();
  
  const isAdmin = userRole === 'Admin' || userRoles.includes('Admin');

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

  const FilterDropdowns = () => (
    <>
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
    </>
  );

  return (
    <div className="mb-8">
      {/* Header with Creator Count */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-xl md:text-2xl font-bold flex items-center text-white">
          <Users className="h-5 w-5 md:h-6 md:w-6 mr-2 text-white" /> 
          <span className="hidden sm:inline">Total Creators: </span>
          <span className="sm:hidden">Creators: </span>
          <span className="ml-2 text-brand-yellow">{isLoading ? "..." : creatorCount}</span>
        </h1>
        
        {/* Admin Only: Marketing Structure Button */}
        {isAdmin && (
          <CreateMarketingStructureButton />
        )}
      </div>
      
      {/* Search and Filters */}
      <div className="flex flex-col gap-3">
        {/* Search field - full width on mobile */}
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

        {/* Desktop Filters */}
        {!isMobile && (
          <div className="flex gap-3 flex-wrap">
            <FilterDropdowns />
            
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
        )}

        {/* Mobile Filters Sheet */}
        {isMobile && (
          <div className="flex gap-2">
            <Sheet open={mobileFiltersOpen} onOpenChange={setMobileFiltersOpen}>
              <SheetTrigger asChild>
                <Button 
                  variant="outline" 
                  className="flex-1 h-12 border-white/20 text-white flex items-center justify-center gap-2"
                >
                  <Menu className="h-5 w-5" />
                  <span>Filters</span>
                  {(selectedGenders.length + selectedTeams.length + selectedClasses.length) > 0 && (
                    <span className="bg-white/10 text-xs px-2 py-0.5 rounded-full text-white">
                      {selectedGenders.length + selectedTeams.length + selectedClasses.length}
                    </span>
                  )}
                </Button>
              </SheetTrigger>
              <SheetContent side="bottom" className="h-[80vh] bg-background border-white/20">
                <SheetHeader>
                  <SheetTitle className="text-white">Filter Creators</SheetTitle>
                  <SheetDescription className="text-white/70">
                    Choose filters to narrow down the creator list
                  </SheetDescription>
                </SheetHeader>
                
                <div className="mt-6 space-y-4">
                  <div className="grid grid-cols-1 gap-4">
                    <FilterDropdowns />
                  </div>
                  
                  {/* Clear and Close buttons */}
                  <div className="flex gap-2 pt-4 border-t border-white/20">
                    {(selectedGenders.length > 0 || selectedTeams.length > 0 || selectedClasses.length > 0 || searchQuery) && (
                      <Button 
                        variant="outline" 
                        className="flex-1 h-12 text-white border-white/20" 
                        onClick={() => {
                          handleClearFilters();
                          setMobileFiltersOpen(false);
                        }}
                      >
                        <Filter className="h-4 w-4 mr-2" />
                        Clear All
                      </Button>
                    )}
                    <Button 
                      className="flex-1 h-12 bg-gradient-premium-yellow text-black"
                      onClick={() => setMobileFiltersOpen(false)}
                    >
                      Apply Filters
                    </Button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        )}
      </div>
    </div>
  );
};

export default CreatorsHeader;
