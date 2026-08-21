import System from "@/models/system";
import Workspace from "@/models/workspace";
import showToast from "@/utils/toast";
import { castToType } from "@/utils/types";
import { useEffect, useRef, useState } from "react";
import Admin from "@/models/admin";
import * as Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import paths from "@/utils/paths";
import useUser from "@/hooks/useUser";
import CTAButton from "@/components/lib/CTAButton";

export default function WorkspaceAgentConfiguration({ workspace }) {
  const { user } = useUser();
  const [settings, setSettings] = useState({});
  const [hasChanges, setHasChanges] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const formEl = useRef(null);

  useEffect(() => {
    async function fetchSettings() {
      const _settings = await System.keys();
      setSettings(_settings ?? {});
      setLoading(false);
    }
    fetchSettings();
  }, []);

  const handleUpdate = async (e) => {
    setSaving(true);
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

    const { workspace: updatedWorkspace, message } = await Workspace.update(
      workspace.slug,
      data.workspace
    );
    await Admin.updateSystemPreferences(data.system);
    await System.updateSystem(data.env);

    if (!!updatedWorkspace) {
      showToast("Workspace updated!", "success", { clear: true });
    } else {
      showToast(`Error: ${message}`, "error", { clear: true });
    }

    setSaving(false);
    setHasChanges(false);
  };

  if (!workspace || loading) return <LoadingSkeleton />;
  return (
    <div
      id="workspace-agent-settings-container"
      className="w-full max-w-[800px]"
    >
      <form
        ref={formEl}
        onSubmit={handleUpdate}
        onChange={() => setHasChanges(true)}
        id="agent-settings-form"
        className="flex flex-col gap-y-6"
      >
        <div className="bg-theme-settings-input-bg border border-white/10 rounded-xl p-6 shadow-sm flex flex-col gap-y-6">
          <div className="flex justify-between items-center border-b border-white/10 pb-4">
            <div>
              <h3 className="text-base font-semibold text-white">
                Agent Capabilities
              </h3>
              <p className="text-xs text-white/60">
                Configure autonomous agent execution and instructions for this
                workspace.
              </p>
            </div>
            {hasChanges && (
              <CTAButton type="submit">
                {saving ? "Updating..." : "Save Changes"}
              </CTAButton>
            )}
          </div>

          <div className="flex flex-col gap-y-2">
            <label className="block input-label">Enable Agent</label>
            <p className="text-white text-opacity-60 text-xs font-medium">
              Choose whether responses in this workspace use agent tool calling
              and skills.
            </p>
            <select
              name="chatMode"
              defaultValue={
                workspace?.chatMode === "automatic" ? "automatic" : "chat"
              }
              className="border-none bg-theme-settings-input-bg text-white text-sm rounded-lg focus:outline-primary-button active:outline-primary-button outline-none block w-full p-2.5"
              onChange={() => setHasChanges(true)}
            >
              <option value="chat">Disabled (Standard Chat)</option>
              <option value="automatic">Enabled (Agent Mode)</option>
            </select>
          </div>

          <div className="flex flex-col gap-y-2 border-t border-white/10 pt-4">
            <label className="block input-label">Available Skills</label>
            <p className="text-white text-opacity-60 text-xs font-medium mb-2">
              Customize and enhance agent capabilities by configuring global
              agent skills.
            </p>
            <a
              className="w-fit transition-all duration-300 border border-slate-200/20 px-5 py-2 rounded-lg text-white text-sm hover:bg-slate-200 hover:text-slate-800"
              href={paths.settings.agentSkills()}
            >
              Configure Available Skills
            </a>
          </div>

          <div className="flex flex-col gap-y-2 border-t border-white/10 pt-4">
            <label className="block input-label">Agent Instructions</label>
            <p className="text-white text-opacity-60 text-xs font-medium">
              Custom instructions that guide how the agent reasons and uses
              tools in this workspace.
            </p>
            <textarea
              name="openAiPrompt"
              rows={4}
              defaultValue={workspace?.openAiPrompt || ""}
              onChange={() => setHasChanges(true)}
              className="border-none bg-theme-settings-input-bg text-white placeholder:text-theme-settings-input-placeholder text-sm rounded-lg focus:outline-primary-button active:outline-primary-button outline-none block w-full p-2.5"
              placeholder="Provide system instructions for the agent..."
            />
          </div>
        </div>
      </form>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div
      id="workspace-agent-settings-container"
      className="w-full max-w-[800px]"
    >
      <div className="flex flex-col gap-y-6">
        <Skeleton.default
          height={100}
          width="100%"
          count={2}
          highlightColor="var(--theme-bg-primary)"
          baseColor="var(--theme-bg-secondary)"
          enableAnimation={true}
          containerClassName="flex flex-col gap-y-1"
        />
        <div className="bg-white/10 h-[1px] w-full" />
        <Skeleton.default
          height={100}
          width="100%"
          count={2}
          highlightColor="var(--theme-bg-primary)"
          baseColor="var(--theme-bg-secondary)"
          enableAnimation={true}
          containerClassName="flex flex-col gap-y-1 mt-4"
        />
      </div>
    </div>
  );
}
