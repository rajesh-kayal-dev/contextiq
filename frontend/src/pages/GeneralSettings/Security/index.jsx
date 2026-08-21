import { useEffect, useState } from "react";
import Sidebar from "@/components/SettingsSidebar";
import showToast from "@/utils/toast";
import System from "@/models/system";
import paths from "@/utils/paths";
import { AUTH_TIMESTAMP, AUTH_TOKEN, AUTH_USER } from "@/utils/constants";
import PreLoader from "@/components/Preloader";
import CTAButton from "@/components/lib/CTAButton";
import { useTranslation } from "react-i18next";
import Toggle from "@/components/lib/Toggle";
import {
  USERNAME_MIN_LENGTH,
  USERNAME_MAX_LENGTH,
  USERNAME_PATTERN,
} from "@/utils/username";

import SettingsHeader from "@/components/SettingsHeader";

export default function GeneralSecurity() {
  const { t } = useTranslation();
  return (
    <div className="w-screen h-screen overflow-hidden bg-[#0B1220] light:bg-[#F8FAFC] flex">
      <Sidebar />
      <div className="flex-1 h-full flex flex-col overflow-y-auto">
        <SettingsHeader
          title="Security Settings"
          subtitle="Configure authentication mode, multi-user permissions, and password protection."
        />
        <div className="flex-1 overflow-y-auto px-4 md:px-8 py-6 flex justify-center">
          <div className="w-full max-w-[1200px] flex flex-col gap-y-6">
            <MultiUserMode />
            <PasswordProtection />
          </div>
        </div>
      </div>
    </div>
  );
}

function MultiUserMode() {
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [useMultiUserMode, setUseMultiUserMode] = useState(false);
  const [multiUserModeEnabled, setMultiUserModeEnabled] = useState(false);
  const [loading, setLoading] = useState(true);
  const { t } = useTranslation();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setHasChanges(false);
    if (useMultiUserMode) {
      const form = new FormData(e.target);
      const data = {
        username: form.get("username"),
        password: form.get("password"),
      };

      const { success, error } = await System.setupMultiUser(data);
      if (success) {
        showToast("Multi-User mode enabled successfully.", "success");
        setSaving(false);
        setTimeout(() => {
          window.localStorage.removeItem(AUTH_USER);
          window.localStorage.removeItem(AUTH_TOKEN);
          window.localStorage.removeItem(AUTH_TIMESTAMP);
          window.location = paths.settings.users();
        }, 2_000);
        return;
      }

      showToast(`Failed to enable Multi-User mode: ${error}`, "error");
      setSaving(false);
      return;
    }
  };

  useEffect(() => {
    async function fetchIsMultiUserMode() {
      setLoading(true);
      const multiUserModeEnabled = await System.isMultiUserMode();
      setMultiUserModeEnabled(multiUserModeEnabled);
      setLoading(false);
    }
    fetchIsMultiUserMode();
  }, []);

  if (loading) {
    return (
      <div className="h-1/2 transition-all duration-500 relative md:ml-[2px] md:mr-[8px] md:my-[16px] md:rounded-[26px] p-[18px] h-full overflow-y-scroll">
        <div className="w-full h-full flex justify-center items-center">
          <PreLoader />
        </div>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      onChange={() => setHasChanges(true)}
      className="w-full bg-[#111827] light:bg-white border border-white/10 light:border-slate-200 rounded-xl p-6 shadow-sm flex flex-col gap-y-4"
    >
      <div className="flex justify-between items-center border-b border-white/10 light:border-slate-200 pb-4">
        <div>
          <h3 className="text-base font-semibold text-white light:text-slate-900">
            {t("security.multiuser.title")}
          </h3>
          <p className="text-xs text-[#94A3B8] light:text-slate-500">
            {t("security.multiuser.description")}
          </p>
        </div>
        {hasChanges && (
          <CTAButton onClick={handleSubmit}>
            {saving ? t("common.saving") : t("common.save")}
          </CTAButton>
        )}
      </div>

      <div className="flex flex-col gap-y-4 pt-2">
        {multiUserModeEnabled ? (
          <p className="text-white light:text-slate-900 text-sm font-semibold">
            {t("security.multiuser.enable.is-enable")}
          </p>
        ) : (
          <Toggle
            size="lg"
            label={t("security.multiuser.enable.enable")}
            enabled={useMultiUserMode}
            onChange={(checked) => setUseMultiUserMode(checked)}
          />
        )}
        {useMultiUserMode && (
          <div className="flex flex-col gap-y-4 max-w-md pt-2">
            <div>
              <label
                htmlFor="username"
                className="text-white light:text-slate-900 text-sm font-medium block mb-1.5"
              >
                {t("security.multiuser.enable.username")}
              </label>
              <input
                name="username"
                type="text"
                className="bg-[#0B1220] light:bg-slate-50 border border-white/10 light:border-slate-200 text-white light:text-slate-900 text-sm rounded-lg focus:ring-2 focus:ring-[#14B8A6]/50 focus:border-[#14B8A6] outline-none block w-full p-2.5 placeholder:text-[#94A3B8]"
                placeholder="Your admin username"
                minLength={USERNAME_MIN_LENGTH}
                maxLength={USERNAME_MAX_LENGTH}
                pattern={USERNAME_PATTERN}
                required={true}
                autoComplete="off"
                disabled={multiUserModeEnabled}
                defaultValue={multiUserModeEnabled ? "********" : ""}
              />
              <p className="text-[#94A3B8] text-xs mt-1">
                {t("common.username_requirements")}
              </p>
            </div>
            <div>
              <label
                htmlFor="password"
                className="text-white light:text-slate-900 text-sm font-medium block mb-1.5"
              >
                {t("security.multiuser.enable.password")}
              </label>
              <input
                name="password"
                type="text"
                className="bg-[#0B1220] light:bg-slate-50 border border-white/10 light:border-slate-200 text-white light:text-slate-900 text-sm rounded-lg focus:ring-2 focus:ring-[#14B8A6]/50 focus:border-[#14B8A6] outline-none block w-full p-2.5 placeholder:text-[#94A3B8]"
                placeholder="Your admin password"
                minLength={8}
                required={true}
                autoComplete="off"
                defaultValue={multiUserModeEnabled ? "********" : ""}
              />
            </div>
          </div>
        )}
      </div>
    </form>
  );
}

export const PW_REGEX = new RegExp(/^[a-zA-Z0-9_\-!@$%^&*();]+$/);
function PasswordProtection() {
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [multiUserModeEnabled, setMultiUserModeEnabled] = useState(false);
  const [usePassword, setUsePassword] = useState(false);
  const [loading, setLoading] = useState(true);
  const { t } = useTranslation();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (multiUserModeEnabled) return false;
    const form = new FormData(e.target);

    if (!PW_REGEX.test(form.get("password"))) {
      showToast(
        `Your password has restricted characters in it. Allowed symbols are _,-,!,@,$,%,^,&,*,(,),;`,
        "error"
      );
      setSaving(false);
      return;
    }

    setSaving(true);
    setHasChanges(false);
    const data = {
      usePassword,
      newPassword: form.get("password"),
    };

    const { success, error } = await System.updateSystemPassword(data);
    if (success) {
      showToast("Your page will refresh in a few seconds.", "success");
      setSaving(false);
      setTimeout(() => {
        window.localStorage.removeItem(AUTH_USER);
        window.localStorage.removeItem(AUTH_TOKEN);
        window.localStorage.removeItem(AUTH_TIMESTAMP);
        window.location.reload();
      }, 3_000);
      return;
    } else {
      showToast(`Failed to update password: ${error}`, "error");
      setSaving(false);
    }
  };

  useEffect(() => {
    async function fetchIsMultiUserMode() {
      setLoading(true);
      const multiUserModeEnabled = await System.isMultiUserMode();
      const settings = await System.keys();
      setMultiUserModeEnabled(multiUserModeEnabled);
      setUsePassword(settings?.RequiresAuth);
      setLoading(false);
    }
    fetchIsMultiUserMode();
  }, []);

  if (loading) return null;
  if (multiUserModeEnabled) return null;

  return (
    <form
      onSubmit={handleSubmit}
      onChange={() => setHasChanges(true)}
      className="w-full bg-[#111827] light:bg-white border border-white/10 light:border-slate-200 rounded-xl p-6 shadow-sm flex flex-col gap-y-4"
    >
      <div className="flex justify-between items-center border-b border-white/10 light:border-slate-200 pb-4">
        <div>
          <h3 className="text-base font-semibold text-white light:text-slate-900">
            {t("security.password.title")}
          </h3>
          <p className="text-xs text-[#94A3B8] light:text-slate-500">
            {t("security.password.description")}
          </p>
        </div>
        {hasChanges && (
          <CTAButton onClick={handleSubmit}>
            {saving ? t("common.saving") : t("common.save")}
          </CTAButton>
        )}
      </div>

      <div className="flex flex-col gap-y-4 pt-2">
        <Toggle
          size="lg"
          label={t("security.password.title")}
          enabled={usePassword}
          onChange={(checked) => setUsePassword(checked)}
        />
        {usePassword && (
          <div className="max-w-md pt-2">
            <label
              htmlFor="password"
              className="text-white light:text-slate-900 text-sm font-medium block mb-1.5"
            >
              {t("security.password.password-label")}
            </label>
            <input
              name="password"
              type="text"
              className="bg-[#0B1220] light:bg-slate-50 border border-white/10 light:border-slate-200 text-white light:text-slate-900 text-sm rounded-lg focus:ring-2 focus:ring-[#14B8A6]/50 focus:border-[#14B8A6] outline-none block w-full p-2.5 placeholder:text-[#94A3B8]"
              placeholder="Your Instance Password"
              minLength={8}
              required={true}
              autoComplete="off"
              defaultValue={usePassword ? "********" : ""}
            />
          </div>
        )}
      </div>
    </form>
  );
}
