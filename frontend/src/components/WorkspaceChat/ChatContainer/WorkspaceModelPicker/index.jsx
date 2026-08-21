import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useModal } from "@/hooks/useModal";
import { useSidebarToggle } from "@/components/Sidebar/SidebarToggle";
import LLMSelectorModal from "../PromptInput/LLMSelector/index";
import SetupProvider from "../PromptInput/LLMSelector/SetupProvider";
import {
  SAVE_LLM_SELECTOR_EVENT,
  PROVIDER_SETUP_EVENT,
} from "../PromptInput/LLMSelector/action";
import Workspace from "@/models/workspace";
import System from "@/models/system";
import ModelRouterAPI from "@/models/modelRouter";

const PROVIDER_DISPLAY_MAP = {
  groq: "Groq",
  openai: "OpenAI",
  anthropic: "Anthropic",
  gemini: "Gemini",
  ollama: "Ollama",
  lmstudio: "LM Studio",
  togetherai: "Together AI",
  openrouter: "OpenRouter",
  mistral: "Mistral",
  bedrock: "AWS Bedrock",
  azure: "Azure OpenAI",
  localai: "LocalAI",
};

async function resolveModelInfo(workspace, systemSettings, t) {
  if (!workspace) return { provider: "", model: "" };

  const effectiveProvider =
    workspace.chatProvider ?? systemSettings?.LLMProvider;
  const rawModel = workspace.chatModel ?? systemSettings?.LLMModel ?? "";

  if (effectiveProvider === "ContextIQ-router") {
    const routerId = workspace.router_id || systemSettings?.ModelRouterId;
    if (!routerId) {
      return {
        provider: "Router",
        model: t("model-router.metrics.model-router-default"),
      };
    }
    const { router } = await ModelRouterAPI.get(routerId);
    return {
      provider: "Router",
      model: router?.name || t("model-router.metrics.model-router-default"),
    };
  }

  const providerName =
    PROVIDER_DISPLAY_MAP[effectiveProvider?.toLowerCase()] ||
    (effectiveProvider
      ? effectiveProvider.charAt(0).toUpperCase() + effectiveProvider.slice(1)
      : "");

  return {
    provider: providerName,
    model: rawModel,
  };
}

async function fetchModelInfo(slug, setModelInfo, t) {
  if (!slug) return;
  try {
    const [workspace, systemSettings] = await Promise.all([
      Workspace.bySlug(slug),
      System.keys(),
    ]);
    const info = await resolveModelInfo(workspace, systemSettings, t);
    setModelInfo(info);
  } catch (err) {
    console.error("Failed to fetch model info:", err);
  }
}

export default function WorkspaceModelPicker({ workspaceSlug = null }) {
  const { t } = useTranslation();
  const { slug: urlSlug } = useParams();
  const slug = urlSlug ?? workspaceSlug;
  const { showSidebar } = useSidebarToggle();

  const [showSelector, setShowSelector] = useState(false);
  const [modelInfo, setModelInfo] = useState({ provider: "", model: "" });
  const {
    isOpen: isSetupProviderOpen,
    openModal: openSetupProviderModal,
    closeModal: closeSetupProviderModal,
  } = useModal();
  const [config, setConfig] = useState({ settings: {}, provider: null });
  const [refreshKey, setRefreshKey] = useState(0);

  // Fetch current model info for display
  useEffect(() => {
    fetchModelInfo(slug, setModelInfo, t);
  }, [slug, t]);

  // Close selector and refresh model info when model is saved
  useEffect(() => {
    function handleSave() {
      setShowSelector(false);
      fetchModelInfo(slug, setModelInfo, t);
    }
    window.addEventListener(SAVE_LLM_SELECTOR_EVENT, handleSave);
    return () =>
      window.removeEventListener(SAVE_LLM_SELECTOR_EVENT, handleSave);
  }, [slug, t]);

  // Handle provider setup request
  useEffect(() => {
    function handleProviderSetup(e) {
      const { provider, settings } = e.detail;
      setConfig({ settings, provider });
      setTimeout(() => openSetupProviderModal(), 300);
    }
    window.addEventListener(PROVIDER_SETUP_EVENT, handleProviderSetup);
    return () =>
      window.removeEventListener(PROVIDER_SETUP_EVENT, handleProviderSetup);
  }, [openSetupProviderModal]);

  if (!slug) return null;

  // Format label text: "Groq • llama-3.1-8b-instant" or "llama-3.1-8b-instant" or "Select Model"
  let displayText = t("chat_window.select_model") || "Select Model";
  if (modelInfo.provider && modelInfo.model) {
    displayText = `${modelInfo.provider} • ${modelInfo.model}`;
  } else if (modelInfo.model) {
    displayText = modelInfo.model;
  } else if (modelInfo.provider) {
    displayText = modelInfo.provider;
  }

  return (
    <>
      {showSelector && (
        <div
          className="fixed inset-0 z-[40]"
          onClick={() => setShowSelector(false)}
        />
      )}

      {/* Desktop & Tablet Top-Left Anchored Model Selector */}
      <div
        className={`hidden md:flex absolute top-3 ${
          showSidebar ? "left-4" : "left-16"
        } z-[45] items-center transition-all duration-300`}
      >
        <button
          type="button"
          onClick={() => setShowSelector(!showSelector)}
          className={`group border cursor-pointer px-3 py-1.5 flex items-center gap-x-1.5 rounded-full transition-all shadow-sm ${
            showSelector
              ? "bg-[#172033] light:bg-white border-[#2563EB] text-[#2563EB]"
              : "bg-[#172033]/80 light:bg-white/90 border-[#26344D] light:border-[#CBD5E1] hover:border-[#2563EB]/50 light:hover:border-[#2563EB] text-[#F8FAFC] light:text-[#0F172A]"
          }`}
        >
          <span className="text-[#2563EB] text-xs font-bold">✦</span>
          <span className="text-xs font-medium text-[#F8FAFC] light:text-[#0F172A] tracking-tight">
            {displayText}
          </span>
          <span className="text-[10px] text-[#94A3B8] light:text-[#64748B] group-hover:text-[#2563EB] transition-colors">
            ▼
          </span>
        </button>

        {showSelector && (
          <div className="absolute left-0 top-full mt-2 bg-[#172033] light:bg-white border border-[#26344D] light:border-[#CBD5E1] rounded-xl shadow-2xl w-[580px] max-w-[calc(100vw-32px)] overflow-hidden z-[50]">
            <LLMSelectorModal
              key={refreshKey}
              workspaceSlug={slug}
              initialProvider={config.provider?.value}
            />
          </div>
        )}
      </div>

      {/* Mobile Model Selector (< 768px) */}
      <div className="md:hidden absolute top-3 right-4 z-[45] flex items-center">
        <button
          type="button"
          onClick={() => setShowSelector(!showSelector)}
          className={`group border cursor-pointer px-3 py-1 flex items-center gap-x-1.5 rounded-full transition-all max-w-[65vw] ${
            showSelector
              ? "bg-[#172033] light:bg-white border-[#2563EB] text-[#2563EB] shadow-sm"
              : "bg-[#172033]/90 light:bg-white border-[#26344D] light:border-[#CBD5E1] text-[#F8FAFC] light:text-[#0F172A]"
          }`}
        >
          <span className="text-[#2563EB] text-xs font-bold">✦</span>
          <span className="text-xs font-medium truncate max-w-[160px] text-[#F8FAFC] light:text-[#0F172A]">
            {displayText}
          </span>
          <span className="text-[10px] text-[#94A3B8] light:text-[#64748B]">
            ▼
          </span>
        </button>

        {showSelector && (
          <div className="absolute right-0 top-full mt-2 bg-[#172033] light:bg-white border border-[#26344D] light:border-[#CBD5E1] rounded-xl shadow-2xl w-[calc(100vw-48px)] max-w-[420px] overflow-hidden z-[50]">
            <LLMSelectorModal
              key={refreshKey}
              workspaceSlug={slug}
              initialProvider={config.provider?.value}
            />
          </div>
        )}
      </div>

      <SetupProvider
        isOpen={isSetupProviderOpen}
        closeModal={closeSetupProviderModal}
        postSubmit={() => {
          closeSetupProviderModal();
          setRefreshKey((k) => k + 1);
        }}
        settings={config.settings}
        llmProvider={config.provider}
      />
    </>
  );
}
