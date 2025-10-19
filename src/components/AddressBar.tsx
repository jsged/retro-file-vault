import { ChevronRight, Home } from "lucide-react";
import { Button } from "./ui/button";

interface AddressBarProps {
  currentPath: string;
  onNavigate: (path: string) => void;
}

export const AddressBar = ({ currentPath, onNavigate }: AddressBarProps) => {
  const pathParts = currentPath.split("/").filter(Boolean);

  return (
    <div className="flex items-center gap-1 border-b border-border bg-[hsl(var(--win7-address-bar))] px-2 py-1.5">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onNavigate("/")}
        className="h-7 px-2 hover:bg-[hsl(var(--win7-hover))]"
      >
        <Home className="h-4 w-4" />
      </Button>
      <ChevronRight className="h-4 w-4 text-muted-foreground" />
      {pathParts.length === 0 ? (
        <span className="text-sm">Root</span>
      ) : (
        pathParts.map((part, index) => {
          const path = "/" + pathParts.slice(0, index + 1).join("/");
          return (
            <div key={path} className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onNavigate(path)}
                className="h-7 px-2 text-sm hover:bg-[hsl(var(--win7-hover))]"
              >
                {part}
              </Button>
              {index < pathParts.length - 1 && (
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              )}
            </div>
          );
        })
      )}
    </div>
  );
};
