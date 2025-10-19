import { ChevronRight, Folder, FolderOpen } from "lucide-react";
import { useState } from "react";
import { FileItem } from "./FileExplorer";

interface FolderTreeProps {
  currentPath: string;
  onNavigate: (path: string) => void;
  files: FileItem[];
}

export const FolderTree = ({ currentPath, onNavigate, files }: FolderTreeProps) => {
  const [expandedFolders, setExpandedFolders] = useState<string[]>([]);

  const toggleFolder = (path: string) => {
    setExpandedFolders(prev =>
      prev.includes(path) ? prev.filter(p => p !== path) : [...prev, path]
    );
  };

  const directories = files.filter(f => f.type === "directory");

  return (
    <div className="w-64 border-r border-border bg-[hsl(var(--sidebar-background))] overflow-y-auto">
      <div className="p-2">
        <div
          className="flex cursor-pointer items-center gap-1 rounded px-2 py-1 hover:bg-[hsl(var(--win7-hover))]"
          onClick={() => onNavigate("/")}
        >
          <FolderOpen className="h-4 w-4 text-primary" />
          <span className="text-sm font-medium">Root</span>
        </div>
        {directories.map((dir) => {
          const dirPath = currentPath === "/" ? `/${dir.name}` : `${currentPath}/${dir.name}`;
          const isExpanded = expandedFolders.includes(dirPath);
          const isSelected = currentPath === dirPath;

          return (
            <div key={dir.name} className="ml-4">
              <div
                className={`flex cursor-pointer items-center gap-1 rounded px-2 py-1 hover:bg-[hsl(var(--win7-hover))] ${
                  isSelected ? "bg-[hsl(var(--win7-selected))]" : ""
                }`}
                onClick={() => {
                  toggleFolder(dirPath);
                  onNavigate(dirPath);
                }}
              >
                <ChevronRight
                  className={`h-3 w-3 transition-transform ${isExpanded ? "rotate-90" : ""}`}
                />
                {isSelected ? (
                  <FolderOpen className="h-4 w-4 text-primary" />
                ) : (
                  <Folder className="h-4 w-4 text-primary" />
                )}
                <span className="text-sm">{dir.name}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
