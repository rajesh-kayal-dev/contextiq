import React from "react";
import { Link } from "react-router-dom";
import useLogo from "@/hooks/useLogo";
import DefaultLogoDark from "@/media/logo/contextiq-logo.svg";
import paths from "@/utils/paths";
import { ArrowRight } from "@phosphor-icons/react";

export default function LandingHeader({ isAuthenticated = false }) {
  const { logo, isCustomLogo } = useLogo();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-5 md:px-12 backdrop-blur-xl bg-[#0B1220]/70 border-b border-slate-800/50">
      {/* Brand Logo */}
      <Link to="/" className="flex items-center gap-1.5 group">
        {!isCustomLogo && (
          <img
            src="/branding/favicon/favicon.png"
            alt="ContextIQ favicon"
            className="h-6 w-auto object-contain transition-transform duration-300 group-hover:scale-105"
          />
        )}
        <img
          src={isCustomLogo ? logo : "/branding/ContextIq transprent for dark bg.png"}
          alt="ContextIQ"
          className="h-6 w-auto object-contain transition-transform duration-300 group-hover:scale-105"
        />
      </Link>

      {/* Nav links */}
      <nav className="hidden md:flex items-center gap-8 text-xs font-mono text-slate-400 uppercase tracking-wider">
        <a
          href="#features"
          className="hover:text-teal-400 transition-colors duration-300"
        >
          Capabilities
        </a>
        <a
          href="#workflow"
          className="hover:text-teal-400 transition-colors duration-300"
        >
          Architecture
        </a>
        <a
          href="#philosophy"
          className="hover:text-teal-400 transition-colors duration-300"
        >
          Security & Privacy
        </a>
      </nav>

      {/* Action buttons */}
      <div className="flex items-center gap-4">
        {isAuthenticated ? (
          <Link
            to={paths.home()}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-medium bg-teal-500 text-slate-950 hover:bg-teal-400 transition-all duration-300 shadow-[0_0_20px_rgba(20,184,166,0.3)]"
          >
            Open Workspace
            <ArrowRight size={14} weight="bold" />
          </Link>
        ) : (
          <>
            <Link
              to={paths.login()}
              className="text-xs font-mono uppercase text-slate-300 hover:text-white px-3 py-2 transition-colors duration-300"
            >
              Sign In
            </Link>
            <Link
              to={paths.login()}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-medium bg-teal-500 text-slate-950 hover:bg-teal-400 transition-all duration-300 shadow-[0_0_20px_rgba(20,184,166,0.3)]"
            >
              Get Started
              <ArrowRight size={14} weight="bold" />
            </Link>
          </>
        )}
      </div>
    </header>
  );
}
