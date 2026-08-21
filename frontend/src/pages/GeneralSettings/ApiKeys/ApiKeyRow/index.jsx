import Admin from "@/models/admin";
import { Trash } from "@phosphor-icons/react";
import { userFromStorage } from "@/utils/request";
import System from "@/models/system";
import { useTranslation } from "react-i18next";

export default function ApiKeyRow({ apiKey, removeApiKey }) {
  const { t } = useTranslation();
  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to revoke this API key?"))
      return false;

    const user = userFromStorage();
    const Model = !!user ? Admin : System;
    await Model.deleteApiKey(apiKey.id);
    removeApiKey(apiKey.id);
  };

  return (
    <tr className="bg-transparent text-white light:text-slate-900 text-xs font-medium hover:bg-[#0B1220]/30 light:hover:bg-slate-50 transition-colors">
      <td
        scope="row"
        className="px-6 py-4 whitespace-nowrap align-middle font-medium"
      >
        {apiKey.name || "Unnamed Key"}
      </td>
      <td scope="row" className="px-6 py-4 align-middle">
        <code className="font-mono text-xs text-[#94A3B8] light:text-slate-500 bg-[#0B1220] light:bg-slate-100 px-2 py-1 rounded border border-white/10 light:border-slate-200">
          {apiKey.secret}
        </code>
      </td>
      <td className="px-6 py-4 text-left align-middle text-[#94A3B8] light:text-slate-500">
        {apiKey.createdBy?.username || "--"}
      </td>
      <td className="px-6 py-4 whitespace-nowrap align-middle text-[#94A3B8] light:text-slate-500">
        {new Date(apiKey.createdAt).toLocaleDateString()}
      </td>
      <td className="px-6 py-4 align-middle text-right">
        <button
          onClick={handleDelete}
          className="text-xs font-medium text-red-400 hover:text-red-300 light:text-red-600 light:hover:text-red-700 p-1.5 rounded-lg hover:bg-red-500/10 transition-colors"
          title="Revoke Key"
        >
          <Trash className="h-4 w-4" weight="bold" />
        </button>
      </td>
    </tr>
  );
}
