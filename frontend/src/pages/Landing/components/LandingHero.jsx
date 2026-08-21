import React from "react";
import { Link } from "react-router-dom";
import paths from "@/utils/paths";
import { ArrowRight, ShieldCheck, Cpu, Lightning } from "@phosphor-icons/react";
import ContextIQVisual from "./ContextIQVisual";

export default function LandingHero({ isAuthenticated = false }) {
  return (
    <section className="relative z-10 pt-36 pb-20 px-6 max-w-7xl mx-auto flex flex-col items-center text-center">
      {/* Availability / Status Badge */}
      <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full border border-teal-500/30 bg-slate-900/60 backdrop-blur-md mb-8 shadow-[0_0_20px_rgba(20,184,166,0.15)]">
        <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse shadow-[0_0_8px_rgba(20,184,166,0.8)]" />
        <span className="text-xs font-mono tracking-tight uppercase text-teal-300">
          ContextIQ 2.0 • Private RAG Knowledge Engine
        </span>
      </div>

      {/* Main Headline */}
      <h1 className="text-5xl md:text-7xl font-extralight tracking-tight leading-[1.08] mb-6 text-slate-100 max-w-4xl">
        Ask your knowledge.{" "}
        <span className="bg-gradient-to-r from-teal-400 via-cyan-400 to-teal-200 bg-clip-text text-transparent font-normal">
          Get answers with context.
        </span>
      </h1>

      {/* Description */}
      <p className="text-base sm:text-lg font-light leading-relaxed text-slate-400 max-w-2xl mb-10">
        Turn your documents into a private AI knowledge assistant. Query PDFs,
        codebases, and media with strict privacy, zero data leaks, and accurate
        vector retrieval.
      </p>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16 w-full max-w-md">
        <Link
          to={isAuthenticated ? paths.home() : paths.login()}
          className="group relative inline-flex items-center justify-center gap-3 px-8 py-3.5 rounded-full text-xs font-medium uppercase tracking-wider text-slate-950 bg-gradient-to-r from-teal-400 to-cyan-400 hover:from-teal-300 hover:to-cyan-300 transition-all duration-300 shadow-[0_0_35px_rgba(20,184,166,0.35)] hover:scale-[1.02] w-full sm:w-auto"
        >
          <span>{isAuthenticated ? "Go to Workspace" : "Get Started"}</span>
          <ArrowRight
            size={16}
            weight="bold"
            className="group-hover:translate-x-1 transition-transform duration-300"
          />
        </Link>

        {!isAuthenticated && (
          <Link
            to={paths.login()}
            className="inline-flex items-center justify-center px-8 py-3.5 rounded-full text-xs font-mono uppercase tracking-wider text-slate-300 border border-slate-800 hover:border-teal-500/50 hover:text-white hover:bg-slate-900/40 transition-all duration-300 w-full sm:w-auto"
          >
            Sign In
          </Link>
        )}
      </div>

      {/* Interactive Visual Canvas Container */}
      <div className="w-full max-w-5xl h-[440px] md:h-[500px] mb-20 shadow-[0_20px_60px_rgba(0,0,0,0.6)]">
        <ContextIQVisual />
      </div>

      {/* High-Level Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 w-full max-w-4xl py-8 border-y border-slate-800/80">
        <div className="flex items-center justify-center gap-4">
          <div className="p-3 rounded-xl bg-teal-500/10 border border-teal-500/20 text-teal-400">
            <ShieldCheck size={28} />
          </div>
          <div className="text-left">
            <div className="text-xl font-light text-slate-100">100% Local</div>
            <div className="text-xs font-mono uppercase text-slate-500">
              Private Data Privacy
            </div>
          </div>
        </div>

        <div className="flex items-center justify-center gap-4">
          <div className="p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
            <Cpu size={28} />
          </div>
          <div className="text-left">
            <div className="text-xl font-light text-slate-100">Multi-Model</div>
            <div className="text-xs font-mono uppercase text-slate-500">
              Ollama, OpenAI, Custom
            </div>
          </div>
        </div>

        <div className="flex items-center justify-center gap-4">
          <div className="p-3 rounded-xl bg-teal-500/10 border border-teal-500/20 text-teal-300">
            <Lightning size={28} />
          </div>
          <div className="text-left">
            <div className="text-xl font-light text-slate-100">Sub-second</div>
            <div className="text-xs font-mono uppercase text-slate-500">
              LanceDB Vector RAG
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
