import { Moon, Sun } from "lucide-react";
import { useState } from "react";

const ThemeToggle = () => {
  const [isDark, setIsDark] = useState(false);

  const toggleTheme = () => {
    document.body.classList.toggle("dark");
    setIsDark((isDark) => !isDark);
  };

  return (
    <button
      type="button"
      title="toggle dark theme"
      className="w-12 h-12 min-w-12 min-h-12 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-[oklch(27.4%_.006_286.033)] rounded-sm cursor-pointer"
      onClick={toggleTheme}
    >
      {!isDark && <Moon />}
      {isDark && <Sun />}
    </button>
  );
};

export default ThemeToggle;
