const prisma = require("../utils/prisma");

const MobileDevice = {
  tablename: "mobile_devices",

  get: async function (clause = {}) {
    try {
      const device = await prisma.mobile_devices.findFirst({
        where: clause,
      });
      return device;
    } catch (error) {
      console.error(error);
      return null;
    }
  },

  where: async function (clause = {}, limit = null) {
    try {
      const devices = await prisma.mobile_devices.findMany({
        where: clause,
        ...(limit !== null ? { take: limit } : {}),
      });
      return devices;
    } catch (error) {
      console.error(error);
      return [];
    }
  },

  delete: async function (clause = {}) {
    try {
      await prisma.mobile_devices.deleteMany({
        where: clause,
      });
      return true;
    } catch (error) {
      console.error(error);
      return false;
    }
  },
};

module.exports = { MobileDevice };
