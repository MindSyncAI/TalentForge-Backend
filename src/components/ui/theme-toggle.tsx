import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { toast } from "@/hooks/use-toast";

export function ThemeToggle() {
  const [theme, setTheme] = useState<"light" | "dark">("dark");

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") as "light" | "dark" | null;
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    
    if (savedTheme) {
      setTheme(savedTheme);
      document.documentElement.classList.toggle("dark", savedTheme === "dark");
      document.documentElement.classList.toggle("light", savedTheme === "light");
      document.body.classList.toggle("dark", savedTheme === "dark");
      document.body.classList.toggle("light", savedTheme === "light");
      document.getElementById("root")?.classList.toggle("dark", savedTheme === "dark");
      document.getElementById("root")?.classList.toggle("light", savedTheme === "light");
    } else {
      // Default to dark mode
      setTheme("dark");
      document.documentElement.classList.add("dark");
      document.body.classList.add("dark");
      document.getElementById("root")?.classList.add("dark");
      localStorage.setItem("theme", "dark");
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    
    // Remove both classes first
    document.documentElement.classList.remove("dark", "light");
    document.body.classList.remove("dark", "light");
    document.getElementById("root")?.classList.remove("dark", "light");
    
    // Add the appropriate class
    document.documentElement.classList.add(newTheme);
    document.body.classList.add(newTheme);
    document.getElementById("root")?.classList.add(newTheme);
    
    // Save to localStorage
    localStorage.setItem("theme", newTheme);
    
    // Show appropriate toast notification
    if (newTheme === "dark") {
      toast({
        title: "Nox",
        description: "Dark mode enabled",
        duration: 2000,
      });
    } else {
      toast({
        title: "Lumos",
        description: "Light mode enabled",
        duration: 2000,
      });
    }
  };

  return (
    <Button 
      variant="ghost" 
      size="icon" 
      onClick={toggleTheme} 
      className={`h-9 w-9 rounded-full transition-all ${
        theme === "light" 
          ? "bg-white hover:bg-gray-100 text-gray-800" 
          : "bg-[#1D1D1F] hover:bg-[#2D2D2F] text-gray-400 hover:text-talentforge-400"
      }`}
    >
      {theme === "light" ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}
