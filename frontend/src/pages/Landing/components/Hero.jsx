import React from "react";
import { Link } from "react-router-dom";
import paths from "@/utils/paths";
import { ArrowRight } from "@phosphor-icons/react";

export default function Hero({ isAuthenticated = false, onOpenGuestModal }) {
  return (
    <section className="relative z-10 flex flex-col items-center justify-center w-full min-h-screen px-6 text-center pt-24 pb-16">
      {/* Precision Status Badge */}
      <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full border border-neutral-800/60 bg-neutral-900/40 backdrop-blur-md mb-8 shadow-[0_0_20px_rgba(0,0,0,0.5)]">
        <span className="w-1.5 h-1.5 rounded-full bg-neutral-300 shadow-[0_0_8px_rgba(200,200,200,0.5)] animate-pulse" />
        <span
          className="text-xs font-normal tracking-tight uppercase text-neutral-400"
          style={{ fontFamily: "'JetBrains Mono', monospace" }}
        >
          PRIVATE AI KNOWLEDGE
        </span>
      </div>

      {/* Headline */}
      <h1 className="text-5xl md:text-7xl font-thin tracking-tight leading-[1.05] mb-6 text-neutral-100 max-w-4xl mx-auto flex flex-wrap justify-center gap-x-[0.25em] gap-y-2">
        <span>Ask your knowledge.</span>{" "}
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-neutral-300 to-neutral-500 font-extralight">
          Get answers with context.
        </span>
      </h1>

      {/* Description */}
      <p className="text-sm sm:text-base font-extralight leading-[1.8] text-neutral-400 max-w-md mx-auto mb-12">
        Upload your documents, retrieve the right information, and get grounded
        answers from your AI.
      </p>

      {/* Action CTAs */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-5 mb-20 w-full max-w-md">
        {/* Primary CTA */}
        {isAuthenticated ? (
          <Link
            to="/workspace"
            className="group relative inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-full text-xs font-normal tracking-tight text-neutral-100 overflow-hidden transition-transform duration-500 hover:scale-[1.02] active:scale-[0.98] w-full sm:w-auto"
            style={{
              background:
                "linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.03) 100%)",
              backdropFilter: "blur(12px)",
              border: "1px solid rgba(255,255,255,0.15)",
            }}
          >
            <span className="relative z-10">Open Workspace</span>
            <ArrowRight
              size={14}
              className="relative z-10 text-base opacity-60 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-500"
            />
          </Link>
        ) : (
          <button
            type="button"
            onClick={onOpenGuestModal}
            className="group relative inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-full text-xs font-normal tracking-tight text-neutral-100 overflow-hidden transition-transform duration-500 hover:scale-[1.02] active:scale-[0.98] w-full sm:w-auto"
            style={{
              background:
                "linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.03) 100%)",
              backdropFilter: "blur(12px)",
              border: "1px solid rgba(255,255,255,0.15)",
            }}
          >
            <span className="relative z-10">Get Started</span>
            <ArrowRight
              size={14}
              className="relative z-10 text-base opacity-60 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-500"
            />
          </button>
        )}

        {/* Ghost CTA: Sign In */}
        {!isAuthenticated && (
          <Link
            to={paths.login()}
            className="inline-flex items-center justify-center px-8 py-3.5 rounded-full text-xs font-normal tracking-tight text-neutral-500 border border-transparent hover:border-neutral-800 hover:text-neutral-200 hover:bg-neutral-900/30 transition-all duration-500 w-full sm:w-auto"
          >
            Sign In
          </Link>
        )}
      </div>
    </section>
  );
}
