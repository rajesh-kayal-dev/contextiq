import React, { useEffect, useRef, useState } from "react";
import { List, SidebarSimple } from "@phosphor-icons/react";
import NewWorkspaceModal, {
  useNewWorkspaceModal,
} from "../Modals/NewWorkspace";
import ActiveWorkspaces from "./ActiveWorkspaces";
import useLogo from "@/hooks/useLogo";
import useUser from "@/hooks/useUser";
import Footer from "../Footer";
import { Link } from "react-router-dom";
import paths from "@/utils/paths";
import { useSidebarToggle } from "./SidebarToggle";
import SearchBox from "./SearchBox";
import { Tooltip } from "react-tooltip";
import { createPortal } from "react-dom";
import { useThemeContext } from "@/ThemeContext";

export default function Sidebar() {
  const { user } = useUser();
  const { logo, isCustomLogo } = useLogo();
  const { isLight } = useThemeContext();
  const sidebarRef = useRef(null);
  const { showSidebar, setShowSidebar } = useSidebarToggle();
  const {
    showing: showingNewWsModal,
    showModal: showNewWsModal,
    hideModal: hideNewWsModal,
  } = useNewWorkspaceModal();

  return (
    <>
      {/* Desktop Floating Favicon Mark when Collapsed */}
      {!showSidebar && (
        <div
          className="hidden md:flex absolute top-4 left-5 z-30 items-center justify-center cursor-pointer group"
          onClick={() => setShowSidebar(true)}
          data-tooltip-id="sidebar-toggle-tooltip"
          data-tooltip-content="Open sidebar"
          aria-label="Open sidebar"
        >
          <img
            src="/branding/favicon/favicon.png"
            alt="ContextIQ"
            className="w-7 h-7 object-contain group-hover:opacity-20 transition-opacity duration-200"
          />
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <div className="w-7 h-7 rounded-lg bg-[#2563EB] text-white flex items-center justify-center shadow-md">
              <SidebarSimple size={16} weight="bold" />
            </div>
          </div>
        </div>
      )}

      {/* Desktop Sidebar (Expanded: 260px, Collapsed: 0px completely hidden) */}
      <div
        style={{
          width: showSidebar ? "260px" : "0px",
        }}
        className="hidden md:flex relative flex-shrink-0 transition-all duration-200 ease-in-out h-full overflow-hidden z-20"
      >
        <div
          className={`flex flex-col h-full w-[260px] bg-[#0B1120] light:bg-[#F8FAFC] border-r border-white/[0.07] light:border-[#CBD5E1] transition-opacity duration-200 ${
            showSidebar ? "opacity-100" : "opacity-0 pointer-events-none"
          }`}
        >
          {/* Logo Header + Close Button */}
          <div className="flex items-center justify-between h-14 px-3 flex-shrink-0 border-b border-white/[0.05] light:border-[#CBD5E1]">
            <Link
              to={paths.home()}
              aria-label="Home"
              className="flex items-center gap-1.5"
            >
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
                className="h-[24px] w-auto object-contain max-w-[150px]"
              />
            </Link>
            <button
              type="button"
              onClick={() => setShowSidebar(false)}
              className="p-1.5 rounded-lg text-[#94A3B8] light:text-[#475569] hover:text-[#F8FAFC] light:hover:text-[#0F172A] hover:bg-white/10 light:hover:bg-slate-200 transition-colors"
              data-tooltip-id="sidebar-toggle-tooltip"
              data-tooltip-content="Close sidebar"
              aria-label="Close sidebar"
            >
              <SidebarSimple size={18} weight="bold" />
            </button>
          </div>

          {/* Scrollable Content */}
          <div
            ref={sidebarRef}
            className="flex-1 flex flex-col min-h-0 overflow-hidden"
          >
            <div className="flex-1 flex flex-col overflow-y-auto no-scroll px-3 pt-3 pb-2 gap-y-3">
              <SearchBox user={user} showNewWsModal={showNewWsModal} />
              <ActiveWorkspaces />
            </div>

            {/* Footer */}
            <div className="flex-shrink-0 border-t border-white/[0.05] light:border-[#CBD5E1] px-3 pt-2 pb-3">
              <Footer />
            </div>
          </div>
        </div>
        {showingNewWsModal && <NewWorkspaceModal hideModal={hideNewWsModal} />}
      </div>
      <WorkspaceAndThreadTooltips />
    </>
  );
}

export function SidebarMobileHeader() {
  const { logo, isCustomLogo } = useLogo();
  const { isLight } = useThemeContext();
  const sidebarRef = useRef(null);
  const [showSidebar, setShowSidebar] = useState(false);
  const [showBgOverlay, setShowBgOverlay] = useState(false);
  const {
    showing: showingNewWsModal,
    showModal: showNewWsModal,
    hideModal: hideNewWsModal,
  } = useNewWorkspaceModal();
  const { user } = useUser();

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

  return (
    <>
      {/* Mobile top bar */}
      <div
        aria-label="Show sidebar"
        className="md:hidden relative top-0 left-0 right-0 z-20 flex justify-between items-center px-4 py-2 bg-[#0B1120] light:bg-[#F8FAFC] border-b border-white/[0.07] light:border-[#CBD5E1] text-[#F8FAFC] light:text-[#0F172A] shadow-md h-14 shrink-0"
      >
        <button
          type="button"
          onClick={() => setShowSidebar(true)}
          className="rounded-lg p-2 flex items-center justify-center text-[#94A3B8] light:text-[#475569] hover:text-[#F8FAFC] light:hover:text-[#0F172A] hover:bg-white/5 light:hover:bg-slate-200 transition-colors"
          aria-label="Open Navigation Menu"
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
            className="h-[24px] w-auto object-contain max-w-[150px]"
          />
        </div>
        <div className="w-8" />
      </div>

      {/* Mobile sliding drawer overlay */}
      <div
        style={{
          transform: showSidebar ? `translateX(0vw)` : `translateX(-100vw)`,
        }}
        className="md:hidden z-50 fixed top-0 left-0 transition-all duration-300 w-[100vw] h-[100vh]"
      >
        <div
          className={`${
            showBgOverlay
              ? "transition-all opacity-100"
              : "transition-none opacity-0"
          } duration-300 fixed top-0 left-0 bg-black/60 backdrop-blur-sm w-screen h-screen`}
          onClick={() => setShowSidebar(false)}
        />
        <div
          ref={sidebarRef}
          className="relative h-[100vh] fixed top-0 left-0 flex flex-col bg-[#0B1120] light:bg-[#F8FAFC] border-r border-white/[0.07] light:border-[#CBD5E1] w-[85%] max-w-[320px] shadow-2xl z-50"
        >
          {/* Mobile drawer header with back/close button */}
          <div className="flex items-center justify-between h-14 px-4 border-b border-white/[0.05] light:border-[#CBD5E1] flex-shrink-0">
            <div className="flex items-center gap-x-1.5">
              <Link to={paths.home()} aria-label="Home" className="flex items-center gap-1.5">
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
                  className="h-[24px] w-auto object-contain max-w-[150px]"
                />
              </Link>
            </div>
            <button
              type="button"
              onClick={() => setShowSidebar(false)}
              className="p-1.5 rounded-lg text-[#94A3B8] light:text-[#475569] hover:text-[#F8FAFC] light:hover:text-[#0F172A] hover:bg-white/10 light:hover:bg-slate-200 transition-colors"
              aria-label="Close menu"
            >
              <SidebarSimple size={20} weight="bold" />
            </button>
          </div>

          {/* Mobile drawer content */}
          <div className="flex-1 flex flex-col overflow-hidden">
            <div
              className="flex-1 flex flex-col overflow-y-auto no-scroll px-3 pt-3 pb-2 gap-y-3"
              onClick={(e) => {
                // Close drawer when clicking a link or button inside
                if (e.target.closest("a") || e.target.closest("button")) {
                  setShowSidebar(false);
                }
              }}
            >
              <SearchBox user={user} showNewWsModal={showNewWsModal} />
              <ActiveWorkspaces />
            </div>
            <div className="flex-shrink-0 border-t border-white/[0.05] light:border-[#CBD5E1] px-3 pt-2 pb-6">
              <Footer />
            </div>
          </div>
        </div>
        {showingNewWsModal && <NewWorkspaceModal hideModal={hideNewWsModal} />}
      </div>
    </>
  );
}

function WorkspaceAndThreadTooltips() {
  return createPortal(
    <React.Fragment>
      <Tooltip
        id="workspace-name"
        place="right"
        delayShow={300}
        className="tooltip !text-xs !z-[9999]"
      />
      <Tooltip
        id="sidebar-toggle-tooltip"
        place="right"
        delayShow={200}
        className="tooltip !text-xs !z-[9999]"
      />
      <Tooltip
        id="workspace-thread-name"
        place="right"
        delayShow={300}
        className="tooltip !text-xs !z-[9999]"
      />
      <Tooltip
        id="upload-workspace"
        place="top"
        delayShow={300}
        className="tooltip !text-xs !z-[9999]"
      />
      <Tooltip
        id="gear-workspace"
        place="top"
        delayShow={300}
        className="tooltip !text-xs !z-[9999]"
      />
    </React.Fragment>,
    document.body
  );
}
