import { useEffect, useRef, useState } from "react";
import { DotsThreeVertical } from "@phosphor-icons/react";
import { useMemoriesContext, LIMITS } from "../MemoriesContext";
import CardMenu from "./CardMenu";

export default function MemoryCard({ memory }) {
  const {
    activeTab,
    memories,
    handleDelete,
    openEditModal,
    handlePromote,
    handleDemote,
  } = useMemoriesContext();

  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const buttonRef = useRef(null);

  useEffect(() => {
    if (!menuOpen) return;
    function handleClickOutside(e) {
      if (
        menuRef.current &&
        !menuRef.current.contains(e.target) &&
        buttonRef.current &&
        !buttonRef.current.contains(e.target)
      ) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [menuOpen]);

  const isWorkspace = activeTab === "workspace";
  const canMove = isWorkspace
    ? memories.global.length < LIMITS.global
    : memories.workspace.length < LIMITS.workspace;

  return (
    <div className="relative shrink-0 bg-[#172033] light:bg-white border border-[#26344D] light:border-[#CBD5E1] rounded-xl p-3.5 flex gap-2 items-start shadow-sm hover:border-[#2563EB]/40 transition-colors">
      <div className="flex-1 min-w-0">
        <p className="text-xs leading-relaxed text-[#F8FAFC] light:text-[#0F172A] font-medium">
          {memory.content}
        </p>
        <p className="text-[11px] leading-4 text-[#94A3B8] light:text-[#64748B] mt-2">
          {new Date(memory.createdAt).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          })}
        </p>
      </div>
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setMenuOpen(!menuOpen)}
        className="shrink-0 border-none bg-transparent cursor-pointer text-[#94A3B8] light:text-[#64748B] hover:text-[#2563EB] transition-colors p-1 rounded-lg"
      >
        <DotsThreeVertical size={18} weight="bold" />
      </button>
      {menuOpen && (
        <CardMenu
          menuRef={menuRef}
          buttonRef={buttonRef}
          isWorkspace={isWorkspace}
          canMove={canMove}
          onEdit={() => {
            setMenuOpen(false);
            openEditModal(memory);
          }}
          onMove={() => {
            setMenuOpen(false);
            if (isWorkspace) handlePromote(memory.id);
            else handleDemote(memory.id);
          }}
          onDelete={() => {
            setMenuOpen(false);
            handleDelete(memory.id);
          }}
        />
      )}
    </div>
  );
}
