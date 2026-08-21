import React, { useEffect, useRef, useState } from "react";
import paths, { isPathMatch } from "@/utils/paths";
import useLogo from "@/hooks/useLogo";
import {
  House,
  List,
  SlidersHorizontal,
  ChatText,
  BookOpen,
  Robot,
  Cpu,
  Stack,
  Image as ImageIcon,
  Database,
  Scissors,
  Key,
  Shield,
  MagnifyingGlass,
  ArrowLeft,
  X,
  CaretRight,
} from "@phosphor-icons/react";
import useUser from "@/hooks/useUser";
import { isMobile } from "react-device-detect";
import Footer from "../Footer";
import { Link, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import System from "@/models/system";
import Option from "./MenuOption";
import useAppVersion from "@/hooks/useAppVersion";
import { useThemeContext } from "@/ThemeContext";

export default function SettingsSidebar() {
  const { logo, isCustomLogo } = useLogo();
  const { isLight } = useThemeContext();
  const { user } = useUser();
  const sidebarRef = useRef(null);
  const [showSidebar, setShowSidebar] = useState(false);
  const [showBgOverlay, setShowBgOverlay] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    function handleBg() {
      if (showSidebar) {
        setTimeout(() => {
          setShowBgOverlay(true);
        }, 300);
      } else {
        setShowBgOverlay(false);
      }
    }
    handleBg();
  }, [showSidebar]);

  if (isMobile) {
    return (
      <>
        <div className="fixed top-0 left-0 right-0 z-10 flex justify-between items-center px-4 py-2 bg-[#0B1220] light:bg-white text-[#94A3B8] light:text-[#475569] border-b border-white/10 light:border-slate-200 shadow-md h-14">
          <button
            onClick={() => setShowSidebar(true)}
            className="rounded-lg p-1.5 flex items-center justify-center text-[#94A3B8] hover:text-white"
          >
            <List className="h-6 w-6" />
          </button>
          <div className="flex items-center justify-center flex-grow gap-1.5">
            {!isCustomLogo && !isLight && (
              <img
                src="/branding/favicon/favicon.png"
                alt="ContextIQ favicon"
                className="h-[24px] w-auto object-contain"
              />
            )}
            <img
              src={logo}
              alt="ContextIQ"
              className="block mx-auto h-6 w-auto object-contain max-w-[160px]"
            />
          </div>
          <Link
            to={paths.home()}
            className="p-1.5 rounded-lg text-[#94A3B8] hover:text-white"
          >
            <House className="h-5 w-5" />
          </Link>
        </div>
        <div
          style={{
            transform: showSidebar ? `translateX(0vw)` : `translateX(-100vw)`,
          }}
          className="z-50 fixed top-0 left-0 transition-all duration-300 w-[100vw] h-[100vh]"
        >
          <div
            className={`${
              showBgOverlay ? "opacity-100" : "opacity-0"
            } duration-300 fixed top-0 left-0 bg-black/60 backdrop-blur-sm w-screen h-screen`}
            onClick={() => setShowSidebar(false)}
          />
          <div
            ref={sidebarRef}
            className="h-[100vh] fixed top-0 left-0 bg-[#0B1220] light:bg-[#F8FAFC] border-r border-white/10 light:border-slate-200 w-[80%] max-w-[300px] p-4 flex flex-col justify-between"
          >
            <div className="flex flex-col gap-y-4">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <Link to={paths.home()} className="flex items-center gap-1.5">
                  {!isCustomLogo && !isLight && (
                    <img
                      src="/branding/favicon/favicon.png"
                      alt="ContextIQ favicon"
                      className="h-[24px] w-auto object-contain"
                    />
                  )}
                  <img src={logo} alt="ContextIQ" className="h-6 w-auto object-contain max-w-[160px]" />
                </Link>
                <button
                  type="button"
                  onClick={() => setShowSidebar(false)}
                  className="p-1 rounded-lg text-[#94A3B8] hover:text-white"
                >
                  <X size={18} weight="bold" />
                </button>
              </div>
              <SidebarSearch
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
              />
              <div className="overflow-y-auto no-scroll max-h-[calc(100vh-180px)]">
                <CategorizedSidebarOptions
                  user={user}
                  searchQuery={searchQuery}
                />
              </div>
            </div>
            <div className="border-t border-white/10 pt-3">
              <Footer />
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <div className="w-[260px] h-screen shrink-0 bg-[#0B1220] light:bg-[#F8FAFC] border-r border-white/10 light:border-slate-200 flex flex-col justify-between p-4">
      <div className="flex flex-col gap-y-4 flex-1 min-h-0">
        <div className="flex items-center justify-between border-b border-white/10 light:border-slate-200 pb-3">
          <Link to={paths.home()} className="flex items-center gap-1.5">
            {!isCustomLogo && !isLight && (
              <img
                src="/branding/favicon/favicon.png"
                alt="ContextIQ favicon"
                className="h-[24px] w-auto object-contain"
              />
            )}
            <img src={logo} alt="ContextIQ" className="h-6 w-auto object-contain max-w-[160px]" />
          </Link>
          <Link
            to={paths.home()}
            className="flex items-center gap-1 text-xs text-[#94A3B8] hover:text-white light:hover:text-[#0F172A] transition-colors p-1.5 rounded-md hover:bg-white/5"
            title="Back to Workspace"
          >
            <ArrowLeft size={14} weight="bold" />
            <span>Home</span>
          </Link>
        </div>

        <SidebarSearch
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
        />

        <div className="flex-1 overflow-y-auto no-scroll">
          <CategorizedSidebarOptions user={user} searchQuery={searchQuery} />
        </div>
      </div>

      <div className="border-t border-white/10 light:border-slate-200 pt-3 shrink-0">
        <div className="flex justify-between items-center text-xs text-[#94A3B8] px-2 mb-2">
          <SupportEmail />
          <AppVersion />
        </div>
        <Footer />
      </div>
    </div>
  );
}

function SidebarSearch({ searchQuery, setSearchQuery }) {
  return (
    <div className="relative w-full">
      <MagnifyingGlass
        size={14}
        weight="bold"
        className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8]"
      />
      <input
        type="text"
        placeholder="Search settings..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="w-full bg-[#111827] light:bg-white border border-white/10 light:border-slate-200 rounded-lg pl-8 pr-7 py-1.5 text-xs text-white light:text-slate-900 placeholder:text-[#94A3B8] focus:outline-none focus:ring-1 focus:ring-[#14B8A6]"
      />
      {searchQuery && (
        <button
          onClick={() => setSearchQuery("")}
          className="absolute right-2 top-1/2 -translate-y-1/2 text-[#94A3B8] hover:text-white"
        >
          <X size={12} weight="bold" />
        </button>
      )}
    </div>
  );
}

function CollapsibleCategoryGroup({ group, user, query }) {
  const location = useLocation();
  const storageKey = `contextiq_settings_cat_${group.title
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "_")}`;

  const filteredItems = group.items.filter(
    (item) => !query || item.btnText.toLowerCase().includes(query)
  );

  const hasActiveItem = filteredItems.some((item) =>
    isPathMatch(item.href, location.pathname)
  );

  const [isCollapsed, setIsCollapsed] = useState(() => {
    if (hasActiveItem) return false;
    const stored = localStorage.getItem(storageKey);
    return stored ? JSON.parse(stored) : false;
  });

  useEffect(() => {
    if (hasActiveItem && isCollapsed) {
      setIsCollapsed(false);
      localStorage.setItem(storageKey, JSON.stringify(false));
    }
  }, [location.pathname, hasActiveItem]);

  if (filteredItems.length === 0) return null;

  const toggleCollapse = () => {
    const nextState = !isCollapsed;
    setIsCollapsed(nextState);
    localStorage.setItem(storageKey, JSON.stringify(nextState));
  };

  return (
    <div className="flex flex-col gap-y-1">
      <button
        type="button"
        onClick={toggleCollapse}
        className="flex items-center justify-between px-3 py-1 text-[10px] font-bold text-[#94A3B8] light:text-[#64748B] hover:text-white light:hover:text-[#0F172A] tracking-wider uppercase group select-none transition-colors"
      >
        <span>{group.title}</span>
        <CaretRight
          size={12}
          weight="bold"
          className={`transition-transform duration-200 ${
            !isCollapsed ? "rotate-90 text-[#14B8A6]" : "text-[#94A3B8]"
          }`}
        />
      </button>

      {!isCollapsed &&
        filteredItems.map((item) => (
          <Option
            key={item.btnText}
            btnText={item.btnText}
            icon={item.icon}
            href={item.href}
            user={user}
            flex={item.flex}
            roles={item.roles}
          />
        ))}
    </div>
  );
}

function CategorizedSidebarOptions({ user = null, searchQuery = "" }) {
  const query = searchQuery.toLowerCase().trim();

  const GROUPS = [
    {
      title: "AI WORKSPACE",
      items: [
        {
          btnText: "General",
          icon: <SlidersHorizontal size={16} weight="bold" />,
          href: paths.settings.interface(),
          roles: ["admin", "manager"],
          flex: true,
        },
        {
          btnText: "Chat",
          icon: <ChatText size={16} weight="bold" />,
          href: paths.settings.chat(),
          roles: ["admin", "manager"],
          flex: true,
        },
        {
          btnText: "Knowledge",
          icon: <BookOpen size={16} weight="bold" />,
          href: paths.settings.vectorDatabase(),
          roles: ["admin"],
          flex: true,
        },
        {
          btnText: "Agent",
          icon: <Robot size={16} weight="bold" />,
          href: paths.settings.agentSkills(),
          roles: ["admin"],
          flex: true,
        },
      ],
    },
    {
      title: "AI PROVIDERS",
      items: [
        {
          btnText: "LLM",
          icon: <Cpu size={16} weight="bold" />,
          href: paths.settings.llmPreference(),
          roles: ["admin"],
          flex: true,
        },
        {
          btnText: "Embeddings",
          icon: <Stack size={16} weight="bold" />,
          href: paths.settings.embedder.modelPreference(),
          roles: ["admin"],
          flex: true,
        },
        {
          btnText: "Image Generation",
          icon: <ImageIcon size={16} weight="bold" />,
          href: paths.settings.imageGenerationPreference(),
          roles: ["admin"],
          flex: true,
        },
      ],
    },
    {
      title: "DATA & RETRIEVAL",
      items: [
        {
          btnText: "Vector Database",
          icon: <Database size={16} weight="bold" />,
          href: paths.settings.vectorDatabase(),
          roles: ["admin"],
          flex: true,
        },
        {
          btnText: "Chunking",
          icon: <Scissors size={16} weight="bold" />,
          href: paths.settings.embedder.chunkingPreference(),
          roles: ["admin"],
          flex: true,
        },
      ],
    },
    {
      title: "DEVELOPER",
      items: [
        {
          btnText: "API",
          icon: <Key size={16} weight="bold" />,
          href: paths.settings.apiKeys(),
          roles: ["admin"],
          flex: true,
        },
      ],
    },
    {
      title: "SECURITY",
      items: [
        {
          btnText: "Security",
          icon: <Shield size={16} weight="bold" />,
          href: paths.settings.security(),
          roles: ["admin", "manager"],
          flex: true,
        },
      ],
    },
  ];

  return (
    <div className="flex flex-col gap-y-4 pt-2">
      {GROUPS.map((group) => (
        <CollapsibleCategoryGroup
          key={group.title}
          group={group}
          user={user}
          query={query}
        />
      ))}
    </div>
  );
}

function SupportEmail() {
  const [supportEmail, setSupportEmail] = useState(paths.mailToMintplex());
  const { t } = useTranslation();

  useEffect(() => {
    const fetchSupportEmail = async () => {
      const supportEmail = await System.fetchSupportEmail();
      setSupportEmail(
        supportEmail?.email
          ? `mailto:${supportEmail.email}`
          : paths.mailToMintplex()
      );
    };
    fetchSupportEmail();
  }, []);

  return (
    <Link
      to={supportEmail}
      className="text-[#94A3B8] hover:text-white light:hover:text-[#0F172A] text-xs"
    >
      {t("settings.contact", "Contact Support")}
    </Link>
  );
}

function AppVersion() {
  const { version, isLoading } = useAppVersion();
  if (isLoading) return null;
  return (
    <Link
      to={`https://github.com/Mintplex-Labs/contextiq/releases/tag/v${version}`}
      target="_blank"
      rel="noreferrer"
      className="text-theme-text-secondary light:opacity-80 opacity-50 text-xs mx-3"
    >
      v{version}
    </Link>
  );
}
