import React from "react";

export default function Metrics() {
  const metrics = [
    { value: "PRIVATE", label: "YOUR DATA" },
    { value: "LOCAL", label: "KNOWLEDGE" },
    { value: "SMART", label: "RETRIEVAL" },
  ];

  return (
    <div className="relative z-10 flex items-center justify-center gap-10 sm:gap-24 w-full max-w-4xl mx-auto pb-20">
      {metrics.map((item, idx) => (
        <React.Fragment key={item.label}>
          {idx > 0 && (
            <div className="w-px h-10 bg-gradient-to-b from-transparent via-neutral-800 to-transparent" />
          )}
          <div className="flex flex-col items-center gap-2">
            <div
              className="text-xl sm:text-2xl font-thin tracking-tight text-transparent bg-clip-text"
              style={{
                backgroundImage:
                  "linear-gradient(135deg, #f5f5f5 0%, #737373 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              {item.value}
            </div>
            <div
              className="text-xs font-normal tracking-tight uppercase text-neutral-600"
              style={{ fontFamily: "'JetBrains Mono', monospace" }}
            >
              {item.label}
            </div>
          </div>
        </React.Fragment>
      ))}
    </div>
  );
}
