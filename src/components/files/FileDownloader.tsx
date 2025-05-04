import React, { useState, useEffect, useRef } from 'react';
import { Progress } from '@/components/ui/progress';
import { X } from 'lucide-react';

interface DownloadStatus {
  id: string;
  name: string;
  progress: number;
  status: 'downloading' | 'complete' | 'error';
  error?: string;
}

export const FileDownloader: React.FC = () => {
  const [showProgress, setShowProgress] = useState(false);
  const [downloads, setDownloads] = useState<DownloadStatus[]>([]);
  const [overallProgress, setOverallProgress] = useState(0);
  
  // Create a custom event to trigger downloads
  useEffect(() => {
    const handleDownloadRequest = (event: CustomEvent) => {
      const { files } = event.detail;
      if (files && files.length > 0) {
        startDownload(files);
      }
    };

    // Add event listener with type assertion
    window.addEventListener('fileDownloadRequest', 
      handleDownloadRequest as EventListener);
    
    return () => {
      window.removeEventListener('fileDownloadRequest', 
        handleDownloadRequest as EventListener);
    };
  }, []);

  const calculateOverallProgress = (downloads: DownloadStatus[]) => {
    if (downloads.length === 0) return 0;
    const totalProgress = downloads.reduce((sum, download) => sum + download.progress, 0);
    return totalProgress / downloads.length;
  };

  const startDownload = async (files: any[]) => {
    if (files.length === 0) return;
    
    setShowProgress(true);
    
    // Initialize download statuses
    const initialStatuses: DownloadStatus[] = files.map(file => ({
      id: file.id,
      name: file.name,
      progress: 0,
      status: 'downloading'
    }));
    
    setDownloads(initialStatuses);
    setOverallProgress(0);
    
    // Process each file download
    for (const file of files) {
      try {
        await downloadFile(file);
      } catch (error) {
        console.error(`Error downloading ${file.name}:`, error);
        // Update status to error
        setDownloads(prevDownloads => 
          prevDownloads.map(download => 
            download.id === file.id 
              ? { 
                  ...download, 
                  status: 'error', 
                  error: error instanceof Error ? error.message : 'Download failed' 
                } 
              : download
          )
        );
      }
    }
    
    // Keep progress visible for a short time after completion
    setTimeout(() => {
      const allComplete = downloads.every(d => d.status === 'complete' || d.status === 'error');
      if (allComplete) {
        // Optionally hide after some time
        // setShowProgress(false);
      }
    }, 3000);
  };

  const downloadFile = async (file: any) => {
    return new Promise<void>((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open('GET', file.url, true);
      xhr.responseType = 'blob';
      
      // Set up progress tracking
      xhr.onprogress = (event) => {
        if (event.lengthComputable) {
          const percentComplete = Math.round((event.loaded / event.total) * 100);
          
          // Update this download's progress
          setDownloads(prevDownloads => 
            prevDownloads.map(download => 
              download.id === file.id 
                ? { ...download, progress: percentComplete } 
                : download
            )
          );
          
          // Recalculate overall progress
          setDownloads(prevDownloads => {
            const newOverall = calculateOverallProgress(prevDownloads);
            setOverallProgress(newOverall);
            return prevDownloads;
          });
        }
      };
      
      xhr.onload = function() {
        if (this.status === 200) {
          // Create a blob from the response
          const blob = new Blob([this.response], { type: file.type || 'application/octet-stream' });
          const url = window.URL.createObjectURL(blob);
          
          // Create a link and trigger download
          const a = document.createElement('a');
          a.style.display = 'none';
          a.href = url;
          a.download = file.name;
          document.body.appendChild(a);
          a.click();
          
          // Clean up
          window.URL.revokeObjectURL(url);
          document.body.removeChild(a);
          
          // Update status to complete
          setDownloads(prevDownloads => 
            prevDownloads.map(download => 
              download.id === file.id 
                ? { ...download, progress: 100, status: 'complete' } 
                : download
            )
          );
          
          resolve();
        } else {
          reject(new Error(`HTTP error: ${this.status}`));
        }
      };
      
      xhr.onerror = function() {
        reject(new Error('Network error during download'));
      };
      
      xhr.send();
    });
  };

  if (!showProgress || downloads.length === 0) {
    return null;
  }

  return (
    <div className="fixed bottom-5 right-5 bg-background border border-border rounded-md shadow-lg p-4 w-80 z-50">
      <div className="flex justify-between items-center mb-2">
        <h3 className="font-medium">Downloading Files</h3>
        <button 
          onClick={() => setShowProgress(false)} 
          className="text-muted-foreground hover:text-foreground"
          aria-label="Close download progress"
        >
          <X size={16} />
        </button>
      </div>
      
      <div className="mb-4">
        <div className="flex justify-between text-sm mb-1">
          <span>Overall progress</span>
          <span>{Math.round(overallProgress)}%</span>
        </div>
        <Progress value={overallProgress} className="h-2" />
      </div>
      
      <div className="max-h-40 overflow-y-auto space-y-3">
        {downloads.map((download) => (
          <div key={download.id} className="text-sm">
            <div className="flex justify-between mb-1">
              <span className="truncate max-w-[180px]" title={download.name}>{download.name}</span>
              <span>{Math.round(download.progress)}%</span>
            </div>
            <Progress value={download.progress} className="h-1.5" />
            {download.error && <p className="text-xs text-destructive mt-1">{download.error}</p>}
          </div>
        ))}
      </div>
    </div>
  );
};
