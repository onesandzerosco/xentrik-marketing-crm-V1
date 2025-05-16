
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
  description?: string; // Field for file descriptions
  thumbnail_url?: string; // New field for video thumbnails
}

export interface Folder {
  id: string;
  name: string;
  parentId?: string | null; // ID of parent folder, null for root folders
  isCategory?: boolean; // Flag to indicate if this is a category folder
}

export interface FileOperationsHandlers {
  onCreateFolder: (folderName: string, fileIds: string[], parentId?: string | null, isCategory?: boolean) => Promise<void>;
  onAddFilesToFolder: (fileIds: string[], targetFolderId: string) => Promise<void>;
  onDeleteFolder: (folderId: string) => Promise<void>;
  onRemoveFromFolder?: (fileIds: string[], folderId: string) => Promise<void>;
  onRenameFolder?: (folderId: string, newFolderName: string) => Promise<void>;
}
