
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import { useEffect, useState } from "react";
import ThemeToggle from "./ThemeToggle";

const Layout = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [theme, setTheme] = useState<"light" | "dark">("light");
  
  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
    document.documentElement.classList.toggle("dark");
  };

  useEffect(() => {
    // Check for saved theme preference or use system preference
    const savedTheme = localStorage.getItem("theme") as "light" | "dark" | null;
    const systemPrefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    
    const initialTheme = savedTheme || (systemPrefersDark ? "dark" : "light");
    setTheme(initialTheme);
    
    if (initialTheme === "dark") {
      document.documentElement.classList.add("dark");
    }
  }, []);

  return (
    <div className="flex min-h-screen bg-background dark:bg-gray-900 transition-colors duration-300">
      {/* Mobile menu button */}
      <button
        className="fixed z-20 top-4 left-4 p-2 rounded-md md:hidden text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 shadow-md"
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          {isMobileMenuOpen ? (
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          ) : (
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16"
            />
          )}
        </svg>
      </button>

      {/* Sidebar for mobile (overlay) */}
      <div
        className={`fixed inset-0 z-10 transform transition-transform duration-300 ease-in-out md:hidden ${
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="relative w-64 h-full">
          <Sidebar closeMobileMenu={() => setIsMobileMenuOpen(false)} />
        </div>
        <div 
          className="absolute inset-0 bg-black bg-opacity-50" 
          onClick={() => setIsMobileMenuOpen(false)}
          style={{ left: "16rem" }}
        ></div>
      </div>

      {/* Sidebar for desktop (fixed) */}
      <div className="hidden md:block md:w-64 shrink-0">
        <Sidebar />
      </div>

      {/* Main content */}
      <main className="flex-1 flex flex-col">
        <div className="py-2 px-4 flex justify-end items-center border-b dark:border-gray-800">
          <ThemeToggle theme={theme} toggleTheme={toggleTheme} />
        </div>
        <div className="flex-1 p-4 md:p-6 animate-fade-in overflow-y-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default Layout;
