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
     const url = new URL(req.url);
     let operation: string | null = null;
     let pathParam: string | null = null;
     let content: string | undefined;
     let newName: string | undefined;
     let ftpConfig: any;

     if (req.method === 'GET') {
       operation = url.searchParams.get('operation') || url.searchParams.get('op');
       pathParam = url.searchParams.get('path');
       ftpConfig = {
         host: url.searchParams.get('host') || undefined,
         port: Number(url.searchParams.get('port') || '21'),
         user: url.searchParams.get('user') || undefined,
         password: url.searchParams.get('password') || undefined,
       };
     } else {
       const body = await req.json();
       operation = body.operation;
       pathParam = body.path;
       content = body.content;
       newName = body.newName;
       ftpConfig = body.ftpConfig;
     }

     const operationStr = operation || '';
     const path = pathParam || '/';
     console.log(`FTP operation: ${operationStr} at path: ${path}`);

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
      
      switch (operationStr) {
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
          // Stream from FTP to HTTP response without buffering whole file
          const { PassThrough } = await import("node:stream");
          const pass = new PassThrough();

          // Start FTP download into PassThrough
          client
            .downloadTo(pass, path)
            .catch((err: unknown) => pass.emit('error', err as Error));

          // Bridge Node stream -> Web ReadableStream
          const readableStream = new ReadableStream<Uint8Array>({
            start(controller) {
              pass.on('data', (chunk) => {
                controller.enqueue(new Uint8Array(chunk));
              });
              pass.on('end', () => {
                controller.close();
                try { client.close(); } catch (_) {}
              });
              pass.on('error', (err) => {
                try { client.close(); } catch (_) {}
                controller.error(err);
              });
            },
            cancel() {
              try { pass.destroy(); } catch (_) {}
              try { client.close(); } catch (_) {}
            }
          });

          return new Response(readableStream, {
            headers: {
              ...corsHeaders,
              "Content-Disposition": `attachment; filename="${path.split("/").pop()}"`,
              "Content-Type": "application/octet-stream",
              "Cache-Control": "no-store",
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
