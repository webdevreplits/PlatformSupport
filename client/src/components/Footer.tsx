import pepsicoLogo from "@assets/image_1761935104305.png";

export function Footer() {
  return (
    <footer className="relative z-10 border-t border-white/10 bg-gradient-to-r from-[#1e1b4b] via-[#312e81] to-[#1e3a8a] mt-auto">
      <div className="container mx-auto px-4 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <img src={pepsicoLogo} alt="PepsiCo" className="h-8" />
            <span className="text-sm text-white/70">
              © {new Date().getFullYear()} PepsiCo. All rights reserved.
            </span>
          </div>
          <div className="flex items-center gap-6">
            <a href="#" className="text-sm text-white/70 hover:text-white transition-colors">
              Privacy Policy
            </a>
            <a href="#" className="text-sm text-white/70 hover:text-white transition-colors">
              Terms of Service
            </a>
            <a href="#" className="text-sm text-white/70 hover:text-white transition-colors">
              Contact Support
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
