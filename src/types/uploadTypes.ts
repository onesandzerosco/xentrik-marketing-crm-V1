
export interface ZipProcessingOptions {
  creatorId: string;
  currentFolder: string;
  categoryId?: string; // Make categoryId an optional property
  updateFileProgress: (fileName: string, progress: number) => void;
  updateFileStatus: (fileName: string, status: 'uploading' | 'processing' | 'complete' | 'error', error?: string) => void;
}

export interface UploadingFile {
  file: File;
  progress: number;
  status: 'uploading' | 'processing' | 'complete' | 'error';
  error?: string;
}

export interface FileProgress {
  uploadingFiles: UploadingFile[];
  overallProgress: number;
  setUploadingFiles: (files: UploadingFile[]) => void;
  setOverallProgress: (progress: number) => void;
  updateFileProgress: (fileName: string, progress: number, status?: 'uploading' | 'processing' | 'complete' | 'error') => void;
  updateFileStatus: (fileName: string, status: 'uploading' | 'processing' | 'complete' | 'error', error?: string) => void;
  calculateOverallProgress: () => number;
}

export interface FileUploadOptions {
  creatorId: string;
  onUploadComplete?: (fileIds?: string[]) => void;
  currentFolder: string;
}
