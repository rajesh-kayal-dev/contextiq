import { useEffect, useState } from "react";
import Sidebar from "@/components/SettingsSidebar";
import * as Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { PlusCircle } from "@phosphor-icons/react";
import Admin from "@/models/admin";
import ApiKeyRow from "./ApiKeyRow";
import NewApiKeyModal from "./NewApiKeyModal";
import paths from "@/utils/paths";
import { userFromStorage } from "@/utils/request";
import System from "@/models/system";
import ModalWrapper from "@/components/ModalWrapper";
import { useModal } from "@/hooks/useModal";
import CTAButton from "@/components/lib/CTAButton";
import { useTranslation } from "react-i18next";

import SettingsHeader from "@/components/SettingsHeader";

export default function AdminApiKeys() {
  const { isOpen, openModal, closeModal } = useModal();
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [apiKeys, setApiKeys] = useState([]);

  const fetchExistingKeys = async () => {
    const user = userFromStorage();
    const Model = !!user ? Admin : System;
    const { apiKeys: foundKeys } = await Model.getApiKeys();
    setApiKeys(foundKeys);
    setLoading(false);
  };

  useEffect(() => {
    fetchExistingKeys();
  }, []);

  const removeApiKey = (id) => {
    setApiKeys((prevKeys) => prevKeys.filter((apiKey) => apiKey.id !== id));
  };

  return (
    <div className="w-screen h-screen overflow-hidden bg-[#0B1220] light:bg-[#F8FAFC] flex">
      <Sidebar />
      <div className="flex-1 h-full flex flex-col overflow-y-auto">
        <SettingsHeader
          title="ContextIQ API"
          subtitle="Use the ContextIQ API to connect your applications to your AI knowledge and RAG workflows."
        />
        <div className="flex-1 overflow-y-auto px-4 md:px-8 py-6 flex justify-center">
          <div className="w-full max-w-[1200px] flex flex-col gap-y-6">
            <div className="bg-[#111827] light:bg-white border border-white/10 light:border-slate-200 rounded-xl p-6 shadow-sm flex flex-col gap-y-6">
              <div className="flex justify-between items-center border-b border-white/10 light:border-slate-200 pb-4">
                <div>
                  <h3 className="text-base font-semibold text-white light:text-slate-900">
                    API Keys
                  </h3>
                  <a
                    href={paths.apiDocs()}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs font-medium text-[#14B8A6] hover:underline mt-1 inline-block"
                  >
                    Read the ContextIQ API documentation &rarr;
                  </a>
                </div>
                <CTAButton onClick={openModal}>
                  <PlusCircle className="h-4 w-4" weight="bold" /> Create API
                  Key
                </CTAButton>
              </div>

              <div className="overflow-x-auto">
                {loading ? (
                  <Skeleton.default
                    height={200}
                    width="100%"
                    highlightColor="var(--theme-bg-primary)"
                    baseColor="var(--theme-bg-secondary)"
                  />
                ) : (
                  <table className="w-full text-xs text-left rounded-lg min-w-[720px]">
                    <thead className="text-[#94A3B8] light:text-slate-500 text-xs font-semibold uppercase border-b border-white/10 light:border-slate-200 bg-[#0B1220]/50 light:bg-slate-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 rounded-tl-lg">
                          Name
                        </th>
                        <th scope="col" className="px-6 py-3">
                          API Key
                        </th>
                        <th scope="col" className="px-6 py-3">
                          Created By
                        </th>
                        <th scope="col" className="px-6 py-3">
                          Created
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 rounded-tr-lg text-right"
                        >
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/10 light:divide-slate-200">
                      {apiKeys.length === 0 ? (
                        <tr className="bg-transparent text-[#94A3B8] light:text-slate-500">
                          <td colSpan="5" className="px-6 py-12 text-center">
                            <p className="text-sm font-semibold text-white light:text-slate-900 mb-1">
                              No API keys yet
                            </p>
                            <p className="text-xs text-[#94A3B8] light:text-slate-500">
                              Create an API key to connect external applications
                              to ContextIQ.
                            </p>
                          </td>
                        </tr>
                      ) : (
                        apiKeys.map((apiKey) => (
                          <ApiKeyRow
                            key={apiKey.id}
                            apiKey={apiKey}
                            removeApiKey={removeApiKey}
                          />
                        ))
                      )}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      <ModalWrapper isOpen={isOpen}>
        <NewApiKeyModal closeModal={closeModal} onSuccess={fetchExistingKeys} />
      </ModalWrapper>
    </div>
  );
}
