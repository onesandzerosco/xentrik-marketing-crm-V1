
// Types for the tags functionality
export interface FileTag {
  id: string;
  name: string;
  color: string;
}

export interface UseFileTagsProps {
  creatorId?: string;
}

export interface UseTagsReturnType {
  availableTags: FileTag[];
  selectedTags: string[];
  setSelectedTags: React.Dispatch<React.SetStateAction<string[]>>;
  isLoading: boolean;
  addTagToFiles: (fileIds: string[], tagId: string) => Promise<void>;
  removeTagFromFiles: (fileIds: string[], tagId: string) => Promise<void>;
  removeTagFromFile: (tagName: string, fileId: string) => Promise<void>;
  createTag: (name: string, color?: string) => Promise<FileTag>;
  deleteTag: (tagId: string) => Promise<void>;
  filterFilesByTags: (files: any[], tagNames: string[]) => any[];
  fetchTags: () => Promise<void>;
}
