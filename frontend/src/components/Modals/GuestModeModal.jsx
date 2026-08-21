import React, { useState, useEffect, useRef } from "react";
import System from "@/models/system";
import { AUTH_TOKEN, AUTH_USER, AUTH_TIMESTAMP } from "@/utils/constants";
import useLogo from "@/hooks/useLogo";
import DefaultLogoDark from "@/media/logo/contextiq-logo.svg";
import { X, ArrowRight, ArrowLeft, CheckCircle } from "@phosphor-icons/react";

// Modern 4-Digit Box PIN Input Component
function PinInput({ value, onChange, autoFocus = false, hasError = false }) {
  const inputRefs = [useRef(null), useRef(null), useRef(null), useRef(null)];
  const digits = (value || "").split("").slice(0, 4);

  useEffect(() => {
    if (autoFocus && inputRefs[0].current) {
      inputRefs[0].current.focus();
    }
  }, [autoFocus]);

  const handleChange = (index, e) => {
    const val = e.target.value.replace(/\D/g, "");
    if (!val) return;

    const char = val[val.length - 1]; // take last entered digit
    const newDigits = [...digits];
    newDigits[index] = char;
    const combined = newDigits.join("").slice(0, 4);
    onChange(combined);

    // Auto-advance to next box
    if (index < 3 && inputRefs[index + 1].current) {
      inputRefs[index + 1].current.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace") {
      e.preventDefault();
      const newDigits = [...digits];
      if (newDigits[index]) {
        newDigits[index] = "";
        onChange(newDigits.join(""));
      } else if (index > 0) {
        newDigits[index - 1] = "";
        onChange(newDigits.join(""));
        if (inputRefs[index - 1].current) {
          inputRefs[index - 1].current.focus();
        }
      }
    } else if (e.key === "ArrowLeft" && index > 0) {
      inputRefs[index - 1].current?.focus();
    } else if (e.key === "ArrowRight" && index < 3) {
      inputRefs[index + 1].current?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, 4);
    if (pasted) {
      onChange(pasted);
      const targetIndex = Math.min(pasted.length, 3);
      inputRefs[targetIndex].current?.focus();
    }
  };

  return (
    <div className="flex items-center justify-center gap-3 my-4">
      {[0, 1, 2, 3].map((index) => {
        const val = digits[index] || "";
        const isFilled = val !== "";
        return (
          <div key={index} className="relative">
            <input
              ref={inputRefs[index]}
              type="password"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={1}
              value={val}
              onChange={(e) => handleChange(index, e)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              onPaste={handlePaste}
              className={`w-14 h-14 sm:w-16 sm:h-16 text-center text-2xl font-mono rounded-xl bg-[#262626] border text-white transition-all duration-200 focus:outline-none ${
                hasError
                  ? "border-rose-500/80 ring-2 ring-rose-500/30"
                  : isFilled
                    ? "border-[#14B8A6] ring-2 ring-[#14B8A6]/20 bg-[#14B8A6]/10"
                    : "border-neutral-700 hover:border-neutral-500 focus:border-[#14B8A6] focus:ring-2 focus:ring-[#14B8A6]/30"
              }`}
            />
            {isFilled && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none text-[#14B8A6] text-xl font-bold">
                •
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

export default function GuestModeModal({ isOpen, onClose }) {
  const { logo, isCustomLogo } = useLogo();

  // Steps: "initial" | "welcome_back" | "confirm_pin" | "optional_name" | "success"
  const [step, setStep] = useState("initial");

  const [initialPin, setInitialPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [name, setName] = useState("");

  const [pendingSession, setPendingSession] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen) {
      setStep("initial");
      setInitialPin("");
      setConfirmPin("");
      setName("");
      setPendingSession(null);
      setError(null);
      setLoading(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // STEP 1: Submit initial 4-digit PIN for lookup
  const handleInitialPinSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (initialPin.length !== 4) {
      setError("Please enter your 4-digit PIN.");
      return;
    }

    setLoading(true);
    const savedGuestId = window.localStorage.getItem("contextiq_guest_id");
    const res = await System.lookupGuestPin({
      pin: initialPin,
      guestId: savedGuestId,
    });

    setLoading(false);

    if (res.isExisting && res.token) {
      // RETURNING GUEST FOUND: Save session and show "Welcome Back"
      setPendingSession({
        user: res.user,
        token: res.token,
        guestId: res.guestId,
      });
      setStep("welcome_back");
    } else {
      // NEW GUEST PIN: Go directly to Confirm PIN (Step 1 of 2)
      setConfirmPin("");
      setStep("confirm_pin");
    }
  };

  // RETURNING GUEST: Complete login to workspace
  const handleReturningGuestContinue = (e) => {
    if (e) e.preventDefault();
    if (pendingSession) {
      if (pendingSession.guestId)
        window.localStorage.setItem(
          "contextiq_guest_id",
          pendingSession.guestId
        );
      if (pendingSession.user)
        window.localStorage.setItem(
          AUTH_USER,
          JSON.stringify(pendingSession.user)
        );
      window.localStorage.setItem(AUTH_TOKEN, pendingSession.token);
      window.localStorage.setItem(AUTH_TIMESTAMP, Number(new Date()));
      window.location = "/workspace";
    }
  };

  // NEW GUEST STEP 1: Confirm PIN -> Match check
  const handleConfirmPinSubmit = (e) => {
    e.preventDefault();
    if (confirmPin.length !== 4) {
      setError("Please confirm your 4-digit PIN.");
      return;
    }
    if (initialPin !== confirmPin) {
      setError("PINs do not match.");
      return;
    }
    setError(null);
    setStep("optional_name");
  };

  // NEW GUEST STEP 2: Optional Name -> Create Guest Account & Open Workspace
  const handleFinalGuestSetup = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const { success, user, token, guestId, message } = await System.setupGuest({
      name: name.trim(),
      pin: initialPin,
      confirmPin,
    });

    if (success && token) {
      setStep("success");
      if (guestId) window.localStorage.setItem("contextiq_guest_id", guestId);
      if (user) window.localStorage.setItem(AUTH_USER, JSON.stringify(user));
      window.localStorage.setItem(AUTH_TOKEN, token);
      window.localStorage.setItem(AUTH_TIMESTAMP, Number(new Date()));

      setTimeout(() => {
        window.location = "/workspace";
      }, 1000);
    } else {
      setError(message || "Failed to set up guest workspace.");
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md transition-opacity duration-300">
      <div className="w-full max-w-[460px] bg-[#1F1F1F] border border-[#333333] rounded-2xl shadow-2xl overflow-hidden p-6 sm:p-8 text-white relative animate-in fade-in zoom-in-95 duration-200">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-neutral-400 hover:text-white p-1 rounded-lg transition-colors"
          aria-label="Close"
        >
          <X size={20} />
        </button>

        {/* Logo Header */}
        <div className="flex items-center gap-1.5 mb-6">
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

        {/* STEP 1: INITIAL PIN ENTRY */}
        {step === "initial" && (
          <form
            onSubmit={handleInitialPinSubmit}
            className="animate-in fade-in duration-200"
          >
            <h2 className="text-2xl sm:text-3xl font-light tracking-tight text-white mb-1">
              Continue as Guest
            </h2>
            <p className="text-neutral-400 text-sm mb-4 font-normal">
              Enter your 4-digit PIN
            </p>

            <PinInput
              value={initialPin}
              onChange={setInitialPin}
              autoFocus={true}
              hasError={!!error}
            />

            {error && (
              <div className="mb-4 p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-mono text-center">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || initialPin.length !== 4}
              className="mt-4 w-full py-3 rounded-xl bg-[#14B8A6] hover:bg-[#0F766E] text-slate-950 font-semibold text-sm transition shadow-[0_0_15px_rgba(20,184,166,0.2)] disabled:opacity-40"
            >
              {loading ? "Verifying..." : "Continue"}
            </button>
          </form>
        )}

        {/* RETURNING GUEST: WELCOME BACK CONFIRMATION */}
        {step === "welcome_back" && (
          <div className="animate-in fade-in zoom-in-95 duration-250 py-4 text-center">
            <div className="w-16 h-16 rounded-full bg-[#14B8A6]/20 border border-[#14B8A6]/50 flex items-center justify-center mx-auto mb-4 text-[#14B8A6]">
              <CheckCircle size={36} weight="fill" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-light tracking-tight text-white mb-2">
              Welcome back
            </h2>
            <p className="text-neutral-400 text-sm mb-6 font-normal">
              Your guest workspace is ready.
            </p>

            <button
              type="button"
              onClick={handleReturningGuestContinue}
              className="w-full py-3 rounded-xl bg-[#14B8A6] hover:bg-[#0F766E] text-slate-950 font-semibold text-sm transition shadow-[0_0_15px_rgba(20,184,166,0.2)]"
            >
              Continue
            </button>
          </div>
        )}

        {/* NEW GUEST WIZARD — STEP 1: CONFIRM PIN */}
        {step === "confirm_pin" && (
          <form
            onSubmit={handleConfirmPinSubmit}
            className="animate-in fade-in slide-in-from-right-4 duration-250"
          >
            <h2 className="text-2xl sm:text-3xl font-light tracking-tight text-white mb-1">
              Confirm your PIN
            </h2>
            <p className="text-neutral-400 text-sm mb-4 font-normal">
              Re-enter your 4-digit PIN to confirm.
            </p>

            <PinInput
              value={confirmPin}
              onChange={setConfirmPin}
              autoFocus={true}
              hasError={!!error}
            />

            {error && (
              <div className="mb-4 p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-mono text-center">
                {error}
              </div>
            )}

            <div className="flex items-center justify-between gap-3 pt-4">
              <button
                type="button"
                onClick={() => {
                  setError(null);
                  setStep("initial");
                }}
                className="px-5 py-2.5 rounded-xl border border-neutral-700 text-neutral-300 hover:text-white hover:border-neutral-500 text-sm font-medium transition flex items-center gap-2"
              >
                <ArrowLeft size={16} weight="bold" />
                <span>Back</span>
              </button>
              <button
                type="submit"
                disabled={confirmPin.length !== 4}
                className="px-6 py-2.5 rounded-xl bg-[#14B8A6] hover:bg-[#0F766E] text-slate-950 font-semibold text-sm transition flex items-center gap-2 disabled:opacity-40 shadow-[0_0_15px_rgba(20,184,166,0.2)]"
              >
                <span>Confirm</span>
                <ArrowRight size={16} weight="bold" />
              </button>
            </div>
          </form>
        )}

        {/* NEW GUEST WIZARD — STEP 2: OPTIONAL NAME */}
        {step === "optional_name" && (
          <form
            onSubmit={handleFinalGuestSetup}
            className="animate-in fade-in slide-in-from-right-4 duration-250"
          >
            <h2 className="text-2xl sm:text-3xl font-light tracking-tight text-white mb-1">
              Almost done
            </h2>
            <p className="text-neutral-400 text-sm mb-6 font-normal">
              What should we call you?{" "}
              <span className="text-neutral-500">(Optional)</span>
            </p>

            <div className="mb-6">
              <input
                type="text"
                autoFocus
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                className="w-full px-4 py-3 rounded-xl bg-[#262626] border border-neutral-700 text-white text-base focus:outline-none focus:border-[#14B8A6] focus:ring-2 focus:ring-[#14B8A6]/30 transition"
              />
            </div>

            {error && (
              <div className="mb-4 p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-mono text-center">
                {error}
              </div>
            )}

            <div className="flex items-center justify-between gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  setError(null);
                  setStep("confirm_pin");
                }}
                className="px-5 py-2.5 rounded-xl border border-neutral-700 text-neutral-300 hover:text-white hover:border-neutral-500 text-sm font-medium transition flex items-center gap-2"
              >
                <ArrowLeft size={16} weight="bold" />
                <span>Back</span>
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2.5 rounded-xl bg-[#14B8A6] hover:bg-[#0F766E] text-slate-950 font-semibold text-sm transition shadow-[0_0_15px_rgba(20,184,166,0.2)] disabled:opacity-40"
              >
                {loading ? "Creating..." : "Continue"}
              </button>
            </div>
          </form>
        )}

        {/* NEW GUEST SUCCESS ANIMATION */}
        {step === "success" && (
          <div className="animate-in fade-in zoom-in duration-300 py-6 text-center">
            <div className="w-16 h-16 rounded-full bg-[#14B8A6]/20 border border-[#14B8A6]/50 flex items-center justify-center mx-auto mb-4 text-[#14B8A6]">
              <CheckCircle size={40} weight="fill" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-light text-white mb-2">
              Your guest workspace is ready
            </h2>
            <p className="text-neutral-400 text-sm font-light">
              Redirecting you to ContextIQ...
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
