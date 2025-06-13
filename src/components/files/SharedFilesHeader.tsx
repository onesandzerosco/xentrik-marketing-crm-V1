import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { X, Search, Download } from "lucide-react";
import { useCreators } from "@/context/creator";
import ContentGuideDownloader from "@/components/onboarding/ContentGuideDownloader";

interface SharedFilesHeaderProps {
  isLoading: boolean;
  creatorCount: number;
  selectedGenders: string[];
  selectedTeams: string[];
  selectedClasses: string[];
  setSelectedGenders: (genders: string[]) => void;
  setSelectedTeams: (teams: string[]) => void;
  setSelectedClasses: (classes: string[]) => void;
  handleClearFilters: () => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

const SharedFilesHeader: React.FC<SharedFilesHeaderProps> = ({
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
  setSearchQuery,
}) => {
  const { creators } = useCreators();

  // Derive unique values from creators array
  const teams = [...new Set(creators.map(creator => creator.team).filter(Boolean))];
  const genders = [...new Set(creators.map(creator => creator.gender).filter(Boolean))];
  const creatorTypes = [...new Set(creators.map(creator => creator.creatorType).filter(Boolean))];

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Files for Creators</h1>
          <div className="flex items-center gap-4 mt-2">
            <p className="text-muted-foreground">
              {isLoading ? "Loading..." : `${creatorCount} creator${creatorCount !== 1 ? 's' : ''} available`}
            </p>
            <ContentGuideDownloader />
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            type="text"
            placeholder="Search creators..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          <select
            value=""
            onChange={(e) => {
              const value = e.target.value;
              if (value && !selectedGenders.includes(value)) {
                setSelectedGenders([...selectedGenders, value]);
              }
            }}
            className="px-3 py-2 border rounded-md text-sm"
          >
            <option value="">Filter by Gender</option>
            {genders.map((gender) => (
              <option key={gender} value={gender}>
                {gender}
              </option>
            ))}
          </select>

          <select
            value=""
            onChange={(e) => {
              const value = e.target.value;
              if (value && !selectedTeams.includes(value)) {
                setSelectedTeams([...selectedTeams, value]);
              }
            }}
            className="px-3 py-2 border rounded-md text-sm"
          >
            <option value="">Filter by Team</option>
            {teams.map((team) => (
              <option key={team} value={team}>
                {team}
              </option>
            ))}
          </select>

          <select
            value=""
            onChange={(e) => {
              const value = e.target.value;
              if (value && !selectedClasses.includes(value)) {
                setSelectedClasses([...selectedClasses, value]);
              }
            }}
            className="px-3 py-2 border rounded-md text-sm"
          >
            <option value="">Filter by Class</option>
            {creatorTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>

          {(selectedGenders.length > 0 || selectedTeams.length > 0 || selectedClasses.length > 0) && (
            <Button onClick={handleClearFilters} variant="outline" size="sm">
              Clear Filters
            </Button>
          )}
        </div>
      </div>

      {(selectedGenders.length > 0 || selectedTeams.length > 0 || selectedClasses.length > 0) && (
        <div className="flex flex-wrap gap-2 mt-4">
          {selectedGenders.map((gender) => (
            <Badge key={`gender-${gender}`} variant="secondary" className="flex items-center gap-1">
              {gender}
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => setSelectedGenders(selectedGenders.filter(g => g !== gender))}
              />
            </Badge>
          ))}
          {selectedTeams.map((team) => (
            <Badge key={`team-${team}`} variant="secondary" className="flex items-center gap-1">
              {team}
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => setSelectedTeams(selectedTeams.filter(t => t !== team))}
              />
            </Badge>
          ))}
          {selectedClasses.map((creatorClass) => (
            <Badge key={`class-${creatorClass}`} variant="secondary" className="flex items-center gap-1">
              {creatorClass}
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => setSelectedClasses(selectedClasses.filter(c => c !== creatorClass))}
              />
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
};

export default SharedFilesHeader;
