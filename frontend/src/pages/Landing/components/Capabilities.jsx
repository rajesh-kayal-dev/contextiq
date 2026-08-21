import React from "react";
import {
  FileText,
  MagnifyingGlass,
  Cpu,
  ShieldCheck,
  ArrowUpRight,
} from "@phosphor-icons/react";

export default function Capabilities() {
  const items = [
    {
      title: "Document Intelligence",
      description: "Upload and organize your documents in one workspace.",
      category: "SOURCES • INGESTION",
      icon: FileText,
    },
    {
      title: "Contextual Retrieval",
      description:
        "Find the most relevant information before generating an answer.",
      category: "LANCEDB • VECTOR RAG",
      icon: MagnifyingGlass,
    },
    {
      title: "AI Models",
      description: "Choose the AI provider and model that fits your workflow.",
      category: "LLM • PROVIDERS",
      icon: Cpu,
    },
    {
      title: "Private Knowledge",
      description:
        "Keep your documents, embeddings, and knowledge under your control.",
      category: "SECURITY • PRIVACY",
      icon: ShieldCheck,
    },
  ];

  return (
    <section
      id="features"
      className="relative z-10 w-full px-6 py-32 max-w-5xl mx-auto flex flex-col items-center"
    >
      <div id="product" className="scroll-mt-24"></div>
      <h2 className="text-3xl sm:text-5xl font-thin tracking-tight mb-20 text-neutral-100">
        Core Capabilities
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.title}
              className="group block relative p-px rounded-[2rem] bg-gradient-to-b from-neutral-800/60 to-transparent transition-transform duration-500 hover:scale-[1.02] cursor-pointer"
            >
              {/* Card Glass Backdrop */}
              <div className="absolute inset-0 bg-neutral-900/40 backdrop-blur-md rounded-[2rem] z-0" />

              <div className="relative z-10 p-6 h-full flex flex-col">
                {/* Large Visual Card Area */}
                <div className="w-full h-56 sm:h-72 rounded-3xl bg-neutral-800/40 mb-6 overflow-hidden relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-neutral-800/30 to-neutral-900/30 group-hover:scale-105 transition-transform duration-700 flex items-center justify-center">
                    <Icon
                      size={56}
                      weight="thin"
                      className="text-neutral-600 group-hover:text-neutral-300 transition-colors duration-500"
                    />
                  </div>
                </div>

                {/* Card Footer Info & Button */}
                <div className="flex items-center justify-between mt-auto px-2 pb-2">
                  <div className="text-left">
                    <h3 className="text-xl font-thin tracking-tight text-neutral-200">
                      {item.title}
                    </h3>
                    <p className="text-xs text-neutral-400 font-light mt-1">
                      {item.description}
                    </p>
                    <p
                      className="text-xs text-neutral-500 font-normal uppercase mt-2"
                      style={{ fontFamily: "'JetBrains Mono', monospace" }}
                    >
                      {item.category}
                    </p>
                  </div>

                  <div className="w-12 h-12 rounded-full border border-neutral-800 flex items-center justify-center group-hover:bg-neutral-100 group-hover:text-black transition-colors duration-500 shrink-0 ml-4">
                    <ArrowUpRight size={20} />
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
