import { useTranslation } from "react-i18next";
import useUser from "@/hooks/useUser";
import { Plus, GearSix, UploadSimple } from "@phosphor-icons/react";

/**
 * Quick action buttons for home and empty workspace states.
 * @param {Object} props
 * @param {boolean} props.hasAvailableWorkspace - Whether the user has a workspace they can use
 * @param {Function} props.onCreateAgent - Handler for "Create an Agent" action
 * @param {Function} props.onEditWorkspace - Handler for "Edit Workspace" action
 * @param {Function} props.onUploadDocument - Handler for "Upload a Document" action
 */
export default function QuickActions({
  hasAvailableWorkspace,
  onCreateAgent,
  onEditWorkspace,
  onUploadDocument,
}) {
  const { t } = useTranslation();
  const { user } = useUser();

  return (
    <div className="flex flex-wrap justify-center items-center gap-3 mt-4">
      <QuickActionButton
        icon={Plus}
        label={t("main-page.quickActions.createAgent")}
        onClick={onCreateAgent}
        show={!user || ["admin"].includes(user?.role)}
      />
      <QuickActionButton
        icon={GearSix}
        label={t("main-page.quickActions.editWorkspace")}
        onClick={onEditWorkspace}
        show={
          hasAvailableWorkspace &&
          (!user || ["admin", "manager"].includes(user?.role))
        }
      />
      <QuickActionButton
        icon={UploadSimple}
        label={t("main-page.quickActions.uploadDocument")}
        onClick={onUploadDocument}
        show={true}
      />
    </div>
  );
}

function QuickActionButton({ icon: Icon, label, onClick, show = true }) {
  if (!show) return null;
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex items-center gap-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-[#94A3B8] light:text-[#475569] hover:text-[#F8FAFC] light:hover:text-[#0F172A] bg-[#172033]/50 light:bg-slate-100 border border-white/[0.08] light:border-slate-300 hover:border-[#2563EB]/40 light:hover:border-[#2563EB] hover:bg-[#172033] light:hover:bg-slate-200 transition-all duration-200"
    >
      {Icon && <Icon className="w-3.5 h-3.5 text-[#2563EB]" weight="bold" />}
      <span>{label}</span>
    </button>
  );
}
