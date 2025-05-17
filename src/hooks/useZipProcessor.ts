import JSZip from 'jszip';
import { v4 as uuidv4 } from 'uuid';
import { supabase } from '@/integrations/supabase/client';
import { ZipProcessingOptions } from '@/types/uploadTypes';
import { getFileExtension, getFileType } from '@/utils/fileUtils';

export const useZipProcessor = () => {
  // Process a ZIP file by extracting its contents and uploading each file
  const processZipFile = async (
    zipFile: File,
    options: ZipProcessingOptions
  ): Promise<string[]> => {
    const { 
      creatorId, 
      currentFolder,
      categoryId,
      updateFileProgress, 
      updateFileStatus 
    } = options;
    
    const uploadedFileIds: string[] = [];
    
    try {
      updateFileStatus(zipFile.name, 'processing');
      
      // Load the ZIP file
      const zip = new JSZip();
      const zipContents = await zip.loadAsync(zipFile);
      
      // Create a folder name based on the ZIP file name
      const baseFolderName = zipFile.name.split('.')[0];
      // Create a unique folder ID with the name and a unique identifier
      const folderId = `${baseFolderName.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${uuidv4().slice(0, 8)}`;
      
      // Keep track of total files for progress calculation
      const files = Object.values(zipContents.files).filter(file => !file.dir);
      const totalFiles = files.length;
      let processedFiles = 0;
      
      // Process each file in the ZIP
      for (const file of files) {
        try {
          // Skip directories
          if (file.dir) {
            continue;
          }
          
          const fileName = file.name.split('/').pop() || `file-${uuidv4().slice(0, 8)}`;
          
          // Update status to show we're working on this file
          updateFileStatus(`${zipFile.name} -> ${fileName}`, 'processing');
          
          // Get the file content as array buffer
          const content = await file.async('arraybuffer');
          const fileBlob = new Blob([content]);
          
          // Construct file path in storage
          const filePath = `${creatorId}/${folderId}/${fileName}`;
          
          // Upload the file to storage
          const { data: uploadData, error: uploadError } = await supabase.storage
            .from('raw_uploads')
            .upload(filePath, fileBlob, {
              cacheControl: '3600',
              upsert: false,
            });
          
          if (uploadError) {
            console.error(`Error uploading ${fileName}:`, uploadError);
            updateFileStatus(`${zipFile.name} -> ${fileName}`, 'error', uploadError.message);
            continue;
          }
          
          // Determine file type
          const extension = getFileExtension(fileName);
          const fileType = getFileType(extension);
          const mimeType = fileType === 'image' ? `image/${extension}` 
                           : fileType === 'video' ? `video/${extension}`
                           : fileType === 'audio' ? `audio/${extension}`
                           : 'application/octet-stream';
          
          // Add file to database
          const foldersList = ['all', folderId];
          const categoriesList = categoryId ? [categoryId] : [];
          
          const { data: fileData, error: fileError } = await supabase
            .from('media')
            .insert({
              creator_id: creatorId,
              filename: fileName,
              file_size: fileBlob.size,
              mime: mimeType,
              bucket_key: filePath,
              folders: foldersList,
              categories: categoriesList
            })
            .select('id')
            .single();
          
          if (fileError) {
            console.error(`Error saving ${fileName} metadata:`, fileError);
            updateFileStatus(`${zipFile.name} -> ${fileName}`, 'error', fileError.message);
            continue;
          }
          
          // Add file ID to the list
          uploadedFileIds.push(fileData.id);
          
          // Update progress
          processedFiles++;
          const progress = Math.floor((processedFiles / totalFiles) * 100);
          updateFileProgress(zipFile.name, progress);
          
          // Mark file as complete
          updateFileStatus(`${zipFile.name} -> ${fileName}`, 'complete');
        } catch (error) {
          console.error(`Error processing file from ZIP:`, error);
          updateFileStatus(`${zipFile.name} -> ${file.name}`, 'error', error instanceof Error ? error.message : 'Unknown error');
        }
      }
      
      // Now create a folder entry in the database if a category ID was provided
      if (categoryId) {
        try {
          console.log(`Creating folder in database: ${baseFolderName} with category ${categoryId}`);
          // No need to create an actual database entry for folders, they are virtual
        } catch (folderError) {
          console.error('Error creating folder entry:', folderError);
        }
      }
      
      // Mark the ZIP file as complete
      updateFileStatus(zipFile.name, 'complete');
      return uploadedFileIds;
      
    } catch (error) {
      console.error('Error processing ZIP file:', error);
      updateFileStatus(zipFile.name, 'error', error instanceof Error ? error.message : 'Unknown error');
      return uploadedFileIds;
    }
  };
  
  return {
    processZipFile
  };
};
