import React, { useEffect, useState } from "react";
import { X, Copy, Check } from "@phosphor-icons/react";
import Admin from "@/models/admin";
import { userFromStorage } from "@/utils/request";
import System from "@/models/system";
import { useTranslation } from "react-i18next";

export default function NewApiKeyModal({ closeModal, onSuccess }) {
  const { t } = useTranslation();
  const [apiKey, setApiKey] = useState(null);
  const [name, setName] = useState("");
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);

  const handleCreate = async (e) => {
    setError(null);
    e.preventDefault();
    const user = userFromStorage();
    const Model = !!user ? Admin : System;

    const { apiKey: newApiKey, error } = await Model.generateApiKey({
      name,
    });
    if (!!newApiKey) {
      setApiKey(newApiKey);
      onSuccess();
    }
    setError(error);
  };

  const copyApiKey = () => {
    if (!apiKey) return false;
    window.navigator.clipboard.writeText(apiKey.secret);
    setCopied(true);
  };

  useEffect(() => {
    function resetStatus() {
      if (!copied) return false;
      setTimeout(() => {
        setCopied(false);
      }, 3000);
    }
    resetStatus();
  }, [copied]);

  return (
    <div className="fixed inset-0 z-50 overflow-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="relative w-full max-w-lg bg-[#111827] light:bg-white rounded-xl shadow-xl border border-white/10 light:border-slate-200 overflow-hidden">
        <div className="flex justify-between items-center p-5 border-b border-white/10 light:border-slate-200">
          <h3 className="text-base font-semibold text-white light:text-slate-900">
            Create API Key
          </h3>
          <button
            onClick={closeModal}
            type="button"
            className="p-1 rounded-lg text-[#94A3B8] hover:text-white light:hover:text-slate-900 hover:bg-white/5 light:hover:bg-slate-100 transition-colors"
          >
            <X size={18} weight="bold" />
          </button>
        </div>

        <form onSubmit={handleCreate} className="p-6">
          <div className="space-y-4">
            {error && (
              <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
                {error}
              </div>
            )}

            {!apiKey ? (
              <div>
                <label className="block mb-1.5 text-xs font-semibold text-white light:text-slate-900">
                  Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Production App"
                  required={true}
                  className="bg-[#0B1220] light:bg-slate-50 text-white light:text-slate-900 text-xs rounded-lg border border-white/10 light:border-slate-300 focus:outline-none focus:ring-1 focus:ring-[#14B8A6] block w-full p-2.5"
                />
                <p className="text-[#94A3B8] light:text-slate-500 text-xs mt-1.5">
                  Give this key a name so you can identify where it is used.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="p-3 rounded-lg bg-[#14B8A6]/10 border border-[#14B8A6]/20 text-[#14B8A6] text-xs font-medium">
                  API key created successfully.
                </div>

                <div>
                  <label className="block mb-1.5 text-xs font-semibold text-white light:text-slate-900">
                    API Key Secret
                  </label>
                  <div className="relative flex items-center">
                    <input
                      type="text"
                      readOnly={true}
                      value={apiKey.secret}
                      className="bg-[#0B1220] light:bg-slate-50 text-white light:text-slate-900 font-mono text-xs rounded-lg border border-white/10 light:border-slate-300 block w-full p-2.5 pr-28"
                    />
                    <button
                      type="button"
                      onClick={copyApiKey}
                      className="absolute right-1.5 px-3 py-1.5 bg-[#14B8A6] hover:bg-[#0F766E] text-white text-xs font-medium rounded-md transition-colors flex items-center gap-1.5"
                    >
                      {copied ? (
                        <>
                          <Check size={14} weight="bold" /> Copied
                        </>
                      ) : (
                        <>
                          <Copy size={14} weight="bold" /> Copy API Key
                        </>
                      )}
                    </button>
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs">
                  Store this key securely. You will not be able to view it
                  again.
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-end items-center gap-x-3 mt-6 pt-4 border-t border-white/10 light:border-slate-200">
            {!apiKey ? (
              <>
                <button
                  onClick={closeModal}
                  type="button"
                  className="px-4 py-2 rounded-lg text-xs font-medium text-white light:text-slate-700 hover:bg-white/5 light:hover:bg-slate-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg text-xs font-medium bg-[#14B8A6] hover:bg-[#0F766E] text-white transition-colors"
                >
                  Create API Key
                </button>
              </>
            ) : (
              <button
                onClick={closeModal}
                type="button"
                className="px-4 py-2 rounded-lg text-xs font-medium bg-[#14B8A6] hover:bg-[#0F766E] text-white transition-colors"
              >
                Close
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
