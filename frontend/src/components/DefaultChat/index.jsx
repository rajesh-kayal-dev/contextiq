import React, { useEffect, useState } from "react";
import paths from "@/utils/paths";
import { isMobile } from "react-device-detect";
import useUser from "@/hooks/useUser";
import Appearance from "@/models/appearance";
import useLogo from "@/hooks/useLogo";
import Workspace from "@/models/workspace";
import { NavLink } from "react-router-dom";
import { LAST_VISITED_WORKSPACE } from "@/utils/constants";
import { useTranslation } from "react-i18next";
import { safeJsonParse } from "@/utils/request";
import { useThemeContext } from "@/ThemeContext";

export default function DefaultChatContainer() {
  const { t } = useTranslation();
  const { user } = useUser();
  const { logo } = useLogo();
  const { isLight } = useThemeContext();
  const [lastVisitedWorkspace, setLastVisitedWorkspace] = useState(null);
  const [{ workspaces, loading }, setWorkspaces] = useState({
    workspaces: [],
    loading: true,
  });

  useEffect(() => {
    async function fetchWorkspaces() {
      const availableWorkspaces = await Workspace.all();
      const serializedLastVisitedWorkspace = localStorage.getItem(
        LAST_VISITED_WORKSPACE
      );
      if (!serializedLastVisitedWorkspace)
        return setWorkspaces({
          workspaces: availableWorkspaces,
          loading: false,
        });

      try {
        const lastVisitedWorkspace = safeJsonParse(
          serializedLastVisitedWorkspace,
          null
        );
        if (lastVisitedWorkspace == null) throw new Error("Non-parseable!");
        const isValid = availableWorkspaces.some(
          (ws) => ws.slug === lastVisitedWorkspace?.slug
        );
        if (!isValid) throw new Error("Invalid value!");
        setLastVisitedWorkspace(lastVisitedWorkspace);
      } catch {
        localStorage.removeItem(LAST_VISITED_WORKSPACE);
      } finally {
        setWorkspaces({ workspaces: availableWorkspaces, loading: false });
      }
    }
    fetchWorkspaces();
  }, []);

  if (loading) {
    return (
      <Layout>
        <div className="w-full h-full flex flex-col items-center justify-center overflow-y-auto no-scroll gap-y-4">
          <div className="w-14 h-14 rounded-2xl bg-[#1C263A] animate-pulse" />
          <div className="w-48 h-6 rounded-lg bg-[#1C263A] animate-pulse" />
          <div className="w-72 h-4 rounded bg-[#1C263A] animate-pulse" />
          <div className="w-56 h-4 rounded bg-[#1C263A] animate-pulse" />
          <div className="mt-4 w-36 h-9 rounded-lg bg-[#1C263A] animate-pulse" />
        </div>
      </Layout>
    );
  }

  const hasWorkspaces = workspaces.length > 0;
  return (
    <Layout>
      <div className="w-full h-full flex flex-col items-center justify-center overflow-y-auto no-scroll px-6">
        {/* ContextIQ Icon */}
        <div className="w-16 h-16 mb-6 rounded-2xl bg-[#172033] light:bg-slate-100 border border-white/10 light:border-slate-200 flex items-center justify-center shadow-lg light:shadow-sm">
          <img
            src={isLight ? "/branding/favicon/01 — Primary Transparent.png" : "/branding/favicon/favicon.png"}
            alt="ContextIQ"
            className="w-10 h-10 object-contain"
            onError={(e) => {
              e.target.style.display = "none";
            }}
          />
        </div>

        {/* Headline */}
        <h1 className="text-[#F8FAFC] light:text-[#0F172A] text-2xl md:text-3xl font-semibold mb-3 text-center tracking-tight">
          {hasWorkspaces
            ? `Welcome back, ${user.username}.`
            : "Ask your knowledge anything."}
        </h1>

        {/* Subtext */}
        <p className="text-[#94A3B8] light:text-[#475569] text-sm md:text-base text-center max-w-sm leading-relaxed mb-8">
          {hasWorkspaces
            ? t("home.chooseWorkspace")
            : "Upload your documents and start asking questions. ContextIQ retrieves relevant answers from your knowledge base."}
        </p>

        {/* CTA */}
        {hasWorkspaces && (
          <NavLink
            to={paths.workspace.chat(
              lastVisitedWorkspace?.slug || workspaces[0].slug
            )}
            className="flex items-center gap-x-2 px-5 py-2.5 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-sm font-medium transition-all duration-200 shadow-lg shadow-blue-900/30"
          >
            {t("home.goToWorkspace", {
              workspace: lastVisitedWorkspace?.name || workspaces[0].name,
            })}{" "}
            →
          </NavLink>
        )}
      </div>
    </Layout>
  );
}

const Layout = ({ children }) => {
  const { showScrollbar } = Appearance.getSettings();
  return (
    <div
      style={{ height: isMobile ? "100%" : "calc(100% - 32px)" }}
      className={`relative md:ml-[2px] md:mr-[16px] md:my-[16px] md:rounded-[16px] bg-[#111827] light:bg-[#FFFFFF] light:border-[1px] light:border-[#CBD5E1] w-full h-full overflow-y-scroll ${showScrollbar ? "show-scrollbar" : "no-scroll"}`}
    >
      {children}
    </div>
  );
};
