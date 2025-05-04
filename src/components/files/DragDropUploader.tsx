import React, { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';

const DragDropUploader = ({ 
  creatorId, 
  onUploadComplete, 
  onCancel,
  currentFolder 
}: { 
  creatorId: string; 
  onUploadComplete: (uploadedFileIds?: string[]) => void;
  onCancel: () => void;
  currentFolder: string;
}) => {
  const { toast } = useToast();
  const [isUploading, setIsUploading] = useState(false);

  const handleUpload = async (acceptedFiles: File[]) => {
    setIsUploading(true);
    const uploadedFileIds: string[] = [];

    try {
      for (const file of acceptedFiles) {
        const filePath = `${creatorId}/${file.name}`;
        const { error: uploadError } = await supabase.storage
          .from('raw_uploads')
          .upload(filePath, file);

        if (uploadError) {
          throw uploadError;
        }

        const fileId = file.name; // Use a unique identifier for the file
        uploadedFileIds.push(fileId);

        // Add the folder reference to the initial folder array
        let folderArray: string[] = [];
        if (currentFolder && currentFolder !== 'shared' && currentFolder !== 'unsorted') {
          folderArray = [currentFolder];
        }

        // Store metadata in the media table with the folder reference
        const { data: mediaRecord, error: mediaError } = await supabase
          .from('media')
          .insert({
            id: fileId,
            creator_id: creatorId,
            bucket_key: filePath,
            filename: file.name,
            mime: file.type,
            file_size: file.size,
            status: 'complete',
            folders: folderArray // Add the folder array to track which folders this file belongs to
          })
          .select();

        if (mediaError) {
          throw mediaError;
        }
      }

      toast({
        title: "Upload successful",
        description: `${acceptedFiles.length} files uploaded successfully.`,
      });
      onUploadComplete(uploadedFileIds);
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: "Upload failed",
        description: error instanceof Error ? error.message : "Failed to upload files",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const { getRootProps, getInputProps } = useDropzone({
    onDrop: handleUpload,
    accept: {
      'image/*': [],
      'video/*': [],
      'audio/*': [],
      'application/pdf': [],
      'application/msword': [],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': [],
      'application/vnd.ms-excel': [],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': [],
      'application/zip': [],
    },
  });

  return (
    <div {...getRootProps()} className="border-dashed border-2 border-gray-300 p-4 text-center">
      <input {...getInputProps()} />
      <p>Drag & drop some files here, or click to select files</p>
      <Button onClick={onCancel} variant="outline" className="mt-4">Cancel</Button>
      {isUploading && <p>Uploading...</p>}
    </div>
  );
};

export default DragDropUploader;
