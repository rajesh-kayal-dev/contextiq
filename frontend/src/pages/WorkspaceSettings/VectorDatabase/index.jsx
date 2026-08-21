import Workspace from "@/models/workspace";
import showToast from "@/utils/toast";
import { castToType } from "@/utils/types";
import { useRef, useState } from "react";
import MaxContextSnippets from "./MaxContextSnippets";
import DocumentSimilarityThreshold from "./DocumentSimilarityThreshold";
import ResetDatabase from "./ResetDatabase";
import VectorSearchMode from "./VectorSearchMode";
import CTAButton from "@/components/lib/CTAButton";

export default function VectorDatabase({ workspace }) {
  const [hasChanges, setHasChanges] = useState(false);
  const [saving, setSaving] = useState(false);
  const formEl = useRef(null);

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

  if (!workspace) return null;
  return (
    <div className="w-full max-w-[800px]">
      <form
        ref={formEl}
        onSubmit={handleUpdate}
        className="flex flex-col gap-y-6"
      >
        <div className="bg-theme-settings-input-bg border border-white/10 rounded-xl p-6 shadow-sm flex flex-col gap-y-6">
          <div className="flex justify-between items-center border-b border-white/10 pb-4">
            <div>
              <h3 className="text-base font-semibold text-white">
                Retrieval & Context
              </h3>
              <p className="text-xs text-white/60">
                Configure search precision and context retrieval for documents.
              </p>
            </div>
            {hasChanges && (
              <CTAButton type="submit">
                {saving ? "Updating..." : "Save Changes"}
              </CTAButton>
            )}
          </div>
          <VectorSearchMode
            workspace={workspace}
            setHasChanges={setHasChanges}
          />
          <MaxContextSnippets
            workspace={workspace}
            setHasChanges={setHasChanges}
          />
          <DocumentSimilarityThreshold
            workspace={workspace}
            setHasChanges={setHasChanges}
          />
        </div>

        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-6 shadow-sm flex flex-col gap-y-3">
          <div>
            <h3 className="text-base font-semibold text-red-400 mb-1">
              Reset Knowledge Base
            </h3>
            <p className="text-xs text-white/60">
              Clear indexed vector data for this workspace.
            </p>
          </div>
          <ResetDatabase workspace={workspace} />
        </div>
      </form>
    </div>
  );
}
