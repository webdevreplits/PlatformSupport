import { cn } from "@/lib/utils";

interface PhoneMockupProps {
  children?: React.ReactNode;
  className?: string;
}

export function PhoneMockup({ children, className }: PhoneMockupProps) {
  return (
    <div className={cn("relative mx-auto", className)}>
      <div className="relative w-[280px] h-[570px] bg-gray-900 rounded-[2.5rem] p-3 shadow-2xl border-8 border-gray-800">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-gray-800 rounded-b-2xl z-10" />
        
        <div className="w-full h-full bg-gradient-to-br from-blue-950 to-purple-950 rounded-[1.75rem] overflow-hidden">
          {children}
        </div>
      </div>
    </div>
  );
}
