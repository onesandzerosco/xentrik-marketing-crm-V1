
import React, { useState, useEffect } from "react";
import { useCreators } from "../context/creator";
import CreatorsList from "../components/creators/list/CreatorsList";
import { useToast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { BarChart2, Edit, Plus, Users } from "lucide-react";
import { Input } from "@/components/ui/input";

const Creators = () => {
  const { creators, filterCreators } = useCreators();
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const [selectedGenders, setSelectedGenders] = useState<string[]>([]);
  const [selectedTeams, setSelectedTeams] = useState<string[]>([]);
  const [selectedClasses, setSelectedClasses] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Pass searchQuery to filterCreators
  const filteredCreators = filterCreators({
    gender: selectedGenders,
    team: selectedTeams,
    creatorType: selectedClasses,
    searchQuery,
  });

  useEffect(() => {
    if (creators.length > 0) {
      setIsLoading(false);
    } else if (creators.length === 0 && isLoading) {
      const timer = setTimeout(() => {
        setIsLoading(false);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [creators, isLoading]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  return (
    <div className="p-8 w-full">
      {/* Header with creator count and onboard button */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold flex items-center text-yellow-400">
          <Users className="h-6 w-6 mr-2" /> 
          Creators
        </h1>
        
        <div className="flex items-center gap-4">
          <div className="bg-gray-800 rounded-md px-3 py-1 text-sm">
            {isLoading ? "..." : filteredCreators.length} creators
          </div>
          
          <Link to="/creators/onboard">
            <Button variant="premium" className="shadow-premium-yellow hover:shadow-premium-highlight">
              <Plus className="h-4 w-4 mr-2" />
              Onboard Creator
            </Button>
          </Link>
        </div>
      </div>
      
      {/* Search and Filters */}
      <div className="mb-6 flex items-center gap-3">
        {/* Search field */}
        <div className="relative flex-1">
          <Input 
            placeholder="Search by name or email..." 
            className="pl-10 bg-background border-white/20 text-white" 
            value={searchQuery} 
            onChange={handleSearchChange} 
          />
          <span className="absolute left-3 top-1/2 transform -translate-y-1/2">
            <svg className="h-5 w-5 text-white/50" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M3 7H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              <path d="M3 12H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              <path d="M3 17H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </span>
        </div>

        <Button variant="outline" className="border-yellow-500/80 text-yellow-400">
          <span className="mr-2">Gender</span>
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M6 9L12 15L18 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </Button>

        <Button variant="outline" className="border-yellow-500/80 text-yellow-400">
          <Users className="h-4 w-4 mr-2" />
          <span className="mr-2">Teams</span>
        </Button>

        <Button variant="outline" className="border-yellow-500/80 text-yellow-400">
          <span className="mr-2">Class</span>
        </Button>
      </div>

      <CreatorsList 
        isLoading={isLoading}
        creators={filteredCreators}
        hasFilters={!!searchQuery || selectedGenders.length > 0 || selectedTeams.length > 0 || selectedClasses.length > 0}
        renderCreatorActions={(creator) => (
          <div className="flex gap-2 absolute top-4 right-4">
            <Link to={`/creators/${creator.id}/analytics`}>
              <Button variant="outline" size="icon" className="h-8 w-8 rounded-full bg-transparent border-white/20">
                <BarChart2 className="h-4 w-4 text-white" />
              </Button>
            </Link>
            <Link to={`/creators/${creator.id}`}>
              <Button variant="outline" size="icon" className="h-8 w-8 rounded-full bg-transparent border-white/20">
                <Edit className="h-4 w-4 text-white" />
              </Button>
            </Link>
          </div>
        )}
      />
    </div>
  );
};

export default Creators;
