import { File, Folder, Download } from "lucide-react";
import { FileItem } from "./FileExplorer";
import { Button } from "./ui/button";

interface FileListProps {
  files: FileItem[];
  loading: boolean;
  selectedItems: string[];
  onSelectItems: (items: string[]) => void;
  onNavigate: (path: string) => void;
  onDownload: (fileName: string) => void;
  currentPath: string;
}

export const FileList = ({
  files,
  loading,
  selectedItems,
  onSelectItems,
  onNavigate,
  onDownload,
  currentPath,
}: FileListProps) => {
  const formatSize = (bytes: number) => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + " " + sizes[i];
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleString();
  };

  const handleItemClick = (item: FileItem, e: React.MouseEvent) => {
    if (e.ctrlKey || e.metaKey) {
      // Multi-select
      if (selectedItems.includes(item.name)) {
        onSelectItems(selectedItems.filter(name => name !== item.name));
      } else {
        onSelectItems([...selectedItems, item.name]);
      }
    } else {
      // Single select or navigate
      if (item.type === "directory") {
        const newPath = currentPath === "/" ? `/${item.name}` : `${currentPath}/${item.name}`;
        onNavigate(newPath);
      } else {
        onSelectItems([item.name]);
      }
    }
  };

  if (loading) {
    return (
      <div className="flex flex-1 items-center justify-center bg-card">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-auto bg-card">
      <table className="w-full">
        <thead className="sticky top-0 border-b border-border bg-[hsl(var(--win7-toolbar))]">
          <tr>
            <th className="px-4 py-2 text-left text-sm font-medium">Name</th>
            <th className="px-4 py-2 text-left text-sm font-medium">Type</th>
            <th className="px-4 py-2 text-left text-sm font-medium">Size</th>
            <th className="px-4 py-2 text-left text-sm font-medium">Modified</th>
            <th className="px-4 py-2 text-left text-sm font-medium">Actions</th>
          </tr>
        </thead>
        <tbody>
          {files.length === 0 ? (
            <tr>
              <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                This folder is empty
              </td>
            </tr>
          ) : (
            files.map((item) => {
              const isSelected = selectedItems.includes(item.name);
              return (
                <tr
                  key={item.name}
                  className={`cursor-pointer border-b border-border hover:bg-[hsl(var(--win7-hover))] ${
                    isSelected ? "bg-[hsl(var(--win7-selected))]" : ""
                  }`}
                  onClick={(e) => handleItemClick(item, e)}
                >
                  <td className="px-4 py-2">
                    <div className="flex items-center gap-2">
                      {item.type === "directory" ? (
                        <Folder className="h-4 w-4 text-primary" />
                      ) : (
                        <File className="h-4 w-4 text-muted-foreground" />
                      )}
                      <span className="text-sm">{item.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-2 text-sm text-muted-foreground">
                    {item.type === "directory" ? "Folder" : "File"}
                  </td>
                  <td className="px-4 py-2 text-sm text-muted-foreground">
                    {item.type === "file" ? formatSize(item.size) : "-"}
                  </td>
                  <td className="px-4 py-2 text-sm text-muted-foreground">
                    {formatDate(item.modifiedAt)}
                  </td>
                  <td className="px-4 py-2">
                    {item.type === "file" && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDownload(item.name);
                        }}
                        className="h-7 px-2"
                      >
                        <Download className="h-3 w-3" />
                      </Button>
                    )}
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
};
