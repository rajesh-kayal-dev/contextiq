import { useState, useRef, useEffect } from "react";
import { SlidersHorizontal } from "@phosphor-icons/react";
import TextSizeRow from "./TextSize";
import MemoriesRow from "./Memories";
import CopyLinkToChatRow from "./CopyLinkToChat";
import ExportRow from "./Export";
import { Tooltip } from "react-tooltip";

export default function ChatSettingsMenu({
  history = [],
  workspace = null,
  threadSlug = null,
}) {
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef(null);
  const buttonRef = useRef(null);

  useEffect(() => {
    if (!showMenu) return;
    function handleClickOutside(e) {
      if (
        menuRef.current &&
        !menuRef.current.contains(e.target) &&
        buttonRef.current &&
        !buttonRef.current.contains(e.target)
      ) {
        setShowMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showMenu]);

  return (
    <div className="absolute top-3 right-4 md:top-3 md:right-4 z-30">
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setShowMenu(!showMenu)}
        aria-label="Chat settings"
        data-tooltip-id="chat-settings-tooltip"
        data-tooltip-content="Chat settings"
        className={`group border cursor-pointer flex items-center justify-center w-8 h-8 rounded-full transition-all ${
          showMenu
            ? "bg-[#2563EB] text-white border-transparent shadow-md"
            : "bg-[#172033]/70 light:bg-white/90 border-[#26344D] light:border-[#CBD5E1] hover:border-[#2563EB]/50 light:hover:border-[#2563EB] text-[#94A3B8] light:text-[#475569] hover:text-[#F8FAFC] light:hover:text-[#0F172A]"
        }`}
      >
        <SlidersHorizontal
          size={16}
          className={
            showMenu
              ? "text-white"
              : "text-[#94A3B8] light:text-[#475569] group-hover:text-[#2563EB]"
          }
        />
      </button>

      <Tooltip
        id="chat-settings-tooltip"
        place="bottom"
        delayShow={300}
        className="tooltip !text-xs !z-[9999]"
      />

      {showMenu && (
        <div
          ref={menuRef}
          className="absolute right-0 top-[42px] bg-[#172033] light:bg-white border border-[#26344D] light:border-[#CBD5E1] rounded-2xl p-2 w-[270px] flex flex-col gap-1 shadow-2xl shadow-black/40 z-50 transition-all duration-200"
        >
          <div className="px-3 py-1.5 border-b border-white/[0.06] light:border-slate-100 mb-1">
            <p className="text-[11px] font-bold uppercase tracking-wider text-[#64748B]">
              Chat settings
            </p>
          </div>
          <TextSizeRow />
          <MemoriesRow onClose={() => setShowMenu(false)} />
          <ExportRow
            history={history}
            workspace={workspace}
            threadSlug={threadSlug}
            onClose={() => setShowMenu(false)}
          />
          <CopyLinkToChatRow />
        </div>
      )}
    </div>
  );
}
