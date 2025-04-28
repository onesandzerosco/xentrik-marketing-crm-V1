
import React from 'react';
import { Link } from 'react-router-dom';
import { Card } from "@/components/ui/card";
import { useCreators } from '@/context/creator';
import { Folder, Share2, Upload } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Progress } from "@/components/ui/progress";

const SharedFiles = () => {
  const { creators } = useCreators();
  const { toast } = useToast();

  const handleShare = (creatorId: string) => {
    const shareUrl = `${window.location.origin}/creator-files/${creatorId}`;
    navigator.clipboard.writeText(shareUrl);
    toast({
      title: "Link copied!",
      description: "The sharing link has been copied to your clipboard.",
    });
  };

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
    <div className="p-8 max-w-7xl mx-auto">
      <h1 className="text-2xl font-semibold mb-8">Creator Files</h1>
      
      <div className="space-y-3">
        {creators.map((creator) => {
          const fileStats = fileCountsMap[creator.id] || { total: 0, uploading: 0 };
          const hasUploads = fileStats.uploading > 0;

          return (
            <Card key={creator.id} className="p-4 hover:bg-accent/5 transition-colors cursor-pointer group">
              <div className="flex items-center gap-4">
                <div>
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
                  <div className="flex items-center justify-between gap-4">
                    <h3 className="text-lg font-medium group-hover:text-primary transition-colors">{creator.name}</h3>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.preventDefault();
                          handleShare(creator.id);
                        }}
                        className="h-8"
                      >
                        <Share2 className="h-4 w-4" />
                      </Button>
                      <Link to={`/creator-files/${creator.id}`} className="shrink-0">
                        <Button 
                          variant="premium" 
                          size="sm" 
                          className="h-8 shadow-premium-yellow hover:shadow-premium-highlight"
                        >
                          <Upload className="h-4 w-4 mr-1" />
                          View Files
                        </Button>
                      </Link>
                    </div>
                  </div>
                  
                  <div className="mt-2 flex items-center gap-4">
                    <span className="text-sm text-muted-foreground">
                      {fileStats.total} {fileStats.total === 1 ? 'file' : 'files'}
                    </span>
                    {hasUploads && (
                      <div className="flex-1 max-w-[200px]">
                        <Progress value={65} className="h-2" />
                        <span className="text-xs text-primary mt-1">
                          {fileStats.uploading} files uploading...
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          );
        })}

        {creators.length === 0 && (
          <div className="text-center py-12">
            <p className="text-lg text-muted-foreground">No creators found</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SharedFiles;
