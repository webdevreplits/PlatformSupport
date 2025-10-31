export function BackgroundDecor() {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {/* Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#1e1b4b] via-[#4c1d95] to-[#1e3a8a]" />
      
      {/* Flowing Lines Pattern */}
      <svg className="absolute top-0 right-0 w-3/4 h-full opacity-20" viewBox="0 0 800 800" preserveAspectRatio="none">
        <path
          d="M 0,400 Q 200,300 400,400 T 800,400"
          stroke="url(#gradient1)"
          strokeWidth="2"
          fill="none"
        />
        <path
          d="M 0,300 Q 200,200 400,300 T 800,300"
          stroke="url(#gradient1)"
          strokeWidth="2"
          fill="none"
        />
        <path
          d="M 0,500 Q 200,400 400,500 T 800,500"
          stroke="url(#gradient1)"
          strokeWidth="2"
          fill="none"
        />
        <defs>
          <linearGradient id="gradient1" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.5" />
          </linearGradient>
        </defs>
      </svg>

      {/* Dots Grid */}
      <div className="absolute bottom-10 left-10 grid grid-cols-6 gap-2 opacity-30">
        {Array.from({ length: 24 }).map((_, i) => (
          <div key={i} className="w-2 h-2 rounded-full bg-gradient-to-r from-purple-500 to-pink-500" />
        ))}
      </div>

      {/* Striped Circle */}
      <div className="absolute top-20 left-10 w-32 h-32 rounded-full overflow-hidden opacity-40">
        <div className="absolute inset-0 bg-gradient-to-br from-orange-400 to-orange-600">
          <div className="absolute inset-0" style={{
            background: 'repeating-linear-gradient(45deg, transparent, transparent 8px, rgba(255,255,255,0.3) 8px, rgba(255,255,255,0.3) 16px)'
          }} />
        </div>
      </div>

      {/* Strategy Badge */}
      <div className="absolute top-10 left-10 flex items-center gap-2 opacity-60">
        <div className="w-16 h-16 rounded-full border-2 border-white/40 flex items-center justify-center">
          <div className="text-white text-[8px] text-center leading-tight font-semibold">
            STRATEGY +<br/>TRANSFORMATION
          </div>
        </div>
      </div>

      {/* DATA, ANALYTICS & AI Label */}
      <div className="absolute bottom-10 left-10 text-white/50 text-xs font-semibold tracking-wider opacity-70">
        DATA, ANALYTICS & AI
      </div>
    </div>
  );
}
