const { PrismaClient } = require("@prisma/client");

// npx prisma introspect
// npx prisma generate
// npx prisma migrate dev --name init -> ensures that db is in sync with schema
// npx prisma migrate reset -> resets the db

const debugEnabled = process.env.DEBUG === "true";
const logLevels = debugEnabled
  ? ["error", "info", "warn", "query"]
  : ["error", "warn"];
const prisma = new PrismaClient({
  log: logLevels,
});

module.exports = prisma;
