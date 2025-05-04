
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import * as unzipit from "https://esm.sh/unzipit@1.4.3";
import { Buffer } from "https://deno.land/std@0.168.0/node/buffer.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.6";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const supabaseUrl = "https://rdzwpiokpyssqhnfiqrt.supabase.co";
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";

type RequestBody = {
  zipUrl: string;
  creatorId: string;
  folderPath: string;
  uploadedZipId: string;
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Parse the request body
    const { zipUrl, creatorId, folderPath, uploadedZipId } = await req.json() as RequestBody;
    
    if (!zipUrl || !creatorId || !folderPath) {
      throw new Error("Missing required parameters");
    }

    // Create a Supabase client with the service role key for admin operations
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    console.log(`Starting to process ZIP file from: ${zipUrl}`);

    // Download the ZIP file
    const response = await fetch(zipUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch ZIP file: ${response.statusText}`);
    }

    const zipBuffer = await response.arrayBuffer();
    console.log(`ZIP file downloaded, size: ${zipBuffer.byteLength} bytes`);
    
    // Extract the ZIP contents
    const { entries } = await unzipit.unzip(zipBuffer);
    console.log(`ZIP contains ${Object.keys(entries).length} files`);
    
    // Skip directories and process only files
    const extractedFiles = [];
    const extractedFileIds = [];
    
    for (const [name, entry] of Object.entries(entries)) {
      // Skip directories and macOS metadata files
      if (entry.isDirectory || name.startsWith("__MACOSX") || name.includes(".DS_Store")) {
        continue;
      }
      
      try {
        // Get file content as ArrayBuffer
        const fileData = await entry.arrayBuffer();
        const fileName = name.split("/").pop() || "unknown_file";
        
        console.log(`Extracting: ${fileName} (${fileData.byteLength} bytes)`);
        
        // Clean filename - remove special characters that might cause issues
        const safeFileName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_');
        
        // Upload the file to Supabase Storage
        const filePath = `${creatorId}/${folderPath}/${safeFileName}`;
        
        const { error: uploadError } = await supabase.storage
          .from("raw_uploads")
          .upload(filePath, fileData, {
            contentType: getMimeType(fileName),
            upsert: true
          });
          
        if (uploadError) {
          console.error(`Error uploading ${fileName}:`, uploadError);
          continue;
        }
        
        // Create a record in the media table
        const { data: mediaData, error: mediaError } = await supabase
          .from("media")
          .insert({
            creator_id: creatorId,
            bucket_key: filePath,
            filename: safeFileName,
            mime: getMimeType(fileName),
            file_size: fileData.byteLength,
            folders: folderPath === 'shared' ? [] : [folderPath],
            description: `Extracted from ZIP archive`
          })
          .select('id');
          
        if (mediaError) {
          console.error(`Error creating media record for ${fileName}:`, mediaError);
          continue;
        }
        
        if (mediaData && mediaData.length > 0) {
          extractedFiles.push(fileName);
          extractedFileIds.push(mediaData[0].id);
        }
      } catch (fileError) {
        console.error(`Error processing file ${name}:`, fileError);
      }
    }
    
    // Update the original ZIP file record to show extraction is complete
    if (uploadedZipId) {
      await supabase
        .from("media")
        .update({ 
          description: `ZIP archive extracted: ${extractedFiles.length} files`, 
          status: 'extracted'
        })
        .eq('id', uploadedZipId);
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: `Successfully extracted ${extractedFiles.length} files from ZIP archive`,
        extractedFiles,
        extractedFileIds
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error processing ZIP file:", error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Unknown error occurred",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});

// Helper function to determine MIME type based on file extension
function getMimeType(filename: string): string {
  const extension = filename.split('.').pop()?.toLowerCase() || '';
  
  const mimeTypes: Record<string, string> = {
    'jpg': 'image/jpeg',
    'jpeg': 'image/jpeg',
    'png': 'image/png',
    'gif': 'image/gif',
    'webp': 'image/webp',
    'svg': 'image/svg+xml',
    'pdf': 'application/pdf',
    'doc': 'application/msword',
    'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'xls': 'application/vnd.ms-excel',
    'xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'txt': 'text/plain',
    'mp4': 'video/mp4',
    'webm': 'video/webm',
    'mp3': 'audio/mpeg',
    'wav': 'audio/wav',
  };
  
  return mimeTypes[extension] || 'application/octet-stream';
}
