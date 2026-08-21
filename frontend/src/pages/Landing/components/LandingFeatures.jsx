import React from "react";
import {
  FileText,
  MagnifyingGlass,
  HardDrive,
  Users,
  Wrench,
  Shield,
} from "@phosphor-icons/react";

export default function LandingFeatures() {
  const features = [
    {
      icon: FileText,
      title: "Universal Document Ingestion",
      desc: "Connect PDFs, Office documents, code repositories, web scrapers, and audio transcriptions seamlessly into your private knowledge hub.",
    },
    {
      icon: MagnifyingGlass,
      title: "Precision RAG & Vector Search",
      desc: "ContextIQ embeds chunks with semantic vectors using LanceDB to retrieve exact supporting citations without context distortion.",
    },
    {
      icon: HardDrive,
      title: "Any LLM & Vector DB",
      desc: "Run 100% offline with local models via Ollama/LM Studio or hook into top-tier commercial AI providers of your choice.",
    },
    {
      icon: Users,
      title: "Multi-User Workspaces",
      desc: "Organize knowledge into segmented workspaces with fine-grained role permissions for teams, admins, and custom manager access.",
    },
    {
      icon: Wrench,
      title: "Autonomous Agent Skills",
      desc: "Empower AI assistants with search, custom web scraping, database querying, and tool execution directly inside your chats.",
    },
    {
      icon: Shield,
      title: "Zero Data Leakage",
      desc: "Your data stays in your control. Complete privacy, self-hosted deployment options, and strict token security guaranteed.",
    },
  ];

  return (
    <section
      id="features"
      className="relative z-10 py-24 px-6 max-w-7xl mx-auto"
    >
      <div className="text-center mb-16">
        <span className="text-xs font-mono uppercase text-teal-400 tracking-widest px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/20">
          Core Capabilities
        </span>
        <h2 className="text-3xl sm:text-5xl font-extralight tracking-tight text-slate-100 mt-4">
          Engineered for Enterprise Knowledge
        </h2>
        <p className="text-sm sm:text-base font-light text-slate-400 max-w-xl mx-auto mt-4">
          Built from the ground up to synthesize scattered company data into
          instant, verifiable AI answers.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {features.map((item, idx) => {
          const Icon = item.icon;
          return (
            <div
              key={idx}
              className="group relative p-8 rounded-2xl bg-slate-900/50 border border-slate-800/80 backdrop-blur-md hover:border-teal-500/50 hover:bg-slate-900/80 transition-all duration-300 shadow-lg"
            >
              <div className="w-12 h-12 rounded-xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400 mb-6 group-hover:scale-110 group-hover:bg-teal-500/20 transition-all duration-300">
                <Icon size={24} weight="duotone" />
              </div>
              <h3 className="text-xl font-light text-slate-100 mb-3 group-hover:text-teal-300 transition-colors">
                {item.title}
              </h3>
              <p className="text-sm font-light leading-relaxed text-slate-400">
                {item.desc}
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
