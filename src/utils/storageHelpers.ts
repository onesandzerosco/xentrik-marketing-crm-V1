
import { supabase } from '@/integrations/supabase/client';

export const BUCKET_NAME = 'raw_uploads';

interface UploadResult {
  fileId: string;
  bucketPath: string;
  publicUrl: string;
}

export const uploadFileToStorage = async (
  file: File,
  creatorId: string,
  fileName: string
): Promise<UploadResult> => {
  // Create the bucket path: creatorId/fileName
  const bucketPath = `${creatorId}/${fileName}`;
  
  try {
    // Upload file to storage bucket
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(bucketPath, file, {
        upsert: true,
        contentType: file.type
      });

    if (uploadError) {
      console.error('Storage upload error:', uploadError);
      throw new Error(`Failed to upload file: ${uploadError.message}`);
    }

    // Get public URL for the uploaded file
    const { data: urlData } = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(bucketPath);

    // Insert metadata into the media table
    const { data: mediaData, error: mediaError } = await supabase
      .from('media')
      .insert({
        creator_id: creatorId,
        filename: fileName,
        bucket_key: bucketPath,
        file_size: file.size,
        mime: file.type,
        status: 'available'
      })
      .select('id')
      .single();

    if (mediaError) {
      console.error('Database insert error:', mediaError);
      // Clean up the uploaded file if database insert fails
      await supabase.storage.from(BUCKET_NAME).remove([bucketPath]);
      throw new Error(`Failed to save file metadata: ${mediaError.message}`);
    }

    return {
      fileId: mediaData.id,
      bucketPath,
      publicUrl: urlData.publicUrl
    };
  } catch (error) {
    console.error('Upload process error:', error);
    throw error;
  }
};

export const deleteFileFromStorage = async (bucketPath: string, fileId: string): Promise<void> => {
  try {
    // Delete from storage bucket
    const { error: storageError } = await supabase.storage
      .from(BUCKET_NAME)
      .remove([bucketPath]);

    if (storageError) {
      console.error('Storage deletion error:', storageError);
    }

    // Delete metadata from database
    const { error: dbError } = await supabase
      .from('media')
      .delete()
      .eq('id', fileId);

    if (dbError) {
      console.error('Database deletion error:', dbError);
      throw new Error(`Failed to delete file metadata: ${dbError.message}`);
    }
  } catch (error) {
    console.error('Delete process error:', error);
    throw error;
  }
};

export const getFileUrl = (bucketPath: string): string => {
  const { data } = supabase.storage
    .from(BUCKET_NAME)
    .getPublicUrl(bucketPath);
  
  return data.publicUrl;
};

export const downloadFile = async (bucketPath: string, fileName: string): Promise<void> => {
  try {
    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .download(bucketPath);

    if (error) {
      throw new Error(`Failed to download file: ${error.message}`);
    }

    // Create download link
    const url = URL.createObjectURL(data);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Download error:', error);
    throw error;
  }
};
