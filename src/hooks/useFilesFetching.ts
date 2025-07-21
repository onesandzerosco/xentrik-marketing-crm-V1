
import { CreatorFileType } from '@/types/fileTypes';
import { supabase } from '@/integrations/supabase/client';
import { getFileType } from '@/utils/fileUtils';

interface UseFilesFetchingProps {
  creatorId?: string;
  recentlyUploadedIds: string[];
  availableFolders: { id: string; name: string }[];
  tableName?: string;
}

export const useFilesFetching = ({ 
  creatorId,
  recentlyUploadedIds,
  availableFolders,
  tableName = 'media'
}: UseFilesFetchingProps) => {
  const fetchCreatorFiles = async () => {
    if (!creatorId) {
      throw new Error('Creator not found');
    }
    
    // Fetch from specified table (media or marketing_media)
    const { data: mediaData, error: mediaError } = tableName === 'marketing_media' 
      ? await supabase.from('marketing_media')
          .select('*')
          .eq('creator_id', creatorId)
          .order('created_at', { ascending: false })
      : await supabase.from('media')
          .select('*')
          .eq('creator_id', creatorId)
          .order('created_at', { ascending: false }); // Sort by most recent first
    
    if (mediaError) {
      console.error('Error fetching media data:', mediaError);
      // If there's an error, fall back to creator_files
      return fetchFromCreatorFiles();
    }
    
    if (mediaData && mediaData.length > 0) {
      // Process files from media table
      const processedFiles = await Promise.all(mediaData.map(async (media) => {
        // Get a signed URL for the file
        const { data } = await supabase.storage
          .from('raw_uploads')
          .createSignedUrl(media.bucket_key, 3600);
        
        const fileName = media.filename;
        const fileExt = fileName.split('.').pop()?.toLowerCase() || '';
        const type = getFileType(fileExt);
        
        // Check if this file is in the recently uploaded list
        const isNewlyUploaded = recentlyUploadedIds.includes(media.id);
        
        // Get folder references from the new folders array
        const folderRefs = media.folders || [];
        
        // Debug tag information
        console.log(`File ${fileName} tags:`, media.tags);
        
        return {
          id: media.id,
          name: fileName,
          size: media.file_size,
          created_at: media.created_at,
          url: data?.signedUrl || '',
          type,
          folder: 'all', // Default folder
          folderRefs, // Add folder references from the array
          status: media.status as "uploading" | "complete" || 'complete',
          bucketPath: media.bucket_key,
          isNewlyUploaded,
          description: media.description, // Add description field to file object
          thumbnail_url: media.thumbnail_url, // Add thumbnail_url for videos
          tags: media.tags || [] // Ensure tags are included
        } as CreatorFileType;
      }));
      
      return processedFiles;
    }
    
    // If no media data, fall back to creator_files
    return fetchFromCreatorFiles();
  };
  
  const fetchFromCreatorFiles = async () => {
    if (!creatorId) {
      throw new Error('Creator not found');
    }
    
    // Get all folders including custom ones
    const folders = availableFolders.map(f => f.id);
    let allFiles: CreatorFileType[] = [];
    
    for (const folder of folders) {
      const { data: filesData, error: filesError } = await supabase.storage
        .from('creator_files')
        .list(`${creatorId}/${folder}`, {
          sortBy: { column: 'created_at', order: 'desc' }, // Sort by most recent first
        });

      if (filesError) {
        console.error(`Error fetching files from ${folder}:`, filesError);
        continue;
      }

      const processedFiles = await Promise.all((filesData || [])
        // Filter out the .folder marker file
        .filter(file => file.name !== '.folder')
        .map(async (file: any) => {
          const { data } = await supabase.storage
            .from('creator_files')
            .createSignedUrl(`${creatorId}/${folder}/${file.name}`, 3600);

          const fileExt = file.name.split('.').pop()?.toLowerCase() || '';
          const type = getFileType(fileExt);
          const bucketPath = `${creatorId}/${folder}/${file.name}`;

          return {
            id: `${file.id || file.name}`,
            name: file.name,
            size: file.metadata?.size || 0,
            created_at: file.created_at || new Date().toISOString(),
            url: data?.signedUrl || '',
            type,
            folder,
            folderRefs: [folder], // Set the current folder as the folder reference
            status: 'complete' as "uploading" | "complete",
            bucketPath
          } as CreatorFileType;
        }));
      
      allFiles = [...allFiles, ...processedFiles];
    }
    
    // Sort by most recent first
    allFiles.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    
    return allFiles;
  };

  return {
    fetchCreatorFiles,
    fetchFromCreatorFiles
  };
};
