import React, { useState } from "react";
import { Link } from "react-router-dom";
import System from "@/models/system";
import { AUTH_TOKEN, AUTH_USER, AUTH_TIMESTAMP } from "@/utils/constants";
import useLogo from "@/hooks/useLogo";
import DefaultLogoDark from "@/media/logo/contextiq-logo.svg";
import paths from "@/utils/paths";
import { ArrowLeft, Sparkle, Eye, EyeSlash } from "@phosphor-icons/react";
import CubesVisual from "@/pages/Login/components/CubesVisual";
import GuestModeModal from "@/components/Modals/GuestModeModal";

export default function Register() {
  const { logo, isCustomLogo } = useLogo();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [guestModalOpen, setGuestModalOpen] = useState(false);

  const handleRegister = async (e) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError("Please enter your full name.");
      return;
    }

    if (!email.trim()) {
      setError("Please enter a valid email address.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }

    setLoading(true);
    const { success, user, token, message } = await System.registerUser({
      name: name.trim(),
      email: email.trim(),
      password,
    });

    if (success && token) {
      if (user) window.localStorage.setItem(AUTH_USER, JSON.stringify(user));
      window.localStorage.setItem(AUTH_TOKEN, token);
      window.localStorage.setItem(AUTH_TIMESTAMP, Number(new Date()));
      window.location = "/workspace";
    } else {
      setError(message || "Registration failed. Please try again.");
      setLoading(false);
    }
  };

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

      {/* Centered Two-Column Auth Card matching reference design */}
      <div className="w-full max-w-5xl mx-auto shadow-2xl rounded-2xl bg-neutral-900 border border-neutral-800/80 flex flex-col md:flex-row overflow-hidden">
        {/* LEFT COLUMN: Public Registration Form */}
        <div className="w-full md:w-1/2 flex flex-col justify-between px-8 py-10 sm:px-10 sm:py-14">
          <div>
            {/* ContextIQ Logo */}
            <Link to="/" className="inline-block mb-6">
              <div className="flex items-center gap-1.5">
                {!isCustomLogo && (
                  <img
                    src="/branding/favicon/favicon.png"
                    alt="ContextIQ favicon"
                    className="h-6 w-auto object-contain"
                  />
                )}
                <img
                  src={isCustomLogo ? logo : "/branding/ContextIq transprent for dark bg.png"}
                  alt="ContextIQ"
                  className="h-6 w-auto object-contain"
                />
              </div>
            </Link>

            {/* Heading & Subtitle matching reference typography */}
            <h1 className="text-[52px] sm:text-[64px] font-light leading-tight mb-4 tracking-tight text-white">
              Create
              <br />
              Account
            </h1>
            <p className="text-neutral-400 text-[17px] sm:text-[18px] mb-8 font-normal">
              Create your ContextIQ account to continue
            </p>

            {/* Public Registration Form */}
            <form onSubmit={handleRegister} className="flex flex-col gap-4">
              <div>
                <label
                  className="block text-neutral-300 text-[15px] mb-1.5 font-medium"
                  htmlFor="name"
                >
                  Full Name
                </label>
                <input
                  id="name"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Jane Doe"
                  className="w-full px-4 py-3 rounded-lg bg-neutral-800 border border-neutral-700 text-neutral-100 placeholder-neutral-500 text-[16px] focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                />
              </div>

              <div>
                <label
                  className="block text-neutral-300 text-[15px] mb-1.5 font-medium"
                  htmlFor="email"
                >
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@email.com"
                  className="w-full px-4 py-3 rounded-lg bg-neutral-800 border border-neutral-700 text-neutral-100 placeholder-neutral-500 text-[16px] focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                />
              </div>

              <div>
                <label
                  className="block text-neutral-300 text-[15px] mb-1.5 font-medium"
                  htmlFor="password"
                >
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-4 py-3 pr-11 rounded-lg bg-neutral-800 border border-neutral-700 text-neutral-100 placeholder-neutral-500 text-[16px] focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-white transition-colors p-1"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeSlash size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              <div>
                <label
                  className="block text-neutral-300 text-[15px] mb-1.5 font-medium"
                  htmlFor="confirmPassword"
                >
                  Confirm Password
                </label>
                <div className="relative">
                  <input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-4 py-3 pr-11 rounded-lg bg-neutral-800 border border-neutral-700 text-neutral-100 placeholder-neutral-500 text-[16px] focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setShowConfirmPassword(!showConfirmPassword)
                    }
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-white transition-colors p-1"
                    aria-label={
                      showConfirmPassword ? "Hide password" : "Show password"
                    }
                  >
                    {showConfirmPassword ? (
                      <EyeSlash size={20} />
                    ) : (
                      <Eye size={20} />
                    )}
                  </button>
                </div>
              </div>

              {error && (
                <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-mono">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="mt-3 w-full py-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-[16px] font-semibold transition disabled:opacity-50"
              >
                {loading ? "Creating account..." : "Create Account"}
              </button>
            </form>

            {/* Bottom Actions: Sign In & Try as Guest */}
            <div className="mt-6 flex flex-col gap-3 text-[15px] text-neutral-400 pt-2 border-t border-neutral-800/60">
              <div className="flex items-center justify-between">
                <span>Already have an account?</span>
                <Link
                  to={paths.login()}
                  className="text-blue-500 hover:underline font-medium"
                >
                  Sign in
                </Link>
              </div>
              {/* Try as Guest Action */}
              <div className="mt-4 pt-4 border-t border-neutral-800/80 flex items-center justify-center">
                <button
                  type="button"
                  onClick={() => setGuestModalOpen(true)}
                  className="w-full py-2.5 rounded-xl border border-teal-500/30 bg-teal-500/10 hover:bg-teal-500/20 text-teal-300 text-xs font-mono uppercase tracking-wider transition flex items-center justify-center gap-2"
                >
                  <Sparkle size={15} weight="fill" />
                  <span>Try as Guest</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Full-width Edge-to-Edge 3D Cubes Panel */}
        <div className="w-full md:w-1/2 bg-[#171717] relative flex items-center justify-center min-h-[450px] md:min-h-[640px]">
          <CubesVisual className="w-full h-full min-h-[450px] md:min-h-[640px]" />
        </div>
      </div>

      {/* Guest Mode Multi-Step Modal */}
      <GuestModeModal
        isOpen={guestModalOpen}
        onClose={() => setGuestModalOpen(false)}
      />
    </div>
  );
}
