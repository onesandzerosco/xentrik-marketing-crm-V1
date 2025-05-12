
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

export interface FileProgress {
  uploadingFiles: UploadingFile[];
  overallProgress: number;
  setUploadingFiles: React.Dispatch<React.SetStateAction<UploadingFile[]>>;
  setOverallProgress: React.Dispatch<React.SetStateAction<number>>;
  updateFileProgress: (fileName: string, progress: number, status?: 'uploading' | 'processing' | 'complete' | 'error') => void;
  updateFileStatus: (fileName: string, status: 'uploading' | 'processing' | 'complete' | 'error', error?: string) => void;
  calculateOverallProgress: () => number;
}

export interface ZipProcessingOptions {
  creatorId: string;
  currentFolder: string;
  updateFileProgress: (fileName: string, progress: number) => void;
  updateFileStatus: (fileName: string, status: 'uploading' | 'processing' | 'complete' | 'error', error?: string) => void;
}
