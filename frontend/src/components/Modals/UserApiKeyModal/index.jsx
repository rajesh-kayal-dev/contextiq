import React, { useState, useEffect } from "react";
import { X, Key, CheckCircle, Warning } from "@phosphor-icons/react";
import ModalWrapper from "@/components/ModalWrapper";
import UserApiKey from "@/models/userApiKey";
import { toast } from "react-toastify";

const PROVIDERS = [
  { id: "openai", name: "OpenAI (GPT-4, GPT-3.5)" },
  { id: "gemini", name: "Google Gemini" },
  { id: "anthropic", name: "Anthropic Claude" },
  { id: "groq", name: "Groq (Llama 3, DeepSeek R1)" },
  { id: "openrouter", name: "OpenRouter" },
  { id: "deepseek", name: "DeepSeek AI" },
  { id: "perplexity", name: "Perplexity AI" },
  { id: "mistral", name: "Mistral AI" },
  { id: "ollama", name: "Ollama (Local)" },
];

export default function UserApiKeyModal({
  isOpen = false,
  hideModal = () => {},
  requiredProvider = "openai",
  onSaveSuccess = () => {},
}) {
  const [provider, setProvider] = useState(requiredProvider || "openai");
  const [apiKey, setApiKey] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (requiredProvider) {
      setProvider(requiredProvider.toLowerCase());
    }
  }, [requiredProvider]);

  if (!isOpen) return null;

  const handleSave = async (e) => {
    e.preventDefault();
    setError(null);

    if (!apiKey || !apiKey.trim()) {
      setError("Please enter a valid API key.");
      return;
    }

    setSaving(true);
    const result = await UserApiKey.saveKey(provider, apiKey.trim());
    setSaving(false);

    if (result.success) {
      toast.success(`API key for ${provider} saved securely!`);
      setApiKey("");
      hideModal();
      onSaveSuccess(provider);
    } else {
      setError(result.error || "Failed to save API key. Please try again.");
    }
  };

  const selectedProviderObj =
    PROVIDERS.find((p) => p.id === provider) ||
    PROVIDERS.find((p) => p.id === "openai");

  return (
    <ModalWrapper isOpen={isOpen}>
      <div className="w-full max-w-lg bg-theme-bg-secondary rounded-lg shadow-xl border-2 border-theme-modal-border overflow-hidden">
        {/* Header */}
        <div className="relative p-5 border-b border-theme-modal-border flex items-center justify-between">
          <div className="flex items-center gap-x-2">
            <div className="p-2 bg-blue-500/10 rounded-lg text-blue-400">
              <Key size={24} weight="bold" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">
                API Key Required
              </h3>
              <p className="text-xs text-white/60">
                Configure your LLM API key to start chatting
              </p>
            </div>
          </div>
          <button
            onClick={hideModal}
            type="button"
            className="text-white/60 hover:text-white transition-all p-1 rounded-lg hover:bg-theme-modal-border"
          >
            <X size={20} weight="bold" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSave} className="p-6 space-y-4">
          {error && (
            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm flex items-center gap-x-2">
              <Warning size={20} weight="bold" className="shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="p-3 bg-theme-modal-border/30 rounded-lg border border-theme-modal-border text-xs text-white/80">
            🔒 Your API key is{" "}
            <strong>encrypted and scoped exclusively to your account</strong>.
            Other users cannot access or use your key.
          </div>

          <div>
            <label className="block text-sm font-medium text-white/90 mb-1.5">
              LLM Provider
            </label>
            <select
              value={provider}
              onChange={(e) => setProvider(e.target.value)}
              className="w-full bg-theme-bg-primary text-white text-sm rounded-lg p-2.5 border border-theme-modal-border focus:ring-2 focus:ring-blue-500 outline-none"
            >
              {PROVIDERS.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-white/90 mb-1.5">
              API Key for {selectedProviderObj?.name || provider}
            </label>
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder={`Enter your ${selectedProviderObj?.name || provider} API key`}
              required
              autoFocus
              className="w-full bg-theme-bg-primary text-white text-sm rounded-lg p-2.5 border border-theme-modal-border focus:ring-2 focus:ring-blue-500 outline-none placeholder:text-white/30"
            />
          </div>

          {/* Footer buttons */}
          <div className="pt-3 flex items-center justify-end gap-x-3 border-t border-theme-modal-border/50">
            <button
              type="button"
              onClick={hideModal}
              className="px-4 py-2 text-sm text-white/70 hover:text-white transition-all rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2 text-sm font-medium bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-all flex items-center gap-x-2 disabled:opacity-50"
            >
              {saving ? (
                <span>Saving...</span>
              ) : (
                <>
                  <CheckCircle size={18} weight="bold" />
                  <span>Save API Key & Continue</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </ModalWrapper>
  );
}
