import React, { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import System from "@/models/system";
import useLogo from "@/hooks/useLogo";
import DefaultLogoDark from "@/media/logo/contextiq-logo.svg";
import paths from "@/utils/paths";
import showToast from "@/utils/toast";
import { ArrowLeft, EnvelopeSimple, Eye, EyeSlash } from "@phosphor-icons/react";
import CubesVisual from "@/pages/Login/components/CubesVisual";

export default function ForgotPassword() {
  const { logo, isCustomLogo } = useLogo();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const urlToken = searchParams.get("token");

  const [step, setStep] = useState(urlToken ? "reset" : "recover"); // 'recover', 'sent', or 'reset'
  const [username, setUsername] = useState("");
  const [resetToken, setResetToken] = useState(urlToken || null);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (urlToken) {
      setResetToken(urlToken);
      setStep("reset");
    }
  }, [urlToken]);

  const handleRecoverySubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const { success, error: errMessage } = await System.recoverAccount(
      username
    );

    setLoading(false);
    if (success) {
      setStep("sent");
      showToast("Password reset link sent to your email.", "success", {
        clear: true,
      });
    } else {
      setError(errMessage || "Failed to send reset email.");
    }
  };

  const handleResetSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    const { success, error: errMessage } = await System.resetPassword(
      resetToken,
      newPassword,
      confirmPassword
    );
    setLoading(false);

    if (success) {
      showToast("Password reset successful. Please sign in.", "success", {
        clear: true,
      });
      navigate(paths.login());
    } else {
      setError(errMessage || "Password reset failed.");
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
        {/* LEFT COLUMN: Recovery Form / Confirmation */}
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
              {step === "sent" ? "Check Email" : "Reset Password"}
            </h1>
            <p className="text-neutral-400 text-[17px] sm:text-[18px] mb-8 font-normal">
              {step === "recover" &&
                "Enter your account email to receive a password reset link"}
              {step === "sent" &&
                `We've sent a password reset link to ${username || "your email"}`}
              {step === "reset" && "Choose a new password for your account"}
            </p>

            {step === "recover" && (
              <form
                onSubmit={handleRecoverySubmit}
                className="flex flex-col gap-5"
              >
                <div>
                  <label
                    className="block text-neutral-300 text-[15px] mb-2 font-medium"
                    htmlFor="username"
                  >
                    Email Address
                  </label>
                  <input
                    id="username"
                    type="email"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="you@email.com"
                    className="w-full px-4 py-3 rounded-lg bg-neutral-800 border border-neutral-700 text-neutral-100 placeholder-neutral-500 text-[16px] focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                  />
                </div>

                {error && (
                  <div className="p-3.5 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-mono">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="mt-4 w-full py-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-[16px] font-semibold transition disabled:opacity-50"
                >
                  {loading ? "Sending Link..." : "Send Reset Link"}
                </button>
              </form>
            )}

            {step === "sent" && (
              <div className="flex flex-col gap-6">
                <div className="p-6 rounded-xl bg-blue-500/10 border border-blue-500/30 flex flex-col items-center text-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-blue-600/20 text-blue-400 flex items-center justify-center">
                    <EnvelopeSimple size={28} />
                  </div>
                  <h3 className="text-lg font-medium text-white">
                    Email Sent Successfully
                  </h3>
                  <p className="text-neutral-300 text-sm leading-relaxed">
                    Please check your inbox (and spam folder) for an email from
                    ContextIQ containing your password reset link. The link is
                    valid for 15 minutes.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setStep("recover")}
                  className="w-full py-3 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-[15px] font-medium transition"
                >
                  Resend Email
                </button>
              </div>
            )}

            {step === "reset" && (
              <form
                onSubmit={handleResetSubmit}
                className="flex flex-col gap-5"
              >
                <div>
                  <label
                    className="block text-neutral-300 text-[15px] mb-2 font-medium"
                    htmlFor="newPassword"
                  >
                    New Password
                  </label>
                  <div className="relative">
                    <input
                      id="newPassword"
                      type={showNewPassword ? "text" : "password"}
                      required
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full px-4 py-3 pr-11 rounded-lg bg-neutral-800 border border-neutral-700 text-neutral-100 placeholder-neutral-500 text-[16px] focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-white transition-colors p-1"
                      aria-label={
                        showNewPassword ? "Hide password" : "Show password"
                      }
                    >
                      {showNewPassword ? (
                        <EyeSlash size={20} />
                      ) : (
                        <Eye size={20} />
                      )}
                    </button>
                  </div>
                </div>

                <div>
                  <label
                    className="block text-neutral-300 text-[15px] mb-2 font-medium"
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
                  <div className="p-3.5 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-mono">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="mt-4 w-full py-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-[16px] font-semibold transition disabled:opacity-50"
                >
                  {loading ? "Resetting..." : "Save New Password"}
                </button>
              </form>
            )}

            {/* Bottom Back Link */}
            <div className="mt-8 text-neutral-400 text-[15px]">
              <Link
                to={paths.login()}
                className="text-blue-500 hover:underline"
              >
                Back to Sign In
              </Link>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Full-width Edge-to-Edge 3D Cubes Panel */}
        <div className="w-full md:w-1/2 bg-[#171717] relative flex items-center justify-center min-h-[450px] md:min-h-[640px]">
          <CubesVisual className="w-full h-full min-h-[450px] md:min-h-[640px]" />
        </div>
      </div>
    </div>
  );
}
