import { useState } from "react";
import { Trans, useTranslation } from "react-i18next";

export default function ChatModeSelection({ workspace, setHasChanges }) {
  const { t } = useTranslation();
  // Standardize mode to 'chat' if set to legacy 'query' mode
  const initialMode =
    workspace?.chatMode === "automatic" ? "automatic" : "chat";
  const [chatMode, setChatMode] = useState(initialMode);

  return (
    <div className="flex flex-col gap-y-[8px]">
      <div className="flex flex-col gap-y-[4px]">
        <label htmlFor="chatMode" className="block input-label">
          Chat Mode
        </label>
        <p className="text-white text-opacity-60 text-xs font-medium">
          Select how the workspace handles user responses.
        </p>
      </div>

      <div className="flex flex-col gap-y-[8px]">
        <div className="w-fit flex gap-x-1 items-center p-1 rounded-lg bg-theme-settings-input-bg">
          <input type="hidden" name="chatMode" value={chatMode} />
          <button
            type="button"
            disabled={chatMode === "chat"}
            onClick={() => {
              setChatMode("chat");
              setHasChanges(true);
            }}
            className="border-none transition-bg duration-200 px-6 py-1 text-sm font-medium text-white/60 disabled:text-white bg-transparent disabled:bg-sky-600 rounded-md hover:bg-white/10"
          >
            Chat
          </button>
          <button
            type="button"
            disabled={chatMode === "automatic"}
            onClick={() => {
              setChatMode("automatic");
              setHasChanges(true);
            }}
            className="border-none transition-bg duration-200 px-6 py-1 text-sm font-medium text-white/60 disabled:text-white bg-transparent disabled:bg-sky-600 rounded-md hover:bg-white/10"
          >
            Agent
          </button>
        </div>
        <ChatModeExplanation chatMode={chatMode} />
      </div>
    </div>
  );
}

/**
 * A component that displays the explanation for a given chat mode.
 * @param {'automatic' | 'chat' | 'query'} chatMode - The chat mode to display the explanation for.
 * @returns {JSX.Element} The component to display the explanation for the given chat mode.
 */
function ChatModeExplanation({ chatMode = "chat" }) {
  const { t } = useTranslation();
  return (
    <p className="text-sm text-white/60">
      <b>{t(`chat.mode.${chatMode}.title`)}</b>{" "}
      <Trans
        i18nKey={`chat.mode.${chatMode}.description`}
        components={{ b: <b />, br: <br /> }}
      />
    </p>
  );
}
