export function CardPattern() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-10">
      <svg width="100%" height="100%" className="absolute inset-0">
        <defs>
          <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#9333ea" />
            <stop offset="50%" stopColor="#ec4899" />
            <stop offset="100%" stopColor="#8b5cf6" />
          </linearGradient>
        </defs>
        
        {/* Flowing curved lines pattern */}
        <path
          d="M-50,80 Q150,60 350,80 T750,80"
          stroke="url(#lineGradient)"
          strokeWidth="2"
          fill="none"
          opacity="0.6"
        />
        <path
          d="M-50,120 Q200,100 400,120 T850,120"
          stroke="url(#lineGradient)"
          strokeWidth="2"
          fill="none"
          opacity="0.5"
        />
        <path
          d="M-100,40 Q100,20 300,40 T700,40"
          stroke="url(#lineGradient)"
          strokeWidth="1.5"
          fill="none"
          opacity="0.4"
        />
        <path
          d="M50,160 Q250,140 450,160 T900,160"
          stroke="url(#lineGradient)"
          strokeWidth="2"
          fill="none"
          opacity="0.5"
        />
        <path
          d="M-80,200 Q120,180 320,200 T720,200"
          stroke="url(#lineGradient)"
          strokeWidth="1.5"
          fill="none"
          opacity="0.3"
        />
      </svg>
    </div>
  );
}
