import React from "react";
import { Link } from "react-router-dom";

export default function Philosophy({
  isAuthenticated = false,
  onOpenGuestModal,
}) {
  return (
    <section
      id="philosophy"
      className="relative z-10 w-full px-6 py-32 max-w-3xl mx-auto flex flex-col items-center text-center"
    >
      <h2 className="text-3xl sm:text-5xl font-thin tracking-tight mb-10 text-neutral-100">
        Built Around Your Knowledge
      </h2>

      <p className="text-base sm:text-lg font-extralight leading-[1.8] text-neutral-400 mb-12">
        ContextIQ keeps your knowledge at the center of every conversation. Your
        documents provide the context, retrieval finds the relevant information,
        and your AI model generates the answer.
      </p>

      {isAuthenticated ? (
        <Link
          to="/workspace"
          className="inline-flex items-center justify-center px-8 py-3.5 rounded-full text-xs font-normal tracking-tight text-neutral-100 border border-neutral-800 hover:border-neutral-500 hover:bg-neutral-800/50 transition-all duration-500"
        >
          Open Workspace
        </Link>
      ) : (
        <button
          type="button"
          onClick={onOpenGuestModal}
          className="inline-flex items-center justify-center px-8 py-3.5 rounded-full text-xs font-normal tracking-tight text-neutral-100 border border-neutral-800 hover:border-neutral-500 hover:bg-neutral-800/50 transition-all duration-500"
        >
          Get Started
        </button>
      )}
    </section>
  );
}
