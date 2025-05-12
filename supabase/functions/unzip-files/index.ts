
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import JSZip from 'https://esm.sh/jszip@3.10.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface ExtractZipRequest {
  creatorId: string;
  fileName: string;
  targetFolder: string;
  currentFolder: string | null;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get the request body
    const body = await req.json() as ExtractZipRequest;
    const { creatorId, fileName, targetFolder, currentFolder } = body;

    if (!creatorId || !fileName || !targetFolder) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    // Download the ZIP file from storage
    console.log(`Downloading ZIP file: ${creatorId}/${fileName}`);
    const { data: fileData, error: downloadError } = await supabaseClient.storage
      .from('raw_uploads')
      .download(`${creatorId}/${fileName}`);

    if (downloadError || !fileData) {
      console.error('Failed to download ZIP file:', downloadError);
      return new Response(
        JSON.stringify({ error: `Failed to download ZIP file: ${downloadError?.message || 'Unknown error'}` }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Parse the ZIP file
    console.log('Extracting ZIP file...');
    const zip = new JSZip();
    const zipContent = await zip.loadAsync(await fileData.arrayBuffer());
    const extractedFiles: { name: string, content: Blob, type: string }[] = [];
    
    // Extract all files from the ZIP
    const promises = Object.keys(zipContent.files).map(async (filename) => {
      const zipEntry = zipContent.files[filename];
      
      // Skip directories
      if (zipEntry.dir) {
        return;
      }
      
      const content = await zipEntry.async('blob');
      const extractedFileName = filename.split('/').pop() || filename;
      
      // Try to determine the file mime type
      let mimeType = 'application/octet-stream';
      const lowerName = extractedFileName.toLowerCase();
      if (lowerName.endsWith('.jpg') || lowerName.endsWith('.jpeg')) mimeType = 'image/jpeg';
      else if (lowerName.endsWith('.png')) mimeType = 'image/png';
      else if (lowerName.endsWith('.gif')) mimeType = 'image/gif';
      else if (lowerName.endsWith('.mp4')) mimeType = 'video/mp4';
      else if (lowerName.endsWith('.mp3')) mimeType = 'audio/mpeg';
      else if (lowerName.endsWith('.pdf')) mimeType = 'application/pdf';
      else if (lowerName.endsWith('.txt')) mimeType = 'text/plain';
      
      extractedFiles.push({
        name: extractedFileName,
        content,
        type: mimeType
      });
    });
    
    await Promise.all(promises);
    console.log(`Extracted ${extractedFiles.length} files from ZIP`);
    
    // Ensure the target folder exists (create a dummy file)
    const folderPath = `${creatorId}/${targetFolder}`;
    await supabaseClient.storage
      .from('raw_uploads')
      .upload(`${folderPath}/.folder`, new Blob([''], { type: 'text/plain' }), { upsert: true });

    console.log(`Created folder: ${folderPath}`);
    
    // Upload each extracted file and create media records
    const fileIds: string[] = [];
    
    // First, list all files in the target folder to check for name conflicts
    const { data: existingFilesInFolder } = await supabaseClient.storage
      .from('raw_uploads')
      .list(folderPath);
      
    const existingFileNames = existingFilesInFolder ? 
      existingFilesInFolder.map(file => file.name) : [];
    
    console.log(`Found ${existingFileNames.length} existing files in target folder`);
    
    for (const file of extractedFiles) {
      // Generate a unique filename to avoid collisions
      let uniqueFileName = file.name;
      let counter = 0;
      
      // Check for name collisions and rename if needed
      while (existingFileNames.includes(uniqueFileName)) {
        counter++;
        const lastDotIndex = file.name.lastIndexOf('.');
        if (lastDotIndex !== -1) {
          // File has extension
          const baseName = file.name.substring(0, lastDotIndex);
          const extension = file.name.substring(lastDotIndex);
          uniqueFileName = `${baseName} (${counter})${extension}`;
        } else {
          // File has no extension
          uniqueFileName = `${file.name} (${counter})`;
        }
      }
      
      // Add the new filename to our list to check against for subsequent files
      existingFileNames.push(uniqueFileName);
      
      const filePath = `${folderPath}/${uniqueFileName}`;
      console.log(`Uploading: ${filePath}`);
      
      try {
        // Upload the file to storage with upsert: true to overwrite if needed
        const { error: uploadError } = await supabaseClient.storage
          .from('raw_uploads')
          .upload(filePath, file.content, {
            contentType: file.type,
            upsert: true
          });
          
        if (uploadError) {
          console.error(`Error uploading ${uniqueFileName}:`, uploadError);
          continue;
        }
        
        // Create a media record
        const folderArray = [targetFolder];
        if (currentFolder && currentFolder !== 'all' && currentFolder !== 'unsorted') {
          folderArray.push(currentFolder);
        }
        
        const { data: mediaRecord, error: mediaError } = await supabaseClient
          .from('media')
          .insert({
            creator_id: creatorId,
            bucket_key: filePath,
            filename: uniqueFileName,
            mime: file.type,
            file_size: file.content.size,
            status: 'complete',
            folders: folderArray
          })
          .select('id');
          
        if (mediaError) {
          console.error(`Error creating media record for ${uniqueFileName}:`, mediaError);
          continue;
        }
        
        if (mediaRecord && mediaRecord[0]) {
          fileIds.push(mediaRecord[0].id);
        }
      } catch (err) {
        console.error(`Unexpected error processing file ${uniqueFileName}:`, err);
      }
    }
    
    // Clean up the original ZIP file
    await supabaseClient.storage
      .from('raw_uploads')
      .remove([`${creatorId}/${fileName}`]);
      
    console.log('ZIP processing complete');

    return new Response(
      JSON.stringify({ 
        success: true, 
        fileIds, 
        message: `Successfully extracted ${fileIds.length} files` 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    console.error('Error processing ZIP file:', error);
    
    return new Response(
      JSON.stringify({ 
        error: 'Failed to process ZIP file', 
        details: error.message 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
})
