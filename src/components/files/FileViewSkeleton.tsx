
import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';

interface FileViewSkeletonProps {
  viewMode: 'grid' | 'list';
}

export const FileViewSkeleton: React.FC<FileViewSkeletonProps> = ({ viewMode }) => {
  if (viewMode === 'list') {
    return (
      <div className="p-4 space-y-3">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex items-center space-x-4 py-2">
            <Skeleton className="h-8 w-8 rounded-md" />
            <Skeleton className="h-5 w-full max-w-[200px]" />
            <Skeleton className="h-4 w-16 ml-auto" />
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-8 w-8 rounded-full" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 p-4">
      {[...Array(10)].map((_, i) => (
        <div key={i} className="flex flex-col">
          <Skeleton className="h-32 w-full rounded-md mb-2" />
          <Skeleton className="h-5 w-3/4 mb-1" />
          <div className="flex justify-between">
            <Skeleton className="h-3 w-10" />
            <Skeleton className="h-3 w-16" />
          </div>
        </div>
      ))}
    </div>
  );
};
