import { Upload, FolderPlus, Trash2 } from "lucide-react";
import { Button } from "./ui/button";
import { useRef } from "react";

interface ToolbarProps {
  onUpload: (file: File) => void;
  onCreateFolder: (name: string) => void;
  onDelete: () => void;
  selectedCount: number;
}

export const Toolbar = ({ onUpload, onCreateFolder, onDelete, selectedCount }: ToolbarProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onUpload(file);
      e.target.value = "";
    }
  };

  const handleNewFolder = () => {
    const name = prompt("Enter folder name:");
    if (name) {
      onCreateFolder(name);
    }
  };

  return (
    <div className="flex items-center gap-1 border-b border-border bg-[hsl(var(--win7-toolbar))] px-2 py-1">
      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        onChange={handleFileChange}
      />
      <Button
        variant="ghost"
        size="sm"
        onClick={handleUploadClick}
        className="h-8 gap-2 text-xs hover:bg-[hsl(var(--win7-hover))]"
      >
        <Upload className="h-4 w-4" />
        Upload
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={handleNewFolder}
        className="h-8 gap-2 text-xs hover:bg-[hsl(var(--win7-hover))]"
      >
        <FolderPlus className="h-4 w-4" />
        New Folder
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={onDelete}
        disabled={selectedCount === 0}
        className="h-8 gap-2 text-xs hover:bg-destructive/10 disabled:opacity-50"
      >
        <Trash2 className="h-4 w-4" />
        Delete {selectedCount > 0 && `(${selectedCount})`}
      </Button>
    </div>
  );
};
