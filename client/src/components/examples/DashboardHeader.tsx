import { DashboardHeader } from "../DashboardHeader";
import { useState } from "react";

export default function DashboardHeaderExample() {
  const [isDark, setIsDark] = useState(true);

  return (
    <div className="bg-gradient-to-br from-blue-950 to-purple-950 min-h-[200px]">
      <DashboardHeader 
        onThemeToggle={() => setIsDark(!isDark)} 
        isDark={isDark}
      />
    </div>
  );
}
