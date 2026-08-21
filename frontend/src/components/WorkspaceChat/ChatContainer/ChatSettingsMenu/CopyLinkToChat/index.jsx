import ModalWrapper from "@/components/ModalWrapper";
import { useModal } from "@/hooks/useModal";
import { X, LinkSimple } from "@phosphor-icons/react";
import { useState } from "react";
import { useParams } from "react-router-dom";

const SEEN_COPY_LINK_CHAT_ALERT = "contextiq_seen_copy_link_chat_alert";

export default function CopyLinkToChatRow() {
  const { slug, threadSlug } = useParams();
  const [copied, setCopied] = useState(false);
  const { isOpen, openModal, closeModal } = useModal();

  if (!slug) return null;

  function getChatUrl() {
    let path = `/workspace/${slug}`;
    if (threadSlug) path += `/t/${threadSlug}`;
    return `${window.location.origin}${path}`;
  }

  function handleClick() {
    navigator.clipboard.writeText(getChatUrl()).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });

    if (!window.localStorage.getItem(SEEN_COPY_LINK_CHAT_ALERT)) openModal();
  }

  function handleCloseModal() {
    closeModal();
    window.localStorage.setItem(SEEN_COPY_LINK_CHAT_ALERT, "1");
  }

  return (
    <>
      <div
        onClick={handleClick}
        className="group flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer hover:bg-white/[0.06] light:hover:bg-slate-100 transition-colors"
      >
        <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-[#2563EB]/10 text-[#2563EB] shrink-0">
          <LinkSimple size={16} weight="bold" />
        </div>
        <div className="flex flex-col min-w-0 flex-1">
          <span className="text-xs font-semibold text-[#F8FAFC] light:text-[#0F172A] truncate">
            {copied ? "Link copied!" : "Copy chat link"}
          </span>
          <span className="text-[11px] text-[#94A3B8] light:text-[#64748B] truncate">
            Share this conversation
          </span>
        </div>
      </div>
      <CopyLinkModal
        isOpen={isOpen}
        closeModal={handleCloseModal}
        url={getChatUrl()}
      />
    </>
  );
}

function CopyLinkModal({ isOpen, closeModal, url }) {
  if (!isOpen) return null;

  return (
    <ModalWrapper isOpen={isOpen}>
      <div
        onMouseDown={(e) => e.stopPropagation()}
        onClick={(e) => e.stopPropagation()}
        className="w-[500px] bg-theme-bg-sidebar px-6 py-4 rounded-lg flex flex-col items-center justify-between relative shadow-lg border border-white/10"
      >
        <div className="w-full flex items-center justify-between">
          <div className="text-white text-left font-medium text-lg">
            Chat link copied!
          </div>
          <button
            onClick={closeModal}
            className="text-white opacity-60 hover:text-white hover:opacity-100 border-none outline-none"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex flex-col w-full mt-4">
          <p className="text-sm text-zinc-400 light:text-slate-500">
            The link to this chat has been copied to your clipboard.
          </p>
          <p className="text-sm text-zinc-400 light:text-slate-500 pt-1">
            This <strong>does not</strong> change permissions on the chat and is
            simply a way for you to quick link to you own chats.
          </p>
          <div className="mt-3 px-3 py-2 rounded-md bg-theme-bg-primary border border-white/10 text-sm text-white break-all select-all">
            {url}
          </div>
        </div>
      </div>
    </ModalWrapper>
  );
}
