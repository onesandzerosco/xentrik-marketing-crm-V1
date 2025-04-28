
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card } from "@/components/ui/card";
import { useCreators } from '@/context/creator';
import { Folder, Share2, Upload, Search } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import TagFilter from "@/components/TagFilter";

const SharedFiles = () => {
  const { creators } = useCreators();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGenders, setSelectedGenders] = useState<string[]>([]);
  const [selectedTeams, setSelectedTeams] = useState<string[]>([]);
  const [selectedClasses, setSelectedClasses] = useState<string[]>([]);

  const handleShare = (creatorId: string) => {
    const shareUrl = `${window.location.origin}/creator-files/${creatorId}`;
    navigator.clipboard.writeText(shareUrl);
    toast({
      title: "Link copied!",
      description: "The sharing link has been copied to your clipboard.",
    });
  };

  // Get unique tags for filters
  const genderTags = Array.from(new Set(creators.map(c => c.gender)));
  const teamTags = Array.from(new Set(creators.filter(c => c.team).map(c => c.team)));
  const classTags = Array.from(new Set(creators.filter(c => c.creatorType).map(c => c.creatorType)));

  // Filter creators based on search and tags
  const filteredCreators = creators.filter(creator => {
    const matchesSearch = creator.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesGender = selectedGenders.length === 0 || selectedGenders.includes(creator.gender);
    const matchesTeam = selectedTeams.length === 0 || (creator.team && selectedTeams.includes(creator.team));
    const matchesClass = selectedClasses.length === 0 || (creator.creatorType && selectedClasses.includes(creator.creatorType));
    
    return matchesSearch && matchesGender && matchesTeam && matchesClass;
  });

  // Fetch file counts for each creator
  const { data: fileCountsMap = {} } = useQuery({
    queryKey: ['creator-file-counts'],
    queryFn: async () => {
      const creatorCounts: Record<string, { total: number, uploading: number }> = {};
      
      for (const creator of creators) {
        const { data: filesData } = await supabase.storage
          .from('creator_files')
          .list(`${creator.id}/shared`);
          
        creatorCounts[creator.id] = {
          total: filesData?.length || 0,
          uploading: 0 // This would be updated in real-time when uploads are happening
        };
      }
      
      return creatorCounts;
    }
  });

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div className="flex flex-col space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search creators..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        
        <div className="flex flex-wrap gap-4">
          <div>
            <h3 className="text-sm font-medium mb-2">Gender</h3>
            <TagFilter
              tags={genderTags}
              selectedTags={selectedGenders}
              onChange={setSelectedGenders}
              type="gender"
            />
          </div>
          <div>
            <h3 className="text-sm font-medium mb-2">Team</h3>
            <TagFilter
              tags={teamTags}
              selectedTags={selectedTeams}
              onChange={setSelectedTeams}
              type="team"
            />
          </div>
          <div>
            <h3 className="text-sm font-medium mb-2">Class</h3>
            <TagFilter
              tags={classTags}
              selectedTags={selectedClasses}
              onChange={setSelectedClasses}
              type="class"
            />
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {filteredCreators.map((creator) => {
          const fileStats = fileCountsMap[creator.id] || { total: 0, uploading: 0 };
          const hasUploads = fileStats.uploading > 0;

          return (
            <Card key={creator.id} className="p-4 hover:bg-accent/5 transition-colors group">
              <div className="flex items-center gap-4">
                <div className="shrink-0">
                  {creator.profileImage ? (
                    <img 
                      src={creator.profileImage} 
                      alt={creator.name} 
                      className="w-12 h-12 rounded-full object-cover border-2 border-primary/20 group-hover:border-primary/40 transition-all"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-premium-highlight/10 flex items-center justify-center">
                      <Folder className="w-6 h-6 text-primary/60 group-hover:text-primary/80 transition-colors" />
                    </div>
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-xl font-semibold group-hover:text-primary transition-colors">{creator.name}</h3>
                      <div className="text-sm text-muted-foreground mt-0.5">
                        {fileStats.total} {fileStats.total === 1 ? 'file' : 'files'}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        onClick={(e) => {
                          e.preventDefault();
                          handleShare(creator.id);
                        }}
                        className="h-9 hover:bg-gradient-premium-yellow hover:text-black transition-all"
                      >
                        <Share2 className="h-4 w-4" />
                      </Button>
                      <Link to={`/creator-files/${creator.id}`}>
                        <Button 
                          variant="premium" 
                          className="h-9 shadow-premium-yellow hover:shadow-premium-highlight"
                        >
                          <Upload className="h-4 w-4 mr-1" />
                          View Files
                        </Button>
                      </Link>
                    </div>
                  </div>
                  
                  {hasUploads && (
                    <div className="mt-3">
                      <Progress value={65} className="h-2" />
                      <span className="text-xs text-primary mt-1 block">
                        {fileStats.uploading} files uploading...
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          );
        })}

        {filteredCreators.length === 0 && (
          <div className="text-center py-12">
            <p className="text-lg text-muted-foreground">
              {searchQuery || selectedGenders.length > 0 || selectedTeams.length > 0 || selectedClasses.length > 0
                ? "No creators found matching your filters"
                : "No creators found"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SharedFiles;
