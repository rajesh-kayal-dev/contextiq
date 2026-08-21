const prisma = require("../utils/prisma");
const { EncryptionManager } = require("../utils/EncryptionManager");

const UserApiKey = {
  /**
   * Normalize provider string to lowercase
   * @param {string} provider
   * @returns {string}
   */
  normalizeProvider: function (provider = "") {
    return String(provider || "")
      .trim()
      .toLowerCase();
  },

  /**
   * Save an encrypted API key for a specific user and provider
   * @param {Object} params
   * @param {number} params.userId
   * @param {string} params.provider
   * @param {string} params.apiKey
   */
  setKey: async function ({ userId, provider, apiKey }) {
    if (!userId) throw new Error("User ID is required.");
    const cleanProvider = this.normalizeProvider(provider);
    if (!cleanProvider) throw new Error("Provider name is required.");
    if (!apiKey || typeof apiKey !== "string" || !apiKey.trim()) {
      throw new Error("API key cannot be empty.");
    }

    const encryptionMgr = new EncryptionManager();
    const encryptedKey = encryptionMgr.encrypt(apiKey.trim());

    const existing = await prisma.user_api_keys.findFirst({
      where: {
        user_id: Number(userId),
        provider: cleanProvider,
      },
    });

    if (existing) {
      await prisma.user_api_keys.update({
        where: { id: existing.id },
        data: {
          api_key: encryptedKey,
          lastUpdatedAt: new Date(),
        },
      });
    } else {
      await prisma.user_api_keys.create({
        data: {
          user_id: Number(userId),
          provider: cleanProvider,
          api_key: encryptedKey,
        },
      });
    }

    return { success: true, provider: cleanProvider };
  },

  /**
   * Fetch and decrypt API key for a specific user and provider
   * @param {Object} params
   * @param {number} params.userId
   * @param {string} params.provider
   * @returns {Promise<string|null>}
   */
  getKey: async function ({ userId, provider }) {
    if (!userId || !provider) return null;
    const cleanProvider = this.normalizeProvider(provider);

    try {
      const record = await prisma.user_api_keys.findFirst({
        where: {
          user_id: Number(userId),
          provider: cleanProvider,
        },
      });

      if (!record || !record.api_key) return null;

      const encryptionMgr = new EncryptionManager();
      const plainKey = encryptionMgr.decrypt(record.api_key);
      return plainKey || null;
    } catch (e) {
      console.error(
        `[UserApiKey.getKey Error] for user ${userId}, provider ${provider}:`,
        e
      );
      return null;
    }
  },

  /**
   * Check if a user has configured an API key for a given provider
   * @param {Object} params
   * @param {number} params.userId
   * @param {string} params.provider
   * @returns {Promise<boolean>}
   */
  hasKey: async function ({ userId, provider }) {
    if (!userId || !provider) return false;
    const cleanProvider = this.normalizeProvider(provider);
    const record = await prisma.user_api_keys.findFirst({
      where: {
        user_id: Number(userId),
        provider: cleanProvider,
      },
      select: { id: true },
    });
    return !!record;
  },

  /**
   * Retrieve all configured providers for a specific user (returns metadata without plain text keys)
   * @param {number} userId
   * @returns {Promise<Array<{provider: string, hasKey: boolean, lastUpdatedAt: Date}>>}
   */
  getUserKeys: async function (userId) {
    if (!userId) return [];
    const keys = await prisma.user_api_keys.findMany({
      where: { user_id: Number(userId) },
      select: { provider: true, lastUpdatedAt: true },
    });
    return keys.map((k) => ({
      provider: k.provider,
      hasKey: true,
      lastUpdatedAt: k.lastUpdatedAt,
    }));
  },

  /**
   * Delete a saved key for a specific user and provider
   * @param {Object} params
   * @param {number} params.userId
   * @param {string} params.provider
   */
  deleteKey: async function ({ userId, provider }) {
    if (!userId || !provider) return false;
    const cleanProvider = this.normalizeProvider(provider);
    try {
      await prisma.user_api_keys.deleteMany({
        where: {
          user_id: Number(userId),
          provider: cleanProvider,
        },
      });
      return true;
    } catch (e) {
      console.error(`[UserApiKey.deleteKey Error]:`, e);
      return false;
    }
  },
};

module.exports = { UserApiKey };
