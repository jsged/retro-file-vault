import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";

const ThemeToggle = () => {
  const [isDark, setIsDark] = useState(false);

  // Load saved theme on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "dark") {
      document.documentElement.classList.add("dark");
      setIsDark(true);
    } else {
      document.documentElement.classList.remove("dark");
      setIsDark(false);
    }
  }, []);

  // Toggle handler
  const toggleTheme = () => {
    const newTheme = isDark ? "light" : "dark";
    setIsDark(!isDark);
    localStorage.setItem("theme", newTheme);
    document.documentElement.classList.toggle("dark");
  };

  return (
    <button
      onClick={toggleTheme}
      className="flex items-center justify-center w-9 h-9 rounded-md border border-border bg-secondary hover:bg-muted transition-colors duration-300"
      title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
    >
      <div
        className="transition-transform duration-500 ease-in-out"
        style={{
          transform: isDark ? "rotate(180deg)" : "rotate(0deg)",
        }}
      >
        {isDark ? (
          <Sun className="h-5 w-5 text-yellow-400" />
        ) : (
          <Moon className="h-5 w-5 text-gray-700" />
        )}
      </div>
    </button>
  );
};

export default ThemeToggle;
