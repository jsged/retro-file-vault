import { useState, useEffect } from "react";
import { Toolbar } from "./Toolbar";
import { AddressBar } from "./AddressBar";
import { FolderTree } from "./FolderTree";
import { FileList } from "./FileList";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface FileItem {
  name: string;
  type: "file" | "directory";
  size: number;
  modifiedAt?: string;
}

export const FileExplorer = () => {
  const [currentPath, setCurrentPath] = useState("/");
  const [files, setFiles] = useState<FileItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);

  const loadDirectory = async (path: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("ftp-operations", {
        body: { operation: "list", path },
      });

      if (error) throw error;
      
      setFiles(data || []);
      setCurrentPath(path);
      setSelectedItems([]);
    } catch (error) {
      console.error("Error loading directory:", error);
      toast.error("Failed to load directory");
    } finally {
      setLoading(false);
    }
  };

  const handleNavigate = (path: string) => {
    loadDirectory(path);
  };

  const handleDelete = async (items: string[]) => {
    for (const item of items) {
      try {
        const fullPath = currentPath === "/" ? `/${item}` : `${currentPath}/${item}`;
        await supabase.functions.invoke("ftp-operations", {
          body: { operation: "delete", path: fullPath },
        });
      } catch (error) {
        console.error("Error deleting:", error);
        toast.error(`Failed to delete ${item}`);
        return;
      }
    }
    toast.success("Items deleted successfully");
    loadDirectory(currentPath);
  };

  const handleUpload = async (file: File) => {
    try {
      const content = await file.text();
      const fullPath = currentPath === "/" ? `/${file.name}` : `${currentPath}/${file.name}`;
      
      const { error } = await supabase.functions.invoke("ftp-operations", {
        body: { operation: "upload", path: fullPath, content },
      });

      if (error) throw error;
      
      toast.success("File uploaded successfully");
      loadDirectory(currentPath);
    } catch (error) {
      console.error("Error uploading:", error);
      toast.error("Failed to upload file");
    }
  };

  const handleCreateFolder = async (name: string) => {
    try {
      const fullPath = currentPath === "/" ? `/${name}` : `${currentPath}/${name}`;
      
      const { error } = await supabase.functions.invoke("ftp-operations", {
        body: { operation: "createDir", path: fullPath },
      });

      if (error) throw error;
      
      toast.success("Folder created successfully");
      loadDirectory(currentPath);
    } catch (error) {
      console.error("Error creating folder:", error);
      toast.error("Failed to create folder");
    }
  };

  const handleDownload = async (fileName: string) => {
    try {
      const fullPath = currentPath === "/" ? `/${fileName}` : `${currentPath}/${fileName}`;
      
      const { data, error } = await supabase.functions.invoke("ftp-operations", {
        body: { operation: "download", path: fullPath },
      });

      if (error) throw error;
      
      // Convert array back to Uint8Array and create blob
      const uint8Array = new Uint8Array(data.content);
      const blob = new Blob([uint8Array]);
      const url = URL.createObjectURL(blob);
      
      // Create download link
      const a = document.createElement('a');
      a.href = url;
      a.download = data.fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast.success("File downloaded successfully");
    } catch (error) {
      console.error("Error downloading:", error);
      toast.error("Failed to download file");
    }
  };

  useEffect(() => {
    loadDirectory("/");
  }, []);

  return (
    <div className="flex h-screen flex-col bg-background">
      <Toolbar
        onUpload={handleUpload}
        onCreateFolder={handleCreateFolder}
        onDelete={() => handleDelete(selectedItems)}
        selectedCount={selectedItems.length}
      />
      <AddressBar currentPath={currentPath} onNavigate={handleNavigate} />
      <div className="flex flex-1 overflow-hidden border-t border-border">
        <FolderTree currentPath={currentPath} onNavigate={handleNavigate} files={files} />
        <FileList
          files={files}
          loading={loading}
          selectedItems={selectedItems}
          onSelectItems={setSelectedItems}
          onNavigate={handleNavigate}
          onDownload={handleDownload}
          currentPath={currentPath}
        />
      </div>
    </div>
  );
};
