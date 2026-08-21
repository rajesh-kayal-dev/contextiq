const { BaseImageGenerator } = require("../base");

class OpenAiImageGenerator extends BaseImageGenerator {
  constructor(apiKeyOverride = null) {
    const apiKey =
      apiKeyOverride ||
      process.env.IMAGE_GEN_OPENAI_KEY ||
      process.env.OPEN_AI_KEY;
    if (!apiKey) throw new Error("API_KEY_REQUIRED:openai");
    const { OpenAI: OpenAIApi } = require("openai");

    let model = process.env.IMAGE_GEN_MODEL_PREF || "dall-e-3";
    if (model === "gpt-image-1") model = "dall-e-3";

    super({
      client: new OpenAIApi({
        apiKey,
      }),
      model,
      className: "OpenAiImageGenerator",
    });
  }

  imageFieldName(count) {
    return count > 1 ? "image[]" : "image";
  }
}

module.exports = { OpenAiImageGenerator };
