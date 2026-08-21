const prisma = require("../prisma");

function isInvalidOrClassificationModel(modelName = "") {
  if (!modelName || typeof modelName !== "string") return false;
  const lower = modelName.toLowerCase().trim();
  return (
    lower === "llama3-8b-8192" ||
    lower === "llama-3.1-8b-instant" ||
    lower === "llama-3.3-70b-versatile" ||
    lower.includes("guard") ||
    lower.includes("safeguard") ||
    lower.includes("classifier") ||
    lower.includes("classification") ||
    lower.includes("whisper")
  );
}

async function migrateGroqModel() {
  try {
    const TARGET_MODEL = "openai/gpt-oss-120b";

    // 1. Check process.env
    if (isInvalidOrClassificationModel(process.env.GROQ_MODEL_PREF)) {
      process.env.GROQ_MODEL_PREF = TARGET_MODEL;
    }

    // 2. Migrate SystemSettings
    const allSettings = await prisma.system_settings.findMany({
      where: {
        label: { in: ["groq_model_pref", "GroqModelPref"] },
      },
    });

    for (const setting of allSettings) {
      if (isInvalidOrClassificationModel(setting.value)) {
        await prisma.system_settings.update({
          where: { id: setting.id },
          data: { value: TARGET_MODEL },
        });
        console.log(
          `[Groq Migration] Migrated system setting from ${setting.value} to ${TARGET_MODEL}.`
        );
      }
    }

    // 3. Migrate Workspaces (chatModel & agentModel)
    const allWorkspaces = await prisma.workspaces.findMany();
    for (const ws of allWorkspaces) {
      const updates = {};
      if (!ws.chatModel || isInvalidOrClassificationModel(ws.chatModel)) {
        updates.chatModel = TARGET_MODEL;
      }
      if (isInvalidOrClassificationModel(ws.agentModel)) {
        updates.agentModel = TARGET_MODEL;
      }

      if (Object.keys(updates).length > 0) {
        await prisma.workspaces.update({
          where: { id: ws.id },
          data: updates,
        });
        console.log(
          `[Groq Migration] Migrated workspace ${ws.slug} models (${Object.keys(updates).join(", ")}) to ${TARGET_MODEL}.`
        );
      }
    }
  } catch (error) {
    console.error("[Groq Migration Error]", error.message);
  }
}

module.exports = migrateGroqModel;
