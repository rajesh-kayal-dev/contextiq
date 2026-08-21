import { API_BASE } from "@/utils/constants";
import { baseHeaders } from "@/utils/request";

const UserApiKey = {
  // GET /api/user/keys - Fetch all configured provider keys for the logged-in user
  getUserKeys: async function () {
    return await fetch(`${API_BASE}/user/keys`, {
      method: "GET",
      headers: baseHeaders(),
    })
      .then((res) => {
        if (!res.ok) throw new Error("Could not fetch user API keys.");
        return res.json();
      })
      .then((res) => res?.keys || [])
      .catch((e) => {
        console.error(e);
        return [];
      });
  },

  // POST /api/user/keys - Save/update an API key for a specified provider
  saveKey: async function (provider, apiKey) {
    return await fetch(`${API_BASE}/user/keys`, {
      method: "POST",
      headers: baseHeaders(),
      body: JSON.stringify({ provider, apiKey }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.error) return { success: false, error: data.error };
        return { success: true, message: data.message };
      })
      .catch((e) => {
        console.error(e);
        return {
          success: false,
          error: e.message || "Failed to save API key.",
        };
      });
  },

  // GET /api/user/keys/check/:provider - Check if user has key configured for provider
  checkKey: async function (provider) {
    if (!provider) return false;
    return await fetch(
      `${API_BASE}/user/keys/check/${encodeURIComponent(provider)}`,
      {
        method: "GET",
        headers: baseHeaders(),
      }
    )
      .then((res) => {
        if (!res.ok) return false;
        return res.json();
      })
      .then((data) => Boolean(data?.hasKey))
      .catch((e) => {
        console.error(e);
        return false;
      });
  },

  // DELETE /api/user/keys/:provider - Delete a provider API key
  deleteKey: async function (provider) {
    return await fetch(
      `${API_BASE}/user/keys/${encodeURIComponent(provider)}`,
      {
        method: "DELETE",
        headers: baseHeaders(),
      }
    )
      .then((res) => res.json())
      .then((data) => Boolean(data?.success))
      .catch((e) => {
        console.error(e);
        return false;
      });
  },
};

export default UserApiKey;
