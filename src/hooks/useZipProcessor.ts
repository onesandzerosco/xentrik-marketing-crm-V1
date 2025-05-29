
import { supabase } from '@/integrations/supabase/client';
import { ZipProcessingOptions } from '@/types/uploadTypes';
import { getFileExtension, getFileType, uploadFileInChunks } from '@/utils/fileUtils';

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
      console.log(`Starting ZIP processing for ${zipFile.name} with category: ${categoryId}`);
      updateFileStatus(zipFile.name, 'processing');
      
      // Load the ZIP file using dynamic import for JSZip
      const JSZip = (await import('jszip')).default;
      const zip = new JSZip();
      const zipContents = await zip.loadAsync(zipFile);
      
      // SOP Step 4: Create a folder name based on the ZIP file name (remove .zip extension)
      const baseFolderName = zipFile.name.replace(/\.zip$/i, '');
      // Use just the base name as the folder name - no timestamp suffix for folder names
      const folderName = baseFolderName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      
      console.log(`Creating folder: ${folderName} under category: ${categoryId} as per SOP step 4`);
      
      // Keep track of total files for progress calculation
      const files = Object.values(zipContents.files).filter(file => !file.dir);
      const totalFiles = files.length;
      let processedFiles = 0;
      
      if (totalFiles === 0) {
        updateFileStatus(zipFile.name, 'error', 'ZIP file contains no files');
        return [];
      }
      
      console.log(`Found ${totalFiles} files in ZIP`);
      
      // First, check if a folder with this name already exists in this category
      let existingFolder = null;
      try {
        const { data: folderCheck, error: folderCheckError } = await supabase
          .from('file_folders')
          .select('folder_id, folder_name')
          .eq('creator_id', creatorId)
          .eq('category_id', categoryId)
          .eq('folder_name', folderName)
          .maybeSingle();
        
        if (folderCheckError) {
          console.warn('Error checking for existing folder:', folderCheckError);
        } else if (folderCheck) {
          existingFolder = folderCheck;
          console.log(`Using existing folder: ${folderCheck.folder_name} (ID: ${folderCheck.folder_id})`);
        }
      } catch (error) {
        console.warn('Could not check for existing folder:', error);
      }
      
      // Create folder in database if it doesn't exist
      let folderId: string;
      if (existingFolder) {
        folderId = existingFolder.folder_id;
      } else {
        console.log(`Creating new folder: ${folderName} in category: ${categoryId}`);
        
        const { data: newFolder, error: createFolderError } = await supabase
          .from('file_folders')
          .insert({
            folder_name: folderName,
            creator_id: creatorId,
            category_id: categoryId
          })
          .select('folder_id')
          .single();
        
        if (createFolderError) {
          console.error('Error creating folder in database:', createFolderError);
          updateFileStatus(zipFile.name, 'error', `Failed to create folder: ${createFolderError.message}`);
          return [];
        }
        
        folderId = newFolder.folder_id;
        console.log(`Created folder with ID: ${folderId}`);
      }
      
      updateFileProgress(zipFile.name, 30);
      
      // Process each file in the ZIP
      for (const file of files) {
        try {
          // Skip directories
          if (file.dir) {
            continue;
          }
          
          const fileName = file.name.split('/').pop() || `file-${Date.now().toString().slice(-8)}`;
          
          // Update status to show we're working on this file
          updateFileStatus(`${zipFile.name} -> ${fileName}`, 'processing');
          
          // Get the file content as array buffer
          const content = await file.async('arraybuffer');
          const fileBlob = new Blob([content]);
          
          // Construct file path in storage - use the folder name for storage path
          const filePath = `${creatorId}/${folderName}/${fileName}`;
          
          console.log(`Uploading file: ${filePath} to folder: ${folderName}`);
          
          // Use chunked upload for large files (>10MB), regular upload for smaller files
          const fileSize = fileBlob.size;
          const useChunkedUpload = fileSize > 10 * 1024 * 1024; // 10MB threshold
          
          if (useChunkedUpload) {
            console.log(`Using chunked upload for large file: ${fileName} (${Math.round(fileSize / 1024 / 1024)}MB)`);
            
            // Upload using chunked upload for large files
            await uploadFileInChunks(
              new File([fileBlob], fileName, { type: fileBlob.type }),
              'raw_uploads',
              filePath,
              (progress) => {
                const overallProgress = Math.floor(((processedFiles + (progress / 100)) / totalFiles) * 100);
                updateFileProgress(zipFile.name, 30 + Math.floor(overallProgress * 0.6)); // Scale to 30-90%
              },
              supabase
            );
          } else {
            // Use regular upload for smaller files
            const { error: uploadError } = await supabase.storage
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
          }
          
          // Determine file type
          const extension = getFileExtension(fileName);
          const fileType = getFileType(extension);
          const mimeType = fileType === 'image' ? `image/${extension}` 
                           : fileType === 'video' ? `video/${extension}`
                           : fileType === 'audio' ? `audio/${extension}`
                           : 'application/octet-stream';
          
          // SOP Step 4: Add file to database with proper folder and category organization
          // Use the folderId (UUID) for the folders array, not the folder name
          const foldersList = ['all', folderId]; // Include both 'all' and the specific folder ID
          const categoriesList = categoryId ? [categoryId] : [];
          
          console.log(`Creating media record for ${fileName} with folder ID: ${folderId} and categories: ${categoriesList} as per SOP`);
          
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
          const progress = 30 + Math.floor((processedFiles / totalFiles) * 60); // Scale from 30% to 90%
          updateFileProgress(zipFile.name, progress);
          
          // Mark file as complete
          updateFileStatus(`${zipFile.name} -> ${fileName}`, 'complete');
          
          console.log(`Successfully processed ${fileName} as per SOP workflow`);
        } catch (error) {
          console.error(`Error processing file from ZIP:`, error);
          updateFileStatus(`${zipFile.name} -> ${file.name}`, 'error', error instanceof Error ? error.message : 'Unknown error');
        }
      }
      
      // Mark the ZIP file as complete
      updateFileProgress(zipFile.name, 100);
      updateFileStatus(zipFile.name, 'complete');
      
      console.log(`SOP completed: ZIP processing complete. Created ${uploadedFileIds.length} files in folder ${folderName} (ID: ${folderId}) under category ${categoryId}`);
      
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
