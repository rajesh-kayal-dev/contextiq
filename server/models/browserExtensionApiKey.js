const prisma = require("../utils/prisma");

const BrowserExtensionApiKey = {
  tablename: "browser_extension_api_keys",

  makeKey: async function () {
    const v4 = require("uuid").v4;
    return `bx-${v4()}`;
  },

  create: async function (userId = null) {
    try {
      const apiKey = await prisma.browser_extension_api_keys.create({
        data: {
          key: await this.makeKey(),
          user_id: userId ? Number(userId) : null,
        },
      });
      return { apiKey, message: null };
    } catch (error) {
      console.error(error);
      return { apiKey: null, message: error.message };
    }
  },

  get: async function (clause = {}) {
    try {
      const apiKey = await prisma.browser_extension_api_keys.findFirst({
        where: clause,
      });
      return apiKey;
    } catch (error) {
      console.error(error);
      return null;
    }
  },

  where: async function (clause = {}, limit = null) {
    try {
      const apiKeys = await prisma.browser_extension_api_keys.findMany({
        where: clause,
        ...(limit !== null ? { take: limit } : {}),
      });
      return apiKeys;
    } catch (error) {
      console.error(error);
      return [];
    }
  },

  delete: async function (clause = {}) {
    try {
      await prisma.browser_extension_api_keys.deleteMany({
        where: clause,
      });
      return true;
    } catch (error) {
      console.error(error);
      return false;
    }
  },
};

module.exports = { BrowserExtensionApiKey };
