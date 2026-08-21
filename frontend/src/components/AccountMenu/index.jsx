import React, { useState, useRef, useEffect } from "react";
import useUser from "@/hooks/useUser";
import usePfp from "@/hooks/usePfp";
import paths from "@/utils/paths";
import { Link } from "react-router-dom";
import {
  User,
  Gear,
  SignOut,
  Sparkle,
  CaretUp,
  CaretDown,
} from "@phosphor-icons/react";
import UpgradeGuestModal from "../Modals/UpgradeGuestModal";
import ProfileModal from "./ProfileModal";
import {
  AUTH_TIMESTAMP,
  AUTH_TOKEN,
  AUTH_USER,
  LAST_VISITED_WORKSPACE,
  USER_PROMPT_INPUT_MAP,
} from "@/utils/constants";

export default function AccountMenu() {
  const { user } = useUser();
  const { pfp } = usePfp();

  const [localUser, setLocalUser] = useState(user);
  const [isOpen, setIsOpen] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);

  const menuRef = useRef(null);

  // Sync context user & listen for real-time name changes without reload
  useEffect(() => {
    setLocalUser(user);
  }, [user]);

  useEffect(() => {
    function handleUserUpdate(e) {
      if (e?.detail) {
        setLocalUser(e.detail);
      } else {
        const stored = localStorage.getItem(AUTH_USER);
        if (stored) {
          try {
            setLocalUser(JSON.parse(stored));
          } catch (err) {
            console.error(err);
          }
        }
      }
    }
    window.addEventListener("user_updated", handleUserUpdate);
    return () => window.removeEventListener("user_updated", handleUserUpdate);
  }, []);

  const activeUser = localUser || user;
  const isGuest = activeUser?.role === "guest";
  const rawDisplayName =
    activeUser?.name ||
    activeUser?.bio ||
    activeUser?.username ||
    (isGuest ? "Guest User" : "Account");
  const displayName =
    rawDisplayName && rawDisplayName.includes("@")
      ? rawDisplayName.split("@")[0]
      : rawDisplayName;
  const accountBadge = isGuest ? "Guest" : "Account";
  const initial = (displayName || "A").charAt(0).toUpperCase();

  // Close popover on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  const handleSignOut = () => {
    window.localStorage.removeItem(AUTH_USER);
    window.localStorage.removeItem(AUTH_TOKEN);
    window.localStorage.removeItem(AUTH_TIMESTAMP);
    window.localStorage.removeItem(LAST_VISITED_WORKSPACE);
    window.localStorage.removeItem(USER_PROMPT_INPUT_MAP);
    window.localStorage.removeItem("contextiq_guest_id");
    window.localStorage.removeItem("contextiq-workspace-order");
    window.sessionStorage.clear();
    window.location.replace("/");
  };

  return (
    <div ref={menuRef} className="relative w-full">
      {/* FLOATING POPOVER MENU (Opens UPWARDS above account button) */}
      {isOpen && (
        <div className="absolute bottom-full mb-2.5 left-0 right-0 w-full bg-[#1F1F1F] border border-[#333333] rounded-xl p-1.5 shadow-2xl z-50 text-white animate-in fade-in slide-in-from-bottom-2 duration-150">
          <div className="flex flex-col gap-1 text-xs">
            {/* GUEST ONLY: Visually Emphasized Create Account Button */}
            {isGuest && (
              <>
                <button
                  type="button"
                  onClick={() => {
                    setIsOpen(false);
                    setShowUpgradeModal(true);
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg bg-gradient-to-r from-teal-500/20 via-cyan-500/20 to-blue-500/20 border border-teal-500/40 text-teal-300 hover:text-white hover:border-teal-400 font-mono font-semibold uppercase tracking-wider transition-all duration-200 shadow-[0_0_12px_rgba(20,184,166,0.15)] group"
                >
                  <Sparkle
                    size={15}
                    weight="fill"
                    className="text-teal-400 group-hover:scale-110 transition-transform"
                  />
                  <span>Create Account</span>
                </button>
                <div className="h-[1px] bg-neutral-800 my-1" />
              </>
            )}

            {/* Profile Action */}
            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                setShowProfileModal(true);
              }}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-neutral-300 hover:text-white hover:bg-neutral-800 transition-colors font-medium text-left"
            >
              <User size={16} className="text-neutral-400" />
              <span>Profile</span>
            </button>

            {/* Settings Action */}
            <Link
              to={paths.settings.interface()}
              onClick={() => setIsOpen(false)}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-neutral-300 hover:text-white hover:bg-neutral-800 transition-colors font-medium text-left"
            >
              <Gear size={16} className="text-neutral-400" />
              <span>Settings</span>
            </Link>

            <div className="h-[1px] bg-neutral-800 my-1" />

            {/* Sign Out Action */}
            <button
              type="button"
              onClick={handleSignOut}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition-colors font-medium text-left"
            >
              <SignOut size={16} />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      )}

      {/* BOTTOM-LEFT ACCOUNT TRIGGER BUTTON */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-white transition-all duration-200 group text-left"
      >
        <div className="flex items-center gap-3 min-w-0">
          {/* Avatar */}
          {pfp ? (
            <img
              src={pfp}
              alt={displayName}
              className="w-8 h-8 rounded-full object-cover shrink-0 border border-white/20"
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#14B8A6] to-cyan-800 text-slate-950 font-bold text-xs flex items-center justify-center shrink-0 shadow">
              {initial}
            </div>
          )}

          {/* Name & Badge */}
          <div className="flex flex-col min-w-0">
            <span className="text-xs font-medium text-neutral-200 group-hover:text-white truncate">
              {displayName}
            </span>
            <span className="text-[10px] font-mono text-neutral-400 group-hover:text-neutral-300 truncate">
              {accountBadge}
            </span>
          </div>
        </div>

        {/* Caret Indicator */}
        <div className="text-neutral-400 group-hover:text-white shrink-0">
          {isOpen ? (
            <CaretUp size={14} weight="bold" />
          ) : (
            <CaretDown size={14} weight="bold" />
          )}
        </div>
      </button>

      {/* Upgrade Guest Modal */}
      <UpgradeGuestModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
      />

      {/* Profile Modal */}
      <ProfileModal
        user={user}
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
        onUpgrade={() => setShowUpgradeModal(true)}
      />
    </div>
  );
}
