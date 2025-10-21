import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Lock, Minus, X, AlertCircle } from "lucide-react";

const Auth = () => {
  const [host, setHost] = useState("ftp.fasthosts.co.uk");
  const [port, setPort] = useState("21");
  const [username, setUsername] = useState("jsged_games");
  const [password, setPassword] = useState("gamesaresupercool");
  const [anonymous, setAnonymous] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const offsetRef = useRef({ x: 0, y: 0 });
  const navigate = useNavigate();
  const boxRef = useRef(null);

  useEffect(() => {
    const isAuthenticated = sessionStorage.getItem("ftp_authenticated");
    if (isAuthenticated === "true") navigate("/");

    // Center window after mount
    const centerWindow = () => {
      if (boxRef.current) {
        const { offsetWidth, offsetHeight } = boxRef.current;
        setPosition({
          x: window.innerWidth / 2 - offsetWidth / 2,
          y: window.innerHeight / 2 - offsetHeight / 2,
        });
      }
    };
    centerWindow();
    window.addEventListener("resize", centerWindow);
    return () => window.removeEventListener("resize", centerWindow);
  }, [navigate]);

  const handlePointerDown = (e) => {
    setDragging(true);
    offsetRef.current = {
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    };
  };

  const handlePointerMove = (e) => {
    if (!dragging) return;
    setPosition({
      x: e.clientX - offsetRef.current.x,
      y: e.clientY - offsetRef.current.y,
    });
  };

  const handlePointerUp = () => setDragging(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(false);

    setTimeout(() => {
      const ftpConfig = {
        host,
        port: parseInt(port),
        user: anonymous ? "anonymous" : username,
        password: anonymous ? "" : password,
      };

      sessionStorage.setItem("ftp_authenticated", "true");
      sessionStorage.setItem("ftp_config", JSON.stringify(ftpConfig));
      toast.success("Connected successfully");
      navigate("/");
      setIsLoading(false);
    }, 800);
  };

  return (
    <div
      className="relative flex min-h-screen items-center justify-center bg-[url('/background.png')] bg-cover bg-center font-['Segoe_UI'] select-none overflow-hidden"
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
    >
      {/* Main auth window */}
      {!isMinimized && (
        <div
          ref={boxRef}
          style={{
            transform: `translate(${position.x}px, ${position.y}px)`,
          }}
          className={`absolute w-full max-w-sm rounded-md bg-white/75 backdrop-blur-md shadow-[0_0_30px_rgba(0,0,0,0.3)] border border-white/30 transition-all ${
            dragging ? "cursor-grabbing" : "cursor-default"
          }`}
          onPointerDown={(e) => e.stopPropagation()}
        >
          {/* Title Bar */}
          <div
            onPointerDown={handlePointerDown}
            className="flex items-center justify-between border-b border-gray-300/40 bg-white/70 px-3 py-1.5 cursor-grab active:cursor-grabbing"
          >
            <div className="flex items-center gap-2">
              <Lock className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-semibold text-gray-900">
                jsged Game FTP Server Login
              </span>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setIsMinimized(true)}
                className="h-5 w-5 flex items-center justify-center rounded hover:bg-gray-300/40 transition"
                title="Minimize"
              >
                <Minus className="h-3 w-3 text-gray-700" />
              </button>
              <button
                onClick={() => toast("Button Disabled")}
                className="h-5 w-5 flex items-center justify-center rounded hover:bg-red-500/70 hover:text-white transition"
                title="Close"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          </div>

          {/* Banner (Windows Home Server style, with layered images) */}
          <div
            className="relative h-24 w-full overflow-hidden"
            style={{
              backgroundImage: "url('/banner-bg.jpg')", // this is your background image
              backgroundSize: "cover", // makes it crop and fill the area
              backgroundPosition: "center", // centers the image
            }}
          >
            {/* Optional dark gradient overlay for text/logo contrast */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/20 to-transparent pointer-events-none" />

            {/* Foreground logo or overlay image */}
            <div className="absolute inset-0 flex items-center justify-center">
              <img
                src="/banner-logo.png" // this is your overlay (e.g. Windows Home Server logo)
                alt="Windows Server Logo"
                className="h-16 w-auto object-contain drop-shadow-md"
              />
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            <div className="mb-5">
              <h2 className="text-lg font-semibold text-gray-900">FTP Connection</h2>
              <p className="text-sm text-gray-600">
                Enter your FTP server credentials to connect.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="host" className="block text-sm font-medium text-gray-700">
                    Server Address
                  </label>
                  <Input
                    id="host"
                    type="text"
                    value={host}
                    onChange={(e) => setHost(e.target.value)}
                    placeholder="ftp.example.com"
                    className="mt-1 h-9 border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-400/50"
                    disabled={isLoading}
                  />
                </div>
                <div>
                  <label htmlFor="port" className="block text-sm font-medium text-gray-700">
                    Port
                  </label>
                  <Input
                    id="port"
                    type="text"
                    value={port}
                    onChange={(e) => setPort(e.target.value)}
                    placeholder="21"
                    className="mt-1 h-9 border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-400/50"
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                  Username
                </label>
                <Input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter username"
                  className="mt-1 h-9 border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-400/50"
                  disabled={isLoading || anonymous}
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
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
                  disabled={isLoading || anonymous}
                />
                {error && (
                  <div className="mt-2 flex items-center gap-2 text-sm text-red-600">
                    <AlertCircle className="h-4 w-4" />
                    <span>Connection failed. Check your credentials.</span>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="anonymous"
                  checked={anonymous}
                  onChange={(e) => setAnonymous(e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  disabled={isLoading}
                />
                <label htmlFor="anonymous" className="text-sm font-medium text-gray-700">
                  Anonymous login
                </label>
              </div>

              <div className="flex justify-end pt-2">
                <Button
                  type="submit"
                  disabled={isLoading || (!anonymous && (!host || !username || !password))}
                  className="h-9 px-6 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-500 disabled:opacity-50 transition-colors"
                >
                  {isLoading ? (
                    <span className="flex items-center gap-2">
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                      Connecting...
                    </span>
                  ) : (
                    "Connect"
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Minimized Bar */}
      {isMinimized && (
        <div
          className="fixed bottom-3 left-1/2 -translate-x-1/2 w-64 rounded-t-md bg-white/80 border border-gray-300 shadow-md backdrop-blur-sm flex items-center justify-between px-3 py-1 cursor-pointer hover:bg-white transition"
          onClick={() => setIsMinimized(false)}
        >
          <div className="flex items-center gap-2">
            <Lock className="h-4 w-4 text-blue-600" />
            <span className="text-sm font-medium text-gray-800">
              jsged Game FTP Access
            </span>
          </div>
          <span className="text-xs text-gray-500">Click to restore</span>
        </div>
      )}
    </div>
  );
};

export default Auth;
