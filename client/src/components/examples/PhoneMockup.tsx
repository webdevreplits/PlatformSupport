import { PhoneMockup } from "../PhoneMockup";
import { GlassmorphicCard } from "../GlassmorphicCard";

export default function PhoneMockupExample() {
  return (
    <div className="flex items-center justify-center p-8 bg-gradient-to-br from-blue-950 to-purple-950 min-h-[600px]">
      <PhoneMockup>
        <div className="p-4 space-y-4">
          <div className="text-xs text-white/70">09:41</div>
          <GlassmorphicCard gradient="blue" className="p-4">
            <div className="text-sm font-semibold text-white">Sample Card</div>
            <div className="text-2xl font-bold mt-2">$1,234</div>
          </GlassmorphicCard>
        </div>
      </PhoneMockup>
    </div>
  );
}
