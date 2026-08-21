import React, { useState } from "react";
import { MagnifyingGlass, Check, Star } from "@phosphor-icons/react";
import { useTranslation } from "react-i18next";
import { CONTEXTIQ_LLM_PROVIDERS } from "@/utils/contextiqProviders";

export default function LLMSelectorSidePanel({
  availableProviders,
  selectedLLMProvider,
  onSearchChange,
  onProviderClick,
}) {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState("");

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    if (onSearchChange) onSearchChange(e);
  };

  const query = searchTerm.trim().toLowerCase();

  const filtered = CONTEXTIQ_LLM_PROVIDERS.filter((provider) => {
    if (!query) return true;
    return (
      provider.name.toLowerCase().includes(query) ||
      provider.label.toLowerCase().includes(query) ||
      provider.keywords.some((k) => k.toLowerCase().includes(query))
    );
  });

  const popularProviders = filtered.filter((p) => p.category === "popular");
  const moreProviders = filtered.filter((p) => p.category === "more");

  return (
    <div className="w-[45%] md:w-[40%] h-full flex flex-col gap-3 p-3 border-r border-[#26344D] light:border-[#CBD5E1] bg-[#0B1120]/40 light:bg-slate-50">
      {/* Search Input */}
      <div className="relative shrink-0">
        <MagnifyingGlass
          size={14}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8] light:text-[#64748B]"
          weight="bold"
        />
        <input
          id="llm-search-input"
          type="search"
          placeholder="Search providers..."
          value={searchTerm}
          onChange={handleSearch}
          className="bg-[#172033] light:bg-white text-[#F8FAFC] light:text-[#0F172A] placeholder:text-[#94A3B8] light:placeholder:text-[#64748B] text-xs rounded-xl pl-9 pr-3 h-8 w-full outline-none border border-[#26344D] light:border-[#CBD5E1] focus:border-[#2563EB] transition-colors"
        />
      </div>

      {/* Provider List (Popular & More) */}
      <div className="flex flex-col gap-3 overflow-y-auto min-h-0 flex-1 pr-1 no-scroll">
        {/* Popular Providers Section */}
        {popularProviders.length > 0 && (
          <div className="flex flex-col gap-1.5">
            <p className="text-[10px] font-bold uppercase tracking-wider text-[#94A3B8] light:text-[#64748B] px-1">
              Popular Providers
            </p>
            <div className="flex flex-col gap-1">
              {popularProviders.map((llm) => (
                <ProviderCard
                  key={llm.value}
                  provider={llm}
                  isSelected={selectedLLMProvider === llm.value}
                  onClick={() => onProviderClick(llm.value)}
                />
              ))}
            </div>
          </div>
        )}

        {/* More Providers Section */}
        {moreProviders.length > 0 && (
          <div className="flex flex-col gap-1.5 mt-1">
            <p className="text-[10px] font-bold uppercase tracking-wider text-[#94A3B8] light:text-[#64748B] px-1">
              More Providers
            </p>
            <div className="flex flex-col gap-1">
              {moreProviders.map((llm) => (
                <ProviderCard
                  key={llm.value}
                  provider={llm}
                  isSelected={selectedLLMProvider === llm.value}
                  onClick={() => onProviderClick(llm.value)}
                />
              ))}
            </div>
          </div>
        )}

        {filtered.length === 0 && (
          <div className="p-4 text-center text-xs text-[#94A3B8] light:text-[#64748B]">
            No matching AI providers found.
          </div>
        )}
      </div>
    </div>
  );
}

function ProviderCard({ provider, isSelected, onClick }) {
  return (
    <button
      type="button"
      data-llm-value={provider.value}
      onClick={onClick}
      className={`w-full text-left border cursor-pointer flex items-center justify-between p-2 rounded-xl transition-all ${
        isSelected
          ? "bg-[#2563EB]/10 border-[#2563EB] text-[#F8FAFC] light:text-[#0F172A] shadow-sm"
          : "bg-[#172033]/60 light:bg-white border-[#26344D]/60 light:border-[#CBD5E1] hover:border-[#2563EB]/40 text-[#F8FAFC] light:text-[#0F172A]"
      }`}
    >
      <div className="flex items-center gap-2.5 min-w-0 flex-1">
        {provider.logo ? (
          <img
            src={provider.logo}
            alt={`${provider.name} logo`}
            className="w-6 h-6 rounded-md object-contain shrink-0"
          />
        ) : (
          <div className="w-6 h-6 rounded-md bg-[#2563EB]/20 text-[#2563EB] flex items-center justify-center font-bold text-xs shrink-0">
            {provider.name.charAt(0)}
          </div>
        )}
        <div className="flex flex-col min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-semibold truncate">
              {provider.name}
            </span>
            {provider.isRecommended && (
              <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-[#2563EB] text-white shrink-0">
                <Star size={8} weight="fill" />
                Recommended
              </span>
            )}
          </div>
          <span className="text-[10px] text-[#94A3B8] light:text-[#64748B] truncate">
            {provider.label}
          </span>
        </div>
      </div>
      {isSelected && (
        <Check
          size={14}
          weight="bold"
          className="text-[#2563EB] shrink-0 ml-1"
        />
      )}
    </button>
  );
}
