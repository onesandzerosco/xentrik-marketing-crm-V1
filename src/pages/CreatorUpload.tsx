
import React, { useState } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { Upload, Check, Loader2 } from 'lucide-react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from '@/integrations/supabase/client';
import { useCreators } from '@/context/creator';

const CreatorUpload = () => {
  const { id } = useParams();
  const { getCreator } = useCreators();
  const creator = getCreator(id || '');
  const { toast } = useToast();
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<string[]>([]);

  if (!creator) {
    return <Navigate to="/" replace />;
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    const newUploadedFiles: string[] = [];
    
    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
        const filePath = `${creator.id}/unsorted/${safeName}`;
        
        const { error } = await supabase.storage
          .from('creator_files')
          .upload(filePath, file, {
            cacheControl: '3600',
            upsert: true
          });
          
        if (error) {
          throw error;
        }
        
        newUploadedFiles.push(file.name);
      }
      
      setUploadedFiles(prev => [...prev, ...newUploadedFiles]);
      
      toast({
        title: newUploadedFiles.length > 1 
          ? `${newUploadedFiles.length} files uploaded successfully` 
          : 'File uploaded successfully',
        description: newUploadedFiles.length > 1
          ? `Successfully uploaded ${newUploadedFiles.length} files` 
          : `Successfully uploaded ${newUploadedFiles[0]}`,
      });
      
      // Reset the input
      e.target.value = '';
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: 'Upload failed',
        description: error instanceof Error ? error.message : 'Failed to upload the file(s)',
        variant: 'destructive',
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background/50 to-background/80 p-4 md:p-8 flex flex-col items-center justify-center">
      <Card className="max-w-md w-full p-6 md:p-8 shadow-lg">
        <div className="flex flex-col items-center text-center mb-6">
          <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-4">
            {creator.profileImage ? (
              <img 
                src={creator.profileImage} 
                alt={creator.name} 
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              <span className="text-3xl font-bold text-primary">
                {creator.name[0].toUpperCase()}
              </span>
            )}
          </div>
          <h1 className="text-2xl font-bold mb-1">Upload Files</h1>
          <p className="text-muted-foreground">
            Upload files to share with {creator.name}
          </p>
        </div>

        <div className="space-y-4">
          <div className="border-2 border-dashed border-primary/20 rounded-lg p-6 text-center hover:border-primary/40 transition-colors">
            <input
              id="file-upload"
              type="file"
              multiple
              onChange={handleFileChange}
              className="hidden"
              disabled={isUploading}
            />
            <label 
              htmlFor="file-upload" 
              className="cursor-pointer flex flex-col items-center"
            >
              <Upload className="h-10 w-10 text-muted-foreground mb-2" />
              <span className="text-sm font-medium">
                {isUploading ? 'Uploading...' : 'Click to upload or drag and drop'}
              </span>
              <span className="text-xs text-muted-foreground mt-1">
                Support for all file types
              </span>
            </label>
          </div>

          {isUploading && (
            <div className="flex items-center justify-center py-2">
              <Loader2 className="h-5 w-5 animate-spin text-primary mr-2" />
              <span>Uploading files...</span>
            </div>
          )}

          {uploadedFiles.length > 0 && (
            <div className="mt-4">
              <h3 className="text-sm font-medium mb-2">Uploaded files:</h3>
              <ul className="space-y-1 max-h-40 overflow-auto rounded-md border p-2">
                {uploadedFiles.map((file, index) => (
                  <li key={index} className="text-sm flex items-center">
                    <Check className="h-4 w-4 text-green-500 mr-2" />
                    <span className="truncate">{file}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

export default CreatorUpload;
