
export interface CreatorFileType {
  id: string;
  name: string;
  size: number;
  created_at: string;
  url: string;
  type: string;
  folder: string;
  status?: "uploading" | "complete";
  bucketPath?: string;
  isNewlyUploaded?: boolean;
  folderRefs?: string[]; // Array of folder IDs this file is associated with
  categoryRefs?: string[]; // Array of category IDs this file is associated with
  description?: string; // Field for file descriptions
  thumbnail_url?: string; // New field for video thumbnails
  tags?: string[]; // Added tags field for file tagging
}

export interface Folder {
  id: string;
  name: string;
  categoryId: string; // Making this required to fix type inconsistencies
}

export interface Category {
  id: string;
  name: string;
}

export interface FileOperationsHandlers {
  onCreateFolder: (folderName: string, fileIds: string[], categoryId: string) => Promise<void>;
  onCreateCategory: (categoryName: string) => Promise<void>;
  onAddFilesToFolder: (fileIds: string[], targetFolderId: string, categoryId: string) => Promise<void>;
  onDeleteFolder: (folderId: string) => Promise<void>;
  onDeleteCategory: (categoryId: string) => Promise<void>;
  onRemoveFromFolder?: (fileIds: string[], folderId: string) => Promise<void>;
  onRenameFolder?: (folderId: string, newFolderName: string) => Promise<void>;
  onRenameCategory?: (categoryId: string, newCategoryName: string) => Promise<void>;
}
