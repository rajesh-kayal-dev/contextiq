import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Brain, CaretRight } from "@phosphor-icons/react";
import useUser from "@/hooks/useUser";
import System from "@/models/system";
import { useMemoriesSidebar, useSourcesSidebar } from "../../ChatSidebar";

export default function MemoriesRow({ onClose }) {
  const { t } = useTranslation();
  const { user } = useUser();
  const { toggleSidebar } = useMemoriesSidebar();
  const { closeSidebar } = useSourcesSidebar();
  const [memoryEnabled, setMemoryEnabled] = useState(null);

  const isAdmin = !user || user?.role === "admin";

  useEffect(() => {
    System.keys().then((settings) => {
      setMemoryEnabled(!!settings?.MemoryEnabled);
    });
  }, []);

  function handleClick() {
    closeSidebar();
    toggleSidebar();
    onClose();
  }

  if (memoryEnabled === null) return null;
  if (!isAdmin && !memoryEnabled) return null;

  return (
    <div
      onClick={handleClick}
      className="group flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer hover:bg-white/[0.06] light:hover:bg-slate-100 transition-colors"
    >
      <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-[#2563EB]/10 text-[#2563EB] shrink-0">
        <Brain size={16} weight="bold" />
      </div>
      <div className="flex flex-col min-w-0 flex-1">
        <span className="text-xs font-semibold text-[#F8FAFC] light:text-[#0F172A] truncate">
          {t("chat_window.memories.title")}
        </span>
        <span className="text-[11px] text-[#94A3B8] light:text-[#64748B] truncate">
          Manage saved context
        </span>
      </div>
      <CaretRight size={14} className="text-[#64748B] shrink-0" />
    </div>
  );
}
