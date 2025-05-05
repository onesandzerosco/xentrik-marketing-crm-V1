
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
}

export interface FileOperationsHandlers {
  onCreateFolder: (folderName: string, fileIds: string[]) => Promise<void>;
  onAddFilesToFolder: (fileIds: string[], targetFolderId: string) => Promise<void>;
  onDeleteFolder: (folderId: string) => Promise<void>;
  onRemoveFromFolder?: (fileIds: string[], folderId: string) => Promise<void>;
}
