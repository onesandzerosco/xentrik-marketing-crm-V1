import React, { useState } from 'react';
import { CreatorFileType } from '@/pages/CreatorFiles';
import { Button } from "@/components/ui/button";
import { Upload, Trash2, Share2, Download, CheckCircle, FileVideo, Play } from 'lucide-react';
import { formatFileSize } from '@/utils/fileUtils';
import { useToast } from "@/components/ui/use-toast";
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { Checkbox } from "@/components/ui/checkbox";
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

interface FileGridProps {
  files: CreatorFileType[];
  isCreatorView?: boolean;
  onFilesChanged?: () => void;
  recentlyUploadedIds?: string[];
  onUploadClick?: () => void;
  onSelectFiles?: (fileIds: string[]) => void;
}

export const FileGrid: React.FC<FileGridProps> = ({ 
  files, 
  isCreatorView = false, 
  onFilesChanged,
  recentlyUploadedIds = [],
  onUploadClick,
  onSelectFiles
}) => {
  const { toast } = useToast();
  const { userRole, userRoles } = useAuth();
  const isAdmin = userRole === "Admin";
  
  // Use our permission utility functions with both primary role and roles array
  const canDelete = canDeleteFiles(userRole, userRoles);
  const canEdit = canEditFileDescription(userRole, userRoles);
  
  const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set());
  const [processingFiles, setProcessingFiles] = useState<Set<string>>(new Set());
  
  // New state for note editing
  const [isEditingNote, setIsEditingNote] = useState(false);
  const [currentEditingFile, setCurrentEditingFile] = useState<CreatorFileType | null>(null);
  const [noteContent, setNoteContent] = useState("");
  
  // State for video preview
  const [videoPreview, setVideoPreview] = useState<{ file: CreatorFileType, isOpen: boolean }>({
    file: {} as CreatorFileType,
    isOpen: false
  });
  
  // Update parent component when selection changes
  const toggleFileSelection = (fileId: string) => {
    setSelectedFiles(prev => {
      const newSet = new Set(prev);
      if (newSet.has(fileId)) {
        newSet.delete(fileId);
      } else {
        newSet.add(fileId);
      }
      
      if (onSelectFiles) {
        onSelectFiles(Array.from(newSet));
      }
      
      return newSet;
    });
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
      
      setProcessingFiles(prev => {
        const newSet = new Set(prev);
        newSet.delete(file.id);
        return newSet;
      });

      // Also remove from selected files
      if (selectedFiles.has(file.id)) {
        toggleFileSelection(file.id);
      }
      
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
  
  const handleBulkDelete = async () => {
    const filesToDelete = files.filter(file => selectedFiles.has(file.id));
    
    for (const file of filesToDelete) {
      await handleDelete(file);
    }
  };

  const handleBulkDownload = () => {
    const filesToDownload = files.filter(file => selectedFiles.has(file.id));
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
  
  // Function to open video preview
  const openVideoPreview = (file: CreatorFileType) => {
    if (file.type === 'video') {
      setVideoPreview({
        file,
        isOpen: true
      });
    }
  };
  
  // Function to close video preview
  const closeVideoPreview = () => {
    setVideoPreview(prev => ({
      ...prev,
      isOpen: false
    }));
  };

  if (files.length === 0 && onUploadClick) {
    return (
      <div className="flex flex-col items-center justify-center border rounded-lg p-10 text-center h-full">
        <Upload className="h-8 w-8 mb-4 text-muted-foreground" />
        <h3 className="text-lg font-medium mb-2">No files available</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Upload files to see them here
        </p>
        <Button onClick={onUploadClick}>
          <Upload className="h-4 w-4 mr-2" />
          Upload Files
        </Button>
      </div>
    );
  }

  console.log("Permission check:", { canDelete, canEdit, userRole, userRoles, isCreatorView });

  return (
    <div>
      {/* Action buttons for selected files */}
      {selectedFiles.size > 0 && (
        <div className="flex items-center gap-2 mb-4">
          <Button
            variant="outline"
            size="sm"
            onClick={handleBulkDownload}
            className="flex items-center gap-1"
          >
            <Download className="h-4 w-4" />
            Download {selectedFiles.size} files
          </Button>
          
          {canDelete && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleBulkDelete}
              className="flex items-center gap-1 text-destructive border-destructive hover:bg-destructive/10"
            >
              <Trash2 className="h-4 w-4" />
              Delete {selectedFiles.size} files
            </Button>
          )}
        </div>
      )}
      
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {files.map((file) => {
          const isProcessing = processingFiles.has(file.id);
          const isSelected = selectedFiles.has(file.id);
          const isNewlyUploaded = recentlyUploadedIds.includes(file.id);
          const isVideo = file.type === 'video';
          
          return (
            <div 
              key={file.id} 
              className={`relative border rounded-lg overflow-hidden group ${
                isSelected ? 'ring-2 ring-primary' : ''
              } ${isNewlyUploaded ? 'border border-yellow-400' : ''}`}
              onClick={() => toggleFileSelection(file.id)}
            >
              {/* Add checkbox in the top right */}
              <div className="absolute top-2 right-2 z-10">
                <Checkbox 
                  checked={isSelected}
                  onCheckedChange={() => toggleFileSelection(file.id)}
                  onClick={(e) => e.stopPropagation()}
                  className="h-5 w-5 border-2 bg-background/80 hover:bg-background"
                />
              </div>
              
              <div className="aspect-square bg-muted/20 flex items-center justify-center">
                {file.type === 'image' ? (
                  <img 
                    src={file.url} 
                    alt={file.name}
                    className="object-cover w-full h-full"
                  />
                ) : isVideo ? (
                  <div className="w-full h-full relative group cursor-pointer"
                       onClick={(e) => {
                         e.stopPropagation();
                         openVideoPreview(file);
                       }}>
                    {file.thumbnail_url ? (
                      <img 
                        src={file.thumbnail_url} 
                        alt={file.name}
                        className="object-cover w-full h-full"
                      />
                    ) : (
                      <div className="flex flex-col items-center justify-center w-full h-full bg-black/5 absolute inset-0">
                        <FileVideo className="h-10 w-10 text-muted-foreground" />
                        <span className="text-xs mt-2 text-muted-foreground">Click to preview</span>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                      <Button 
                        variant="secondary" 
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          openVideoPreview(file);
                        }}
                        className="flex items-center gap-1.5"
                      >
                        <Play className="h-4 w-4" />
                        Play Video
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="text-3xl font-light text-muted-foreground">
                    {file.name.split('.').pop()?.toUpperCase()}
                  </div>
                )}
              </div>
              
              <div className="p-3">
                <p className="truncate text-sm font-medium">{file.name}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {formatFileSize(file.size)}
                </p>
                {file.description && (
                  <p className="text-xs text-muted-foreground mt-1 truncate">
                    {file.description}
                  </p>
                )}
              </div>
              
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-background to-transparent p-3 pt-6 opacity-0 group-hover:opacity-100 transition-opacity flex justify-end gap-1">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-8 w-8 p-0"
                  onClick={(e) => {
                    e.stopPropagation();
                    triggerDownload([file]);
                  }}
                >
                  <Download className="h-4 w-4" />
                </Button>
                
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-8 w-8 p-0"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleShare(file);
                  }}
                >
                  <Share2 className="h-4 w-4" />
                </Button>
                
                {/* Show edit button to users with canEdit permission */}
                {canEdit && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-8 w-8 p-0 text-blue-500 hover:text-blue-600"
                    onClick={(e) => {
                      e.stopPropagation();
                      openNoteEditor(file);
                    }}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M14 3v4a1 1 0 0 0 1 1h4" />
                      <path d="M17 21H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h7l5 5v11a2 2 0 0 1-2 2z" />
                      <line x1="9" y1="9" x2="10" y2="9" />
                      <line x1="9" y1="13" x2="15" y2="13" />
                      <line x1="9" y1="17" x2="15" y2="17" />
                    </svg>
                  </Button>
                )}

                {/* Only show delete button to users with canDelete permission */}
                {canDelete && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 text-red-500 hover:text-red-600"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(file);
                    }}
                    disabled={isProcessing}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          );
        })}
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
      
      {/* Video Preview Dialog */}
      <Dialog open={videoPreview.isOpen} onOpenChange={closeVideoPreview}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>{videoPreview.file.name}</DialogTitle>
          </DialogHeader>
          <div className="aspect-video w-full bg-black rounded-md overflow-hidden">
            {videoPreview.isOpen && videoPreview.file.url && (
              <video 
                src={videoPreview.file.url} 
                controls 
                autoPlay
                className="w-full h-full"
              />
            )}
          </div>
          <DialogFooter className="sm:justify-between">
            <div className="text-sm text-muted-foreground">
              {videoPreview.file.description && (
                <p>{videoPreview.file.description}</p>
              )}
            </div>
            <Button onClick={closeVideoPreview}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
