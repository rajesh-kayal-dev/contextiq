import React, { useState } from "react";
import System from "@/models/system";
import { AUTH_TOKEN, AUTH_USER, AUTH_TIMESTAMP } from "@/utils/constants";
import showToast from "@/utils/toast";
import { X, ShieldCheck } from "@phosphor-icons/react";

export default function UpgradeGuestModal({ isOpen, onClose }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  if (!isOpen) return null;

  const handleUpgrade = async (e) => {
    e.preventDefault();
    setError(null);

    if (!email.trim()) {
      setError("Please enter a valid email address.");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }

    setLoading(true);
    const { success, user, token, message } = await System.upgradeGuest({
      name: name.trim(),
      email: email.trim(),
      password,
    });

    if (success && token) {
      if (user) window.localStorage.setItem(AUTH_USER, JSON.stringify(user));
      window.localStorage.setItem(AUTH_TOKEN, token);
      window.localStorage.setItem(AUTH_TIMESTAMP, Number(new Date()));
      window.localStorage.removeItem("contextiq_guest_id");

      showToast(
        "Account successfully upgraded to permanent account!",
        "success",
        {
          clear: true,
        }
      );
      setLoading(false);
      onClose();
      window.location.reload();
    } else {
      setError(message || "Failed to upgrade account. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="w-full max-w-md bg-[#1F1F1F] border border-[#3A3A3A] rounded-2xl shadow-2xl overflow-hidden p-6 sm:p-8 text-white relative">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-neutral-400 hover:text-white p-1 rounded-lg transition-colors"
        >
          <X size={20} />
        </button>

        <div className="flex items-center gap-3 mb-4 text-[#14B8A6]">
          <ShieldCheck size={28} weight="fill" />
          <h3 className="text-xl font-light tracking-tight text-white">
            Create Permanent Account
          </h3>
        </div>

        <p className="text-sm text-neutral-400 font-light leading-relaxed mb-6">
          Upgrade your guest session to a permanent email & password account.
          Your private workspaces, documents, and chat history will be fully
          preserved!
        </p>

        <form onSubmit={handleUpgrade} className="flex flex-col gap-4">
          <div>
            <label className="block text-xs font-mono text-neutral-300 mb-1.5 uppercase">
              Full Name <span className="text-neutral-500">(optional)</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Jane Doe"
              className="w-full px-4 py-2.5 rounded-lg bg-[#262626] border border-[#3A3A3A] text-white text-sm focus:outline-none focus:border-[#14B8A6] transition"
            />
          </div>

          <div>
            <label className="block text-xs font-mono text-neutral-300 mb-1.5 uppercase">
              Email Address
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@email.com"
              className="w-full px-4 py-2.5 rounded-lg bg-[#262626] border border-[#3A3A3A] text-white text-sm focus:outline-none focus:border-[#14B8A6] transition"
            />
          </div>

          <div>
            <label className="block text-xs font-mono text-neutral-300 mb-1.5 uppercase">
              Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="•••••••• (min 8 characters)"
              className="w-full px-4 py-2.5 rounded-lg bg-[#262626] border border-[#3A3A3A] text-white text-sm focus:outline-none focus:border-[#14B8A6] transition"
            />
          </div>

          {error && (
            <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-mono">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="mt-2 w-full py-3 rounded-lg bg-[#14B8A6] hover:bg-[#0F766E] text-slate-950 font-semibold text-sm transition shadow-[0_0_20px_rgba(20,184,166,0.25)] disabled:opacity-50"
          >
            {loading ? "Upgrading Account..." : "Upgrade Account"}
          </button>
        </form>
      </div>
    </div>
  );
}
