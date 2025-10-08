import { GlassmorphicCard } from "../GlassmorphicCard";

export default function GlassmorphicCardExample() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gradient-to-br from-blue-950 to-purple-950 min-h-[400px]">
      <GlassmorphicCard gradient="blue">
        <div className="p-6">
          <h3 className="text-lg font-semibold text-white">Blue Card</h3>
          <p className="text-sm text-white/70 mt-2">With blue gradient overlay</p>
        </div>
      </GlassmorphicCard>
      <GlassmorphicCard gradient="mint">
        <div className="p-6">
          <h3 className="text-lg font-semibold text-white">Mint Card</h3>
          <p className="text-sm text-white/70 mt-2">With mint gradient overlay</p>
        </div>
      </GlassmorphicCard>
      <GlassmorphicCard gradient="coral">
        <div className="p-6">
          <h3 className="text-lg font-semibold text-white">Coral Card</h3>
          <p className="text-sm text-white/70 mt-2">With coral gradient overlay</p>
        </div>
      </GlassmorphicCard>
    </div>
  );
}
