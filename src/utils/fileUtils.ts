
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
  const videoTypes = ['mp4', 'webm', 'mov', 'avi', 'mkv', 'flv', 'wmv'];
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
    const baseName = fileName.substring(0, fileName.lastIndexOf('.'));
    const extension = fileName.substring(fileName.lastIndexOf('.'));
    
    let counter = 0;
    let uniqueName = fileName;
    let isUnique = false;
    
    while (!isUnique) {
      // Try to list files that match the current name
      const { data: existingFiles, error } = await supabase.storage
        .from(bucket)
        .list(`${creatorId}/${folderPath}`, {
          search: uniqueName
        });
      
      if (error) {
        console.error('Error checking for file existence:', error);
        break; // In case of error, just use the original file name
      }
      
      // Check if there's any file with the exact same name
      const exactMatch = existingFiles?.find((file: any) => file.name === uniqueName);
      
      if (!exactMatch) {
        isUnique = true;
      } else {
        counter++;
        uniqueName = `${baseName} (${counter})${extension}`;
      }
      
      // Safety check to prevent infinite loops
      if (counter > 100) {
        uniqueName = `${baseName}_${Date.now()}${extension}`;
        isUnique = true;
      }
    }
    
    return uniqueName;
  } catch (error) {
    console.error('Error generating unique filename:', error);
    return `${Date.now()}_${fileName}`; // Fallback to timestamp
  }
};
