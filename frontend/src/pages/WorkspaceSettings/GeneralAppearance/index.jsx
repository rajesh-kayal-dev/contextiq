import Workspace from "@/models/workspace";
import { castToType } from "@/utils/types";
import showToast from "@/utils/toast";
import { useEffect, useRef, useState } from "react";
import WorkspaceName from "./WorkspaceName";
import SuggestedChatMessages from "./SuggestedChatMessages";
import DeleteWorkspace from "./DeleteWorkspace";
import CTAButton from "@/components/lib/CTAButton";

export default function GeneralInfo({ slug, deletionProtected = false }) {
  const [workspace, setWorkspace] = useState(null);
  const [hasChanges, setHasChanges] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const formEl = useRef(null);

  useEffect(() => {
    async function fetchWorkspace() {
      const workspace = await Workspace.bySlug(slug);
      setWorkspace(workspace);
      setLoading(false);
    }
    fetchWorkspace();
  }, [slug]);

  const handleUpdate = async (e) => {
    setSaving(true);
    e.preventDefault();
    const data = {};
    const form = new FormData(formEl.current);
    for (var [key, value] of form.entries()) data[key] = castToType(key, value);
    const { workspace: updatedWorkspace, message } = await Workspace.update(
      workspace.slug,
      data
    );
    if (!!updatedWorkspace) {
      showToast("Workspace updated!", "success", { clear: true });
    } else {
      showToast(`Error: ${message}`, "error", { clear: true });
    }
    setSaving(false);
    setHasChanges(false);
  };

  if (!workspace || loading) return null;
  return (
    <div className="w-full max-w-[800px] flex flex-col gap-y-6">
      <div className="bg-theme-settings-input-bg border border-white/10 rounded-xl p-6 shadow-sm">
        <form
          ref={formEl}
          onSubmit={handleUpdate}
          className="flex flex-col gap-y-4"
        >
          <div className="flex justify-between items-center mb-2">
            <div>
              <h3 className="text-base font-semibold text-white">
                Workspace Information
              </h3>
              <p className="text-xs text-white/60">
                Configure your workspace identity.
              </p>
            </div>
            {hasChanges && (
              <CTAButton type="submit">
                {saving ? "Updating..." : "Save Changes"}
              </CTAButton>
            )}
          </div>
          <WorkspaceName
            key={workspace.slug}
            workspace={workspace}
            setHasChanges={setHasChanges}
          />
        </form>
      </div>

      <div className="bg-theme-settings-input-bg border border-white/10 rounded-xl p-6 shadow-sm">
        <h3 className="text-base font-semibold text-white mb-1">
          Suggested Prompts
        </h3>
        <p className="text-xs text-white/60 mb-4">
          Set prompt suggestions shown when opening a new chat thread.
        </p>
        <SuggestedChatMessages slug={workspace.slug} />
      </div>

      {!deletionProtected && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-6 shadow-sm">
          <DeleteWorkspace workspace={workspace} visible={!deletionProtected} />
        </div>
      )}
    </div>
  );
}
