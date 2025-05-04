
import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/components/ui/use-toast';
import { Archive, Loader2, XCircle, FileArchive, Check } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { getUniqueFileName } from '@/utils/fileUtils';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';

interface ZipFileUploaderProps {
  creatorId: string;
  currentFolder: string;
  onExtractComplete: (fileIds: string[]) => void;
}

export const ZipFileUploader: React.FC<ZipFileUploaderProps> = ({ 
  creatorId, 
  currentFolder, 
  onExtractComplete 
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [extractionProgress, setExtractionProgress] = useState(0);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [extractingStatus, setExtractingStatus] = useState<'idle' | 'uploading' | 'extracting' | 'complete' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [extractedFiles, setExtractedFiles] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      
      if (!file.name.toLowerCase().endsWith('.zip')) {
        toast({
          variant: 'destructive',
          title: 'Invalid file format',
          description: 'Please select a ZIP file (.zip)'
        });
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
        return;
      }
      
      setSelectedFile(file);
      setIsDialogOpen(true);
    }
  };

  const closeDialog = () => {
    setIsDialogOpen(false);
    setSelectedFile(null);
    setExtractingStatus('idle');
    setUploadProgress(0);
    setExtractionProgress(0);
    setErrorMessage(null);
    setExtractedFiles([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const processZipFile = async () => {
    if (!selectedFile) return;
    
    try {
      setIsUploading(true);
      setExtractingStatus('uploading');
      
      // Generate a unique filename
      const safeName = selectedFile.name.replace(/[^a-zA-Z0-9.-]/g, '_');
      const uniqueFileName = await getUniqueFileName(
        safeName,
        currentFolder,
        creatorId,
        'raw_uploads',
        supabase
      );
      
      // Create a file path for the zip file
      const filePath = `${creatorId}/${currentFolder}/${uniqueFileName}`;
      
      // Create a media record for the ZIP file first
      const { data: mediaData, error: mediaError } = await supabase
        .from('media')
        .insert({
          creator_id: creatorId,
          bucket_key: filePath,
          filename: uniqueFileName,
          mime: 'application/zip',
          file_size: selectedFile.size,
          status: 'uploading',
          description: 'ZIP file being processed',
          folders: currentFolder === 'shared' ? [] : [currentFolder]
        })
        .select('id');
        
      if (mediaError) {
        throw new Error(`Error creating media record: ${mediaError.message}`);
      }
      
      const zipId = mediaData?.[0]?.id;
      
      // Upload the ZIP file with progress tracking
      let uploadComplete = false;
      const fileReader = new FileReader();
      
      fileReader.onload = async () => {
        const buffer = fileReader.result as ArrayBuffer;
        
        // Upload the file
        const { error: uploadError } = await supabase.storage
          .from('raw_uploads')
          .upload(filePath, buffer, {
            contentType: 'application/zip',
            upsert: true
          });
          
        if (uploadError) {
          throw new Error(`Error uploading ZIP file: ${uploadError.message}`);
        }
        
        // Update the progress and status
        setUploadProgress(100);
        uploadComplete = true;
        
        // Get the public URL for the ZIP file
        const { data: urlData } = supabase.storage
          .from('raw_uploads')
          .getPublicUrl(filePath);
          
        if (!urlData.publicUrl) {
          throw new Error('Could not get public URL for ZIP file');
        }
        
        // Update status
        setExtractingStatus('extracting');
        
        // Call the edge function to extract the ZIP
        try {
          // Update the media record status
          await supabase
            .from('media')
            .update({ status: 'processing' })
            .eq('id', zipId);
          
          // Start a simulated progress for extraction
          const interval = setInterval(() => {
            setExtractionProgress(prev => {
              const newProgress = prev + 5;
              if (newProgress >= 90) {
                clearInterval(interval);
                return 90;
              }
              return newProgress;
            });
          }, 300);
          
          // Call the edge function to process the ZIP
          const { data, error } = await supabase.functions.invoke('unzip-files', {
            body: {
              zipUrl: urlData.publicUrl,
              creatorId,
              folderPath: currentFolder,
              uploadedZipId: zipId
            }
          });
          
          clearInterval(interval);
          
          if (error) {
            throw new Error(`Error extracting ZIP: ${error.message}`);
          }
          
          if (!data.success) {
            throw new Error('Failed to extract ZIP file');
          }
          
          // Update the progress and status
          setExtractionProgress(100);
          setExtractingStatus('complete');
          setExtractedFiles(data.extractedFiles || []);
          
          toast({
            title: 'ZIP file extracted',
            description: `Successfully extracted ${data.extractedFiles.length} files`
          });
          
          // Notify parent component of the extracted files
          if (data.extractedFileIds && data.extractedFileIds.length > 0) {
            onExtractComplete(data.extractedFileIds);
          }
          
        } catch (extractError) {
          console.error('Extraction error:', extractError);
          setErrorMessage(extractError instanceof Error ? extractError.message : 'Unknown error during extraction');
          setExtractingStatus('error');
          
          // Update the media record status
          await supabase
            .from('media')
            .update({ 
              status: 'error',
              description: `Error extracting ZIP: ${extractError instanceof Error ? extractError.message : 'Unknown error'}`
            })
            .eq('id', zipId);
        }
      };
      
      fileReader.onprogress = (event) => {
        if (event.lengthComputable) {
          const progress = Math.round((event.loaded / event.total) * 100);
          setUploadProgress(progress);
        }
      };
      
      fileReader.onerror = () => {
        setErrorMessage('Error reading the file');
        setExtractingStatus('error');
      };
      
      // Start reading the file as an array buffer
      fileReader.readAsArrayBuffer(selectedFile);
      
    } catch (error) {
      console.error('Upload error:', error);
      setErrorMessage(error instanceof Error ? error.message : 'Unknown error during upload');
      setExtractingStatus('error');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        id="zip-file-input"
        accept=".zip"
        onChange={handleFileSelect}
        className="hidden"
      />
      <label htmlFor="zip-file-input">
        <Button 
          variant="outline" 
          type="button" 
          className="flex items-center gap-2"
        >
          <Archive className="h-4 w-4" />
          <span>Upload ZIP</span>
        </Button>
      </label>
      
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Process ZIP Archive</DialogTitle>
            <DialogDescription>
              Upload and extract ZIP file contents to the current folder.
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex flex-col gap-4 py-4">
            {selectedFile && (
              <div className="flex items-center gap-2 bg-muted p-2 rounded">
                <FileArchive className="h-6 w-6 text-blue-500" />
                <div className="flex-1 overflow-hidden">
                  <p className="font-medium truncate">{selectedFile.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              </div>
            )}
            
            {extractingStatus !== 'idle' && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Upload progress</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <Progress value={uploadProgress} className="h-2" />
                </div>
                
                {(extractingStatus === 'extracting' || extractingStatus === 'complete' || extractingStatus === 'error') && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Extraction progress</span>
                      <span>{extractionProgress}%</span>
                    </div>
                    <Progress value={extractionProgress} className="h-2" />
                  </div>
                )}
                
                {extractingStatus === 'complete' && extractedFiles.length > 0 && (
                  <div className="mt-4 max-h-40 overflow-y-auto bg-muted p-2 rounded">
                    <p className="font-medium mb-1">Extracted files:</p>
                    <ul className="text-xs space-y-1">
                      {extractedFiles.map((file, index) => (
                        <li key={index} className="flex items-center gap-1">
                          <Check className="h-3 w-3 text-green-500" />
                          <span className="truncate">{file}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {errorMessage && (
                  <div className="bg-red-50 border border-red-200 text-red-700 p-2 rounded text-sm">
                    <div className="flex items-center gap-2">
                      <XCircle className="h-4 w-4 text-red-500" />
                      <span>Error: {errorMessage}</span>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
          
          <DialogFooter>
            {extractingStatus === 'idle' && (
              <Button onClick={closeDialog} variant="outline">
                Cancel
              </Button>
            )}
            
            {extractingStatus === 'idle' && (
              <Button 
                onClick={processZipFile} 
                disabled={!selectedFile || isUploading}
                className="gap-2"
              >
                <Archive className="h-4 w-4" />
                Process ZIP
              </Button>
            )}
            
            {(extractingStatus === 'uploading' || extractingStatus === 'extracting') && (
              <Button disabled className="gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                {extractingStatus === 'uploading' ? 'Uploading...' : 'Extracting...'}
              </Button>
            )}
            
            {(extractingStatus === 'complete' || extractingStatus === 'error') && (
              <Button onClick={closeDialog}>
                {extractingStatus === 'complete' ? 'Close' : 'Try Again'}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
