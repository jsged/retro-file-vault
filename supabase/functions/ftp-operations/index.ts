import "jsr:@std/dotenv/load";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface FTPListItem {
  name: string;
  type: number;
  size: number;
  modifiedAt?: Date;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { operation, path, content, newName, ftpConfig } = await req.json();
    console.log(`FTP operation: ${operation} at path: ${path}`);

    if (!ftpConfig || !ftpConfig.host) {
      throw new Error('FTP configuration is required');
    }

    // Import basic-ftp dynamically
    const { Client: FTPClient } = await import("npm:basic-ftp@5.0.5");
    
    const client = new FTPClient();
    client.ftp.verbose = false;
    
    try {
      await client.access({
        host: ftpConfig.host,
        port: ftpConfig.port || 21,
        user: ftpConfig.user,
        password: ftpConfig.password,
        secure: false,
      });
      
      let result;
      
      switch (operation) {
        case 'list':
          const items = await client.list(path || '/');
          result = items.map((item: FTPListItem) => ({
            name: item.name,
            type: item.type === 1 ? 'file' : 'directory',
            size: item.size,
            modifiedAt: item.modifiedAt?.toISOString(),
          }));
          break;
          
        case "download":
          // Import Writable stream and Buffer from Node
          const { Writable } = await import("node:stream");
          const { Buffer } = await import("node:buffer");
          
          // Create a buffer to accumulate data
          const chunks: Uint8Array[] = [];
          const writableStream = new Writable({
            write(chunk, encoding, callback) {
              chunks.push(Buffer.from(chunk));
              callback();
            },
          });
          
          // Download to the writable stream
          await client.downloadTo(writableStream, path);
          
          // Combine all chunks
          const fileBuffer = Buffer.concat(chunks);
          
          return new Response(fileBuffer, {
            headers: {
              ...corsHeaders,
              "Content-Disposition": `attachment; filename="${path.split("/").pop()}"`,
              "Content-Type": "application/octet-stream",
            },
          });

          
        case 'upload':
          if (!content) {
            throw new Error('Content required for upload');
          }
          
          // Create a temporary file for upload
          const uploadTempPath = await Deno.makeTempFile();
          await Deno.writeTextFile(uploadTempPath, content);
          await client.uploadFrom(uploadTempPath, path);
          await Deno.remove(uploadTempPath);
          
          result = { success: true };
          break;
          
        case 'delete':
          const itemList = await client.list(path);
          if (itemList.length > 0 && itemList[0].type === 2) {
            await client.removeDir(path);
          } else {
            await client.remove(path);
          }
          result = { success: true };
          break;
          
        case 'createDir':
          await client.ensureDir(path);
          result = { success: true };
          break;
          
        case 'rename':
          if (!newName) {
            throw new Error('New name required for rename');
          }
          await client.rename(path, newName);
          result = { success: true };
          break;
          
        default:
          throw new Error(`Unknown operation: ${operation}`);
      }
      
      client.close();
      
      return new Response(
        JSON.stringify(result),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      );
      
    } catch (ftpError) {
      client.close();
      throw ftpError;
    }
    
  } catch (error) {
    console.error('FTP operation error:', error);
    const errorMessage = error instanceof Error ? error.message : 'FTP operation failed';
    const errorDetails = error instanceof Error ? error.toString() : String(error);
    
    return new Response(
      JSON.stringify({ 
        error: errorMessage,
        details: errorDetails,
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
