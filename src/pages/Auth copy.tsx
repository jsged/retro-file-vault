import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Lock, AlertCircle } from "lucide-react";

const Auth = () => {
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if already authenticated
    const isAuthenticated = sessionStorage.getItem("ftp_authenticated");
    if (isAuthenticated === "true") {
      navigate("/");
    }
  }, [navigate]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(false);

    // Simulate login delay for authenticity
    setTimeout(() => {
      if (password === "jequaviousdingle") {
        sessionStorage.setItem("ftp_authenticated", "true");
        toast.success("Access granted");
        navigate("/");
      } else {
        setError(true);
        toast.error("Incorrect password");
        setPassword("");
      }
      setIsLoading(false);
    }, 800);
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <img src="/background.png" alt="Background" className="fixed inset-0 -z-10 h-full w-full object-cover opacity-100" />
      {/* Windows 7 Aero Dialog */}
      <div className="w-full max-w-md animate-scale-in">
        {/* Window Chrome */}
        <div className="overflow-hidden rounded-t-lg border border-white/30 bg-gradient-to-b from-white/90 to-white/70 shadow-2xl backdrop-blur-md">
          {/* Title Bar */}
          <div className="flex items-center gap-2 border-b border-white/40 bg-gradient-to-b from-white/50 to-white/30 px-3 py-2">
            <Lock className="h-4 w-4 text-primary" />
            <span className="flex-1 text-sm font-semibold text-foreground">
              jsged Game FTP Access
            </span>
          </div>

          {/* Content Area */}
          <div className="p-6">
            <div className="mb-6 flex items-start gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-b from-primary to-primary/80 shadow-lg">
                <Lock className="h-6 w-6 text-white" />
              </div>
              <div className="flex-1">
                <h2 className="mb-2 text-lg font-semibold text-foreground">
                  Log In
                </h2>
                <p className="text-sm text-muted-foreground">
                  Please enter your password to access the FTP File Explorer.
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium text-foreground">
                  Password
                </label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setError(false);
                  }}
                  placeholder="Enter password"
                  className={`h-9 border-[hsl(0,0%,70%)] bg-white shadow-inner transition-all ${
                    error ? "border-destructive ring-1 ring-destructive" : ""
                  }`}
                  disabled={isLoading}
                  autoFocus
                />
                {error && (
                  <div className="flex items-center gap-2 text-sm text-destructive animate-fade-in">
                    <AlertCircle className="h-4 w-4" />
                    <span>The password is incorrect. Try again.</span>
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button
                  type="submit"
                  disabled={isLoading || !password}
                  className="h-9 bg-gradient-to-b from-primary to-primary/90 px-6 text-sm font-semibold text-white shadow-md hover:from-primary/90 hover:to-primary/80 disabled:opacity-50"
                >
                  {isLoading ? (
                    <span className="flex items-center gap-2">
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                      Verifying...
                    </span>
                  ) : (
                    "OK"
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>

        {/* Window Shadow Base */}
        <div className="h-2 rounded-b-lg bg-gradient-to-b from-black/20 to-transparent" />
      </div>
    </div>
  );
};

export default Auth;
