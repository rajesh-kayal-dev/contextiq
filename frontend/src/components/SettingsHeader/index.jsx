import React from "react";
import { ArrowLeft, List } from "@phosphor-icons/react";
import { Link, useNavigate } from "react-router-dom";
import paths from "@/utils/paths";

export default function SettingsHeader({
  title = "Settings",
  subtitle = "Manage your ContextIQ workspace and AI configuration.",
  onOpenMobileMenu,
}) {
  const navigate = useNavigate();

  return (
    <div className="w-full border-b border-white/10 light:border-slate-200 bg-[#0B1220] light:bg-white px-6 py-4 flex items-center justify-between shrink-0">
      <div className="flex items-center gap-3">
        {onOpenMobileMenu && (
          <button
            type="button"
            onClick={onOpenMobileMenu}
            className="md:hidden p-1.5 rounded-lg text-[#94A3B8] hover:text-white light:hover:text-[#0F172A] hover:bg-white/5"
            aria-label="Open settings menu"
          >
            <List size={20} weight="bold" />
          </button>
        )}
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="p-1.5 rounded-lg text-[#94A3B8] hover:text-white light:hover:text-[#0F172A] hover:bg-white/5 transition-colors"
          title="Go back"
        >
          <ArrowLeft size={18} weight="bold" />
        </button>
        <div>
          <h1 className="text-base font-semibold text-white light:text-slate-900 leading-tight">
            {title}
          </h1>
          {subtitle && (
            <p className="text-xs text-[#94A3B8] light:text-slate-500">
              {subtitle}
            </p>
          )}
        </div>
      </div>

      <div className="hidden sm:flex items-center gap-2">
        <Link
          to={paths.home()}
          className="text-xs font-medium text-[#14B8A6] hover:underline"
        >
          Back to Chat
        </Link>
      </div>
    </div>
  );
}
