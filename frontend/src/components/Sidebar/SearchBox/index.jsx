import { useState, useEffect, useRef } from "react";
import { Plus, MagnifyingGlass } from "@phosphor-icons/react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import paths from "@/utils/paths";
import Preloader from "@/components/Preloader";
import debounce from "lodash.debounce";
import Workspace from "@/models/workspace";
import { Tooltip } from "react-tooltip";

const DEFAULT_SEARCH_RESULTS = {
  workspaces: [],
  threads: [],
};

const SEARCH_RESULT_SELECTED = "search-result-selected";
export default function SearchBox({ user, showNewWsModal }) {
  const { t } = useTranslation();
  const searchRef = useRef(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [searchResults, setSearchResults] = useState(DEFAULT_SEARCH_RESULTS);
  const handleSearch = debounce(handleSearchDebounced, 500);

  async function handleSearchDebounced(e) {
    try {
      const searchValue = e.target.value;
      setSearchTerm(searchValue);
      setLoading(true);
      const searchResults =
        await Workspace.searchWorkspaceOrThread(searchValue);
      setSearchResults(searchResults);
    } catch (error) {
      console.error(error);
      setSearchResults(DEFAULT_SEARCH_RESULTS);
    } finally {
      setLoading(false);
    }
  }

  function handleReset() {
    if (searchRef.current) searchRef.current.value = "";
    setSearchTerm("");
    setLoading(false);
    setSearchResults(DEFAULT_SEARCH_RESULTS);
  }

  useEffect(() => {
    window.addEventListener(SEARCH_RESULT_SELECTED, handleReset);
    return () =>
      window.removeEventListener(SEARCH_RESULT_SELECTED, handleReset);
  }, []);

  return (
    <div className="flex gap-x-2 w-full items-center">
      <div className="relative flex-1">
        <MagnifyingGlass
          size={14}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-[#4B5A72] peer-focus:hidden pointer-events-none"
          weight="bold"
        />
        <input
          ref={searchRef}
          type="search"
          placeholder={t("common.search")}
          onChange={handleSearch}
          onReset={handleReset}
          onFocus={(e) => e.target.select()}
          className="w-full h-9 rounded-lg bg-white/[0.06] border border-white/[0.07] pl-8 pr-3 text-sm text-[#E5E7EB] placeholder:text-[#4B5A72] outline-none focus:border-[#2563EB]/50 focus:bg-white/[0.08] transition-all search-input peer light:bg-slate-100 light:border-slate-300 light:text-slate-700 light:placeholder:text-slate-400"
        />
      </div>
      <ShortWidthNewWorkspaceButton
        user={user}
        showNewWsModal={showNewWsModal}
      />
      <SearchResults
        searchResults={searchResults}
        searchTerm={searchTerm}
        loading={loading}
      />
    </div>
  );
}

function SearchResultWrapper({ children }) {
  return (
    <div className="absolute right-0 top-[6.2%] w-full flex flex-col gap-y-[24px] h-auto bg-theme-modal-border light:bg-theme-bg-primary light:border-2 light:border-theme-modal-border rounded-lg p-[16px] z-10 max-h-[calc(100%-24px)] overflow-y-scroll no-scroll">
      {children}
    </div>
  );
}

function SearchResults({ searchResults, searchTerm, loading }) {
  if (!searchTerm || searchTerm.length < 3) return null;
  if (loading)
    return (
      <SearchResultWrapper>
        <div className="flex flex-col gap-y-[8px] h-[200px] justify-center items-center">
          <Preloader size={5} />
          <p className="text-theme-text-secondary text-xs font-semibold text-center">
            Searching for "{searchTerm}"
          </p>
        </div>
      </SearchResultWrapper>
    );

  if (
    searchResults.workspaces.length === 0 &&
    searchResults.threads.length === 0
  ) {
    return (
      <SearchResultWrapper>
        <div className="flex flex-col gap-y-[8px] h-[200px] justify-center items-center">
          <p className="text-theme-text-secondary text-xs font-semibold text-center">
            No results found for
            <br />
            <span className="text-theme-text-primary font-semibold text-sm">
              "{searchTerm}"
            </span>
          </p>
        </div>
      </SearchResultWrapper>
    );
  }

  return (
    <SearchResultWrapper>
      <SearchResultCategory
        name="Workspaces"
        items={searchResults.workspaces?.map((workspace) => ({
          id: workspace.slug,
          to: paths.workspace.chat(workspace.slug),
          name: workspace.name,
        }))}
      />
      <SearchResultCategory
        name="Threads"
        items={searchResults.threads?.map((thread) => ({
          id: thread.slug,
          to: paths.workspace.thread(thread.workspace.slug, thread.slug),
          name: thread.name,
          hint: thread.workspace.name,
        }))}
      />
    </SearchResultWrapper>
  );
}

function SearchResultCategory({ items, name }) {
  if (!items?.length) return null;
  return (
    <div className="flex flex-col gap-y-[8px]">
      <p className="text-theme-text-secondary text-xs uppercase font-semibold px-[4px]">
        {name}
      </p>
      <div className="flex flex-col gap-y-[6px]">
        {items.map((item) => (
          <SearchResultItem
            key={item.id}
            to={item.to}
            name={item.name}
            hint={item.hint}
          />
        ))}
      </div>
    </div>
  );
}

function SearchResultItem({ to, name, hint }) {
  return (
    <Link
      to={to}
      onClick={() => window.dispatchEvent(new Event(SEARCH_RESULT_SELECTED))}
      className="hover:bg-[#FFF]/10 light:hover:bg-[#000]/10 transition-all duration-300 rounded-sm px-[8px] py-[2px]"
    >
      <p className="text-theme-text-primary text-sm truncate w-[80%]">
        {name}
        {hint && (
          <span className="text-theme-text-secondary text-xs ml-[4px]">
            | {hint}
          </span>
        )}
      </p>
    </Link>
  );
}

function ShortWidthNewWorkspaceButton({ showNewWsModal }) {
  const { t } = useTranslation();

  return (
    <>
      <button
        type="button"
        data-tooltip-id="new-workspace-tooltip"
        data-tooltip-content={t("new-workspace.title", "Create Workspace")}
        onClick={showNewWsModal}
        className="flex-shrink-0 flex items-center justify-center w-9 h-9 rounded-lg bg-[#2563EB] hover:bg-[#1D4ED8] transition-all duration-200 border-none cursor-pointer"
      >
        <Plus size={15} weight="bold" className="text-white" />
      </button>
      <Tooltip
        id="new-workspace-tooltip"
        place="top"
        delayShow={300}
        className="tooltip !text-xs"
      />
    </>
  );
}
