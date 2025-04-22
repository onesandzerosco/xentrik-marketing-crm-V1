
import React, { useEffect, useState } from 'react';
import { Card } from "@/components/ui/card";
import { useCreators } from '@/context/creator';
import { Creator } from '@/types';
import { ChevronDown, ChevronUp } from 'lucide-react';
import FileUploader from '@/components/messages/FileUploader';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';

interface CreatorFileSection {
  creator: Creator;
  isExpanded: boolean;
  files: Array<{
    name: string;
    size: number;
    created_at: string;
    url: string;
  }>;
}

const SharedFiles = () => {
  const { creators } = useCreators();
  const [creatorSections, setCreatorSections] = useState<CreatorFileSection[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeCreatorSections = async () => {
      const sections = await Promise.all(creators.map(async (creator) => {
        const { data: filesData, error: filesError } = await supabase.storage
          .from('creator_files')
          .list(`${creator.id}/shared`, {
            sortBy: { column: 'created_at', order: 'desc' },
          });

        const files = await Promise.all((filesData || []).map(async (file: any) => {
          const { data } = await supabase.storage
            .from('creator_files')
            .createSignedUrl(`${creator.id}/shared/${file.name}`, 3600);

          return {
            name: file.name,
            size: file.metadata?.size || 0,
            created_at: file.created_at,
            url: data?.signedUrl || '',
          };
        }));

        return {
          creator,
          isExpanded: false,
          files
        };
      }));

      setCreatorSections(sections);
      setLoading(false);
    };

    initializeCreatorSections();
  }, [creators]);

  const toggleSection = (creatorId: string) => {
    setCreatorSections(sections => 
      sections.map(section => 
        section.creator.id === creatorId 
          ? { ...section, isExpanded: !section.isExpanded }
          : section
      )
    );
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-primary-foreground"></div>
          <p>Loading files...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <h1 className="text-2xl font-semibold mb-8">Creator Files</h1>
      
      <div className="space-y-6">
        {creatorSections.map(({ creator, isExpanded, files }) => (
          <Card key={creator.id} className="p-6">
            <div 
              className="flex items-center justify-between cursor-pointer"
              onClick={() => toggleSection(creator.id)}
            >
              <div className="flex items-center gap-4">
                {creator.profileImage && (
                  <img 
                    src={creator.profileImage} 
                    alt={creator.name} 
                    className="w-10 h-10 rounded-full object-cover"
                  />
                )}
                <div>
                  <h3 className="text-lg font-medium">{creator.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {files.length} file{files.length !== 1 ? 's' : ''}
                  </p>
                </div>
              </div>
              {isExpanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
            </div>

            {isExpanded && (
              <div className="mt-6 space-y-6">
                <FileUploader creatorId={creator.id} folderPath="shared" />

                {files.length > 0 ? (
                  <div className="space-y-4">
                    {files.map((file) => (
                      <div 
                        key={file.name}
                        className="flex items-center justify-between p-3 bg-secondary/5 rounded-lg hover:bg-secondary/10 transition-colors"
                      >
                        <span className="font-medium truncate flex-1">{file.name}</span>
                        <span className="text-sm text-muted-foreground mx-4">
                          {formatFileSize(file.size)}
                        </span>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          asChild
                        >
                          <a href={file.url} download={file.name} target="_blank" rel="noopener noreferrer">
                            Download
                          </a>
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-muted-foreground py-4">
                    No files uploaded yet
                  </p>
                )}
              </div>
            )}
          </Card>
        ))}

        {creatorSections.length === 0 && (
          <div className="text-center py-12">
            <p className="text-lg text-muted-foreground">No creators found</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SharedFiles;
