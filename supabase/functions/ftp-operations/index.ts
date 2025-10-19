import "jsr:@std/dotenv/load";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// FTP configuration
const FTP_CONFIG = {
  host: 'ftp.fasthosts.co.uk',
  user: 'jsged_games',
  password: 'gamesaresupercool',
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
    const { operation, path, content, newName } = await req.json();
    console.log(`FTP operation: ${operation} at path: ${path}`);

    // Import basic-ftp dynamically
    const { Client: FTPClient } = await import("npm:basic-ftp@5.0.5");
    
    const client = new FTPClient();
    client.ftp.verbose = false;
    
    try {
      await client.access(FTP_CONFIG);
      
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
          
        case 'download':
          // Create a temporary file for download
          const tempFilePath = await Deno.makeTempFile();
          await client.downloadTo(tempFilePath, path);
          const fileContent = await Deno.readFile(tempFilePath);
          await Deno.remove(tempFilePath);
          
          result = {
            success: true,
            content: Array.from(fileContent),
            fileName: path.split('/').pop() || 'download',
          };
          break;
          
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
