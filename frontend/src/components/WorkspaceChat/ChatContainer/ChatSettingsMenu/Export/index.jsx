import { useState } from "react";
import { CaretRight, Export } from "@phosphor-icons/react";
import { useTranslation } from "react-i18next";
import { saveAs } from "file-saver";
import Workspace from "@/models/workspace";
import showToast from "@/utils/toast";
import moment from "moment";

const EXPORT_FORMATS = [
  { key: "pdf", label: "PDF", ext: "pdf" },
  { key: "markdown", label: "Markdown", ext: "md" },
  { key: "plaintext", label: "Plain Text", ext: "txt" },
  { key: "json", label: "JSON", ext: "json" },
  { key: "html", label: "HTML", ext: "html" },
];

export default function ExportRow({
  history = [],
  workspace = null,
  threadSlug = null,
  onClose,
}) {
  const { t } = useTranslation();
  const [showSubmenu, setShowSubmenu] = useState(false);
  const [exporting, setExporting] = useState(false);

  async function handleExport(format) {
    if (exporting || !workspace?.slug) return;
    setExporting(true);
    const blob = await Workspace.exportChatsToType(
      workspace.slug,
      threadSlug,
      format.key
    );
    if (blob) {
      const stamp = moment().format("YYYY-MM-DD HH:mm:ss");
      saveAs(blob, `ContextIQ Export - ${stamp}.${format.ext}`);
    } else {
      showToast("Failed to export chat.", "error");
    }
    setExporting(false);
    onClose();
  }

  if (history.length === 0) return null;
  return (
    <div
      className="relative"
      onMouseEnter={() => setShowSubmenu(true)}
      onMouseLeave={() => setShowSubmenu(false)}
    >
      <div
        className={`group flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition-colors ${
          showSubmenu
            ? "bg-white/[0.08] light:bg-slate-100"
            : "hover:bg-white/[0.06] light:hover:bg-slate-100"
        }`}
      >
        <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-[#2563EB]/10 text-[#2563EB] shrink-0">
          <Export size={16} weight="bold" />
        </div>
        <div className="flex flex-col min-w-0 flex-1">
          <span className="text-xs font-semibold text-[#F8FAFC] light:text-[#0F172A] truncate">
            {exporting ? t("chat_window.exporting") : t("chat_window.export")}
          </span>
          <span className="text-[11px] text-[#94A3B8] light:text-[#64748B] truncate">
            Export chat history
          </span>
        </div>
        <CaretRight size={14} className="text-[#64748B] shrink-0" />
      </div>
      {showSubmenu && (
        <ExportSubmenu onExport={handleExport} exporting={exporting} />
      )}
    </div>
  );
}

function ExportSubmenu({ onExport, exporting }) {
  return (
    <div className="absolute right-full top-0 pr-2 z-50">
      <div className="bg-[#172033] light:bg-white border border-[#26344D] light:border-[#CBD5E1] rounded-2xl p-2 w-[140px] flex flex-col gap-1 shadow-xl">
        <div className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-[#64748B]">
          Export format
        </div>
        {EXPORT_FORMATS.map((format) => (
          <button
            key={format.key}
            onClick={() => onExport(format)}
            disabled={exporting}
            className="flex items-center justify-between px-3 py-1.5 rounded-xl cursor-pointer text-xs transition-colors border-none bg-transparent text-left text-[#F8FAFC] light:text-[#0F172A] hover:bg-white/[0.06] light:hover:bg-slate-100 disabled:opacity-40"
          >
            <span>{format.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
