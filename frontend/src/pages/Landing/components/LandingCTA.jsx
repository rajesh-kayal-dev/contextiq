import React from "react";
import { Link } from "react-router-dom";
import paths from "@/utils/paths";
import { ArrowRight, Sparkle } from "@phosphor-icons/react";

export default function LandingCTA({ isAuthenticated = false }) {
  return (
    <section className="relative z-10 py-24 px-6 max-w-5xl mx-auto">
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-[#0B1220] to-slate-900 border border-teal-500/30 p-10 sm:p-16 text-center shadow-[0_0_50px_rgba(20,184,166,0.15)]">
        {/* Ambient glow background */}
        <div className="absolute -top-24 -left-24 w-72 h-72 rounded-full bg-teal-500/10 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-72 h-72 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none" />

        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/30 text-teal-300 text-xs font-mono uppercase tracking-wider mb-6">
          <Sparkle size={14} weight="fill" />
          <span>Ready to Supercharge Your Data?</span>
        </div>

        <h2 className="text-3xl sm:text-5xl font-extralight text-slate-100 mb-6 tracking-tight">
          Start Querying Your Documents Today
        </h2>

        <p className="text-base font-light text-slate-400 max-w-xl mx-auto mb-10 leading-relaxed">
          Unlock instant semantic retrieval, contextual AI conversations, and
          complete control over your private data.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            to={isAuthenticated ? paths.home() : paths.login()}
            className="group inline-flex items-center justify-center gap-3 px-8 py-3.5 rounded-full text-xs font-medium uppercase tracking-wider text-slate-950 bg-teal-400 hover:bg-teal-300 transition-all duration-300 shadow-[0_0_30px_rgba(20,184,166,0.4)] w-full sm:w-auto"
          >
            <span>
              {isAuthenticated ? "Enter Workspace" : "Get Started Now"}
            </span>
            <ArrowRight
              size={16}
              weight="bold"
              className="group-hover:translate-x-1 transition-transform"
            />
          </Link>
        </div>
      </div>
    </section>
  );
}
