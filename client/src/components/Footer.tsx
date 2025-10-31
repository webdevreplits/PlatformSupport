import pepsicoLogo from "@assets/image_1761935104305.png";

export function Footer() {
  const textStyle = {
    color: '#FFFFFF !important',
    WebkitTextFillColor: '#FFFFFF',
  } as React.CSSProperties;

  return (
    <footer className="relative z-10 border-t border-white/20 bg-gradient-to-r from-[#1e1b4b] via-[#312e81] to-[#1e3a8a] mt-auto">
      <div className="container mx-auto px-4 lg:px-8 py-4">
        <div className="flex items-center justify-between bg-white/15 backdrop-blur-md rounded-lg px-6 py-3 border border-white/20">
          <div className="flex items-center gap-4">
            <img src={pepsicoLogo} alt="PepsiCo" className="h-8" />
            <span className="text-sm font-bold" style={textStyle}>
              © {new Date().getFullYear()} PepsiCo. All rights reserved.
            </span>
          </div>
          <div className="flex items-center gap-6">
            <a href="#" className="text-sm font-bold hover:underline" style={textStyle}>
              Privacy Policy
            </a>
            <a href="#" className="text-sm font-bold hover:underline" style={textStyle}>
              Terms of Service
            </a>
            <a href="#" className="text-sm font-bold hover:underline" style={textStyle}>
              Contact Support
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
