import React, { useState, useEffect } from "react";
import { Link, Navigate } from "react-router-dom";
import System from "@/models/system";
import { AUTH_TOKEN, AUTH_USER, AUTH_TIMESTAMP } from "@/utils/constants";
import paths from "@/utils/paths";
import useQuery from "@/hooks/useQuery";
import useSimpleSSO from "@/hooks/useSimpleSSO";
import useLogo from "@/hooks/useLogo";
import DefaultLogoDark from "@/media/logo/contextiq-logo.svg";
import { usePasswordModal } from "@/components/Modals/Password";
import { FullScreenLoader } from "@/components/Preloader";
import ModalWrapper from "@/components/ModalWrapper";
import { useModal } from "@/hooks/useModal";
import RecoveryCodeModal from "@/components/Modals/DisplayRecoveryCodeModal";
import GuestModeModal from "@/components/Modals/GuestModeModal";
import { ArrowLeft, Sparkle, Eye, EyeSlash } from "@phosphor-icons/react";
import CubesVisual from "./components/CubesVisual";

export default function Login() {
  const query = useQuery();
  const { logo, isCustomLogo } = useLogo();
  const { loading: ssoLoading, ssoConfig } = useSimpleSSO();
  const { loading: authLoading } = usePasswordModal(true);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [recoveryCodes, setRecoveryCodes] = useState([]);
  const [downloadComplete, setDownloadComplete] = useState(false);
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isGuestModalOpen, setIsGuestModalOpen] = useState(false);

  const {
    isOpen: isRecoveryCodeModalOpen,
    openModal: openRecoveryCodeModal,
    closeModal: closeRecoveryCodeModal,
  } = useModal();

  useEffect(() => {
    if (downloadComplete && token) {
      if (user) window.localStorage.setItem(AUTH_USER, JSON.stringify(user));
      window.localStorage.setItem(AUTH_TOKEN, token);
      window.location = "/workspace";
    }
  }, [downloadComplete, user, token]);

  if (authLoading || ssoLoading) return <FullScreenLoader />;

  // SSO redirect handling
  if (ssoConfig?.enabled && ssoConfig?.noLogin) {
    if (!!ssoConfig.noLoginRedirect && !query.has("token")) {
      return window.location.replace(ssoConfig.noLoginRedirect);
    }
    return <Navigate to={paths.sso.login()} />;
  }

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const formData = new FormData(e.target);
    const data = {};
    for (let [key, value] of formData.entries()) data[key] = value;

    const {
      valid,
      user: loggedUser,
      token: authToken,
      message,
      recoveryCodes: rCodes,
    } = await System.requestToken(data);

    if (valid && !!authToken) {
      setUser(loggedUser || null);
      setToken(authToken);

      if (rCodes) {
        setRecoveryCodes(rCodes);
        openRecoveryCodeModal();
      } else {
        if (loggedUser)
          window.localStorage.setItem(AUTH_USER, JSON.stringify(loggedUser));
        window.localStorage.setItem(AUTH_TOKEN, authToken);
        window.localStorage.setItem(AUTH_TIMESTAMP, Number(new Date()));
        window.location = "/workspace";
      }
    } else {
      setError(message || "Invalid login credentials. Please try again.");
      setLoading(false);
    }
    setLoading(false);
  };

  const handleDownloadComplete = () => setDownloadComplete(true);

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
        {/* LEFT COLUMN: Login Form */}
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

            {/* Heading & Subtitle */}
            <h1 className="text-[52px] sm:text-[64px] font-light leading-tight mb-4 tracking-tight text-white">
              Welcome
              <br />
              Back
            </h1>
            <p className="text-neutral-400 text-[17px] sm:text-[18px] mb-8 font-normal">
              Login to your account to continue
            </p>

            {/* Form Fields */}
            <form onSubmit={handleLogin} className="flex flex-col gap-5">
              <div>
                <label
                  className="block text-neutral-300 text-[15px] mb-2 font-medium"
                  htmlFor="username"
                >
                  Email
                </label>
                <input
                  id="username"
                  name="username"
                  type="text"
                  required
                  autoComplete="username"
                  placeholder="you@email.com"
                  className="w-full px-4 py-3 rounded-lg bg-neutral-800 border border-neutral-700 text-neutral-100 placeholder-neutral-500 text-[16px] focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                />
              </div>

              <div>
                <label
                  className="block text-neutral-300 text-[15px] mb-2 font-medium"
                  htmlFor="password"
                >
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    required
                    autoComplete="current-password"
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

              {error && (
                <div className="p-3.5 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-mono">
                  {error}
                </div>
              )}

              <div className="flex items-center justify-between">
                <label className="flex items-center text-neutral-400 text-[14px] font-normal cursor-pointer select-none">
                  <input
                    type="checkbox"
                    className="rounded bg-neutral-800 border-neutral-700 text-blue-600 focus:ring-blue-500 accent-blue-600 mr-2"
                  />
                  Remember me
                </label>

                <Link
                  to={paths.forgotPassword()}
                  className="text-blue-500 text-[14px] hover:underline"
                >
                  Forgot password?
                </Link>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="mt-2 w-full py-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-[16px] font-semibold transition disabled:opacity-50"
              >
                {loading ? "Signing in..." : "Sign In"}
              </button>
            </form>

            {/* Try as Guest Action */}
            <div className="mt-4 pt-4 border-t border-neutral-800/80">
              <button
                type="button"
                onClick={() => setIsGuestModalOpen(true)}
                className="w-full py-2.5 rounded-xl border border-teal-500/30 bg-teal-500/10 hover:bg-teal-500/20 text-teal-300 text-xs font-mono uppercase tracking-wider transition flex items-center justify-center gap-2"
              >
                <Sparkle size={15} weight="fill" />
                <span>Try as Guest</span>
              </button>
            </div>

            {/* Bottom Sign Up Link */}
            <div className="mt-6 text-neutral-400 text-[15px] text-center">
              Don't have an account?
              <Link
                to={paths.register()}
                className="text-blue-500 hover:underline ml-1.5 font-medium"
              >
                Sign up
              </Link>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Full-width Edge-to-Edge 3D Cubes Panel */}
        <div className="w-full md:w-1/2 bg-[#171717] relative flex items-center justify-center min-h-[450px] md:min-h-[640px]">
          <CubesVisual className="w-full h-full min-h-[450px] md:min-h-[640px]" />
        </div>
      </div>

      {/* Guest Mode Wizard Modal */}
      <GuestModeModal
        isOpen={isGuestModalOpen}
        onClose={() => setIsGuestModalOpen(false)}
      />

      {/* Recovery Code Download Modal */}
      <ModalWrapper isOpen={isRecoveryCodeModalOpen} noPortal={true}>
        <RecoveryCodeModal
          recoveryCodes={recoveryCodes}
          onDownloadComplete={handleDownloadComplete}
          onClose={closeRecoveryCodeModal}
        />
      </ModalWrapper>
    </div>
  );
}
