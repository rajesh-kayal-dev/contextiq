import React, { useState } from "react";
import { Link } from "react-router-dom";
import useLogo from "@/hooks/useLogo";
import DefaultLogoDark from "@/media/logo/contextiq-logo.svg";
import paths from "@/utils/paths";
import { List, X, ArrowRight } from "@phosphor-icons/react";

export default function Navigation({
  isAuthenticated = false,
  onOpenGuestModal,
}) {
  const { logo, isCustomLogo } = useLogo();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between p-6 md:p-8 mix-blend-difference">
        {/* Left: Product Identity */}
        <Link to="/" className="flex items-center gap-1.5 group">
          {!isCustomLogo && (
            <img
              src="/branding/favicon/favicon.png"
              alt="ContextIQ favicon"
              className="h-6 w-auto object-contain transition-opacity duration-300 group-hover:opacity-80"
            />
          )}
          <img
            src={isCustomLogo ? logo : "/branding/ContextIq transprent for dark bg.png"}
            alt="ContextIQ"
            className="h-6 w-auto object-contain transition-opacity duration-300 group-hover:opacity-80"
          />
        </Link>

        {/* Right Desktop Nav Links */}
        <div
          className="hidden md:flex items-center gap-8 text-xs font-normal tracking-tight text-neutral-400 uppercase"
          style={{ fontFamily: "'JetBrains Mono', monospace" }}
        >
          <a
            href="#product"
            className="hover:text-neutral-100 transition-colors duration-300"
          >
            Product
          </a>
          <a
            href="#how-it-works"
            className="hover:text-neutral-100 transition-colors duration-300"
          >
            How it works
          </a>
          <a
            href="#features"
            className="hover:text-neutral-100 transition-colors duration-300"
          >
            Features
          </a>

          {isAuthenticated ? (
            <Link
              to={paths.workspace.chat("default")}
              className="text-white hover:text-neutral-300 transition-colors duration-300 flex items-center gap-1.5"
            >
              Workspace <ArrowRight size={12} weight="bold" />
            </Link>
          ) : (
            <>
              <Link
                to={paths.login()}
                className="hover:text-neutral-100 transition-colors duration-300"
              >
                Sign In
              </Link>
              <button
                type="button"
                onClick={onOpenGuestModal}
                className="px-4 py-2 rounded-full border border-neutral-700 text-neutral-200 hover:border-neutral-400 hover:text-white hover:bg-neutral-900/50 transition-all duration-300"
              >
                Get Started
              </button>
            </>
          )}
        </div>

        {/* Mobile Hamburger Toggle */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="md:hidden text-neutral-300 hover:text-white focus:outline-none"
          aria-label="Toggle Navigation"
        >
          {mobileOpen ? <X size={24} /> : <List size={24} />}
        </button>
      </nav>

      {/* Mobile Drawer Menu */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 bg-[#080808]/95 backdrop-blur-xl flex flex-col justify-center px-8 py-12 md:hidden">
          <div
            className="flex flex-col gap-6 text-sm font-normal uppercase tracking-wider text-neutral-300"
            style={{ fontFamily: "'JetBrains Mono', monospace" }}
          >
            <a
              href="#product"
              onClick={() => setMobileOpen(false)}
              className="hover:text-white py-2 border-b border-neutral-800"
            >
              Product
            </a>
            <a
              href="#process"
              onClick={() => setMobileOpen(false)}
              className="hover:text-white py-2 border-b border-neutral-800"
            >
              How it works
            </a>
            <a
              href="#features"
              onClick={() => setMobileOpen(false)}
              className="hover:text-white py-2 border-b border-neutral-800"
            >
              Features
            </a>

            {isAuthenticated ? (
              <Link
                to="/workspace"
                onClick={() => setMobileOpen(false)}
                className="text-teal-400 py-2 border-b border-neutral-800 flex items-center justify-between"
              >
                Workspace <ArrowRight size={16} />
              </Link>
            ) : (
              <>
                <Link
                  to={paths.login()}
                  onClick={() => setMobileOpen(false)}
                  className="hover:text-white py-2 border-b border-neutral-800"
                >
                  Sign In
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    setMobileOpen(false);
                    if (onOpenGuestModal) onOpenGuestModal();
                  }}
                  className="mt-4 text-center py-3 rounded-full border border-neutral-700 text-white bg-neutral-900"
                >
                  Get Started
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
