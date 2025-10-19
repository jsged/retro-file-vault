import { useNavigate } from "react-router-dom";
import { Button } from "./ui/button";
import { LogOut } from "lucide-react";
import { toast } from "sonner";

export const LogoutButton = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    sessionStorage.removeItem("ftp_authenticated");
    toast.success("Logged out successfully");
    navigate("/auth");
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleLogout}
      className="h-8 gap-2 text-xs hover:bg-destructive/10"
    >
      <LogOut className="h-4 w-4" />
      Logout
    </Button>
  );
};
