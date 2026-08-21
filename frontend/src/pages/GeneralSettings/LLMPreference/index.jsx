import React, { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import Sidebar from "@/components/SettingsSidebar";
import System from "@/models/system";
import showToast from "@/utils/toast";
import ContextIQIcon from "@/media/logo/contextiq-icon.png";
import GroqLogo from "@/media/llmprovider/groq.png";
import GeminiLogo from "@/media/llmprovider/gemini.png";
import OpenAiLogo from "@/media/llmprovider/openai.png";
import AnthropicLogo from "@/media/llmprovider/anthropic.png";
import OpenRouterLogo from "@/media/llmprovider/openrouter.jpeg";
import OllamaLogo from "@/media/llmprovider/ollama.png";
import DeepSeekLogo from "@/media/llmprovider/deepseek.png";
import PerplexityLogo from "@/media/llmprovider/perplexity.png";
import MistralLogo from "@/media/llmprovider/mistral.jpeg";
import MinimaxLogo from "@/media/llmprovider/minimax.png";
import XAILogo from "@/media/llmprovider/xai.png";
import ZAiLogo from "@/media/llmprovider/zai.png";

import PreLoader from "@/components/Preloader";
import ModelRouterOptions from "@/components/LLMSelection/ModelRouterOptions";
import GroqAiOptions from "@/components/LLMSelection/GroqAiOptions";
import GeminiLLMOptions from "@/components/LLMSelection/GeminiLLMOptions";
import OpenAiOptions from "@/components/LLMSelection/OpenAiOptions";
import AnthropicAiOptions from "@/components/LLMSelection/AnthropicAiOptions";
import OpenRouterOptions from "@/components/LLMSelection/OpenRouterOptions";
import OllamaLLMOptions from "@/components/LLMSelection/OllamaLLMOptions";
import DeepSeekOptions from "@/components/LLMSelection/DeepSeekOptions";
import PerplexityOptions from "@/components/LLMSelection/PerplexityOptions";
import MistralOptions from "@/components/LLMSelection/MistralOptions";
import MinimaxOptions from "@/components/LLMSelection/MinimaxOptions";
import XAILLMOptions from "@/components/LLMSelection/XAiLLMOptions";
import ZAiLLMOptions from "@/components/LLMSelection/ZAiLLMOptions";

import LLMItem from "@/components/LLMSelection/LLMItem";
import { CaretUpDown, MagnifyingGlass, X } from "@phosphor-icons/react";
import CTAButton from "@/components/lib/CTAButton";

export const MODEL_ROUTER_PROVIDER = {
  name: "Model Router",
  value: "ContextIQ-router",
  logo: ContextIQIcon,
  options: (settings) => <ModelRouterOptions settings={settings} />,
  description:
    "Route messages to different LLM providers based on rules you define.",
  requiredConfig: [],
};

/**
 * ContextIQ curated LLM providers.
 * Only these 12 providers are supported in the ContextIQ UI.
 * This **never** includes the model router provider.
 */
export const AVAILABLE_LLM_PROVIDERS = [
  // ── Popular Providers ────────────────────────────────────────────────────
  {
    name: "Groq",
    value: "groq",
    logo: GroqLogo,
    options: (settings) => <GroqAiOptions settings={settings} />,
    description: "Fast inference — recommended for most users.",
    requiredConfig: ["GroqApiKey"],
  },
  {
    name: "Google Gemini",
    value: "gemini",
    logo: GeminiLogo,
    options: (settings) => <GeminiLLMOptions settings={settings} />,
    description: "General-purpose AI from Google.",
    requiredConfig: ["GeminiLLMApiKey"],
  },
  {
    name: "OpenAI",
    value: "openai",
    logo: OpenAiLogo,
    options: (settings) => <OpenAiOptions settings={settings} />,
    description: "GPT models from OpenAI.",
    requiredConfig: ["OpenAiKey"],
  },
  {
    name: "Anthropic",
    value: "anthropic",
    logo: AnthropicLogo,
    options: (settings) => <AnthropicAiOptions settings={settings} />,
    description: "High-quality reasoning via Claude models.",
    requiredConfig: ["AnthropicApiKey"],
  },
  {
    name: "OpenRouter",
    value: "openrouter",
    logo: OpenRouterLogo,
    options: (settings) => <OpenRouterOptions settings={settings} />,
    description: "Access multiple models through one API.",
    requiredConfig: ["OpenRouterApiKey"],
  },
  {
    name: "Ollama",
    value: "ollama",
    logo: OllamaLogo,
    options: (settings) => <OllamaLLMOptions settings={settings} />,
    description: "Run models locally on your own machine.",
    requiredConfig: ["OllamaLLMBasePath"],
  },
  {
    name: "DeepSeek",
    value: "deepseek",
    logo: DeepSeekLogo,
    options: (settings) => <DeepSeekOptions settings={settings} />,
    description: "Reasoning & coding models from DeepSeek.",
    requiredConfig: ["DeepSeekApiKey"],
  },
  // ── More Providers ────────────────────────────────────────────────────────
  {
    name: "Perplexity AI",
    value: "perplexity",
    logo: PerplexityLogo,
    options: (settings) => <PerplexityOptions settings={settings} />,
    description: "Web-connected AI from Perplexity.",
    requiredConfig: ["PerplexityApiKey"],
  },
  {
    name: "Mistral",
    value: "mistral",
    logo: MistralLogo,
    options: (settings) => <MistralOptions settings={settings} />,
    description: "Open and enterprise models from Mistral AI.",
    requiredConfig: ["MistralApiKey"],
  },
  {
    name: "MiniMax",
    value: "minimax",
    logo: MinimaxLogo,
    options: (settings) => <MinimaxOptions settings={settings} />,
    description: "General-purpose AI from MiniMax.",
    requiredConfig: ["MinimaxApiKey"],
  },
  {
    name: "xAI Grok",
    value: "xai",
    logo: XAILogo,
    options: (settings) => <XAILLMOptions settings={settings} />,
    description: "Grok models from xAI.",
    requiredConfig: ["XAIApiKey", "XAIModelPref"],
  },
  {
    name: "Z.AI",
    value: "zai",
    logo: ZAiLogo,
    options: (settings) => <ZAiLLMOptions settings={settings} />,
    description: "GLM models from Z.AI.",
    requiredConfig: ["ZAiApiKey"],
  },
];

/**
 * All LLM providers that are available to the user.
 * This **always** includes the model router provider.
 */
export const ALL_LLM_PROVIDERS = [
  MODEL_ROUTER_PROVIDER,
  ...AVAILABLE_LLM_PROVIDERS,
];

export const LLM_PREFERENCE_CHANGED_EVENT = "llm-preference-changed";
import SettingsHeader from "@/components/SettingsHeader";

export default function GeneralLLMPreference() {
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredLLMs, setFilteredLLMs] = useState([]);
  const [selectedLLM, setSelectedLLM] = useState(null);
  const [searchMenuOpen, setSearchMenuOpen] = useState(false);
  const searchInputRef = useRef(null);
  const { t } = useTranslation();

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    const form = e?.target || document.querySelector("#llm-preference-form");
    const data = { LLMProvider: selectedLLM };
    if (form) {
      const formData = new FormData(form);
      for (var [key, value] of formData.entries()) data[key] = value;
    }
    const { error } = await System.updateSystem(data);
    setSaving(true);

    if (error) {
      showToast(`Failed to save LLM settings: ${error}`, "error");
    } else {
      showToast("LLM preferences saved successfully.", "success");
    }
    setSaving(false);
    setHasChanges(!!error);
  };

  const updateLLMChoice = (selection) => {
    setSearchQuery("");
    setSelectedLLM(selection);
    setSearchMenuOpen(false);
    setHasChanges(true);
  };

  const handleXButton = () => {
    if (searchQuery.length > 0) {
      setSearchQuery("");
      if (searchInputRef.current) searchInputRef.current.value = "";
    } else {
      setSearchMenuOpen(!searchMenuOpen);
    }
  };

  useEffect(() => {
    async function fetchKeys() {
      const _settings = await System.keys();
      setSettings(_settings);
      setSelectedLLM(_settings?.LLMProvider || "groq");
      setLoading(false);
    }
    fetchKeys();
  }, []);

  useEffect(() => {
    function updateHasChanges() {
      setHasChanges(true);
    }
    window.addEventListener(LLM_PREFERENCE_CHANGED_EVENT, updateHasChanges);
    return () => {
      window.removeEventListener(
        LLM_PREFERENCE_CHANGED_EVENT,
        updateHasChanges
      );
    };
  }, []);

  useEffect(() => {
    const filtered = AVAILABLE_LLM_PROVIDERS.filter((llm) =>
      llm.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredLLMs(filtered);
  }, [searchQuery, selectedLLM]);

  const selectedLLMObject = AVAILABLE_LLM_PROVIDERS.find(
    (llm) => llm.value === selectedLLM
  );

  return (
    <div className="w-screen h-screen overflow-hidden bg-[#0B1220] light:bg-[#F8FAFC] flex">
      <Sidebar />
      {loading ? (
        <div className="flex-1 h-full flex justify-center items-center">
          <PreLoader />
        </div>
      ) : (
        <div className="flex-1 h-full flex flex-col overflow-y-auto">
          <SettingsHeader
            title="LLM Provider Settings"
            subtitle="Configure your primary AI language model provider and API credentials."
          />
          <div className="flex-1 overflow-y-auto px-4 md:px-8 py-6 flex justify-center">
            <form
              id="llm-preference-form"
              onSubmit={handleSubmit}
              className="w-full max-w-[1200px] flex flex-col gap-y-6"
            >
              <div className="bg-[#111827] light:bg-white border border-white/10 light:border-slate-200 rounded-xl p-6 shadow-sm flex flex-col gap-y-6">
                <div className="flex justify-between items-center border-b border-white/10 light:border-slate-200 pb-4">
                  <div>
                    <h3 className="text-base font-semibold text-white light:text-slate-900">
                      AI Provider Selection
                    </h3>
                    <p className="text-xs text-[#94A3B8] light:text-slate-500">
                      Choose which LLM powers reasoning across ContextIQ
                      workspaces.
                    </p>
                  </div>
                  {hasChanges && (
                    <CTAButton onClick={handleSubmit}>
                      {saving ? "Saving..." : "Save changes"}
                    </CTAButton>
                  )}
                </div>

                <div className="relative">
                  {searchMenuOpen && (
                    <div
                      className="fixed inset-0 bg-black/70 backdrop-blur-sm z-20"
                      onClick={() => setSearchMenuOpen(false)}
                    />
                  )}
                  {searchMenuOpen ? (
                    <div className="absolute top-0 left-0 w-full max-w-[640px] max-h-[380px] min-h-[64px] bg-[#111827] light:bg-white rounded-xl flex flex-col justify-between cursor-pointer border-2 border-[#14B8A6] z-30 shadow-2xl overflow-hidden">
                      <div className="w-full flex flex-col gap-y-1">
                        <div className="flex items-center sticky top-0 z-10 border-b border-white/10 light:border-slate-200 px-4 bg-[#111827] light:bg-white">
                          <MagnifyingGlass
                            size={18}
                            weight="bold"
                            className="text-[#94A3B8]"
                          />
                          <input
                            type="text"
                            name="llm-search"
                            autoComplete="off"
                            placeholder="Search providers..."
                            className="border-none bg-transparent pl-3 h-[42px] w-full px-2 py-1 text-sm outline-none text-white light:text-slate-900 placeholder:text-[#94A3B8]"
                            onChange={(e) => setSearchQuery(e.target.value)}
                            ref={searchInputRef}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") e.preventDefault();
                            }}
                          />
                          <X
                            size={18}
                            weight="bold"
                            className="cursor-pointer text-[#94A3B8] hover:text-white"
                            onClick={handleXButton}
                          />
                        </div>
                        <div className="flex-1 px-3 flex flex-col gap-y-2 overflow-y-auto no-scroll pb-4 max-h-[300px]">
                          {filteredLLMs.map((llm) => (
                            <LLMItem
                              key={llm.name}
                              name={llm.name}
                              value={llm.value}
                              image={llm.logo}
                              description={llm.description}
                              checked={selectedLLM === llm.value}
                              onClick={() => updateLLMChoice(llm.value)}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <button
                      className="w-full max-w-[640px] h-[64px] bg-[#0B1220] light:bg-slate-50 border border-white/10 light:border-slate-200 rounded-xl flex items-center p-4 justify-between cursor-pointer hover:border-[#14B8A6] transition-all duration-200"
                      type="button"
                      onClick={() => setSearchMenuOpen(true)}
                    >
                      <div className="flex gap-x-4 items-center">
                        <img
                          src={selectedLLMObject?.logo || ContextIQIcon}
                          alt={`${selectedLLMObject?.name} logo`}
                          className="w-9 h-9 rounded-md object-contain"
                        />
                        <div className="flex flex-col text-left">
                          <div className="text-sm font-semibold text-white light:text-slate-900">
                            {selectedLLMObject?.name || "None selected"}
                          </div>
                          <div className="text-xs text-[#94A3B8] light:text-slate-500">
                            {selectedLLMObject?.description ||
                              "Select an LLM provider"}
                          </div>
                        </div>
                      </div>
                      <CaretUpDown
                        size={20}
                        weight="bold"
                        className="text-[#94A3B8]"
                      />
                    </button>
                  )}
                </div>

                <div
                  onChange={() => setHasChanges(true)}
                  className="flex flex-col gap-y-3 pt-2"
                >
                  {selectedLLM &&
                    AVAILABLE_LLM_PROVIDERS.find(
                      (llm) => llm.value === selectedLLM
                    )?.options?.(settings)}
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
