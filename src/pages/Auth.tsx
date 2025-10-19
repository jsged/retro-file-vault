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
    const isAuthenticated = sessionStorage.getItem("ftp_authenticated");
    if (isAuthenticated === "true") navigate("/");
  }, [navigate]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(false);

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
    <div className="flex min-h-screen items-center justify-center bg-[url('/background.png')] bg-cover bg-center p-4 font-['Segoe_UI']">
      {/* Semi-transparent login window */}
      <div className="w-full max-w-sm rounded-lg bg-white/70 backdrop-blur-md shadow-[0_0_30px_rgba(0,0,0,0.3)] border border-white/30 animate-fade-in">
        {/* Title Bar */}
        <div className="flex items-center gap-2 border-b border-gray-300/40 bg-white/60 px-3 py-2">
          <Lock className="h-4 w-4 text-blue-600" />
          <span className="flex-1 text-sm font-semibold text-gray-900">
            jsged Game FTP Access
          </span>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="mb-5">
            <h2 className="text-lg font-semibold text-gray-900">Sign in</h2>
            <p className="text-sm text-gray-600">
              Enter your password to access the FTP File Explorer.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700"
              >
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
                className={`mt-1 h-9 border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-400/50 ${
                  error ? "border-red-500 ring-1 ring-red-400/50" : ""
                }`}
                disabled={isLoading}
                autoFocus
              />
              {error && (
                <div className="mt-2 flex items-center gap-2 text-sm text-red-600">
                  <AlertCircle className="h-4 w-4" />
                  <span>Incorrect password. Try again.</span>
                </div>
              )}
            </div>

            <div className="flex justify-end pt-2">
              <Button
                type="submit"
                disabled={isLoading || !password}
                className="h-9 px-6 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-500 disabled:opacity-50 transition-colors"
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    Verifying...
                  </span>
                ) : (
                  "Sign In"
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Auth;
