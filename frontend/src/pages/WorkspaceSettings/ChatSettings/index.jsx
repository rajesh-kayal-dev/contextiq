import System from "@/models/system";
import Workspace from "@/models/workspace";
import showToast from "@/utils/toast";
import { castToType } from "@/utils/types";
import { useEffect, useRef, useState } from "react";
import ChatHistorySettings from "./ChatHistorySettings";
import ChatPromptSettings from "./ChatPromptSettings";
import ChatModeSelection from "./ChatModeSelection";
import WorkspaceLLMSelection from "./WorkspaceLLMSelection";
import CTAButton from "@/components/lib/CTAButton";

export default function ChatSettings({ workspace }) {
  const [settings, setSettings] = useState({});
  const [hasChanges, setHasChanges] = useState(false);
  const [saving, setSaving] = useState(false);

  const formEl = useRef(null);
  useEffect(() => {
    async function fetchSettings() {
      const _settings = await System.keys();
      setSettings(_settings ?? {});
    }
    fetchSettings();
  }, []);

  const handleUpdate = async (e) => {
    e.preventDefault();
    setSaving(true);
    const data = {};
    const form = new FormData(formEl.current);
    for (var [key, value] of form.entries()) data[key] = castToType(key, value);

    const { workspace: updatedWorkspace, message } = await Workspace.update(
      workspace.slug,
      data
    );
    if (updatedWorkspace) {
      showToast("Workspace updated!", "success", { clear: true });
      setHasChanges(false);
    } else {
      showToast(`Error: ${message}`, "error", { clear: true });
      // Keep hasChanges true on error so user can retry
    }
    setSaving(false);
  };

  if (!workspace) return null;
  return (
    <div
      id="workspace-chat-settings-container"
      className="w-full max-w-[800px]"
    >
      <form
        ref={formEl}
        onSubmit={handleUpdate}
        id="chat-settings-form"
        className="flex flex-col gap-y-6"
      >
        <div className="bg-theme-settings-input-bg border border-white/10 rounded-xl p-6 shadow-sm flex flex-col gap-y-6">
          <div className="flex justify-between items-center border-b border-white/10 pb-4">
            <div>
              <h3 className="text-base font-semibold text-white">
                Model & Mode
              </h3>
              <p className="text-xs text-white/60">
                Configure model selection and execution mode for this workspace.
              </p>
            </div>
            {hasChanges && (
              <CTAButton type="submit">
                {saving ? "Updating..." : "Save Changes"}
              </CTAButton>
            )}
          </div>
          <WorkspaceLLMSelection
            settings={settings}
            workspace={workspace}
            setHasChanges={setHasChanges}
          />
          <ChatModeSelection
            workspace={workspace}
            setHasChanges={setHasChanges}
          />
        </div>

        <div className="bg-theme-settings-input-bg border border-white/10 rounded-xl p-6 shadow-sm flex flex-col gap-y-6">
          <div className="border-b border-white/10 pb-4">
            <h3 className="text-base font-semibold text-white">
              Prompt & Memory
            </h3>
            <p className="text-xs text-white/60">
              Configure conversation history and system instructions.
            </p>
          </div>
          <ChatHistorySettings
            workspace={workspace}
            setHasChanges={setHasChanges}
          />
          <ChatPromptSettings
            workspace={workspace}
            setHasChanges={setHasChanges}
            hasChanges={hasChanges}
          />
        </div>
      </form>
    </div>
  );
}
