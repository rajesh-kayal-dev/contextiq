import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import Sidebar from "@/components/SettingsSidebar";
import { isMobile } from "react-device-detect";
import Admin from "@/models/admin";
import System from "@/models/system";
import MCPServers from "@/models/mcpServers";
import showToast from "@/utils/toast";
import {
  CaretLeft,
  CaretRight,
  Robot,
  Brain,
  ChartBar,
} from "@phosphor-icons/react";
import ContextualSaveBar from "@/components/ContextualSaveBar";
import { castToType } from "@/utils/types";
import { FullScreenLoader } from "@/components/Preloader";
import {
  getKnowledgeSkills,
  getDataSkills,
  getDefaultSkills,
  getConfigurableSkills,
  getAppIntegrationSkills,
} from "./skills.jsx";
import { DefaultBadge } from "./Badges/default";
import ImportedSkillConfig from "./Imported/ImportedSkillConfig";
import { Tooltip } from "react-tooltip";
import FlowPanel from "./AgentFlows/FlowPanel";
import ServerPanel from "./MCPServers/ServerPanel";
import AgentFlows from "@/models/agentFlows";
import AgentSkillSettings from "./AgentSkillSettings";

const IGNORE_CHANGE_SETTINGS = [
  "agentSkillRerankerEnabled",
  "agentSkillRerankerTopN",
  "agentSkillMaxToolCalls",
  "agentClarifyingQuestionsEnabled",
  "agentClarifyingQuestionsMaxPerTurn",
];

export default function AdminAgents() {
  const { t } = useTranslation();
  const formEl = useRef(null);
  const [hasChanges, setHasChanges] = useState(false);
  const [settings, setSettings] = useState({});
  const [selectedSkill, setSelectedSkill] = useState("");
  const [loading, setLoading] = useState(true);
  const [showSkillModal, setShowSkillModal] = useState(false);

  const [agentSkills, setAgentSkills] = useState([]);
  const [_importedSkills, setImportedSkills] = useState([]);
  const [disabledAgentSkills, setDisabledAgentSkills] = useState([]);

  const [_agentFlows, setAgentFlows] = useState([]);
  const [selectedFlow, setSelectedFlow] = useState(null);
  const [activeFlowIds, setActiveFlowIds] = useState([]);

  // MCP Servers are lazy loaded to not block the UI thread
  const [_mcpServers, setMcpServers] = useState([]);
  const [selectedMcpServer, setSelectedMcpServer] = useState(null);

  const [fileSystemAgentAvailable, setFileSystemAgentAvailable] =
    useState(false);
  const [createFilesAgentAvailable, setCreateFilesAgentAvailable] =
    useState(false);

  const knowledgeSkills = getKnowledgeSkills(t);
  const dataSkills = getDataSkills(t);
  const defaultSkills = getDefaultSkills(t);
  const allConfigurableSkills = getConfigurableSkills(t, {
    fileSystemAgentAvailable,
    createFilesAgentAvailable,
  });
  const allAppIntegrationSkills = getAppIntegrationSkills(t);

  // Filter skills based on mode restrictions
  // singleUserOnly -> hidden in multi-user mode
  // multiUserOnly -> hidden when NOT in multi-user mode
  const isMultiUserMode = settings?.MultiUserMode ?? false;
  const filterSkillsByMode = ([_, skillConfig]) => {
    if (!skillConfig.mode) return true;
    if (skillConfig.mode.includes("singleUserOnly") && isMultiUserMode)
      return false;
    if (skillConfig.mode.includes("multiUserOnly") && !isMultiUserMode)
      return false;
    return true;
  };
  const configurableSkills = Object.fromEntries(
    Object.entries(allConfigurableSkills).filter(filterSkillsByMode)
  );
  const appIntegrationSkills = Object.fromEntries(
    Object.entries(allAppIntegrationSkills).filter(filterSkillsByMode)
  );

  // Alert user if they try to leave the page with unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (event) => {
      if (hasChanges) {
        event.preventDefault();
        event.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [hasChanges]);

  useEffect(() => {
    async function fetchSettings() {
      const [
        _settings,
        _preferences,
        flowsRes,
        fsAgentAvailable,
        createFilesAvailable,
      ] = await Promise.all([
        System.keys(),
        Admin.systemPreferencesByFields([
          "disabled_agent_skills",
          "default_agent_skills",
          "imported_agent_skills",
          "active_agent_flows",
        ]),
        AgentFlows.listFlows(),
        System.isFileSystemAgentAvailable(),
        System.isCreateFilesAgentAvailable(),
      ]);

      const { flows = [] } = flowsRes;
      setSettings({ ..._settings, preferences: _preferences.settings } ?? {});
      setAgentSkills(_preferences.settings?.default_agent_skills ?? []);
      setDisabledAgentSkills(
        _preferences.settings?.disabled_agent_skills ?? []
      );
      setImportedSkills(_preferences.settings?.imported_agent_skills ?? []);
      setActiveFlowIds(flows.filter((f) => f.active).map((f) => f.uuid));
      setAgentFlows(flows);
      setFileSystemAgentAvailable(fsAgentAvailable);
      setCreateFilesAgentAvailable(createFilesAvailable);
      setLoading(false);
    }
    fetchSettings();
  }, []);

  const toggleDefaultSkill = (skillName) => {
    setDisabledAgentSkills((prev) => {
      const updatedSkills = prev.includes(skillName)
        ? prev.filter((name) => name !== skillName)
        : [...prev, skillName];
      setHasChanges(true);
      return updatedSkills;
    });
  };

  const toggleAgentSkill = (skillName) => {
    setAgentSkills((prev) => {
      const updatedSkills = prev.includes(skillName)
        ? prev.filter((name) => name !== skillName)
        : [...prev, skillName];
      setHasChanges(true);
      return updatedSkills;
    });
  };

  const toggleFlow = (flowId) => {
    setActiveFlowIds((prev) => {
      const updatedFlows = prev.includes(flowId)
        ? prev.filter((id) => id !== flowId)
        : [...prev, flowId];
      return updatedFlows;
    });
  };

  const toggleMCP = (serverName) => {
    setMcpServers((prev) => {
      return prev.map((server) => {
        if (server.name !== serverName) return server;
        return { ...server, running: !server.running };
      });
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = {
      workspace: {},
      system: {},
      env: {},
    };

    const form = new FormData(formEl.current);
    for (var [key, value] of form.entries()) {
      if (key.startsWith("system::")) {
        const [_, label] = key.split("system::");
        data.system[label] = String(value);
        continue;
      }

      if (key.startsWith("env::")) {
        const [_, label] = key.split("env::");
        data.env[label] = String(value);
        continue;
      }
      data.workspace[key] = castToType(key, value);
    }

    const { success } = await Admin.updateSystemPreferences(data.system);
    await System.updateSystem(data.env);

    if (success) {
      const _settings = await System.keys();
      const _preferences = await Admin.systemPreferencesByFields([
        "disabled_agent_skills",
        "default_agent_skills",
        "imported_agent_skills",
      ]);
      setSettings({ ..._settings, preferences: _preferences.settings } ?? {});
      setAgentSkills(_preferences.settings?.default_agent_skills ?? []);
      setDisabledAgentSkills(
        _preferences.settings?.disabled_agent_skills ?? []
      );
      setImportedSkills(_preferences.settings?.imported_agent_skills ?? []);
      showToast(`Agent preferences saved successfully.`, "success", {
        clear: true,
      });
    } else {
      showToast(`Agent preferences failed to save.`, "error", { clear: true });
    }

    setHasChanges(false);
  };

  let SelectedSkillComponent = null;
  if (selectedFlow) {
    SelectedSkillComponent = FlowPanel;
  } else if (selectedMcpServer) {
    SelectedSkillComponent = ServerPanel;
  } else if (selectedSkill?.imported) {
    SelectedSkillComponent = ImportedSkillConfig;
  } else if (knowledgeSkills[selectedSkill]) {
    SelectedSkillComponent = knowledgeSkills[selectedSkill]?.component;
  } else if (dataSkills[selectedSkill]) {
    SelectedSkillComponent = dataSkills[selectedSkill]?.component;
  } else if (configurableSkills[selectedSkill]) {
    SelectedSkillComponent = configurableSkills[selectedSkill]?.component;
  } else if (appIntegrationSkills[selectedSkill]) {
    SelectedSkillComponent = appIntegrationSkills[selectedSkill]?.component;
  } else {
    SelectedSkillComponent = defaultSkills[selectedSkill]?.component;
  }

  // Update the click handlers to clear the other selection
  const handleDefaultSkillClick = (skill) => {
    setSelectedFlow(null);
    setSelectedMcpServer(null);
    setSelectedSkill(skill);
    if (isMobile) setShowSkillModal(true);
  };

  const handleSkillClick = (skill) => {
    setSelectedFlow(null);
    setSelectedMcpServer(null);
    setSelectedSkill(skill);
    if (isMobile) setShowSkillModal(true);
  };

  const _handleFlowClick = (flow) => {
    setSelectedSkill(null);
    setSelectedMcpServer(null);
    setSelectedFlow(flow);
    if (isMobile) setShowSkillModal(true);
  };

  const _handleMCPClick = (server) => {
    setSelectedSkill(null);
    setSelectedFlow(null);
    setSelectedMcpServer(server);
    if (isMobile) setShowSkillModal(true);
  };

  const handleFlowDelete = (flowId) => {
    setSelectedFlow(null);
    setActiveFlowIds((prev) => prev.filter((id) => id !== flowId));
    setAgentFlows((prev) => prev.filter((flow) => flow.uuid !== flowId));
  };

  const handleMCPServerDelete = (serverName) => {
    setSelectedMcpServer(null);
    setMcpServers((prev) =>
      prev.filter((server) => server.name !== serverName)
    );
  };

  const handleMCPToolToggle = async (serverName, toolName, enabled) => {
    const { success, error, suppressedTools } = await MCPServers.toggleTool(
      serverName,
      toolName,
      enabled
    );

    if (!success) {
      showToast(error || "Failed to toggle tool.", "error", { clear: true });
      return;
    }

    setMcpServers((prev) =>
      prev.map((server) => {
        if (server.name !== serverName) return server;
        return {
          ...server,
          config: {
            ...server.config,
            ContextIQ: {
              ...server.config?.ContextIQ,
              suppressedTools,
            },
          },
        };
      })
    );

    setSelectedMcpServer((prev) => {
      if (!prev || prev.name !== serverName) return prev;
      return {
        ...prev,
        config: {
          ...prev.config,
          ContextIQ: {
            ...prev.config?.ContextIQ,
            suppressedTools,
          },
        },
      };
    });
  };

  if (loading) {
    return (
      <div
        style={{ height: isMobile ? "100%" : "calc(100% - 32px)" }}
        className="relative md:ml-[2px] md:mr-[16px] md:my-[16px] md:rounded-[16px] w-full h-full flex justify-center items-center"
      >
        <FullScreenLoader />
      </div>
    );
  }

  if (isMobile) {
    return (
      <SkillLayout
        hasChanges={hasChanges}
        handleCancel={() => setHasChanges(false)}
        handleSubmit={handleSubmit}
      >
        <form
          onSubmit={handleSubmit}
          onChange={() => !selectedFlow && setHasChanges(true)}
          ref={formEl}
          className="flex flex-col w-full p-4 mt-10"
        >
          <input
            name="system::default_agent_skills"
            type="hidden"
            value={agentSkills.join(",")}
          />
          <input
            name="system::disabled_agent_skills"
            type="hidden"
            value={disabledAgentSkills.join(",")}
          />

          {/* Skill settings nav */}
          <div
            hidden={showSkillModal}
            className="flex flex-col gap-y-[18px] overflow-y-scroll no-scroll"
          >
            <div className="text-theme-text-primary flex items-center gap-x-2">
              <Robot size={24} />
              <p className="text-lg font-medium">Agent Skills</p>
            </div>
            {/* Knowledge Skills */}
            <div className="text-theme-text-primary flex items-center gap-x-2">
              <Brain size={24} />
              <p className="text-lg font-medium">KNOWLEDGE</p>
            </div>
            <SkillList
              skills={knowledgeSkills}
              selectedSkill={selectedSkill}
              handleClick={handleDefaultSkillClick}
              activeSkills={[
                ...Object.keys(knowledgeSkills).filter(
                  (skill) =>
                    knowledgeSkills[skill].isDefaultSkill &&
                    !disabledAgentSkills.includes(skill)
                ),
                ...Object.keys(knowledgeSkills).filter(
                  (skill) =>
                    !knowledgeSkills[skill].isDefaultSkill &&
                    agentSkills.includes(skill)
                ),
              ]}
            />

            {/* Data Skills */}
            <div className="text-theme-text-primary flex items-center gap-x-2 mt-4">
              <ChartBar size={24} />
              <p className="text-lg font-medium">DATA</p>
            </div>
            <SkillList
              skills={dataSkills}
              selectedSkill={selectedSkill}
              handleClick={handleDefaultSkillClick}
              activeSkills={Object.keys(dataSkills).filter((skill) =>
                agentSkills.includes(skill)
              )}
            />
          </div>

          {/* Selected agent skill modal */}
          {showSkillModal && (
            <div className="fixed top-0 left-0 w-full h-full bg-sidebar z-30">
              <div className="flex flex-col h-full">
                <div className="flex items-center p-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowSkillModal(false);
                      setSelectedSkill("");
                    }}
                    className="text-white/60 hover:text-white transition-colors duration-200"
                  >
                    <div className="flex items-center text-sky-400">
                      <CaretLeft size={24} />
                      <div>Back</div>
                    </div>
                  </button>
                </div>
                <div className="flex-1 overflow-y-auto p-4">
                  <div className=" bg-theme-bg-secondary text-white rounded-xl p-4 overflow-y-scroll overflow-x-visible no-scroll">
                    {SelectedSkillComponent ? (
                      <>
                        {selectedMcpServer ? (
                          <ServerPanel
                            server={selectedMcpServer}
                            toggleServer={toggleMCP}
                            onDelete={handleMCPServerDelete}
                            onToggleTool={handleMCPToolToggle}
                          />
                        ) : selectedFlow ? (
                          <FlowPanel
                            flow={selectedFlow}
                            toggleFlow={toggleFlow}
                            enabled={activeFlowIds.includes(selectedFlow.uuid)}
                            onDelete={handleFlowDelete}
                          />
                        ) : selectedSkill.imported ? (
                          <ImportedSkillConfig
                            key={selectedSkill.hubId}
                            selectedSkill={selectedSkill}
                            setImportedSkills={setImportedSkills}
                          />
                        ) : (
                          <>
                            {knowledgeSkills?.[selectedSkill] ? (
                              <SelectedSkillComponent
                                skill={knowledgeSkills[selectedSkill]?.skill}
                                settings={settings}
                                toggleSkill={
                                  knowledgeSkills[selectedSkill]?.isDefaultSkill
                                    ? toggleDefaultSkill
                                    : toggleAgentSkill
                                }
                                enabled={
                                  knowledgeSkills[selectedSkill]?.isDefaultSkill
                                    ? !disabledAgentSkills.includes(
                                        knowledgeSkills[selectedSkill]?.skill
                                      )
                                    : agentSkills.includes(
                                        knowledgeSkills[selectedSkill]?.skill
                                      )
                                }
                                setHasChanges={setHasChanges}
                                hasChanges={hasChanges}
                                {...knowledgeSkills[selectedSkill]}
                              />
                            ) : dataSkills?.[selectedSkill] ? (
                              <SelectedSkillComponent
                                skill={dataSkills[selectedSkill]?.skill}
                                settings={settings}
                                toggleSkill={toggleAgentSkill}
                                enabled={agentSkills.includes(
                                  dataSkills[selectedSkill]?.skill
                                )}
                                setHasChanges={setHasChanges}
                                hasChanges={hasChanges}
                                {...dataSkills[selectedSkill]}
                              />
                            ) : (
                              <SelectedSkillComponent
                                skill={selectedSkill}
                                settings={settings}
                                toggleSkill={toggleAgentSkill}
                                enabled={agentSkills.includes(selectedSkill)}
                                setHasChanges={setHasChanges}
                                hasChanges={hasChanges}
                              />
                            )}
                          </>
                        )}
                      </>
                    ) : (
                      <div className="flex flex-col items-center justify-center h-full text-theme-text-secondary">
                        <Robot size={40} />
                        <p className="font-medium">Select an Agent Skill</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </form>
      </SkillLayout>
    );
  }

  return (
    <SkillLayout
      hasChanges={hasChanges}
      handleCancel={() => setHasChanges(false)}
      handleSubmit={handleSubmit}
    >
      <form
        onSubmit={handleSubmit}
        onChange={(e) => {
          if (IGNORE_CHANGE_SETTINGS.includes(e.target.name)) return;
          if (!selectedSkill?.imported && !selectedFlow) setHasChanges(true);
        }}
        ref={formEl}
        className="flex-1 flex gap-x-6 p-4 mt-10"
      >
        <input
          name="system::default_agent_skills"
          type="hidden"
          value={agentSkills.join(",")}
        />
        <input
          name="system::disabled_agent_skills"
          type="hidden"
          value={disabledAgentSkills.join(",")}
        />
        <input
          type="hidden"
          name="system::active_agent_flows"
          id="active_agent_flows"
          value={activeFlowIds.join(",")}
        />

        {/* Skill settings nav - Make this section scrollable */}
        <div className="flex flex-col min-w-[360px] h-[calc(100vh-90px)]">
          <div className="flex-none flex justify-between items-center mb-4">
            <div className="text-theme-text-primary flex items-center gap-x-2">
              <Robot size={24} />
              <p className="text-lg font-medium">Agent Skills</p>
            </div>
            <AgentSkillSettings />
          </div>

          <div className="flex-1 overflow-y-auto pr-2 pb-4">
            <div className="space-y-4">
              {/* Knowledge Skills */}
              <div className="text-theme-text-primary flex items-center gap-x-2">
                <Brain size={24} />
                <p className="text-lg font-medium">KNOWLEDGE</p>
              </div>
              <SkillList
                skills={knowledgeSkills}
                selectedSkill={selectedSkill}
                handleClick={handleSkillClick}
                activeSkills={[
                  ...Object.keys(knowledgeSkills).filter(
                    (skill) =>
                      knowledgeSkills[skill].isDefaultSkill &&
                      !disabledAgentSkills.includes(skill)
                  ),
                  ...Object.keys(knowledgeSkills).filter(
                    (skill) =>
                      !knowledgeSkills[skill].isDefaultSkill &&
                      agentSkills.includes(skill)
                  ),
                ]}
              />

              {/* Data Skills */}
              <div className="text-theme-text-primary flex items-center gap-x-2 mt-6">
                <ChartBar size={24} />
                <p className="text-lg font-medium">DATA</p>
              </div>
              <SkillList
                skills={dataSkills}
                selectedSkill={selectedSkill}
                handleClick={handleSkillClick}
                activeSkills={Object.keys(dataSkills).filter((skill) =>
                  agentSkills.includes(skill)
                )}
              />
            </div>
          </div>
        </div>

        {/* Selected agent skill setting panel */}
        <div className="flex-[2] flex flex-col gap-y-[18px] mt-10">
          <div className="bg-theme-bg-secondary text-white rounded-xl flex-1 p-4 overflow-y-scroll overflow-x-visible no-scroll">
            {SelectedSkillComponent ? (
              <>
                {selectedMcpServer ? (
                  <ServerPanel
                    server={selectedMcpServer}
                    toggleServer={toggleMCP}
                    onDelete={handleMCPServerDelete}
                    onToggleTool={handleMCPToolToggle}
                  />
                ) : selectedFlow ? (
                  <FlowPanel
                    flow={selectedFlow}
                    toggleFlow={toggleFlow}
                    enabled={activeFlowIds.includes(selectedFlow.uuid)}
                    onDelete={handleFlowDelete}
                  />
                ) : selectedSkill.imported ? (
                  <ImportedSkillConfig
                    key={selectedSkill.hubId}
                    selectedSkill={selectedSkill}
                    setImportedSkills={setImportedSkills}
                  />
                ) : (
                  <>
                    {knowledgeSkills?.[selectedSkill] ? (
                      <SelectedSkillComponent
                        skill={knowledgeSkills[selectedSkill]?.skill}
                        settings={settings}
                        toggleSkill={
                          knowledgeSkills[selectedSkill]?.isDefaultSkill
                            ? toggleDefaultSkill
                            : toggleAgentSkill
                        }
                        enabled={
                          knowledgeSkills[selectedSkill]?.isDefaultSkill
                            ? !disabledAgentSkills.includes(
                                knowledgeSkills[selectedSkill]?.skill
                              )
                            : agentSkills.includes(
                                knowledgeSkills[selectedSkill]?.skill
                              )
                        }
                        setHasChanges={setHasChanges}
                        hasChanges={hasChanges}
                        {...knowledgeSkills[selectedSkill]}
                      />
                    ) : dataSkills?.[selectedSkill] ? (
                      <SelectedSkillComponent
                        skill={dataSkills[selectedSkill]?.skill}
                        settings={settings}
                        toggleSkill={toggleAgentSkill}
                        enabled={agentSkills.includes(
                          dataSkills[selectedSkill]?.skill
                        )}
                        setHasChanges={setHasChanges}
                        hasChanges={hasChanges}
                        {...dataSkills[selectedSkill]}
                      />
                    ) : (
                      <SelectedSkillComponent
                        skill={selectedSkill}
                        settings={settings}
                        toggleSkill={toggleAgentSkill}
                        enabled={agentSkills.includes(selectedSkill)}
                        setHasChanges={setHasChanges}
                        hasChanges={hasChanges}
                      />
                    )}
                  </>
                )}
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-theme-text-secondary">
                <Robot size={40} />
                <p className="font-medium">Select an Agent Skill</p>
              </div>
            )}
          </div>
        </div>
      </form>
    </SkillLayout>
  );
}

function SkillLayout({ children, hasChanges, handleSubmit, handleCancel }) {
  return (
    <div
      id="workspace-agent-settings-container"
      className="w-screen h-screen overflow-hidden bg-theme-bg-container flex md:mt-0 mt-6"
    >
      <Sidebar />
      <div
        style={{ height: isMobile ? "100%" : "calc(100% - 32px)" }}
        className="relative md:ml-[2px] md:mr-[16px] md:my-[16px] md:rounded-[16px] w-full h-full flex"
      >
        {children}
        <ContextualSaveBar
          showing={hasChanges}
          onSave={handleSubmit}
          onCancel={handleCancel}
        />
      </div>
    </div>
  );
}

function SkillList({
  isDefault = false,
  skills = [],
  selectedSkill = null,
  handleClick = null,
  activeSkills = [],
  Icon = null,
}) {
  if (skills.length === 0) return null;

  return (
    <>
      <div
        className={`bg-theme-bg-secondary text-white rounded-xl ${
          isMobile ? "w-full" : "min-w-[360px] w-fit"
        }`}
      >
        {Object.entries(skills).map(([skill, settings], index) => (
          <div
            key={skill}
            className={`py-3 px-4 flex items-center justify-between ${
              index === 0 ? "rounded-t-xl" : ""
            } ${
              index === Object.keys(skills).length - 1
                ? "rounded-b-xl"
                : "border-b border-white/10"
            } cursor-pointer transition-all duration-300  hover:bg-theme-bg-primary ${
              selectedSkill === skill
                ? "bg-white/10 light:bg-theme-bg-sidebar"
                : ""
            }`}
            onClick={() => handleClick?.(skill)}
          >
            <div className="flex items-center gap-x-2">
              {settings.Icon ? (
                <settings.Icon size={16} />
              ) : (
                Icon && <Icon size={16} />
              )}
              <div className="text-sm font-light">{settings.title}</div>
            </div>
            <div className="flex items-center gap-x-2">
              {isDefault ? (
                <DefaultBadge title={skill} />
              ) : (
                <div className="text-sm text-theme-text-secondary font-medium">
                  {activeSkills.includes(skill) ? "On" : "Off"}
                </div>
              )}
              <CaretRight
                size={14}
                weight="bold"
                className="text-theme-text-secondary"
              />
            </div>
          </div>
        ))}
      </div>
      {/* Tooltip for default skills - only render when skill list is passed isDefault */}
      {isDefault && (
        <Tooltip
          id="default-skill"
          place="bottom"
          delayShow={300}
          className="tooltip light:invert-0 !text-xs"
        />
      )}
    </>
  );
}
