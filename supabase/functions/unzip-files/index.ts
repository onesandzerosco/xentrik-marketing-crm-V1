
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

/**
 * Determine MIME type based on file extension
 */
function determineMimeType(filename: string): string {
  const lowerName = filename.toLowerCase();
  
  if (lowerName.endsWith('.jpg') || lowerName.endsWith('.jpeg')) return 'image/jpeg';
  else if (lowerName.endsWith('.png')) return 'image/png';
  else if (lowerName.endsWith('.gif')) return 'image/gif';
  else if (lowerName.endsWith('.mp4')) return 'video/mp4';
  else if (lowerName.endsWith('.mp3')) return 'audio/mpeg';
  else if (lowerName.endsWith('.pdf')) return 'application/pdf';
  else if (lowerName.endsWith('.txt')) return 'text/plain';
  
  return 'application/octet-stream';
}

/**
 * Create a unique filename to avoid collisions
 */
async function createUniqueFilename(
  originalName: string, 
  existingFileNames: string[]
): Promise<string> {
  let uniqueFileName = originalName;
  let counter = 0;
  
  // Check for name collisions and rename if needed
  while (existingFileNames.includes(uniqueFileName)) {
    counter++;
    const lastDotIndex = originalName.lastIndexOf('.');
    if (lastDotIndex !== -1) {
      // File has extension
      const baseName = originalName.substring(0, lastDotIndex);
      const extension = originalName.substring(lastDotIndex);
      uniqueFileName = `${baseName} (${counter})${extension}`;
    } else {
      // File has no extension
      uniqueFileName = `${originalName} (${counter})`;
    }
  }
  
  return uniqueFileName;
}

/**
 * Extract files from a ZIP archive and prepare them for processing
 */
async function extractFilesFromZip(zipContent: JSZip): Promise<{ name: string, content: Blob, type: string }[]> {
  const extractedFiles: { name: string, content: Blob, type: string }[] = [];
    
  const promises = Object.keys(zipContent.files).map(async (filename) => {
    const zipEntry = zipContent.files[filename];
    
    // Skip directories
    if (zipEntry.dir) {
      return;
    }
    
    const content = await zipEntry.async('blob');
    const extractedFileName = filename.split('/').pop() || filename;
    const mimeType = determineMimeType(extractedFileName);
    
    extractedFiles.push({
      name: extractedFileName,
      content,
      type: mimeType
    });
  });
  
  await Promise.all(promises);
  return extractedFiles;
}

/**
 * Create a folder in storage
 */
async function createStorageFolder(
  supabaseClient: any, 
  creatorId: string, 
  targetFolder: string
): Promise<void> {
  const folderPath = `${creatorId}/${targetFolder}`;
  await supabaseClient.storage
    .from('raw_uploads')
    .upload(`${folderPath}/.folder`, new Blob([''], { type: 'text/plain' }), { upsert: true });
    
  console.log(`Created folder: ${folderPath}`);
}

/**
 * Get existing files in a folder to check for name conflicts
 */
async function listExistingFiles(
  supabaseClient: any, 
  creatorId: string, 
  targetFolder: string
): Promise<string[]> {
  const folderPath = `${creatorId}/${targetFolder}`;
  
  const { data: existingFilesInFolder, error } = await supabaseClient.storage
    .from('raw_uploads')
    .list(folderPath);
    
  if (error) {
    console.error('Error listing files:', error);
    return [];
  }
  
  return existingFilesInFolder ? 
    existingFilesInFolder.map(file => file.name) : [];
}

/**
 * Upload a file to storage and create a media record
 */
async function uploadFileAndCreateRecord(
  supabaseClient: any,
  creatorId: string,
  folderPath: string,
  file: { name: string, content: Blob, type: string },
  uniqueFileName: string,
  currentFolder: string | null
): Promise<string | null> {
  const filePath = `${folderPath}/${uniqueFileName}`;
  
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
      return null;
    }
    
    // Create a media record
    const folderArray = [folderPath.split('/').pop()]; // targetFolder
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
      return null;
    }
    
    return mediaRecord && mediaRecord[0] ? mediaRecord[0].id : null;
  } catch (err) {
    console.error(`Unexpected error processing file ${uniqueFileName}:`, err);
    return null;
  }
}

/**
 * Process extracted files - upload and create media records
 */
async function processExtractedFiles(
  supabaseClient: any,
  creatorId: string,
  targetFolder: string,
  currentFolder: string | null,
  extractedFiles: { name: string, content: Blob, type: string }[],
  existingFileNames: string[]
): Promise<string[]> {
  const fileIds: string[] = [];
  const folderPath = `${creatorId}/${targetFolder}`;
  
  for (const file of extractedFiles) {
    // Generate a unique filename to avoid collisions
    const uniqueFileName = await createUniqueFilename(file.name, existingFileNames);
    
    // Add the new filename to our list to check against for subsequent files
    existingFileNames.push(uniqueFileName);
    
    console.log(`Uploading: ${folderPath}/${uniqueFileName}`);
    
    const fileId = await uploadFileAndCreateRecord(
      supabaseClient,
      creatorId,
      folderPath,
      file,
      uniqueFileName,
      currentFolder
    );
    
    if (fileId) {
      fileIds.push(fileId);
    }
  }
  
  return fileIds;
}

/**
 * Main handler function for the unzip-files Edge Function
 */
async function handleUnzipRequest(req: Request): Promise<Response> {
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
    
    // Extract all files from the ZIP
    const extractedFiles = await extractFilesFromZip(zipContent);
    console.log(`Extracted ${extractedFiles.length} files from ZIP`);
    
    // Ensure the target folder exists
    await createStorageFolder(supabaseClient, creatorId, targetFolder);
    
    // List existing files to check for name conflicts
    const existingFileNames = await listExistingFiles(supabaseClient, creatorId, targetFolder);
    console.log(`Found ${existingFileNames.length} existing files in target folder`);
    
    // Process all extracted files
    const fileIds = await processExtractedFiles(
      supabaseClient, 
      creatorId, 
      targetFolder, 
      currentFolder, 
      extractedFiles,
      existingFileNames
    );
    
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
}

// Main serve handler
serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  
  return handleUnzipRequest(req);
})
