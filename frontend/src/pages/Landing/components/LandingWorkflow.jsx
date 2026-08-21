import React from "react";
import { ArrowRight } from "@phosphor-icons/react";

export default function LandingWorkflow() {
  const steps = [
    {
      num: "01",
      title: "Document Ingestion",
      desc: "Upload PDFs, Markdown, text files, media, or web URLs directly into ContextIQ workspace.",
    },
    {
      num: "02",
      title: "Smart Text Chunking",
      desc: "Content is parsed, normalized, and split into optimized semantic chunks preserving context boundaries.",
    },
    {
      num: "03",
      title: "Vector Embedding",
      desc: "Text chunks are transformed into dense vector math using local or cloud embedding models.",
    },
    {
      num: "04",
      title: "LanceDB Search",
      desc: "When a query arrives, vector similarity search matches top relevant chunks instantly.",
    },
    {
      num: "05",
      title: "Contextual RAG Prompt",
      desc: "Retrieved chunks are formatted with strict source provenance into the LLM system prompt.",
    },
    {
      num: "06",
      title: "Verifiable Answer",
      desc: "The AI model generates accurate answers complete with click-to-verify document citations.",
    },
  ];

  return (
    <section
      id="workflow"
      className="relative z-10 py-24 px-6 max-w-7xl mx-auto border-t border-slate-800/80"
    >
      <div className="text-center mb-16">
        <span className="text-xs font-mono uppercase text-cyan-400 tracking-widest px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20">
          Under The Hood
        </span>
        <h2 className="text-3xl sm:text-5xl font-extralight tracking-tight text-slate-100 mt-4">
          The RAG Knowledge Pipeline
        </h2>
        <p className="text-sm sm:text-base font-light text-slate-400 max-w-xl mx-auto mt-4">
          How ContextIQ turns raw un-structured data into precise,
          citation-backed intelligence.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {steps.map((s, idx) => (
          <div
            key={idx}
            className="relative p-8 rounded-2xl bg-[#0B1220] border border-slate-800/80 hover:border-cyan-500/40 transition-all duration-300 flex flex-col justify-between group"
          >
            <div>
              <div className="flex items-center justify-between mb-6">
                <span className="text-3xl font-mono font-extralight text-teal-400/80 group-hover:text-teal-300">
                  {s.num}
                </span>
                {idx < steps.length - 1 && (
                  <ArrowRight
                    size={18}
                    className="text-slate-700 hidden lg:block group-hover:text-teal-400 group-hover:translate-x-1 transition-all"
                  />
                )}
              </div>
              <h3 className="text-xl font-light text-slate-100 mb-3 group-hover:text-cyan-300 transition-colors">
                {s.title}
              </h3>
              <p className="text-sm font-light leading-relaxed text-slate-400">
                {s.desc}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
