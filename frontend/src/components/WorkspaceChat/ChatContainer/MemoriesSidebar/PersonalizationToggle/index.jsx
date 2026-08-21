import { SimpleToggleSwitch } from "@/components/lib/Toggle";
import { useTranslation } from "react-i18next";
import Admin from "@/models/admin";
import { useMemoriesContext } from "../MemoriesContext";

export default function PersonalizationToggle() {
  const {
    canToggle,
    enabled,
    setEnabled,
    autoExtraction,
    setAutoExtraction,
    loadingEnabled,
  } = useMemoriesContext();
  const { t } = useTranslation();

  async function handleToggle(checked) {
    const value = checked ? "true" : "false";
    const { success } = await Admin.updateSystemPreferences({
      memory_enabled: value,
    });
    if (!success) return;
    setEnabled(checked);
  }

  async function handleAutoExtractionToggle(checked) {
    const value = checked ? "true" : "false";
    const { success } = await Admin.updateSystemPreferences({
      memory_auto_extraction: value,
    });
    if (!success) return;
    setAutoExtraction(checked);
  }

  if (!canToggle || loadingEnabled) return null;

  return (
    <div className="shrink-0 bg-[#172033] light:bg-white border border-[#26344D] light:border-[#CBD5E1] rounded-2xl p-4 space-y-3 shadow-sm">
      <div className="flex items-start gap-3">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-[#F8FAFC] light:text-[#0F172A]">
            {t("chat_window.memories.toggle.label")}
          </p>
          <p className="text-xs leading-4 text-[#94A3B8] light:text-[#64748B] mt-0.5">
            Allow ContextIQ to remember useful information about you.
          </p>
        </div>
        <SimpleToggleSwitch
          size="md"
          enabled={enabled}
          onChange={handleToggle}
        />
      </div>
      {enabled && (
        <div className="flex items-start gap-3 pt-3 border-t border-[#26344D] light:border-slate-200">
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-[#F8FAFC] light:text-[#0F172A]">
              {t("chat_window.memories.auto_extraction.label")}
            </p>
            <p className="text-xs leading-4 text-[#94A3B8] light:text-[#64748B] mt-0.5">
              Let ContextIQ save useful memories automatically.
            </p>
          </div>
          <SimpleToggleSwitch
            size="md"
            enabled={autoExtraction}
            onChange={handleAutoExtractionToggle}
          />
        </div>
      )}
    </div>
  );
}
