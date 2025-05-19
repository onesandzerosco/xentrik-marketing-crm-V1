
import React from 'react';
import { CreatorFileType } from '@/types/fileTypes';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { 
  Download, 
  Trash2, 
  Pencil, 
  FolderPlus,
  Tag,
  FolderMinus 
} from 'lucide-react';
import { formatFileSize, formatDate } from '@/utils/fileUtils';
import { useFilePermissions } from '@/utils/permissionUtils';

interface FileListProps {
  files: CreatorFileType[];
  isCreatorView: boolean;
  onFileDeleted: (fileId: string) => void;
  recentlyUploadedIds: string[];
  onSelectFiles: (fileIds: string[]) => void;
  onAddToFolderClick: () => void;
  currentFolder: string;
  availableFolders: Array<{ id: string; name: string; categoryId: string }>;
  onRemoveFromFolder?: (fileIds: string[], folderId: string) => Promise<void>;
  onEditNote: (file: CreatorFileType) => void;
  onAddTagClick?: () => void;
  viewMode: 'grid' | 'list';
}

export const FileList: React.FC<FileListProps> = ({
  files,
  isCreatorView,
  onFileDeleted,
  recentlyUploadedIds,
  onSelectFiles,
  onAddToFolderClick,
  currentFolder,
  availableFolders,
  onRemoveFromFolder,
  onEditNote,
  onAddTagClick,
  viewMode
}) => {
  const { canDelete, canEdit } = useFilePermissions();
  const [selectedFileIds, setSelectedFileIds] = React.useState<string[]>([]);

  // Toggle a file's selected state
  const toggleFileSelection = (fileId: string) => {
    const newSelectedIds = selectedFileIds.includes(fileId)
      ? selectedFileIds.filter(id => id !== fileId)
      : [...selectedFileIds, fileId];
    
    setSelectedFileIds(newSelectedIds);
    onSelectFiles(newSelectedIds);
  };

  // Handle when a single file's tag button is clicked
  const handleSingleFileTagClick = (file: CreatorFileType) => {
    // Select only this file and trigger the tag modal
    setSelectedFileIds([file.id]);
    onSelectFiles([file.id]);
    if (onAddTagClick) {
      onAddTagClick();
    }
  };

  return (
    <div className="min-w-full overflow-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-muted/30">
          <tr>
            {isCreatorView && (
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <Checkbox 
                  checked={selectedFileIds.length === files.length && files.length > 0} 
                  onCheckedChange={(checked) => {
                    if (checked) {
                      const allFileIds = files.map(file => file.id);
                      setSelectedFileIds(allFileIds);
                      onSelectFiles(allFileIds);
                    } else {
                      setSelectedFileIds([]);
                      onSelectFiles([]);
                    }
                  }}
                />
              </th>
            )}
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">File</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Size</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {files.map((file) => {
            const isNew = recentlyUploadedIds?.includes(file.id);
            const isSelected = selectedFileIds.includes(file.id);
            
            return (
              <tr 
                key={file.id} 
                className={`${isNew ? 'bg-green-50' : ''} ${isSelected ? 'bg-muted/30' : ''} hover:bg-muted/20`}
              >
                {isCreatorView && (
                  <td className="px-4 py-4 whitespace-nowrap">
                    <Checkbox 
                      checked={isSelected}
                      onCheckedChange={() => toggleFileSelection(file.id)}
                    />
                  </td>
                )}
                <td className="px-4 py-4">
                  <div className="flex items-center">
                    {file.type === 'image' && file.url ? (
                      <img 
                        src={file.url} 
                        alt={file.name} 
                        className="h-10 w-10 rounded object-cover mr-3" 
                      />
                    ) : (
                      <div className="h-10 w-10 rounded bg-muted flex items-center justify-center mr-3">
                        {file.type === 'video' && '🎥'}
                        {file.type === 'audio' && '🎵'}
                        {file.type === 'document' && '📄'}
                        {!['video', 'audio', 'document', 'image'].includes(file.type) && '📁'}
                      </div>
                    )}
                    <div>
                      <div className="text-sm font-medium text-gray-900 truncate max-w-[200px]">
                        {file.name}
                      </div>
                      {file.description && (
                        <div className="text-xs text-muted-foreground italic truncate max-w-[200px]">
                          {file.description}
                        </div>
                      )}
                      {file.tags && file.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {file.tags.map((tagId) => (
                            <span 
                              key={tagId} 
                              className="text-xs bg-purple-100 text-purple-800 rounded-full px-2 py-0.5"
                            >
                              {tagId}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </td>
                <td className="px-4 py-4 whitespace-nowrap">
                  <span className="text-sm text-muted-foreground capitalize">{file.type}</span>
                </td>
                <td className="px-4 py-4 whitespace-nowrap">
                  <span className="text-sm text-muted-foreground">{formatFileSize(file.size)}</span>
                </td>
                <td className="px-4 py-4 whitespace-nowrap">
                  <span className="text-sm text-muted-foreground">{formatDate(file.created_at)}</span>
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex space-x-1">
                    <a href={file.url} download={file.name} className="inline-block">
                      <Button variant="outline" size="icon" className="h-8 w-8">
                        <Download className="h-4 w-4" />
                      </Button>
                    </a>
                    
                    {canEdit && (
                      <Button 
                        variant="outline" 
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => onEditNote(file)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                    )}

                    {canEdit && onAddTagClick && (
                      <Button 
                        variant="outline" 
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => handleSingleFileTagClick(file)}
                      >
                        <Tag className="h-4 w-4" />
                      </Button>
                    )}
                    
                    {currentFolder !== 'all' && currentFolder !== 'unsorted' && onRemoveFromFolder && canEdit && (
                      <Button 
                        variant="outline" 
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => onRemoveFromFolder([file.id], currentFolder)}
                      >
                        <FolderMinus className="h-4 w-4" />
                      </Button>
                    )}
                    
                    {canDelete && (
                      <Button 
                        variant="outline" 
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => onFileDeleted(file.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
