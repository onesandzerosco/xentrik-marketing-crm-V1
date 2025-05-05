
export const formatFileSize = (bytes: number) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export const formatDate = (dateString: string) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  
  if (isNaN(date.getTime())) return '';
  
  const today = new Date();
  if (date.toDateString() === today.toDateString()) {
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  }
  
  if (date.getFullYear() === today.getFullYear()) {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }
  
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
};

export const getFileType = (extension: string): string => {
  const imageTypes = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp'];
  const documentTypes = ['pdf', 'doc', 'docx', 'txt', 'xls', 'xlsx', 'csv', 'rtf', 'ppt', 'pptx'];
  const videoTypes = ['mp4', 'webm', 'mov', 'avi', 'mkv', 'flv', 'wmv', 'mpg', 'mpeg', 'm4v'];
  const audioTypes = ['mp3', 'wav', 'ogg', 'flac', 'm4a', 'aac'];
  
  if (imageTypes.includes(extension)) return 'image';
  if (documentTypes.includes(extension)) return 'document';
  if (videoTypes.includes(extension)) return 'video';
  if (audioTypes.includes(extension)) return 'audio';
  
  return 'other';
};

export const getFileExtension = (filename: string): string => {
  return filename.split('.').pop()?.toLowerCase() || '';
};

// Generate a unique file name to handle collisions
export const getUniqueFileName = async (
  fileName: string, 
  folderPath: string, 
  creatorId: string, 
  bucket: string,
  supabase: any
) => {
  try {
    // Split the file name into base name and extension
    const lastDotIndex = fileName.lastIndexOf('.');
    const baseName = lastDotIndex !== -1 ? fileName.substring(0, lastDotIndex) : fileName;
    const extension = lastDotIndex !== -1 ? fileName.substring(lastDotIndex) : '';
    
    let counter = 0;
    let uniqueName = fileName;
    let isUnique = false;
    
    while (!isUnique) {
      // Try to list files that match the current folder
      const { data: existingFiles, error } = await supabase.storage
        .from(bucket)
        .list(`${creatorId}/${folderPath}`, {
          limit: 100
        });
      
      if (error) {
        console.error('Error checking for file existence:', error);
        break; // In case of error, just use the original file name
      }
      
      // Check if there's any file with the exact same name
      const exactMatch = existingFiles?.some((file: any) => file.name === uniqueName);
      
      if (!exactMatch) {
        isUnique = true;
      } else {
        counter++;
        // Format: filename (1).extension, filename (2).extension, etc.
        uniqueName = `${baseName} (${counter})${extension}`;
      }
      
      // Safety check to prevent infinite loops
      if (counter > 100) {
        uniqueName = `${baseName}_${Date.now()}${extension}`;
        isUnique = true;
      }
    }
    
    console.log(`Generated unique filename: ${uniqueName} from original: ${fileName}`);
    return uniqueName;
  } catch (error) {
    console.error('Error generating unique filename:', error);
    return `${Date.now()}_${fileName}`; // Fallback to timestamp
  }
};

// Calculate the number of chunks needed for a large file upload
export const calculateChunks = (fileSize: number, chunkSize: number = 5 * 1024 * 1024) => {
  return Math.ceil(fileSize / Math.pow(1024, 2) * 5); // Calculate chunks based on 5MB parts
};

// Check if a file is a video
export const isVideoFile = (fileName: string): boolean => {
  const extension = getFileExtension(fileName);
  return ['mp4', 'webm', 'mov', 'avi', 'mkv', 'flv', 'wmv', 'mpg', 'mpeg', 'm4v'].includes(extension);
};

// Generate a video thumbnail from a video file
export const generateVideoThumbnail = (videoFile: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    try {
      const video = document.createElement('video');
      video.preload = 'metadata';
      video.playsInline = true;
      video.muted = true;
      
      // Create object URL for the video file
      const url = URL.createObjectURL(videoFile);
      video.src = url;
      
      video.onloadedmetadata = () => {
        // Seek to a position to capture the thumbnail
        video.currentTime = Math.min(1, video.duration / 3);
        
        video.onseeked = () => {
          try {
            // Create canvas to draw the video frame
            const canvas = document.createElement('canvas');
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            
            const ctx = canvas.getContext('2d');
            if (!ctx) {
              URL.revokeObjectURL(url);
              reject(new Error('Could not get canvas context'));
              return;
            }
            
            // Draw video frame to canvas
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            
            // Convert canvas to data URL (thumbnail)
            const thumbnailUrl = canvas.toDataURL('image/jpeg', 0.7);
            URL.revokeObjectURL(url);
            resolve(thumbnailUrl);
          } catch (err) {
            URL.revokeObjectURL(url);
            reject(err);
          }
        };
        
        video.onerror = () => {
          URL.revokeObjectURL(url);
          reject(new Error('Error loading video'));
        };
      };
      
      video.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new Error('Error loading video'));
      };
      
    } catch (err) {
      reject(err);
    }
  });
};

// Helper function to handle chunked uploads
export const uploadFileInChunks = async (
  file: File,
  bucketName: string,
  filePath: string,
  onProgress: (progress: number) => void,
  supabase: any
): Promise<void> => {
  const CHUNK_SIZE = 10 * 1024 * 1024; // 10MB chunks
  const totalChunks = Math.ceil(file.size / CHUNK_SIZE);
  
  try {
    // Initialize the upload
    const { data: { uploadUrl }, error: urlError } = await supabase.storage
      .from(bucketName)
      .upload(filePath, new Blob([]), {
        upsert: true
      });
      
    if (urlError) {
      throw new Error(urlError.message || 'Failed to initialize upload');
    }
    
    let uploadedBytes = 0;
    
    // Upload each chunk
    for (let i = 0; i < totalChunks; i++) {
      const start = i * CHUNK_SIZE;
      const end = Math.min(start + CHUNK_SIZE, file.size);
      const chunk = file.slice(start, end);
      
      // For each chunk, update the file with the new chunk data
      const { error: chunkError } = await supabase.storage
        .from(bucketName)
        .upload(filePath, chunk, {
          upsert: true
        });
      
      if (chunkError) {
        throw new Error(`Failed to upload chunk ${i+1}: ${chunkError.message}`);
      }
      
      uploadedBytes += (end - start);
      const progress = Math.min((uploadedBytes / file.size) * 100, 99);
      onProgress(progress);
    }
    
    // Finalize the upload
    onProgress(100);
  } catch (error) {
    console.error("Error in chunked upload:", error);
    throw error;
  }
};

// Helper function to check if a file exceeds the maximum size (1GB by default)
export const isFileTooLarge = (file: File, maxSizeGB: number = 1): boolean => {
  const maxSizeBytes = maxSizeGB * 1024 * 1024 * 1024;
  return file.size > maxSizeBytes;
};
