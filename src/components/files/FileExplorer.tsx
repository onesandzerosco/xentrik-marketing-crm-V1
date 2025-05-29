
import React from 'react';
import { FileExplorerModals } from './explorer/FileExplorerModals';
import { useFileExplorer } from './explorer/useFileExplorer';
import { MoreHorizontal, Edit, Trash2, Plus, FolderPlus, StickyNote, Tag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import {
  Card,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Skeleton } from "@/components/ui/skeleton";
import { CreatorFileType, Category, Folder } from '@/types/fileTypes';

interface FileExplorerProps {
  files: CreatorFileType[];
  creatorName: string;
  creatorId: string;
  isLoading: boolean;
  onRefresh: () => void;
  onFolderChange: (folderId: string) => void;
  currentFolder: string;
  onCategoryChange: (categoryId: string | null) => void;
  currentCategory: string | null;
  availableFolders: Folder[];
  availableCategories: Category[];
  isCreatorView?: boolean;
  onUploadComplete?: (fileIds?: string[]) => void;
  onUploadStart?: () => void;
  recentlyUploadedIds?: string[];
  onCreateFolder: (folderName: string, fileIds: string[], categoryId: string) => Promise<void>;
  onCreateCategory: (categoryName: string) => Promise<void>;
  onAddFilesToFolder: (fileIds: string[], targetFolderId: string, categoryId: string) => Promise<void>;
  onDeleteFolder: (folderId: string) => Promise<void>;
  onDeleteCategory: (categoryId: string) => Promise<void>;
  onRemoveFromFolder?: (fileIds: string[], folderId: string) => Promise<void>;
  onRenameFolder?: (folderId: string, newName: string) => Promise<void>;
  onRenameCategory?: (categoryId: string, newName: string) => Promise<void>;
}

export const FileExplorer: React.FC<FileExplorerProps> = ({
  files,
  creatorName,
  creatorId,
  isLoading,
  onRefresh,
  onFolderChange,
  currentFolder,
  onCategoryChange,
  currentCategory,
  availableFolders,
  availableCategories,
  isCreatorView = false,
  onUploadComplete,
  onUploadStart,
  recentlyUploadedIds = [],
  onCreateFolder,
  onCreateCategory,
  onAddFilesToFolder,
  onDeleteFolder,
  onDeleteCategory,
  onRemoveFromFolder,
  onRenameFolder,
  onRenameCategory
}) => {
  const {
    selectedFileIds,
    setSelectedFileIds,
    handleFileDeleted,
    isAddCategoryModalOpen,
    setIsAddCategoryModalOpen,
    isCreateFolderModalOpen,
    setIsCreateFolderModalOpen,
    isAddToFolderModalOpen,
    setIsAddToFolderModalOpen,
    isUploadModalOpen,
    setIsUploadModalOpen,
    isDeleteFolderModalOpen,
    setIsDeleteFolderModalOpen,
    isDeleteCategoryModalOpen,
    setIsDeleteCategoryModalOpen,
    isFileNoteModalOpen,
    setIsFileNoteModalOpen,
    handleAddToFolderClick,
    searchQuery,
    setSearchQuery,
    selectedTypes,
    setSelectedTypes,
    viewMode,
    setViewMode,
    handleEditNote,
    fileToEdit,
    setFileToEdit,
    filteredFiles,
    selectedTags, 
    setSelectedTags,
    availableTags,
    onTagCreate,
    handleAddTagClick,
    handleAddTagToFile,
    isAddTagModalOpen,
    setIsAddTagModalOpen,
    onAddTagToFiles,
    onRemoveTagFromFiles,
    availableCategories: availableCategoriesFromHook
  } = useFileExplorer({
    files,
    availableFolders,
    availableCategories,
    currentFolder,
    currentCategory,
    onRefresh,
    onCategoryChange,
    onCreateFolder,
    onCreateCategory,
    onAddFilesToFolder,
    onDeleteFolder,
    onDeleteCategory,
    onRemoveFromFolder,
    onRenameFolder,
    onRenameCategory,
    creatorId
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Files for {creatorName}</h1>
        <div className="flex items-center space-x-2">
          <Button onClick={() => setIsUploadModalOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Upload
          </Button>
          {selectedFileIds.length > 0 && isCreatorView && (
            <Button variant="outline" onClick={handleAddToFolderClick}>
              <FolderPlus className="w-4 h-4 mr-2" />
              Add to Folder
            </Button>
          )}
        </div>
      </div>

      <div className="flex items-center space-x-4">
        <Input
          type="search"
          placeholder="Search files..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <Select onValueChange={(value) => setSelectedTypes(value === 'all' ? [] : [value])}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="image">Images</SelectItem>
            <SelectItem value="video">Videos</SelectItem>
            <SelectItem value="audio">Audio</SelectItem>
            <SelectItem value="application">Documents</SelectItem>
          </SelectContent>
        </Select>
        <Select onValueChange={(value) => setViewMode(value as 'grid' | 'list')}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="View Mode" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="grid">Grid View</SelectItem>
            <SelectItem value="list">List View</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Separator />

      <div className="flex space-x-4">
        <div className="w-64">
          <h3 className="text-lg font-semibold mb-2">Folders</h3>
          <ScrollArea className="h-[400px] rounded-md border">
            <div className="p-2 space-y-1">
              <Button variant="ghost" className="w-full justify-start" onClick={() => { onFolderChange('all'); onCategoryChange(null); }}>
                All Files
              </Button>
              <Button variant="ghost" className="w-full justify-start" onClick={() => { onFolderChange('unsorted'); onCategoryChange(null); }}>
                Unsorted Uploads
              </Button>
              <Separator />
              {availableCategories.map(category => (
                <div key={category.id}>
                  <h4 className="text-sm font-semibold px-2 mt-2">{category.name}</h4>
                  {availableFolders
                    .filter(folder => folder.categoryId === category.id)
                    .map(folder => (
                      <Button
                        key={folder.id}
                        variant="ghost"
                        className="w-full justify-start pl-4"
                        onClick={() => { onFolderChange(folder.id); onCategoryChange(category.id); }}
                      >
                        {folder.name}
                      </Button>
                    ))}
                </div>
              ))}
            </div>
          </ScrollArea>
          {isCreatorView && (
            <Button variant="outline" className="w-full mt-2" onClick={() => setIsAddCategoryModalOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Category
            </Button>
          )}
        </div>

        <div className="flex-1">
          {isLoading ? (
            <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <Card key={i}>
                  <CardContent className="aspect-video">
                    <Skeleton className="h-full w-full" />
                  </CardContent>
                  <CardFooter>
                    <Skeleton className="h-4 w-32" />
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : filteredFiles.length === 0 ? (
            <div className="p-8 text-center">
              <h2 className="text-xl font-semibold">No files found</h2>
              <p className="mt-2">
                {searchQuery
                  ? `No files match your search query "${searchQuery}".`
                  : currentFolder === 'all'
                    ? 'Upload some files to get started.'
                    : `This folder is empty. Upload some files or move existing files here.`}
              </p>
            </div>
          ) : viewMode === 'grid' ? (
            <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-4">
              {filteredFiles.map(file => (
                <Card key={file.id} className={selectedFileIds.includes(file.id) ? 'border-2 border-primary' : ''}>
                  <CardContent className="aspect-video relative">
                    {file.type.startsWith('image') ? (
                      <img
                        src={file.url}
                        alt={file.name}
                        className="object-cover h-full w-full rounded-md"
                      />
                    ) : file.type.startsWith('video') ? (
                      <>
                        {file.thumbnail_url ? (
                          <img
                            src={file.thumbnail_url}
                            alt={file.name}
                            className="object-cover h-full w-full rounded-md"
                          />
                        ) : (
                          <div className="flex items-center justify-center h-full w-full bg-gray-100 rounded-md">
                            <p className="text-gray-500">No Thumbnail</p>
                          </div>
                        )}
                        <video
                          src={file.url}
                          className="hidden"
                        />
                      </>
                    ) : (
                      <div className="flex items-center justify-center h-full w-full bg-gray-100 rounded-md">
                        <p className="text-gray-500">{file.type}</p>
                      </div>
                    )}
                    <div className="absolute top-2 right-2">
                      <input
                        type="checkbox"
                        className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                        checked={selectedFileIds.includes(file.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedFileIds(prev => [...prev, file.id]);
                          } else {
                            setSelectedFileIds(prev => prev.filter(id => id !== file.id));
                          }
                        }}
                      />
                    </div>
                  </CardContent>
                  <CardFooter className="flex items-center justify-between">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <p className="text-sm font-medium truncate">{file.name}</p>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{file.name}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    {isCreatorView && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem onClick={() => handleEditNote(file)}>
                            <StickyNote className="w-4 h-4 mr-2" />
                            Edit Note
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleAddTagToFile(file)}>
                            <Tag className="w-4 h-4 mr-2" />
                            Add Tag
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => handleFileDeleted(file.id)}>
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Size</TableHead>
                  <TableHead>Uploaded</TableHead>
                  {isCreatorView && <TableHead className="text-right">Actions</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredFiles.map(file => (
                  <TableRow key={file.id}>
                    <TableCell className="font-medium">{file.name}</TableCell>
                    <TableCell>{file.type}</TableCell>
                    <TableCell>{(file.size / 1024).toFixed(2)} KB</TableCell>
                    <TableCell>{new Date(file.created_at).toLocaleDateString()}</TableCell>
                    {isCreatorView && (
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <span className="sr-only">Open menu</span>
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem onClick={() => handleEditNote(file)}>
                              <StickyNote className="w-4 h-4 mr-2" />
                              Edit Note
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleAddTagToFile(file)}>
                              <Tag className="w-4 h-4 mr-2" />
                              Add Tag
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => handleFileDeleted(file.id)}>
                              <Trash2 className="w-4 h-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </div>
      
      <FileExplorerModals
        onRefresh={onRefresh}
        onUploadComplete={onUploadComplete}
        onUploadStart={onUploadStart}
        creatorId={creatorId}
        currentFolder={currentFolder}
        currentCategory={currentCategory}
        availableCategories={availableCategories}
        availableFolders={availableFolders}
        fileExplorerState={{
          isUploadModalOpen: isUploadModalOpen,
          setIsUploadModalOpen: setIsUploadModalOpen,
          isAddToFolderModalOpen: isAddToFolderModalOpen,
          setIsAddToFolderModalOpen: setIsAddToFolderModalOpen,
          isCreateFolderModalOpen: isCreateFolderModalOpen,
          setIsCreateFolderModalOpen: setIsCreateFolderModalOpen,
          isAddCategoryModalOpen: isAddCategoryModalOpen,
          setIsAddCategoryModalOpen: setIsAddCategoryModalOpen,
          isDeleteFolderModalOpen: isDeleteFolderModalOpen,
          setIsDeleteFolderModalOpen: setIsDeleteFolderModalOpen,
          isDeleteCategoryModalOpen: isDeleteCategoryModalOpen,
          setIsDeleteCategoryModalOpen: setIsDeleteCategoryModalOpen,
          isFileNoteModalOpen: isFileNoteModalOpen,
          setIsFileNoteModalOpen: setIsFileNoteModalOpen,
          fileToEdit: fileToEdit,
          setFileToEdit: setFileToEdit,
          selectedFileIds: selectedFileIds,
          isAddTagModalOpen: isAddTagModalOpen,
          setIsAddTagModalOpen: setIsAddTagModalOpen,
          availableTags: availableTags,
          onAddTagToFiles: onAddTagToFiles,
          onRemoveTagFromFiles: onRemoveTagFromFiles,
          onTagCreate: onTagCreate
        }}
      />
    </div>
  );
};
