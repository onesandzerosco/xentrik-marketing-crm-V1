
export interface ZipProcessingOptions {
  creatorId: string;
  currentFolder: string;
  categoryId?: string; // Make categoryId an optional property
  updateFileProgress: (fileName: string, progress: number) => void;
  updateFileStatus: (fileName: string, status: 'uploading' | 'processing' | 'complete' | 'error', error?: string) => void;
}
