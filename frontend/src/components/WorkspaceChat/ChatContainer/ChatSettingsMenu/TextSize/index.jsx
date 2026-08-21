import { useState } from "react";
import { CaretRight, TextT, Check } from "@phosphor-icons/react";
import { useTranslation } from "react-i18next";

function getTextSizes(t) {
  return [
    { key: "small", label: t("chat_window.small") },
    { key: "normal", label: t("chat_window.normal") },
    { key: "large", label: t("chat_window.large") },
  ];
}

export default function TextSizeRow() {
  const { t } = useTranslation();
  const [showSubmenu, setShowSubmenu] = useState(false);
  const [selectedSize, setSelectedSize] = useState(
    window.localStorage.getItem("contextiq_text_size") || "normal"
  );

  function handleTextSizeChange(size) {
    setSelectedSize(size);
    window.localStorage.setItem("contextiq_text_size", size);
    window.dispatchEvent(new CustomEvent("textSizeChange", { detail: size }));
  }

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
          <TextT size={16} weight="bold" />
        </div>
        <div className="flex flex-col min-w-0 flex-1">
          <span className="text-xs font-semibold text-[#F8FAFC] light:text-[#0F172A] truncate">
            {t("chat_window.text_size_label")}
          </span>
          <span className="text-[11px] text-[#94A3B8] light:text-[#64748B] truncate">
            Adjust message size
          </span>
        </div>
        <CaretRight size={14} className="text-[#64748B] shrink-0" />
      </div>
      {showSubmenu && (
        <TextSizeSubmenu
          selectedSize={selectedSize}
          onSizeChange={handleTextSizeChange}
        />
      )}
    </div>
  );
}

function TextSizeSubmenu({ selectedSize, onSizeChange }) {
  const { t } = useTranslation();
  const textSizes = getTextSizes(t);

  return (
    <div className="absolute right-full top-0 pr-2 z-50">
      <div className="bg-[#172033] light:bg-white border border-[#26344D] light:border-[#CBD5E1] rounded-2xl p-2 w-[140px] flex flex-col gap-1 shadow-xl">
        <div className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-[#64748B]">
          Text size
        </div>
        {textSizes.map(({ key, label }) => (
          <div
            key={key}
            onClick={() => onSizeChange(key)}
            className={`flex items-center justify-between px-3 py-1.5 rounded-xl cursor-pointer text-xs transition-colors ${
              selectedSize === key
                ? "bg-[#2563EB]/15 text-[#2563EB] font-semibold border border-[#2563EB]/30"
                : "text-[#F8FAFC] light:text-[#0F172A] hover:bg-white/[0.06] light:hover:bg-slate-100"
            }`}
          >
            <span>{label}</span>
            {selectedSize === key && (
              <Check size={14} weight="bold" className="text-[#2563EB]" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
