import React, { useState, useEffect } from "react";
import * as Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import Workspace from "@/models/workspace";
import ManageWorkspace, {
  useManageWorkspaceModal,
} from "../../Modals/ManageWorkspace";
import paths from "@/utils/paths";
import { Link, useParams, useNavigate, useMatch } from "react-router-dom";
import {
  GearSix,
  UploadSimple,
  DotsSixVertical,
  Plus,
} from "@phosphor-icons/react";
import { useNewWorkspaceModal } from "../../Modals/NewWorkspace";
import useUser from "@/hooks/useUser";
import ThreadContainer from "./ThreadContainer";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import showToast from "@/utils/toast";
import { LAST_VISITED_WORKSPACE } from "@/utils/constants";
import { safeJsonParse } from "@/utils/request";

export default function ActiveWorkspaces() {
  const navigate = useNavigate();
  const { slug } = useParams();
  const [loading, setLoading] = useState(true);
  const [workspaces, setWorkspaces] = useState([]);
  const [selectedWs, setSelectedWs] = useState(null);
  const { showing, showModal, hideModal } = useManageWorkspaceModal();
  const { showModal: showNewWsModal } = useNewWorkspaceModal();
  const { user } = useUser();
  const isInWorkspaceSettings = !!useMatch("/workspace/:slug/settings/:tab");
  const isHomePage = !!useMatch("/");

  useEffect(() => {
    async function getWorkspaces() {
      const workspaces = await Workspace.all();
      setLoading(false);
      setWorkspaces(Workspace.orderWorkspaces(workspaces));
    }
    getWorkspaces();
  }, []);

  if (loading) {
    return (
      <Skeleton.default
        height={40}
        width="100%"
        count={5}
        baseColor="var(--theme-sidebar-item-default)"
        highlightColor="var(--theme-sidebar-item-hover)"
        enableAnimation={true}
        className="my-1"
      />
    );
  }

  /**
   * Reorders workspaces in the UI via localstorage on client side.
   * @param {number} startIndex - the index of the workspace to move
   * @param {number} endIndex - the index to move the workspace to
   */
  function reorderWorkspaces(startIndex, endIndex) {
    const reorderedWorkspaces = Array.from(workspaces);
    const [removed] = reorderedWorkspaces.splice(startIndex, 1);
    reorderedWorkspaces.splice(endIndex, 0, removed);
    setWorkspaces(reorderedWorkspaces);
    const success = Workspace.storeWorkspaceOrder(
      reorderedWorkspaces.map((w) => w.id)
    );
    if (!success) {
      showToast("Failed to reorder workspaces", "error");
      Workspace.all().then((workspaces) => setWorkspaces(workspaces));
    }
  }

  const onDragEnd = (result) => {
    if (!result.destination) return;
    reorderWorkspaces(result.source.index, result.destination.index);
  };

  // When on the home page, resolve which workspace should be virtually active
  const virtualActiveSlug = (() => {
    if (!isHomePage || workspaces.length === 0) return null;
    const lastVisited = safeJsonParse(
      localStorage.getItem(LAST_VISITED_WORKSPACE)
    );
    if (
      lastVisited?.slug &&
      workspaces.some((ws) => ws.slug === lastVisited.slug)
    )
      return lastVisited.slug;
    return workspaces[0]?.slug ?? null;
  })();

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <Droppable droppableId="workspaces">
        {(provided) => (
          <div
            role="list"
            aria-label="Workspaces"
            className="flex flex-col"
            ref={provided.innerRef}
            {...provided.droppableProps}
          >
            {/* Section label */}
            <p className="text-[10px] font-semibold uppercase tracking-widest text-[#4B5A72] px-1 mb-2">
              Workspaces
            </p>

            {workspaces.map((workspace, index) => {
              const isVirtuallyActive = workspace.slug === virtualActiveSlug;
              const isActive = workspace.slug === slug || isVirtuallyActive;
              return (
                <Draggable
                  key={workspace.id}
                  draggableId={workspace.id.toString()}
                  index={index}
                >
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      className={`flex flex-col w-full group ${
                        snapshot.isDragging ? "opacity-50" : ""
                      }`}
                      role="listitem"
                    >
                      <div className="flex gap-x-1 items-center justify-between">
                        <Link
                          to={paths.workspace.chat(workspace.slug)}
                          aria-current={isActive ? "page" : ""}
                          className={`
                            transition-all duration-150
                            flex flex-grow w-[75%] gap-x-2 py-[7px] pl-[8px] pr-[6px] rounded-lg text-[#E5E7EB] justify-start items-center
                            ${
                              isActive
                                ? "bg-[#1C263A] border-l-2 border-[#2563EB] pl-[6px] font-medium"
                                : "hover:bg-white/[0.05] light:hover:bg-slate-100"
                            }
                          `}
                        >
                          <div className="flex flex-row justify-between w-full items-center">
                            <div
                              {...provided.dragHandleProps}
                              className="cursor-grab mr-[2px] opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <DotsSixVertical
                                size={16}
                                className="text-[#4B5A72]"
                                weight="bold"
                              />
                            </div>
                            <div
                              data-tooltip-id="workspace-name"
                              data-tooltip-content={workspace.name}
                              className="flex items-center space-x-2 overflow-hidden flex-grow"
                            >
                              <div className="w-[120px] overflow-hidden">
                                <p
                                  className={`
                                  text-[13px] leading-loose whitespace-nowrap overflow-hidden
                                  ${isActive ? "font-medium text-[#E5E7EB]" : "font-normal text-[#94A3B8] group-hover:text-[#E5E7EB]"} truncate
                                  w-full
                                `}
                                >
                                  {workspace.name}
                                </p>
                              </div>
                            </div>
                            {user?.role !== "default" && (
                              <div
                                className={`flex items-center gap-x-[2px] transition-opacity duration-200 ${isActive ? "opacity-100" : "opacity-0 group-hover:opacity-100"}`}
                              >
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.preventDefault();
                                    setSelectedWs(workspace);
                                    showModal();
                                  }}
                                  data-tooltip-id="upload-workspace"
                                  data-tooltip-content="Upload documents to this workspace for RAG indexing"
                                  className="group/upload border-none rounded-md flex items-center justify-center ml-auto p-[3px] hover:bg-[#2563EB]/20 transition-colors"
                                >
                                  <UploadSimple className="h-[16px] w-[16px] text-[#4B5A72] group-hover/upload:text-[#60A5FA]" />
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    navigate(
                                      isInWorkspaceSettings
                                        ? paths.workspace.chat(workspace.slug)
                                        : paths.workspace.settings.generalAppearance(
                                            workspace.slug
                                          )
                                    );
                                  }}
                                  className="group/gear rounded-md flex items-center justify-center ml-auto p-[3px] hover:bg-[#2563EB]/20 transition-colors"
                                  aria-label="General appearance settings"
                                  data-tooltip-id="gear-workspace"
                                  data-tooltip-content="General appearance settings"
                                >
                                  <GearSix
                                    color={
                                      isInWorkspaceSettings &&
                                      workspace.slug === slug
                                        ? "#60A5FA"
                                        : undefined
                                    }
                                    className="h-[16px] w-[16px] text-[#4B5A72] group-hover/gear:text-[#60A5FA]"
                                  />
                                </button>
                              </div>
                            )}
                          </div>
                        </Link>
                      </div>
                      {isActive && (
                        <ThreadContainer
                          workspace={workspace}
                          isActive={isActive}
                          isVirtualThread={isVirtuallyActive}
                        />
                      )}
                    </div>
                  )}
                </Draggable>
              );
            })}
            {workspaces.length === 0 && (
              <div className="flex flex-col items-center justify-center p-4 my-2 text-center rounded-xl bg-white/[0.03] border border-white/[0.08]">
                <p className="text-xs text-[#94A3B8] mb-3">No workspaces yet</p>
                <button
                  type="button"
                  onClick={showNewWsModal}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-medium transition-colors cursor-pointer"
                >
                  <Plus size={14} weight="bold" />
                  <span>Create Workspace</span>
                </button>
              </div>
            )}
            {provided.placeholder}
            {showing && (
              <ManageWorkspace
                hideModal={hideModal}
                providedSlug={selectedWs ? selectedWs.slug : null}
              />
            )}
          </div>
        )}
      </Droppable>
    </DragDropContext>
  );
}
