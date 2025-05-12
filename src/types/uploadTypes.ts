
export interface UploadingFile {
  file: File;
  progress: number;
  status: 'uploading' | 'processing' | 'complete' | 'error';
  error?: string;
  thumbnail?: string;
}

export interface FileUploadOptions {
  creatorId: string;
  onUploadComplete?: (uploadedFileIds?: string[]) => void;
  currentFolder: string;
}
