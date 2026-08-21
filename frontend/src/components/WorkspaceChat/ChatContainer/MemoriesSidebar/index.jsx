import { X, Brain, Plus, ArrowUUpLeft } from "@phosphor-icons/react";
import { useTranslation } from "react-i18next";
import ChatSidebar from "../ChatSidebar";
import { MemoriesProvider, useMemoriesContext } from "./MemoriesContext";
import PersonalizationToggle from "./PersonalizationToggle";
import MemoryTabs from "./MemoryTabs";
import MemoryCard from "./MemoryCard";
import MemoryModal from "./MemoryModal";

export { useMemoriesSidebar } from "../ChatSidebar";

export default function MemoriesSidebar({ workspace }) {
  return (
    <MemoriesProvider workspace={workspace}>
      <MemoriesSidebarContent />
    </MemoriesProvider>
  );
}

function MemoriesSidebarContent() {
  const { sidebarOpen, canToggle, enabled } = useMemoriesContext();

  if (!canToggle && !enabled) return null;
  return (
    <>
      <ChatSidebar isOpen={sidebarOpen}>
        <SidebarPanel>
          <SidebarHeader />
          <PersonalizationToggle />
          <MemoryList />
          <SidebarFooter />
        </SidebarPanel>
      </ChatSidebar>
      <MemoryModalWrapper />
    </>
  );
}

function SidebarPanel({ children }) {
  return (
    <div className="w-[380px] flex-shrink-0 flex flex-col gap-4 py-4 px-5 overflow-y-auto no-scroll h-full">
      {children}
    </div>
  );
}

function MemoryList() {
  const { enabled, activeMemories } = useMemoriesContext();

  if (!enabled) return null;
  if (activeMemories.length === 0) {
    return (
      <>
        <MemoryTabs />
        <EmptyState />
      </>
    );
  }

  return (
    <>
      <MemoryTabs />
      <div className="flex flex-col gap-2 pb-4">
        {activeMemories.map((memory) => (
          <MemoryCard key={memory.id} memory={memory} />
        ))}
      </div>
    </>
  );
}

function MemoryModalWrapper() {
  const {
    enabled,
    modalState,
    editingMemory,
    closeModal,
    handleCreate,
    handleUpdate,
  } = useMemoriesContext();

  if (!enabled) return null;
  return (
    <MemoryModal
      isOpen={modalState.open}
      mode={modalState.mode}
      initialContent={editingMemory?.content || ""}
      onClose={closeModal}
      onSubmit={(content) => {
        if (modalState.mode === "edit" && editingMemory) {
          handleUpdate(editingMemory.id, content);
        } else {
          handleCreate(content);
        }
      }}
    />
  );
}

function SidebarHeader() {
  const { t } = useTranslation();
  const { closeSidebar } = useMemoriesContext();

  return (
    <div className="flex items-center justify-between shrink-0 pb-3 border-b border-white/[0.06] light:border-slate-200">
      <div className="flex items-center gap-2.5">
        <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-[#2563EB]/10 text-[#2563EB]">
          <Brain size={18} weight="bold" />
        </div>
        <p className="font-bold text-base text-[#F8FAFC] light:text-[#0F172A]">
          {t("chat_window.memories.title")}
        </p>
      </div>
      <button
        onClick={closeSidebar}
        type="button"
        className="p-1.5 rounded-lg text-[#94A3B8] light:text-[#475569] hover:text-[#F8FAFC] light:hover:text-[#0F172A] hover:bg-white/10 light:hover:bg-slate-200 transition-colors border-none bg-transparent cursor-pointer"
        aria-label="Close memories panel"
      >
        <X size={18} weight="bold" />
      </button>
    </div>
  );
}

function EmptyState() {
  const { t } = useTranslation();
  const { openCreateModal } = useMemoriesContext();
  return (
    <div className="flex flex-col items-center text-center py-8 px-4 bg-[#172033]/40 light:bg-white/60 border border-[#26344D] light:border-[#CBD5E1] rounded-2xl my-2 shadow-sm">
      <div className="w-11 h-11 rounded-2xl bg-[#2563EB]/10 flex items-center justify-center text-[#2563EB] mb-3">
        <Brain size={22} weight="bold" />
      </div>
      <p className="font-bold text-sm text-[#F8FAFC] light:text-[#0F172A]">
        No memories yet
      </p>
      <p className="text-xs text-[#94A3B8] light:text-[#64748B] mt-1 max-w-[240px] leading-relaxed">
        ContextIQ will save useful information here when memory is enabled.
      </p>
      <button
        type="button"
        onClick={openCreateModal}
        className="mt-4 px-4 py-2 bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-semibold rounded-xl shadow-md cursor-pointer transition-all flex items-center gap-1.5 border-none"
      >
        <Plus size={14} weight="bold" />
        {t("chat_window.memories.empty_cta")}
      </button>
    </div>
  );
}

function SidebarFooter() {
  const { closeSidebar } = useMemoriesContext();
  return (
    <div className="mt-auto pt-3 pb-2 border-t border-white/[0.06] light:border-slate-200 flex items-center shrink-0">
      <button
        type="button"
        onClick={closeSidebar}
        className="group flex items-center gap-2 text-xs font-semibold text-[#94A3B8] light:text-[#475569] hover:text-[#2563EB] light:hover:text-[#2563EB] transition-colors border-none bg-transparent cursor-pointer p-1 rounded-lg"
      >
        <ArrowUUpLeft
          size={16}
          weight="fill"
          className="group-hover:-translate-x-0.5 transition-transform"
        />
        <span>Back to Workspaces</span>
      </button>
    </div>
  );
}
