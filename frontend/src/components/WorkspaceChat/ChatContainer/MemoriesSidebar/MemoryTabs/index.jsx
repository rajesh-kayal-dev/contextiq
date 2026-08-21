import { Plus } from "@phosphor-icons/react";
import { useTranslation } from "react-i18next";
import { Tooltip } from "react-tooltip";
import { useMemoriesContext, LIMITS } from "../MemoriesContext";

export default function MemoryTabs() {
  const { workspace, activeTab, setActiveTab, memories, openCreateModal } =
    useMemoriesContext();
  const { t } = useTranslation();
  const workspaceName =
    workspace?.name || t("chat_window.memories.tab_workspace");
  const workspaceCount = memories.workspace.length;
  const globalCount = memories.global.length;
  const atLimit =
    activeTab === "workspace"
      ? workspaceCount >= LIMITS.workspace
      : globalCount >= LIMITS.global;

  return (
    <div className="flex items-center justify-between shrink-0 gap-2 py-1">
      <div className="flex items-center gap-1.5 min-w-0">
        <button
          type="button"
          onClick={() => setActiveTab("workspace")}
          data-tooltip-id="memories-workspace-pill"
          data-tooltip-content={workspaceName}
          className={`flex items-center gap-1 h-7 px-3 rounded-full border-none cursor-pointer text-xs font-semibold uppercase tracking-wider whitespace-nowrap transition-colors min-w-0 shrink ${
            activeTab === "workspace"
              ? "bg-[#2563EB] text-white shadow-sm"
              : "bg-white/[0.06] light:bg-slate-200 text-[#94A3B8] light:text-[#475569] hover:bg-white/10 light:hover:bg-slate-300"
          }`}
        >
          <span className="truncate max-w-[120px]">{workspaceName}</span>
          <span className="font-normal opacity-80">
            {workspaceCount}/{LIMITS.workspace}
          </span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("global")}
          className={`flex items-center gap-1 h-7 px-3 rounded-full border-none cursor-pointer text-xs font-semibold uppercase tracking-wider whitespace-nowrap transition-colors shrink-0 ${
            activeTab === "global"
              ? "bg-[#2563EB] text-white shadow-sm"
              : "bg-white/[0.06] light:bg-slate-200 text-[#94A3B8] light:text-[#475569] hover:bg-white/10 light:hover:bg-slate-300"
          }`}
        >
          <span>{t("chat_window.memories.tab_global")}</span>
          <span className="font-normal opacity-80">
            {globalCount}/{LIMITS.global}
          </span>
        </button>
      </div>
      <button
        type="button"
        onClick={openCreateModal}
        disabled={atLimit}
        className="flex items-center justify-center size-7 rounded-lg border-none bg-[#2563EB] hover:bg-[#1D4ED8] text-white cursor-pointer transition-colors disabled:opacity-30 disabled:cursor-not-allowed shadow-sm"
        aria-label="Add memory"
      >
        <Plus size={16} weight="bold" />
      </button>
      <Tooltip
        id="memories-workspace-pill"
        place="bottom"
        delayShow={800}
        className="tooltip !text-xs z-99"
      />
    </div>
  );
}
