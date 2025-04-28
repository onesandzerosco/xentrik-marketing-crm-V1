
import React from 'react';
import { Search } from 'lucide-react';
import { Input } from "@/components/ui/input";
import { BackButton } from '@/components/ui/back-button';

interface FileHeaderProps {
  creatorName: string;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export const FileHeader: React.FC<FileHeaderProps> = ({
  creatorName,
  searchQuery,
  onSearchChange,
}) => {
  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <BackButton to="/shared-files" />
        <div>
          <h1 className="text-2xl font-semibold">{creatorName}&apos;s Files</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Browse and manage shared files
          </p>
        </div>
      </div>

      <div className="max-w-md">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input 
            placeholder="Search files..." 
            className="pl-10"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
      </div>
    </div>
  );
};
