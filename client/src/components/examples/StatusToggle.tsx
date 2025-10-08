import { StatusToggle } from "../StatusToggle";
import { useState } from "react";

export default function StatusToggleExample() {
  const [enabled1, setEnabled1] = useState(true);
  const [enabled2, setEnabled2] = useState(false);

  return (
    <div className="flex flex-col gap-4 p-8 bg-gradient-to-br from-blue-950 to-purple-950">
      <StatusToggle 
        enabled={enabled1} 
        onToggle={setEnabled1} 
        label="Policy Enabled" 
      />
      <StatusToggle 
        enabled={enabled2} 
        onToggle={setEnabled2} 
        label="Notifications" 
      />
    </div>
  );
}
