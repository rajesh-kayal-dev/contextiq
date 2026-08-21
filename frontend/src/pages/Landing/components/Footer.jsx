import React from "react";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="relative z-50 flex items-center justify-between p-8 mix-blend-difference pointer-events-none w-full border-t border-neutral-900/50">
      <div
        className="text-xs font-normal tracking-tight text-neutral-600 uppercase"
        style={{ fontFamily: "'JetBrains Mono', monospace" }}
      >
        © {year} ContextIQ
      </div>
      <div
        className="text-xs font-normal tracking-tight text-neutral-600 uppercase flex items-center gap-2"
        style={{ fontFamily: "'JetBrains Mono', monospace" }}
      >
        <span className="w-1 h-1 rounded-full bg-neutral-400"></span>
        Private AI Knowledge
      </div>
    </footer>
  );
}
