import Sidebar from "@/components/SettingsSidebar";
import { useTranslation } from "react-i18next";

export default function GeneralBrowserExtension() {
  const { t } = useTranslation();

  return (
    <div className="w-screen h-screen overflow-hidden bg-sidebar flex">
      <Sidebar />
      <div className="flex-1 flex flex-col justify-between h-full overflow-y-scroll text-slate-400 font-normal text-sm p-4 md:p-14">
        <div className="w-full max-w-[700px] flex flex-col gap-y-4">
          <div className="flex flex-col gap-y-1">
            <h1 className="text-white text-3xl font-semibold">
              {t("settings.browser-extension")}
            </h1>
            <p className="text-sm text-white/60">
              Manage browser extension integration and API keys.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
