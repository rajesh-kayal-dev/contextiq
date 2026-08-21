import React, { useState } from "react";
import {
  X,
  User,
  Envelope,
  ShieldCheck,
  Sparkle,
  PencilSimple,
  Check,
} from "@phosphor-icons/react";
import usePfp from "@/hooks/usePfp";
import System from "@/models/system";
import { AUTH_USER } from "@/utils/constants";

export default function ProfileModal({ user, isOpen, onClose, onUpgrade }) {
  const { pfp } = usePfp();

  const isGuest = user?.role === "guest";
  const getCleanName = (u) => {
    if (!u) return isGuest ? "Guest User" : "User";
    if (u.name && !u.name.includes("@")) return u.name;
    const raw = u.name || u.username || u.email || "";
    if (raw.includes("@")) return raw.split("@")[0] || "User";
    return raw || (isGuest ? "Guest User" : "User");
  };

  const initialDisplayName = getCleanName(user);

  const [isEditingName, setIsEditingName] = useState(false);
  const [nameInput, setNameInput] = useState(initialDisplayName);
  const [currentDisplayName, setCurrentDisplayName] =
    useState(initialDisplayName);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);

  if (!isOpen || !user) return null;

  const initial = (currentDisplayName || "U").charAt(0).toUpperCase();

  const handleSaveName = async (e) => {
    e.preventDefault();
    if (!nameInput.trim()) {
      setErrorMsg("Display name cannot be empty.");
      return;
    }

    setSaving(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    const newName = nameInput.trim();
    const res = await System.updateGuestName({ name: newName });
    setSaving(false);

    if (res.success || res.user) {
      setCurrentDisplayName(newName);
      const updatedUser = {
        ...user,
        name: newName,
        bio: newName,
      };
      window.localStorage.setItem(AUTH_USER, JSON.stringify(updatedUser));
      window.dispatchEvent(
        new CustomEvent("user_updated", { detail: updatedUser })
      );
      setSuccessMsg("Name updated successfully!");
      setIsEditingName(false);
      setTimeout(() => setSuccessMsg(null), 3000);
    } else {
      // Fallback local update
      setCurrentDisplayName(newName);
      const updatedUser = { ...user, name: newName, bio: newName };
      window.localStorage.setItem(AUTH_USER, JSON.stringify(updatedUser));
      window.dispatchEvent(
        new CustomEvent("user_updated", { detail: updatedUser })
      );
      setSuccessMsg("Name updated!");
      setIsEditingName(false);
      setTimeout(() => setSuccessMsg(null), 3000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md transition-opacity duration-300">
      <div className="w-full max-w-md bg-[#1F1F1F] border border-[#333333] rounded-2xl shadow-2xl overflow-hidden text-white relative animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-neutral-800">
          <div className="flex items-center gap-2">
            <User size={20} className="text-[#14B8A6]" weight="bold" />
            <h2 className="text-lg font-medium text-white">Profile Details</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
          >
            <X size={18} weight="bold" />
          </button>
        </div>

        {/* Profile Card Info */}
        <div className="p-6 flex flex-col gap-6">
          {/* User Header */}
          <div className="flex items-center gap-4">
            {pfp ? (
              <img
                src={pfp}
                alt={currentDisplayName}
                className="w-16 h-16 rounded-full object-cover border-2 border-[#14B8A6]/40"
              />
            ) : (
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#14B8A6] to-cyan-700 text-slate-950 font-bold text-2xl flex items-center justify-center shadow-lg">
                {initial}
              </div>
            )}

            <div className="flex-1 min-w-0">
              <h3 className="text-xl font-light text-white tracking-tight truncate">
                {currentDisplayName}
              </h3>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 mt-1 rounded-full text-xs font-mono bg-neutral-800 text-neutral-300 border border-neutral-700">
                <ShieldCheck size={14} className="text-[#14B8A6]" />
                <span>{isGuest ? "Guest Account" : "Permanent Account"}</span>
              </div>
            </div>
          </div>

          {/* User Information Table & Edit Name Option */}
          <div className="bg-[#262626] border border-neutral-800 rounded-xl p-4 flex flex-col gap-3.5 text-sm">
            {/* Name / Display Handle with inline Edit */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="text-neutral-400 flex items-center gap-2 text-xs uppercase font-mono">
                  <User size={14} /> Name / Handle
                </span>

                {!isEditingName && (
                  <button
                    type="button"
                    onClick={() => {
                      setNameInput(currentDisplayName);
                      setIsEditingName(true);
                    }}
                    className="text-xs text-[#14B8A6] hover:underline flex items-center gap-1 font-mono"
                  >
                    <PencilSimple size={13} />
                    <span>Edit Name</span>
                  </button>
                )}
              </div>

              {isEditingName ? (
                <form onSubmit={handleSaveName} className="flex gap-2 mt-1">
                  <input
                    type="text"
                    autoFocus
                    value={nameInput}
                    onChange={(e) => setNameInput(e.target.value)}
                    placeholder="Enter display name"
                    className="flex-1 px-3 py-1.5 rounded-lg bg-neutral-800 border border-neutral-700 text-white text-sm focus:outline-none focus:border-[#14B8A6]"
                  />
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-3 py-1.5 rounded-lg bg-[#14B8A6] text-slate-950 font-semibold text-xs transition hover:bg-[#0F766E] disabled:opacity-50"
                  >
                    {saving ? "Saving..." : "Save"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsEditingName(false)}
                    className="px-2.5 py-1.5 rounded-lg bg-neutral-800 text-neutral-400 hover:text-white text-xs"
                  >
                    Cancel
                  </button>
                </form>
              ) : (
                <span className="font-medium text-neutral-200 truncate">
                  {currentDisplayName}
                </span>
              )}
            </div>

            {user?.email && (
              <div className="flex items-center justify-between border-t border-neutral-800 pt-3">
                <span className="text-neutral-400 flex items-center gap-2 text-xs uppercase font-mono">
                  <Envelope size={14} /> Email
                </span>
                <span className="font-medium text-neutral-200">
                  {user.email}
                </span>
              </div>
            )}

            <div className="flex items-center justify-between border-t border-neutral-800 pt-3">
              <span className="text-neutral-400 flex items-center gap-2 text-xs uppercase font-mono">
                <ShieldCheck size={14} /> Session Type
              </span>
              <span className="font-mono text-xs text-[#14B8A6] bg-[#14B8A6]/10 px-2 py-0.5 rounded border border-[#14B8A6]/30">
                {isGuest ? "Temporary Guest Session" : "Authenticated Session"}
              </span>
            </div>
          </div>

          {successMsg && (
            <div className="p-3 rounded-lg bg-[#14B8A6]/10 border border-[#14B8A6]/30 text-[#14B8A6] text-xs font-mono flex items-center gap-2">
              <Check size={14} weight="bold" />
              <span>{successMsg}</span>
            </div>
          )}

          {errorMsg && (
            <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-mono">
              {errorMsg}
            </div>
          )}

          {/* Guest Upgrade Action Prompt */}
          {isGuest && (
            <div className="p-4 rounded-xl bg-gradient-to-r from-teal-500/10 via-cyan-500/10 to-blue-500/10 border border-teal-500/30 text-xs text-neutral-300 flex flex-col gap-3">
              <div className="flex items-center gap-2 text-teal-300 font-semibold font-mono uppercase">
                <Sparkle size={16} weight="fill" />
                <span>Convert to Permanent Account</span>
              </div>
              <p className="text-neutral-400 leading-relaxed">
                Upgrade to an email + password account to save your private
                guest workspace, documents, and chats permanently.
              </p>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  if (onUpgrade) onUpgrade();
                }}
                className="w-full py-2.5 rounded-lg bg-[#14B8A6] hover:bg-[#0F766E] text-slate-950 font-semibold text-xs font-mono uppercase tracking-wider transition shadow-[0_0_15px_rgba(20,184,166,0.2)]"
              >
                ⚡ Create Account Now
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-[#181818] border-t border-neutral-800 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-medium transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
