import React from "react";

export default function LandingFooter() {
  const year = new Date().getFullYear();

  return (
    <footer
      id="philosophy"
      className="relative z-10 w-full px-6 py-12 border-t border-slate-800/80 bg-[#0B1220]/80 backdrop-blur-md"
    >
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6 text-xs font-mono text-slate-500 uppercase tracking-wider">
        <div className="flex items-center gap-3">
          <span className="w-2 h-2 rounded-full bg-teal-400"></span>
          <span>© {year} ContextIQ Studio • Privacy Engineered</span>
        </div>

        <div className="flex items-center gap-6">
          <a href="#features" className="hover:text-teal-400 transition-colors">
            Capabilities
          </a>
          <a href="#workflow" className="hover:text-teal-400 transition-colors">
            Architecture
          </a>
          <span className="text-slate-700">|</span>
          <span className="text-teal-400/80">LanceDB Enabled</span>
        </div>
      </div>
    </footer>
  );
}
