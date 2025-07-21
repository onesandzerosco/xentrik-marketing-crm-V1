import React from "react";
import { Button } from "@/components/ui/button";
import { Users, Filter, SlidersHorizontal, AlertCircle, Target } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";

interface MarketingFilesHeaderProps {
  isLoading: boolean;
  creatorCount: number;
  selectedGenders: string[];
  selectedTeams: string[];
  selectedClasses: string[];
  selectedMarketingStrategies: string[];
  setSelectedGenders: React.Dispatch<React.SetStateAction<string[]>>;
  setSelectedTeams: React.Dispatch<React.SetStateAction<string[]>>;
  setSelectedClasses: React.Dispatch<React.SetStateAction<string[]>>;
  setSelectedMarketingStrategies: React.Dispatch<React.SetStateAction<string[]>>;
  handleClearFilters: () => void;
  searchQuery: string;
  setSearchQuery: React.Dispatch<React.SetStateAction<string>>;
}

const genderTags = ["Male", "Female", "Trans"];
const teamTags = ["A Team", "B Team", "C Team"];
const classTags = ["Real", "AI"];
const marketingStrategyTags = ["Twitter", "Instagram", "Chaturbate", "TikTok", "Reddit"];

const MarketingFilesHeader: React.FC<MarketingFilesHeaderProps> = ({
  isLoading,
  creatorCount,
  selectedGenders,
  selectedTeams,
  selectedClasses,
  selectedMarketingStrategies,
  setSelectedGenders,
  setSelectedTeams,
  setSelectedClasses,
  setSelectedMarketingStrategies,
  handleClearFilters,
  searchQuery,
  setSearchQuery
}) => {
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
  const toggleMarketingStrategy = (s: string) => {
    setSelectedMarketingStrategies(selectedMarketingStrategies.includes(s) ? selectedMarketingStrategies.filter(x => x !== s) : [...selectedMarketingStrategies, s]);
  };

  return (
    <div className="mb-8">
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
            <Button variant="outline" className="rounded-full flex gap-2 items-center min-w-[120px] h-12 border-white/20 text-white">
              <SlidersHorizontal className="h-5 w-5 text-white" />
              Gender
              {selectedGenders.length > 0 && (
                <span className="ml-1 bg-white/10 text-xs px-2 py-0.5 rounded-full text-white">{selectedGenders.length}</span>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="z-50 w-44 bg-background border-white/20">
            <DropdownMenuLabel className="text-white">Filter by gender</DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-white/20" />
            {genderTags.map((g) => (
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
            <Button variant="outline" className="rounded-full flex gap-2 items-center min-w-[120px] h-12 border-white/20 text-white">
              <Users className="h-5 w-5 text-white" />
              Teams
              {selectedTeams.length > 0 && (
                <span className="ml-1 bg-white/10 text-xs px-2 py-0.5 rounded-full text-white">{selectedTeams.length}</span>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="z-50 w-44 bg-background border-white/20">
            <DropdownMenuLabel className="text-white">Filter by team</DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-white/20" />
            {teamTags.map((t) => (
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
            <Button variant="outline" className="rounded-full flex gap-2 items-center min-w-[120px] h-12 border-white/20 text-white">
              <AlertCircle className="h-5 w-5 text-white" />
              Class
              {selectedClasses.length > 0 && (
                <span className="ml-1 bg-white/10 text-xs px-2 py-0.5 rounded-full text-white">{selectedClasses.length}</span>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="z-50 w-44 bg-background border-white/20">
            <DropdownMenuLabel className="text-white">Filter by class</DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-white/20" />
            {classTags.map((c) => (
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
        {/* Marketing Strategy Filter */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="rounded-full flex gap-2 items-center min-w-[120px] h-12 border-white/20 text-white">
              <Target className="h-5 w-5 text-white" />
              Strategy
              {selectedMarketingStrategies.length > 0 && (
                <span className="ml-1 bg-white/10 text-xs px-2 py-0.5 rounded-full text-white">{selectedMarketingStrategies.length}</span>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="z-50 w-44 bg-background border-white/20">
            <DropdownMenuLabel className="text-white">Filter by strategy</DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-white/20" />
            {marketingStrategyTags.map((s) => (
              <DropdownMenuCheckboxItem
                key={s}
                checked={selectedMarketingStrategies.includes(s)}
                onCheckedChange={() => toggleMarketingStrategy(s)}
                className="text-white"
              >
                {s}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
        {/* Clear button if any filters are active */}
        {(selectedGenders.length > 0 || selectedTeams.length > 0 || selectedClasses.length > 0 || selectedMarketingStrategies.length > 0 || searchQuery) && (
          <Button variant="ghost" size="sm" className="h-12 text-white hover:text-white/80" onClick={handleClearFilters}>
            <span className="mr-1">Clear</span>
            <Filter className="h-4 w-4 text-white" />
          </Button>
        )}
      </div>
    </div>
  );
};

export default MarketingFilesHeader;