import React, { useState } from "react";
import { Link, Navigate } from "react-router-dom";
import useLogo from "@/hooks/useLogo";
import paths from "@/utils/paths";
import { ArrowLeft, Sparkle } from "@phosphor-icons/react";
import CubesVisual from "@/pages/Login/components/CubesVisual";
import GuestModeModal from "@/components/Modals/GuestModeModal";
import { AUTH_TOKEN, AUTH_USER } from "@/utils/constants";

export default function Guest() {
  const { logo } = useLogo();
  const [isGuestModalOpen, setIsGuestModalOpen] = useState(true);

  // If already authenticated, redirect to /workspace
  const storedToken = localStorage.getItem(AUTH_TOKEN);
  const storedUser = localStorage.getItem(AUTH_USER);
  if (storedToken && storedUser) {
    return <Navigate to="/workspace" replace />;
  }

  return (
    <div className="min-h-screen bg-[#171717] text-white flex items-center justify-center p-4 sm:p-6 font-sans relative selection:bg-blue-500/30 selection:text-blue-400">
      {/* Minimal Corner Back to Home Button */}
      <Link
        to="/"
        className="fixed top-6 left-6 z-50 inline-flex items-center gap-2 text-xs font-mono text-neutral-400 hover:text-white transition-colors duration-300 py-2 px-3.5 rounded-full bg-neutral-900/80 border border-neutral-800 backdrop-blur-md shadow-lg group"
      >
        <ArrowLeft
          size={14}
          className="group-hover:-translate-x-0.5 transition-transform duration-300"
        />
        <span>Home</span>
      </Link>

      {/* Centered Two-Column Auth Card */}
      <div className="w-full max-w-5xl mx-auto shadow-2xl rounded-2xl bg-neutral-900 border border-neutral-800/80 flex flex-col md:flex-row overflow-hidden">
        {/* LEFT COLUMN: Guest Info */}
        <div className="w-full md:w-1/2 flex flex-col justify-between px-8 py-10 sm:px-10 sm:py-14">
          <div>
            {/* ContextIQ Logo */}
            <Link to="/" className="inline-block mb-6">
              <img
                src={logo}
                alt="ContextIQ"
                className="h-8 w-auto object-contain"
              />
            </Link>

            {/* Form Heading & Subtitle */}
            <h1 className="text-[48px] sm:text-[60px] font-light leading-tight mb-4 tracking-tight text-white">
              Continue
              <br />
              as Guest
            </h1>
            <p className="text-neutral-400 text-[17px] sm:text-[18px] mb-8 font-normal">
              Try ContextIQ without an account using a simple 4-digit PIN.
            </p>

            <button
              type="button"
              onClick={() => setIsGuestModalOpen(true)}
              className="w-full py-3.5 rounded-xl border border-teal-500/40 bg-teal-500/10 hover:bg-teal-500/20 text-teal-300 text-sm font-mono uppercase tracking-wider transition shadow-[0_0_20px_rgba(20,184,166,0.15)] flex items-center justify-center gap-2"
            >
              <Sparkle size={18} weight="fill" />
              <span>Try as Guest</span>
            </button>

            {/* Bottom Controls */}
            <div className="mt-8 text-neutral-400 text-[15px] flex items-center justify-between">
              <span>
                Permanent account?{" "}
                <Link
                  to={paths.register()}
                  className="text-blue-500 hover:underline"
                >
                  Sign up
                </Link>
              </span>

              <Link
                to={paths.login()}
                className="text-blue-500 hover:underline text-xs"
              >
                Sign in
              </Link>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Full-width Edge-to-Edge 3D Cubes Panel */}
        <div className="w-full md:w-1/2 bg-[#171717] relative flex items-center justify-center min-h-[450px] md:min-h-[640px]">
          <CubesVisual className="w-full h-full min-h-[450px] md:min-h-[640px]" />
        </div>
      </div>

      {/* Guest Mode Modal */}
      <GuestModeModal
        isOpen={isGuestModalOpen}
        onClose={() => setIsGuestModalOpen(false)}
      />
    </div>
  );
}
