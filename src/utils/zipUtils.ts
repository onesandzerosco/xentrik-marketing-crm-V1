
import JSZip from 'jszip';
import { getFileExtension, isVideoFile } from './fileUtils';

/**
 * Checks if a file is a ZIP file based on its extension
 */
export const isZipFile = (fileName: string): boolean => {
  const extension = getFileExtension(fileName);
  return extension === 'zip';
};

/**
 * Extracts files from a ZIP file
 * @param zipFile The ZIP file to extract
 * @returns Promise containing the extracted files
 */
export const extractZipFiles = async (zipFile: File): Promise<{ name: string, content: Blob, isVideo: boolean }[]> => {
  try {
    const zip = new JSZip();
    const zipContent = await zip.loadAsync(zipFile);
    const files: { name: string, content: Blob, isVideo: boolean }[] = [];
    
    const promises = Object.keys(zipContent.files).map(async (filename) => {
      const zipEntry = zipContent.files[filename];
      
      // Skip directories
      if (zipEntry.dir) {
        return;
      }
      
      const content = await zipEntry.async('blob');
      const extractedFileName = filename.split('/').pop() || filename; // Get just the filename without directory path
      const isVideo = isVideoFile(extractedFileName);
      
      files.push({
        name: extractedFileName,
        content,
        isVideo
      });
    });
    
    await Promise.all(promises);
    return files;
  } catch (error) {
    console.error('Error extracting ZIP file:', error);
    throw new Error('Failed to extract ZIP file');
  }
};

/**
 * Gets the base name of a ZIP file (without extension)
 * @param fileName The ZIP file name
 * @returns The base name without extension
 */
export const getZipBaseName = (fileName: string): string => {
  return fileName.replace(/\.zip$/i, '');
};
