import React, { useState, useEffect } from 'react';
import { FileText, Image, File, Video, AudioLines, Download, Share2, Loader2, Trash2, FileEdit } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { formatFileSize, formatDate } from '@/utils/fileUtils';
import { CreatorFileType } from '@/pages/CreatorFiles';
import { useToast } from "@/components/ui/use-toast";
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { canDeleteFiles, canEditFileDescription } from '@/utils/permissionUtils';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

interface FileListProps {
  files: CreatorFileType[];
  isCreatorView?: boolean;
  onFilesChanged?: () => void;
  recentlyUploadedIds?: string[];
  onSelectFiles?: (fileIds: string[]) => void;
  onUploadClick?: () => void;
}

export const FileList: React.FC<FileListProps> = ({ 
  files, 
  isCreatorView = false, 
  onFilesChanged,
  recentlyUploadedIds = [],
  onSelectFiles,
  onUploadClick
}) => {
  const { toast } = useToast();
  const { userRole, userRoles } = useAuth();
  
  // Use our permission utility functions with both primary role and roles array
  const canEdit = canEditFileDescription(userRole, userRoles);
  const canDelete = canDeleteFiles(userRole, userRoles);
  
  const totalFiles = files.length;
  const uploadingFiles = files.filter(file => file.status === 'uploading').length;
  
  const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set());
  const [processingFiles, setProcessingFiles] = useState<Set<string>>(new Set());
  const [displayFiles, setDisplayFiles] = useState<CreatorFileType[]>(files);
  
  // New state for note editing
  const [isEditingNote, setIsEditingNote] = useState(false);
  const [currentEditingFile, setCurrentEditingFile] = useState<CreatorFileType | null>(null);
  const [noteContent, setNoteContent] = useState("");
  
  // Update display files when input files change
  useEffect(() => {
    setDisplayFiles(files);
  }, [files]);
  
  // Notify parent component when selection changes
  useEffect(() => {
    if (onSelectFiles) {
      onSelectFiles(Array.from(selectedFiles));
    }
  }, [selectedFiles, onSelectFiles]);
  
  const getFileIcon = (type: string) => {
    switch (type) {
      case 'image':
        return <Image className="h-4 w-4 text-blue-500" />;
      case 'document':
        return <FileText className="h-4 w-4 text-orange-500" />;
      case 'video':
        return <Video className="h-4 w-4 text-red-500" />;
      case 'audio':
        return <AudioLines className="h-4 w-4 text-green-500" />;
      default:
        return <File className="h-4 w-4 text-gray-500" />;
    }
  };

  const handleShare = (file: CreatorFileType) => {
    navigator.clipboard.writeText(`${window.location.origin}/share/${file.id}`);
    toast({
      title: "Link copied!",
      description: "The sharing link has been copied to your clipboard.",
    });
  };
  
  const handleDelete = async (file: CreatorFileType) => {
    try {
      setProcessingFiles(prev => new Set([...prev, file.id]));
      
      // Delete the file from storage
      const { error: storageError } = await supabase.storage
        .from('raw_uploads')
        .remove([file.bucketPath || '']);
        
      if (storageError) throw storageError;
      
      // Delete the media record if it exists
      if (file.id) {
        const { error: mediaError } = await supabase
          .from('media')
          .delete()
          .eq('id', file.id);
          
        if (mediaError) throw mediaError;
      }
      
      // Remove from selected files
      setSelectedFiles(prev => {
        const newSet = new Set(prev);
        newSet.delete(file.id);
        return newSet;
      });
      
      // Remove from processing files
      setProcessingFiles(prev => {
        const newSet = new Set(prev);
        newSet.delete(file.id);
        return newSet;
      });
      
      // Update local display files to immediately remove this file
      setDisplayFiles(prev => prev.filter(f => f.id !== file.id));
      
      // Notify parent component about the change
      if (onFilesChanged) {
        onFilesChanged();
      }
      
      toast({
        title: "File deleted",
        description: `Successfully deleted ${file.name}`,
      });
    } catch (error) {
      console.error('Delete error:', error);
      
      setProcessingFiles(prev => {
        const newSet = new Set(prev);
        newSet.delete(file.id);
        return newSet;
      });
      
      toast({
        title: "Delete failed",
        description: error instanceof Error ? error.message : "Failed to delete the file",
        variant: "destructive",
      });
    }
  };
  
  const handleDeleteSelected = async () => {
    if (selectedFiles.size === 0) return;
    
    try {
      const selectedFileIds = Array.from(selectedFiles);
      const selectedFileObjects = displayFiles.filter(file => selectedFiles.has(file.id));
      
      // Add all files to processing state
      setProcessingFiles(new Set(selectedFileIds));
      
      // Keep track of successfully deleted file IDs
      const deletedFileIds = new Set<string>();
      
      for (const file of selectedFileObjects) {
        try {
          // Delete the file from storage
          await supabase.storage
            .from('raw_uploads')
            .remove([file.bucketPath || '']);
          
          // Delete the media record if it exists
          if (file.id) {
            await supabase
              .from('media')
              .delete()
              .eq('id', file.id);
          }
          
          // Mark this file as successfully deleted
          deletedFileIds.add(file.id);
        } catch (error) {
          console.error(`Error deleting file ${file.id}:`, error);
          // Continue with other files
        }
      }
      
      // Update local display files to immediately remove deleted files
      setDisplayFiles(prev => prev.filter(f => !deletedFileIds.has(f.id)));
      
      // Clear selections and processing state
      setSelectedFiles(new Set());
      setProcessingFiles(new Set());
      
      // Notify parent component about the change
      if (onFilesChanged) {
        onFilesChanged();
      }
      
      toast({
        title: "Files deleted",
        description: `Successfully deleted ${deletedFileIds.size} files`,
      });
    } catch (error) {
      console.error('Delete selected error:', error);
      
      setProcessingFiles(new Set());
      
      toast({
        title: "Delete failed",
        description: error instanceof Error ? error.message : "Failed to delete selected files",
        variant: "destructive",
      });
    }
  };
  
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      // Select only non-uploading files
      const selectableFileIds = displayFiles
        .filter(file => file.status !== 'uploading')
        .map(file => file.id);
      setSelectedFiles(new Set(selectableFileIds));
    } else {
      setSelectedFiles(new Set());
    }
  };
  
  const handleSelectFile = (fileId: string, checked: boolean) => {
    setSelectedFiles(prev => {
      const newSet = new Set(prev);
      if (checked) {
        newSet.add(fileId);
      } else {
        newSet.delete(fileId);
      }
      return newSet;
    });
  };
  
  const downloadSelected = () => {
    if (selectedFiles.size === 0) return;
    
    const filesToDownload = displayFiles.filter(file => selectedFiles.has(file.id));
    triggerDownload(filesToDownload);
  };

  // Function to trigger download for one or multiple files
  const triggerDownload = (filesToDownload: CreatorFileType[]) => {
    if (filesToDownload.length === 0) return;
    
    // Dispatch a custom event for the FileDownloader to handle
    const event = new CustomEvent('fileDownloadRequest', {
      detail: { files: filesToDownload }
    });
    window.dispatchEvent(event);
  };
  
  // Function to open the note editing dialog
  const openNoteEditor = (file: CreatorFileType) => {
    setCurrentEditingFile(file);
    setNoteContent(file.description || '');
    setIsEditingNote(true);
  };

  // Function to save the note
  const saveNote = async () => {
    if (!currentEditingFile) return;
    
    try {
      // Save the note to the database
      const { error } = await supabase
        .from('media')
        .update({ 
          description: noteContent.substring(0, 200) // Limit to 200 chars
        })
        .eq('id', currentEditingFile.id);
        
      if (error) throw error;
      
      // Update the local state
      setDisplayFiles(prev => 
        prev.map(file => 
          file.id === currentEditingFile.id 
            ? { ...file, description: noteContent } 
            : file
        )
      );
      
      if (onFilesChanged) {
        onFilesChanged();
      }
      
      toast({
        title: "Note saved",
        description: "The file description has been updated.",
      });
      
      setIsEditingNote(false);
      setCurrentEditingFile(null);
      
    } catch (error) {
      console.error('Error saving note:', error);
      toast({
        title: "Error saving note",
        description: error instanceof Error ? error.message : "Failed to save the note",
        variant: "destructive",
      });
    }
  };

  // Function to format date safely
  const safeFormatDate = (dateString?: string) => {
    if (!dateString) return "Unknown date";
    return formatDate(dateString);
  };

  console.log("FileList permissions:", { canEdit, canDelete, userRole, userRoles, isCreatorView });
  
  const allSelected = displayFiles.length > 0 && 
    selectedFiles.size === displayFiles.filter(file => file.status !== 'uploading').length;
  const someSelected = selectedFiles.size > 0 && !allSelected;

  return (
    <>
      <div className="mb-4 flex items-center justify-between px-1">
        <div className="text-sm text-muted-foreground">
          {totalFiles} {totalFiles === 1 ? 'file' : 'files'}
          {uploadingFiles > 0 && (
            <span className="ml-2 text-primary">
              ({uploadingFiles} uploading)
            </span>
          )}
          {selectedFiles.size > 0 && (
            <span className="ml-2">
              | {selectedFiles.size} selected
            </span>
          )}
        </div>
        {selectedFiles.size > 0 && (
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={downloadSelected}
            >
              <Download className="h-3.5 w-3.5 mr-1" /> Download Selected
            </Button>
            {canDelete && (
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleDeleteSelected}
                className="text-red-500"
              >
                <Trash2 className="h-3.5 w-3.5 mr-1" /> Delete Selected
              </Button>
            )}
          </div>
        )}
      </div>

      <div className="rounded-md border overflow-hidden">
        <div className="grid grid-cols-[40px_1fr_100px_150px_120px] gap-3 px-4 py-3 font-medium text-xs border-b bg-muted/20">
          <div className="flex items-center">
            <Checkbox 
              checked={allSelected} 
              onCheckedChange={handleSelectAll}
              className="data-[state=indeterminate]:bg-primary"
              data-state={someSelected ? "indeterminate" : allSelected ? "checked" : "unchecked"}
            />
          </div>
          <div>Name</div>
          <div>Size</div>
          <div>Modified</div>
          <div className="text-right">Actions</div>
        </div>
        <div className="divide-y">
          {displayFiles.map((file) => {
            const isProcessing = processingFiles.has(file.id);
            const isChecked = selectedFiles.has(file.id);
            const isNewlyUploaded = recentlyUploadedIds.includes(file.id);
            const isUploading = file.status === 'uploading';
            
            return (
              <div
                key={file.id}
                className={`grid grid-cols-[40px_1fr_100px_150px_120px] gap-3 px-4 py-3 hover:bg-muted/10 transition-colors items-center ${
                  isNewlyUploaded ? 'border border-yellow-400 bg-yellow-50/10' : ''
                }`}
              >
                <div className="flex items-center">
                  <Checkbox 
                    checked={isChecked}
                    onCheckedChange={(checked) => handleSelectFile(file.id, !!checked)}
                    disabled={isProcessing || isUploading}
                  />
                </div>
                <div className="flex flex-col gap-1 overflow-hidden">
                  <div className="flex items-center gap-2">
                    {getFileIcon(file.type)}
                    <span className="truncate">{file.name}</span>
                  </div>
                  {file.description && (
                    <div className="text-xs text-muted-foreground truncate ml-6">
                      {file.description}
                    </div>
                  )}
                </div>
                <div className="text-xs text-muted-foreground">
                  {formatFileSize(file.size)}
                </div>
                <div className="text-xs text-muted-foreground">
                  {safeFormatDate(file.created_at)}
                </div>
                <div className="flex justify-end gap-2">
                  {isUploading ? (
                    <Button 
                      variant="ghost" 
                      size="sm"
                      disabled
                      className="h-7 px-2"
                    >
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    </Button>
                  ) : (
                    <>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        className="h-7 px-2"
                        disabled={isProcessing}
                        onClick={() => triggerDownload([file])}
                        aria-label={`Download ${file.name}`}
                      >
                        <Download className="h-3.5 w-3.5" />
                      </Button>

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleShare(file)}
                        className="h-7 px-2"
                        disabled={isProcessing}
                      >
                        <Share2 className="h-3.5 w-3.5" />
                      </Button>

                      {canEdit && (
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => openNoteEditor(file)}
                          className="h-7 px-2 text-blue-500 hover:text-blue-600"
                          disabled={isProcessing}
                          aria-label={`Add note to ${file.name}`}
                        >
                          <FileEdit className="h-3.5 w-3.5" />
                        </Button>
                      )}

                      {canDelete && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(file)}
                          className="h-7 px-2 text-red-500 hover:text-red-600"
                          disabled={isProcessing}
                        >
                          {isProcessing ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <Trash2 className="h-3.5 w-3.5" />
                          )}
                        </Button>
                      )}
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Note Editor Dialog */}
      <Dialog open={isEditingNote} onOpenChange={setIsEditingNote}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Note to File</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Label htmlFor="file-note">Note (max 200 characters)</Label>
            <Textarea
              id="file-note"
              value={noteContent}
              onChange={(e) => setNoteContent(e.target.value)}
              placeholder="Enter a description for this file..."
              className="mt-2"
              maxLength={200}
              rows={4}
            />
            <div className="text-right text-xs text-muted-foreground mt-1">
              {noteContent.length}/200 characters
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditingNote(false)}>
              Cancel
            </Button>
            <Button onClick={saveNote}>
              Save Note
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
