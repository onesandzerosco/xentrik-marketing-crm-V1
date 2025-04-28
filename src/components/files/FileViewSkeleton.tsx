
import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';

interface FileViewSkeletonProps {
  viewMode: 'grid' | 'list';
}

export const FileViewSkeleton: React.FC<FileViewSkeletonProps> = ({ viewMode }) => {
  if (viewMode === 'list') {
    return (
      <div className="rounded-md border overflow-hidden">
        <div className="grid grid-cols-[1fr_100px_150px_80px] gap-3 px-4 py-3 font-medium text-xs border-b bg-muted/20">
          <div>Name</div>
          <div>Size</div>
          <div>Modified</div>
          <div className="text-right">Action</div>
        </div>
        <div className="divide-y">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="grid grid-cols-[1fr_100px_150px_80px] gap-3 px-4 py-3 items-center">
              <div className="flex items-center gap-2">
                <Skeleton className="h-4 w-4 rounded-full" />
                <Skeleton className="h-4 w-40" />
              </div>
              <Skeleton className="h-3 w-12" />
              <Skeleton className="h-3 w-24" />
              <div className="text-right">
                <Skeleton className="h-7 w-7 rounded-md ml-auto" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
      {[...Array(12)].map((_, i) => (
        <div key={i} className="border rounded-lg overflow-hidden">
          <Skeleton className="aspect-square" />
          <div className="p-2">
            <Skeleton className="h-4 w-3/4 mb-1" />
            <div className="flex justify-between">
              <Skeleton className="h-3 w-10" />
              <Skeleton className="h-3 w-16" />
            </div>
          </div>
          <div className="px-2 pb-2">
            <Skeleton className="h-8 w-full rounded-md" />
          </div>
        </div>
      ))}
    </div>
  );
};
